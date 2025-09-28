export const inventoryThresholdEmailTemplate = (inventoryItems, branchName) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Group items by status
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.threshold && item.currentStock > 0);
  const outOfStockItems = inventoryItems.filter(item => item.currentStock === 0);
  
  const generateItemRow = (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; font-weight: bold; color: #333;">${item.deviceName}</td>
      <td style="padding: 12px; color: #666;">${item.model}</td>
      <td style="padding: 12px; color: #666;">${item.brand || 'N/A'}</td>
      <td style="padding: 12px; text-align: center;">
        <span style="background-color: ${item.currentStock === 0 ? '#dc3545' : '#ffc107'}; color: ${item.currentStock === 0 ? 'white' : '#000'}; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
          ${item.currentStock} ${item.unit}
        </span>
      </td>
      <td style="padding: 12px; text-align: center; color: #666;">${item.threshold} ${item.unit}</td>
      <td style="padding: 12px; text-align: center; color: #28a745; font-weight: bold;">₹${item.costPrice?.toLocaleString('en-IN') || 'N/A'}</td>
    </tr>
  `;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <!-- Header -->
      <div style="background-color: #fff; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; border-bottom: 3px solid #dc3545; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #dc3545; margin: 0; font-size: 28px;">⚠️ INVENTORY ALERT</h1>
          <h2 style="color: #333; margin: 10px 0; font-size: 20px;">Low Stock Notification</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">${branchName || 'Clinic Branch'}</p>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Generated on: ${currentDate}</p>
        </div>

        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #ffc107, #ff8c00); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; font-size: 24px;">${lowStockItems.length}</h3>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Low Stock Items</p>
          </div>
          <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; font-size: 24px;">${outOfStockItems.length}</h3>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Out of Stock</p>
          </div>
          <div style="background: linear-gradient(135deg, #17a2b8, #138496); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; font-size: 24px;">${inventoryItems.length}</h3>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Total Alerts</p>
          </div>
        </div>

        <!-- Out of Stock Items -->
        ${outOfStockItems.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px; margin-bottom: 20px;">
              🚨 OUT OF STOCK ITEMS (${outOfStockItems.length})
            </h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background-color: #dc3545; color: white;">
                    <th style="padding: 15px; text-align: left;">Device Name</th>
                    <th style="padding: 15px; text-align: left;">Model</th>
                    <th style="padding: 15px; text-align: left;">Brand</th>
                    <th style="padding: 15px; text-align: center;">Current Stock</th>
                    <th style="padding: 15px; text-align: center;">Threshold</th>
                    <th style="padding: 15px; text-align: center;">Cost Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${outOfStockItems.map(generateItemRow).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Low Stock Items -->
        ${lowStockItems.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #ffc107; border-bottom: 2px solid #ffc107; padding-bottom: 10px; margin-bottom: 20px;">
              ⚠️ LOW STOCK ITEMS (${lowStockItems.length})
            </h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background-color: #ffc107; color: #000;">
                    <th style="padding: 15px; text-align: left;">Device Name</th>
                    <th style="padding: 15px; text-align: left;">Model</th>
                    <th style="padding: 15px; text-align: left;">Brand</th>
                    <th style="padding: 15px; text-align: center;">Current Stock</th>
                    <th style="padding: 15px; text-align: center;">Threshold</th>
                    <th style="padding: 15px; text-align: center;">Cost Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${lowStockItems.map(generateItemRow).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Action Required -->
        <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
          <h4 style="color: #1976d2; margin: 0 0 10px 0;">📋 Action Required</h4>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li>Review the items listed above and place purchase orders as needed</li>
            <li>Update inventory levels after receiving new stock</li>
            <li>Consider adjusting threshold levels for better inventory management</li>
            <li>Contact suppliers for urgent restocking requirements</li>
          </ul>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p style="margin: 0;">This is an automated inventory alert from your Clinic Management System.</p>
          <p style="margin: 5px 0 0 0;">Please take necessary action to maintain optimal inventory levels.</p>
        </div>
      </div>
    </div>
  `;
};

export const inventoryThresholdEmailSubject = (branchName, alertCount) => {
  return `🚨 Inventory Alert: ${alertCount} items need attention - ${branchName || 'Clinic'}`;
};
