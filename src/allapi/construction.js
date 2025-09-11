import api from '../api'; // your configured axios instance

// Post API for Project
export const createProject = async (formData) => {
  try {
    const response = await api.post(
      "/construction/project-management/", 
      formData
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error creating project:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get Construction Projects (GET)
export const fetchConstructionProjects = async () => {
  try {
    const response = await api.get("/construction/project-management/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching construction projects:", error.response?.data || error.message);
    throw error;
  }
};


// ✅ Delete Construction Project (DELETE)
export const deleteConstructionProject = async (projectId) => {
  try {
    const response = await api.delete(`/construction/project-management/${projectId}/`);
    return response.data; // return backend response if needed
  } catch (error) {
    console.error(
      "❌ Error deleting construction project:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Update Construction Project details
export const updateConstructionProject = (projectId, formData) => {
  return api.patch(`/construction/project-management/${projectId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//POST API for site-execution
export const createSiteExecution = async (formData) => {
  try {
    const response = await api.post(
      "/construction/site-execution/",  
      formData
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error creating site execution:", error.response?.data || error.message);
    throw error;
  }
};

//Get api for Site-Execution
export const getSiteExecutions = async () => {
  try {
    const response = await api.get("/construction/site-execution/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching site executions:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ DELETE API for Site Execution
export const deleteSiteExecution = async (siteId) => {
  try {
    const response = await api.delete(`/construction/site-execution/${siteId}/`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error deleting site execution:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// ✅ UPDATE API for Site Execution
export const updateSiteExecution = async (siteId, updatedData) => {
  try {
    const response = await api.patch(
      `/construction/site-execution/${siteId}/`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error updating site execution:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//POST API for quality control and assuarance

export const createQualityControl = async (payload) => {
  const response = await api.post("/construction/quality-control/", payload);
  return response.data;
};

// ✅ GET API for Quality Control
export const getQualityControls = async () => {
  try {
    const response = await api.get("/construction/quality-control/");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching quality control records:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ PATCH API for Quality Control
export const updateQualityControl = async (qcId, updatedData) => {
  try {
    const response = await api.patch(
      `/construction/quality-control/${qcId}/`, 
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error updating quality control:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// ✅ API Service - Delete Quality Control Record
export const deleteQualityControl = async (qc_id) => {
  try {
    const response = await api.delete(`/construction/quality-control/${qc_id}/`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error deleting quality control record:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// ✅ POST a new Safety Management record
export const createSafetyManagement = async (data) => {
  try {
    const response = await api.post("/construction/safety-management/", data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating safety management record:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//Get api for safetymanagement
export const getSafetyManagements = async () => {
  try {
    const response = await api.get("/construction/safety-management/");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching safety management records:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Delete a safety management record
export const deleteSafetyManagement = async (safetyId) => {
  try {
    const response = await api.delete(`/construction/safety-management/${safetyId}/`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error deleting safety management record:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//UPDATE api for safetymanagement
export const updateSafetyManagement = async (safety_report_id, payload) => {
  try {
    const response = await api.patch(`/construction/safety-management/${safety_report_id}/`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating safety management record:", error.response?.data || error.message);
    throw error;
  }
};

//post api for material inventory
export const createMaterialInventory = async (data) => {
  try {
    const response = await api.post("/construction/material-inventory/", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating material inventory:", error.response?.data || error.message);
    throw error;
  }
};

// get api for material inventory
export const getMaterialInventory = async () => {
  try {
    const response = await api.get("/construction/material-inventory/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching material inventory:", error.response?.data || error.message);
    throw error;
  }
};
// delete api for material inventory
export const deleteMaterialInventory = async (id) => {
  try {
    const response = await api.delete(`/construction/material-inventory/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting material inventory:", error.response?.data || error.message);
    throw error;
  }
};

// update api for material inventory
export const updateMaterialInventory = async (id, updatedData) => {
  try {
    const response = await api.patch(`/construction/material-inventory/${id}/`, updatedData);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating material inventory:", error.response?.data || error.message);
    throw error;
  }
};
