import api from '../api'; // your configured axios instance

// Post API for creating inventory item
// ✅ Correct
export const createInventoryItem = async (formData) => {
  try {
    const response = await api.post('/inventory/items/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error creating inventory item:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get all inventory items
export const getInventoryItems = async () => {
  try {
    const response = await api.get('/inventory/items/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching inventory items:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update inventory item
export const updateInventoryItem = async (itemId, formData) => {
  try {
    const response = await api.patch(`/inventory/items/${itemId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating inventory item:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteInventoryItem = async (itemId) => {
  try {
    const response = await api.delete(`/inventory/items/${itemId}/`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting inventory item:', error.response?.data || error.message);
    throw error;
  }
};

//Create Stock Entry

export const createStock = async (stockData) => {
  try {
    const response = await api.post("/inventory/stock/", stockData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating stock:", error.response?.data || error.message);
    throw error;
  }
};

//Stock Returns post api
export const createStockReturn = async (payload) => {
  try {
    const response = await api.post('/inventory/returns/', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating stock return:', error.response?.data || error.message);
    throw error;
  }
};

//Stock Return get api
export const getStockReturns = async () => {
  try {
    const response = await api.get('/inventory/returns/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching stock returns:', error.response?.data || error.message);
    throw error;
  }
};

//get stock details
export const getStockManagement  = async () => {
  try {
    const response = await api.get('/inventory/stock/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching stock:', error.response?.data || error.message);
    throw error;
  }
};

//Delete stock details by stockId
export const deleteStock = async (stockId) => {
  try {
    const response = await api.delete(`/inventory/stock/${stockId}/`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting stock ${stockId}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update record by using Stock Management ID
export const updateStock = async (stockManagementId, stockData) => {
  try {
    // Use PUT because PATCH is not allowed
    const response = await api.put(`/inventory/stock/${stockManagementId}/`, stockData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating stock ${stockManagementId}:`, error.response?.data || error.message);
    throw error;
  }
};


// Delete Stock Return by ID
export const deleteStockReturn = async (returnId) => {
  try {
    const response = await api.delete(`/inventory/returns/${returnId}/`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting return ${returnId}:`, error.response?.data || error.message);
    throw error;
  }
};


// Update stock return
export const updateStockReturn = async (returnId, formData) => {
  try {
    const response = await api.patch(`/inventory/returns/${returnId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating stock return:', error.response?.data || error.message);
    throw error;
  }
};

//POST api for valuation report
export const submitValuationReport = async (payload) => {
  try {
    const res = await api.post(`/inventory/valuation-reporting/`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ Error submitting valuation report:", err.response?.data || err.message);
    throw err;
  }
};

// Get valuation reports
export const getValuationReports = async () => {
  try {
    const response = await api.get('/inventory/valuation-reporting/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching valuation reports:', error.response?.data || error.message);
    throw error;
  }
};

//Delete api by using ID of stock valuation and reporting 
// api/inventory.js
export const deleteValuationReport = async (id) => {
  try {
    await api.delete(`/inventory/valuation-reporting/${id}/`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting valuation report ${id}:`, error.response?.data || error.message);
    throw error;
  }
};
