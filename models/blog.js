import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Blog slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  featuredImage: {
    url: {
      type: String,
      required: [true, 'Featured image URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Featured image public ID is required']
    },
    alt: {
      type: String,
      default: ''
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: ['Health Tips', 'Hearing Care', 'Technology', 'News', 'General', 'Research', 'Patient Stories'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title should be under 60 characters']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description should be under 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  readingTime: {
    type: Number, // in minutes
    default: 1
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: false // Made optional to allow super admin blogs without branch
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ branchId: 1, status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });

// Pre-save middleware to calculate reading time
blogSchema.pre('save', function(next) {
  if (this.content && this.isModified('content')) {
    // Rough calculation: 200 words per minute
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

// Pre-save middleware to set publishedAt when status changes to published
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for formatted published date
blogSchema.virtual('formattedPublishedDate').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time text
blogSchema.virtual('readingTimeText').get(function() {
  return `${this.readingTime} min read`;
});

// Method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment likes
blogSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Static method to get related blogs
blogSchema.statics.getRelatedBlogs = function(currentBlogId, category, tags, limit = 3) {
  return this.find({
    _id: { $ne: currentBlogId },
    status: 'published',
    isActive: true,
    $or: [
      { category: category },
      { tags: { $in: tags } }
    ]
  })
  .sort({ publishedAt: -1, views: -1 })
  .limit(limit)
  .populate('author', 'name')
  .populate('branchId', 'branchName');
};

// Static method to get featured blogs
blogSchema.statics.getFeaturedBlogs = function(limit = 5) {
  return this.find({
    status: 'published',
    isActive: true,
    isFeatured: true
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .populate('author', 'name')
  .populate('branchId', 'branchName');
};

// Static method to get popular blogs
blogSchema.statics.getPopularBlogs = function(limit = 5) {
  return this.find({
    status: 'published',
    isActive: true
  })
  .sort({ views: -1, publishedAt: -1 })
  .limit(limit)
  .populate('author', 'name')
  .populate('branchId', 'branchName');
};

export default mongoose.model('Blog', blogSchema);
