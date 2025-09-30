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

//Create Project by passing Tender_id

export const createProjectFromTender = async (tenderId, projectData) => {
  try {
    const response = await api.post(`/tender/create-project/${tenderId}/`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project from tender:', error);
    throw error;
  }
};

//Tender Cancel api
export const cancelTender = async (tenderId, payload) => {
  const response = await api.post(`/tender/create-project/${tenderId}/`, payload);
  return response.data;
};


//Get all projects
export const getProjects = async () => {
  const response = await api.get('/tender/project/');
  console.log("Test GETPROJECT: ", response.data)
  return response.data;
};

export const patchProject = async (projectId, projectData) => {
  const response = await api.patch(`/tender/project/${projectId}/`, projectData);
  return response.data;
};

export const projectCost = async()=>{
  const response = await api.get('/tender/project-costs/');
  return response.data;
}

export const getTenderHistoryDiffs = async (tenderId) => {
  const response = await api.get(`/tender/tender/history/diffs/${tenderId}/`);
  return response.data;
};

export const getTenderHistorySnapshots = async (tenderId) => {
  const response = await api.get(`/tender/tender/history/snapshots/${tenderId}/`);
  return response.data;
};


