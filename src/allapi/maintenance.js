import api from '../api';

// ✅ Create Asset (POST)
export const createAsset = async (assetData) => {
  try {
    const response = await api.post("/maintenance/asset/", assetData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating asset:", error.response?.data || error.message);
    throw error;
  }
};
// ✅ Get all Assets (GET)
export const getAssets = async () => {
  try {
    const response = await api.get("/maintenance/asset/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching assets:", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 Delete API for Asset
export const deleteAsset = async (assetId) => {
  try {
    const response = await api.delete(`/maintenance/asset/${assetId}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Asset delete failed:", error.response?.data || error.message);
    throw error;
  }
};
// 🔹 Update API for Asset
export const updateAsset = async (assetId, payload) => {
  try {
    const response = await api.patch(`/maintenance/asset/${assetId}/`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Asset update failed:", error.response?.data || error.message);
    throw error;
  }
};
// ✅ Create Maintenance Schedule (POST)
export const createMaintenanceSchedule = async (scheduleData) => {
  try {
    const response = await api.post("/maintenance/schedule/", scheduleData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating maintenance schedule:", error.response?.data || error.message);
    throw error;
  }
};
// Get all schedules
export const getMaintenanceSchedules = async () => {
  try {
    const response = await api.get("/maintenance/schedule/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching maintenance schedules:", error.response?.data || error.message);
    throw error;
  }
};
// 🔹 Delete Maintenance Schedule
export const deleteMaintenanceSchedule = async (maintenanceId) => {
  try {
    const response = await api.delete(`/maintenance/schedule/${maintenanceId}/`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to delete maintenance schedule:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// 🔹 Update Maintenance Schedule (PUT)
export const updateMaintenanceSchedule = async (maintenanceId, scheduleData) => {
  try {
    const response = await api.put(`/maintenance/schedule/${maintenanceId}/`, scheduleData);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to update maintenance schedule:",
      error.response?.data || error.message
    );
    throw error;
  }
};
