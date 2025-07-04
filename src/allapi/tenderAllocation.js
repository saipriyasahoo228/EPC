import api from '../api'; // your configured axios instance


//Submit Tender Details
export const createTender = async (tenderData) => {
  try {
    const response = await api.post('/tender/create/', tenderData);
    return response.data;
  } catch (error) {
    console.error('Error creating tender:', error);
    throw error;
  }
};

//Get all Teder Details 
export const getTenders = async (tenderData) => {
  try {
    const response = await api.get('/tender/create/', tenderData);
    return response.data;
  } catch (error) {
    console.error('Error creating tender:', error);
    throw error;
  }
};

// Update the tender details

export const updateTender = async (tender_id, tenderData) => {
  try {
    const response = await api.patch(`/tender/update/${tender_id}/`, tenderData);
    return response.data;
  } catch (error) {
    console.error('Error updating tender:', error);
    throw error;
  }
};

// Get tender details by id

export const getTenderbyID = async (tender_id, tenderData) => {
  try {
    const response = await api.get(`/tender/update/${tender_id}/`, tenderData);
    return response.data;
  } catch (error) {
    console.error('Error updating tender:', error);
    throw error;
  }
};

//Delete tender details 

export const deleteTender = async (tenderId) => {
  try {
    const response = await api.delete(`/tender/delete/${tenderId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting tender:', error);
    throw error;
  }
};