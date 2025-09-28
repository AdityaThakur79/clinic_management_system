import Blog from '../models/blog.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      status,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    // Fetch user data from database
    const user = await User.findById(req.user.userId).populate('branch');
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Get branchId from user's branch
    // Super admins can create blogs without branch association
    let branchId = user.branch?._id || user.branch;
    if (!branchId && user.role !== 'superAdmin') {
      return res.status(400).json({ success: false, message: "User must be associated with a branch" });
    }

    // Validate required fields
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    if (!slug) return res.status(400).json({ success: false, message: "Slug is required" });
    if (!excerpt) return res.status(400).json({ success: false, message: "Excerpt is required" });
    if (!content) return res.status(400).json({ success: false, message: "Content is required" });
    if (!category) return res.status(400).json({ success: false, message: "Category is required" });

    // Check for duplicate slug
    const existingBlog = await Blog.findOne({ slug, isActive: true });
    if (existingBlog) {
      return res.status(400).json({ 
        success: false, 
        message: "A blog with this slug already exists" 
      });
    }

    // Handle featured image upload
    let featuredImage = null;
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    
    if (req.files && req.files.featuredImage) {
      try {
        const imageFile = req.files.featuredImage[0];
        
        // With CloudinaryStorage, the file is already uploaded to Cloudinary
        // and the result is available in the file object
        featuredImage = {
          url: imageFile.path, // This is the Cloudinary URL
          publicId: imageFile.filename, // This is the public_id
          alt: title
        };
        
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        return res.status(500).json({
          success: false,
          message: "Failed to process featured image"
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Featured image is required"
      });
    }

    // Parse tags and keywords if they are strings
    const parsedTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []);
    const parsedKeywords = Array.isArray(seoKeywords) ? seoKeywords : (seoKeywords ? seoKeywords.split(',').map(keyword => keyword.trim()) : []);

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author: user._id,
      category,
      tags: parsedTags,
      status: status || 'draft',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      seoKeywords: parsedKeywords,
      branchId,
      createdBy: user._id
    });

    // Populate the created blog
    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'name email')
      .populate('createdBy', 'name email');
    
    // Only populate branchId if it exists
    if (blog.branchId) {
      await populatedBlog.populate('branchId', 'branchName address');
    }

    return res.status(201).json({ 
      success: true, 
      blog: populatedBlog,
      message: "Blog created successfully" 
    });
  } catch (error) {
    console.error('Blog creation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

export const listBlogs = async (req, res) => {
  try {
    const { 
      branchId, 
      page = 1, 
      limit = 10, 
      search = "", 
      category = "",
      status = "",
      author = "",
      sortBy = "createdAt", 
      sortOrder = "desc",
      featured = false,
      published = false
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    // Build filter
    const filter = { isActive: true };
    
    // Fetch user data from database
    const user = await User.findById(req.user.userId).populate('branch');
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Branch filter - superAdmin can see all, others see only their branch
    if (user.role !== 'superAdmin') {
      const userBranchId = user.branch?._id || user.branch;
      const finalBranchId = branchId || userBranchId;
      
      if (finalBranchId) {
        filter.branchId = new mongoose.Types.ObjectId(finalBranchId);
      }
    } else if (branchId) {
      filter.branchId = new mongoose.Types.ObjectId(branchId);
    }

    // Status filter
    if (status) {
      filter.status = status;
    } else if (published === 'true') {
      filter.status = 'published';
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Author filter
    if (author) {
      filter.author = new mongoose.Types.ObjectId(author);
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name email')
        .populate('branchId', 'branchName address')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sort)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      Blog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      blogs,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.ceil(total / numericLimit),
        hasNext: numericPage * numericLimit < total,
        hasPrev: numericPage > 1
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid blog ID format" 
      });
    }

    const blog = await Blog.findById(id)
      .populate('author', 'name email')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    return res.json({ success: true, blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ 
        success: false, 
        message: "Blog slug is required" 
      });
    }

    const blog = await Blog.findOne({ slug, isActive: true })
      .populate('author', 'name email')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    // Increment views for published blogs
    if (blog.status === 'published') {
      await blog.incrementViews();
    }

    return res.json({ success: true, blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid blog ID format" 
      });
    }

    // Fetch user data from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.views;
    delete updateData.likes;
    
    // Get existing blog to check permissions
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    // Role-based restrictions
    if (user.role !== 'superAdmin') {
      const userBranchId = user.branch?._id || user.branch;
      if (existingBlog.branchId.toString() !== userBranchId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: "You can only update blogs in your own branch" 
        });
      }
    }

    // Check for duplicate slug if being updated
    if (updateData.slug && updateData.slug !== existingBlog.slug) {
      const duplicateBlog = await Blog.findOne({ 
        slug: updateData.slug, 
        isActive: true,
        _id: { $ne: id }
      });
      if (duplicateBlog) {
        return res.status(400).json({ 
          success: false, 
          message: "A blog with this slug already exists" 
        });
      }
    }

    // Handle featured image upload
    if (req.files && req.files.featuredImage) {
      try {
        // Delete old image if it exists
        if (existingBlog.featuredImage && existingBlog.featuredImage.publicId) {
          await cloudinary.uploader.destroy(existingBlog.featuredImage.publicId);
        }

        const imageFile = req.files.featuredImage[0];
        
        // With CloudinaryStorage, the file is already uploaded to Cloudinary
        updateData.featuredImage = {
          url: imageFile.path, // This is the Cloudinary URL
          publicId: imageFile.filename, // This is the public_id
          alt: updateData.title || existingBlog.title
        };
        
      } catch (imageError) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload featured image"
        });
      }
    }

    // Parse tags and keywords if they are strings
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }
    if (updateData.seoKeywords && typeof updateData.seoKeywords === 'string') {
      updateData.seoKeywords = updateData.seoKeywords.split(',').map(keyword => keyword.trim());
    }

    // Add updatedBy
    updateData.updatedBy = user._id;

    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('author', 'name email')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    return res.json({ 
      success: true, 
      blog,
      message: "Blog updated successfully" 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid blog ID format" 
      });
    }

    // Fetch user data from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    // Role-based restrictions
    if (user.role !== 'superAdmin') {
      const userBranchId = user.branch?._id || user.branch;
      if (blog.branchId.toString() !== userBranchId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: "You can only delete blogs in your own branch" 
        });
      }
    }

    // Soft delete
    await Blog.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: user._id },
      { new: true }
    );

    return res.json({ 
      success: true, 
      message: "Blog deleted successfully" 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublicBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 9, 
      search = "", 
      category = "",
      tag = "",
      sortBy = "publishedAt", 
      sortOrder = "desc",
      featured = false
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);

    // Build filter for published blogs only
    const filter = { 
      isActive: true,
      status: 'published'
    };

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Tag filter
    if (tag) {
      filter.tags = { $in: [new RegExp(tag, 'i')] };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name')
        .populate('branchId', 'branchName')
        .sort(sort)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      Blog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      blogs,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.ceil(total / numericLimit),
        hasNext: numericPage * numericLimit < total,
        hasPrev: numericPage > 1
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRelatedBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid blog ID format" 
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    const relatedBlogs = await Blog.getRelatedBlogs(
      id, 
      blog.category, 
      blog.tags, 
      parseInt(limit)
    );

    return res.json({
      success: true,
      relatedBlogs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const featuredBlogs = await Blog.getFeaturedBlogs(parseInt(limit));

    return res.json({
      success: true,
      featuredBlogs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const popularBlogs = await Blog.getPopularBlogs(parseInt(limit));

    return res.json({
      success: true,
      popularBlogs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const incrementBlogLikes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid blog ID format" 
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    await blog.incrementLikes();

    return res.json({
      success: true,
      likes: blog.likes,
      message: "Like added successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
