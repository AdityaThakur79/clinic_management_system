import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useCheckInventoryThresholdsQuery } from '../features/api/inventoryApi';

/**
 * Custom hook to automatically check for inventory threshold alerts
 * and show popup when thresholds are reached
 */
export const useInventoryThresholdAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState(false);
  
  const user = useSelector((state) => state.auth.user);
  const userBranchId = user?.branch?._id || user?.branch || null;
  
  // Debug user data
  useEffect(() => {
    if (user) {
      console.log('🔍 User data:', user);
      console.log('🔍 User branch:', user.branch);
      console.log('🔍 User branch ID:', userBranchId);
    }
  }, [user, userBranchId]);

  // Check thresholds every 5 minutes when user is logged in
  const { data: thresholdData, isLoading, error } = useCheckInventoryThresholdsQuery(
    { branchId: userBranchId },
    {
      skip: !user || userBranchId === undefined,
      pollingInterval: 5 * 60 * 1000, // 5 minutes
      refetchOnMountOrArgChange: true,
    }
  );

  // Debug query state
  useEffect(() => {
    console.log('🔍 Query state:', {
      user: !!user,
      hasCheckedToday,
      userBranchId,
      skip: !user || hasCheckedToday || userBranchId === undefined,
      isLoading,
      error: error?.message,
      data: thresholdData
    });
  }, [user, hasCheckedToday, userBranchId, isLoading, error, thresholdData]);

  // Log any errors for debugging
  useEffect(() => {
    if (error) {
      console.error('Inventory threshold check error:', error);
    }
  }, [error]);

  // Check if we should show alert today
  useEffect(() => {
    if (!user) return;

    const today = new Date().toDateString();
    const lastCheckedDate = localStorage.getItem('inventoryThresholdLastChecked');
    
    if (lastCheckedDate !== today) {
      setHasCheckedToday(false);
      localStorage.setItem('inventoryThresholdLastChecked', today);
    } else {
      setHasCheckedToday(true);
    }
  }, [user]);

  // Show alert when thresholds are reached
  useEffect(() => {
    console.log('🔍 Threshold data received:', thresholdData);
    console.log('🔍 Has checked today:', hasCheckedToday);
    
    if (thresholdData?.lowStockItems && thresholdData.lowStockItems.length > 0 && !hasCheckedToday) {
      console.log('🚨 Showing inventory threshold alert for', thresholdData.lowStockItems.length, 'items');
      setShowAlert(true);
      setHasCheckedToday(true);
    }
  }, [thresholdData, hasCheckedToday]);

  const dismissAlert = () => {
    setShowAlert(false);
  };

  const getAlertData = () => {
    if (!thresholdData) return null;

    const lowStockItems = thresholdData.lowStockItems || [];
    const outOfStockItems = lowStockItems.filter(item => item && item.currentStock === 0);
    const lowStockOnlyItems = lowStockItems.filter(item => item && item.currentStock > 0 && item.currentStock <= item.threshold);

    return {
      totalAlerts: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      lowStock: lowStockOnlyItems.length,
      items: lowStockItems,
      statistics: thresholdData.statistics
    };
  };

  return {
    showAlert,
    dismissAlert,
    alertData: getAlertData(),
    isLoading,
    hasCheckedToday
  };
};

/**
 * Hook to manually trigger inventory threshold check
 */
export const useManualInventoryCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState(null);

  const checkThresholds = async () => {
    setIsChecking(true);
    try {
      // This would typically call an API endpoint
      // For now, we'll simulate the check
      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Manual threshold check completed'
      };
      setLastCheckResult(result);
      return result;
    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      setLastCheckResult(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkThresholds,
    isChecking,
    lastCheckResult
  };
};
