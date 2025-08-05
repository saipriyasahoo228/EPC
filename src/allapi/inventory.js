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