import api from '../api'; // your configured axios instance

//Get all projects
export const getProjectsAccept = async () => {
  const response = await api.get('/tender/projects/accepted');
  return response.data;
};



// POST a new design plan
export const createDesignPlan = async (formData) => {
  try {
    const response = await api.post(
      '/engineering/design-planning/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating design plan:', error);
    throw error;
  }
};


// Get all design planning entries
export const getDesignPlans = async () => {
  const response = await api.get('/engineering/design-planning/');
  return response.data;
};


//Update Design details
export const updateDesignPlan = (designId, formData) => {
  return api.patch(`/engineering/design-planning/${designId}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


//Delete api for design details
export const deleteDesignPlan = (designId) => {
  return api.delete(`/engineering/design-planning/${designId}/`);
};

//Feasibility Studies post api

export const createFeasibilityStudy = async (formData) => {
  try {
    const response = await api.post(
      '/engineering/feasibility-study/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating feasibility study:', error);
    throw error;
  }
};

//Get api to get all feasibilities records
export const fetchFeasibilityStudies = async () => {
  try {
    const response = await api.get('/engineering/feasibility-study/');
    return response.data;
  } catch (error) {
    console.error('Error fetching studies:', error);
    throw error;
  }
};

//Update logic  for feasibility
export const patchFeasibilityStudy = async (feasibilityStudyId, formData) => {
  try {
    const response = await api.patch(
      `/engineering/feasibility-study/${feasibilityStudyId}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error patching feasibility study:', error);
    throw error;
  }
};

//Delete api for feasibility studies
export const deleteFeasibilityStudy = async (feasibilityStudyId) => {
  try {
    const response = await api.delete(
      `/engineering/feasibility-study/${feasibilityStudyId}/`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete feasibility study:', error.response?.data || error.message);
    throw error;
  }
};


// Update Vendor (PATCH)
export const updateVendor = async (vendorId, formData) => {
  return await api.patch(`/procurement/vendor/${vendorId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
