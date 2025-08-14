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
