import Inventory from '../models/inventory.js';
import Branch from '../models/branch.js';
import { User } from '../models/user.js';
import { sendEmail } from '../utils/common/sendMail.js';
import { inventoryThresholdEmailTemplate, inventoryThresholdEmailSubject } from '../utils/emailTemplate/inventoryThresholdTemplate.js';

/**
 * Check for inventory items that are at or below threshold
 * @param {string} branchId - Optional branch ID to filter by
 * @returns {Promise<Array>} Array of inventory items that need attention
 */
export const checkInventoryThresholds = async (branchId = null) => {
  try {
    const filter = { 
      isActive: true,
      $expr: { $lte: ['$currentStock', '$threshold'] }
    };

    // Handle string "null" and actual null values
    if (branchId && branchId !== 'null' && branchId !== null) {
      filter.branchId = branchId;
    }

    const lowStockItems = await Inventory.find(filter)
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name email')
      .sort({ currentStock: 1, deviceName: 1 });

    return lowStockItems;
  } catch (error) {
    console.error('Error checking inventory thresholds:', error);
    throw error;
  }
};

/**
 * Get users who should receive inventory alerts
 * @param {string} branchId - Branch ID to get users for (ignored for superAdmin only)
 * @returns {Promise<Array>} Array of users who should receive alerts
 */
export const getInventoryAlertRecipients = async (branchId = null) => {
  try {
    // Simple logic: Find all SuperAdmins
    const superAdmins = await User.find({ role: 'superAdmin' })
      .select('name email role status');

    console.log(`Found ${superAdmins.length} SuperAdmins:`, superAdmins.map(u => ({ name: u.name, email: u.email, status: u.status })));

    return superAdmins;
  } catch (error) {
    console.error('Error getting SuperAdmins:', error);
    throw error;
  }
};

/**
 * Send inventory threshold alerts via email
 * @param {Array} inventoryItems - Items that are low/out of stock
 * @param {string} branchId - Optional branch ID
 * @returns {Promise<Object>} Result of email sending
 */
export const sendInventoryThresholdAlerts = async (inventoryItems, branchId = null) => {
  try {
    if (!inventoryItems || inventoryItems.length === 0) {
      return { success: true, message: 'No inventory alerts to send' };
    }

    // Get SuperAdmins
    const superAdmins = await getInventoryAlertRecipients(branchId);
    
    if (superAdmins.length === 0) {
      return { success: false, message: 'No SuperAdmins found for inventory alerts' };
    }

    // Group items by branch for better organization
    const itemsByBranch = {};
    inventoryItems.forEach(item => {
      const branchKey = item.branchId?._id?.toString() || 'unknown';
      if (!itemsByBranch[branchKey]) {
        itemsByBranch[branchKey] = {
          branchName: item.branchId?.branchName || 'Unknown Branch',
          items: []
        };
      }
      itemsByBranch[branchKey].items.push(item);
    });

    const emailResults = [];

    // Check email configuration first
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      console.log('⚠️ Email credentials not configured. Skipping email sending but showing recipients found.');
      return {
        success: false,
        message: `Email credentials not configured. Found ${superAdmins.length} SuperAdmins but cannot send emails. Please set SMTP_USER and SMTP_PASS environment variables.`,
        recipientsFound: superAdmins.length,
        recipients: superAdmins.map(r => ({ name: r.name, email: r.email, role: r.role })),
        emailConfigError: "Email credentials not configured"
      };
    }
    
    console.log('✅ Email configuration is valid');

    // Send emails to each SuperAdmin
    for (const recipient of superAdmins) {
      try {
        // SuperAdmins receive alerts for all items from all branches
        const itemsToSend = inventoryItems;
        const branchName = 'All Branches';

        if (itemsToSend.length === 0) {
          continue; // Skip if no items
        }

        console.log(`📧 Preparing to send email to ${recipient.email}...`);
        
        const emailHtml = inventoryThresholdEmailTemplate(itemsToSend, branchName);
        const subject = inventoryThresholdEmailSubject(branchName, itemsToSend.length);

        console.log(`📧 Email subject: ${subject}`);
        console.log(`📧 Email HTML length: ${emailHtml.length} characters`);

        const result = await sendEmail({
          to: recipient.email,
          subject: subject,
          html: emailHtml
        });

        emailResults.push({
          recipient: recipient.email,
          success: true,
          messageId: result.messageId
        });

        console.log(`✅ Inventory alert sent to SuperAdmin ${recipient.email} for ${itemsToSend.length} items`);

      } catch (emailError) {
        console.error(`❌ Failed to send inventory alert to SuperAdmin ${recipient.email}:`, emailError);
        emailResults.push({
          recipient: recipient.email,
          success: false,
          error: emailError.message
        });
      }
    }

    return {
      success: true,
      message: `Inventory alerts processed for ${superAdmins.length} SuperAdmin(s)`,
      results: emailResults,
      totalItems: inventoryItems.length
    };

  } catch (error) {
    console.error('Error sending inventory threshold alerts:', error);
    throw error;
  }
};

/**
 * Check and send inventory threshold alerts
 * This is the main function to call when checking thresholds
 * @param {string} branchId - Optional branch ID to check
 * @returns {Promise<Object>} Result of the threshold check and alert sending
 */
export const checkAndSendInventoryAlerts = async (branchId = null) => {
  try {
    console.log('🔍 Checking inventory thresholds...');
    console.log('🔍 BranchId parameter:', branchId);
    
    // Check for low stock items
    const lowStockItems = await checkInventoryThresholds(branchId);
    console.log(`🔍 Low stock items found: ${lowStockItems.length}`);
    
    if (lowStockItems.length === 0) {
      console.log('✅ No inventory threshold alerts needed');
      return {
        success: true,
        message: 'No inventory threshold alerts needed',
        itemsCount: 0
      };
    }

    console.log(`⚠️ Found ${lowStockItems.length} items at or below threshold`);

    // Send alerts
    console.log('📧 About to send inventory threshold alerts...');
    const alertResult = await sendInventoryThresholdAlerts(lowStockItems, branchId);
    console.log('📧 Alert result:', alertResult);

    return {
      success: true,
      message: `Inventory threshold check completed`,
      itemsCount: lowStockItems.length,
      alertResult: alertResult
    };

  } catch (error) {
    console.error('Error in checkAndSendInventoryAlerts:', error);
    return {
      success: false,
      message: 'Failed to check inventory thresholds',
      error: error.message
    };
  }
};

/**
 * Get inventory threshold statistics
 * @param {string} branchId - Optional branch ID
 * @returns {Promise<Object>} Statistics about inventory thresholds
 */
export const getInventoryThresholdStats = async (branchId = null) => {
  try {
    const filter = { isActive: true };
    // Handle string "null" and actual null values
    if (branchId && branchId !== 'null' && branchId !== null) {
      filter.branchId = branchId;
    }

    const stats = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          lowStockItems: {
            $sum: {
              $cond: [
                { $and: [{ $lte: ['$currentStock', '$threshold'] }, { $gt: ['$currentStock', 0] }] },
                1,
                0
              ]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
            }
          },
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
          lowStockValue: {
            $sum: {
              $cond: [
                { $and: [{ $lte: ['$currentStock', '$threshold'] }, { $gt: ['$currentStock', 0] }] },
                { $multiply: ['$currentStock', '$costPrice'] },
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalValue: 0,
      lowStockValue: 0
    };

    return {
      success: true,
      stats: result
    };

  } catch (error) {
    console.error('Error getting inventory threshold stats:', error);
    throw error;
  }
};
