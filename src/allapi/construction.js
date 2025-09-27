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
    console.log("Check: FETCHCONSTPROJ", response.data);
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
    console.log("Check: CREATESITEEXEC", formData);
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

// POST /construction/safety-expense/
export const createSafetyExpense = async (data) => {
  try {
    const response = await api.post("/construction/safety-expense/", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating safety expense:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/safety-expense/
export const getSafetyExpenses = async () => {
  try {
    const response = await api.get("/construction/safety-expense/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching safety expenses:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/safety-expense/:id/
export const getSafetyExpenseById = async (expenseId) => {
  try {
    const response = await api.get(`/construction/safety-expense/${expenseId}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching safety expense by id:", error.response?.data || error.message);
    throw error;
  }
};

// PATCH /construction/safety-expense/:id/
export const updateSafetyExpense = async (expenseId, payload) => {
  try {
    const response = await api.patch(`/construction/safety-expense/${expenseId}/`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating safety expense:", error.response?.data || error.message);
    throw error;
  }
};

// DELETE /construction/safety-expense/:id/
export const deleteSafetyExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/construction/safety-expense/${expenseId}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting safety expense:", error.response?.data || error.message);
    throw error;
  }
};

// ========================= Other Expense =========================
// POST /construction/other-expense/
export const createOtherExpense = async (data) => {
  try {
    const response = await api.post("/construction/other-expense/", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating other expense:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/other-expense/
export const getOtherExpenses = async () => {
  try {
    const response = await api.get("/construction/other-expense/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching other expenses:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/other-expense/:id/
export const getOtherExpenseById = async (expenseId) => {
  try {
    const response = await api.get(`/construction/other-expense/${expenseId}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching other expense by id:", error.response?.data || error.message);
    throw error;
  }
};

// PATCH /construction/other-expense/:id/
export const updateOtherExpense = async (expenseId, payload) => {
  try {
    const response = await api.patch(`/construction/other-expense/${expenseId}/`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating other expense:", error.response?.data || error.message);
    throw error;
  }
};

// DELETE /construction/other-expense/:id/
export const deleteOtherExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/construction/other-expense/${expenseId}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting other expense:", error.response?.data || error.message);
    throw error;
  }
};

// ========================= Labour Category =========================
// POST /construction/labour-category/
export const createLabourCategory = async (data) => {
  try {
    const response = await api.post("/construction/labour-category/", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating labour category:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/labour-category/
export const getLabourCategories = async () => {
  try {
    const response = await api.get("/construction/labour-category/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching labour categories:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/labour-category/:id/
export const getLabourCategoryById = async (id) => {
  try {
    const response = await api.get(`/construction/labour-category/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching labour category by id:", error.response?.data || error.message);
    throw error;
  }
};

// PATCH /construction/labour-category/:id/
export const updateLabourCategory = async (id, payload) => {
  try {
    const response = await api.patch(`/construction/labour-category/${id}/`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating labour category:", error.response?.data || error.message);
    throw error;
  }
};

// DELETE /construction/labour-category/:id/
export const deleteLabourCategory = async (id) => {
  try {
    const response = await api.delete(`/construction/labour-category/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting labour category:", error.response?.data || error.message);
    throw error;
  }
};

// POST /construction/labour-resource/
export const createLabourResource = async (data) => {
  try {
    const response = await api.post("/construction/labour-resource/", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating labour resource:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/labour-resource/
export const getLabourResources = async () => {
  try {
    const response = await api.get("/construction/labour-resource/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching labour resources:", error.response?.data || error.message);
    throw error;
  }
};

// GET /construction/labour-resource/:id/
export const getLabourResourceById = async (id) => {
  try {
    const response = await api.get(`/construction/labour-resource/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching labour resource by id:", error.response?.data || error.message);
    throw error;
  }
};

// PATCH /construction/labour-resource/:id/
export const updateLabourResource = async (id, payload) => {
  try {
    const response = await api.patch(`/construction/labour-resource/${id}/`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating labour resource:", error.response?.data || error.message);
    throw error;
  }
};

// DELETE /construction/labour-resource/:id/
export const deleteLabourResource = async (id) => {
  try {
    const response = await api.delete(`/construction/labour-resource/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting labour resource:", error.response?.data || error.message);
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

// Create Milestone (POST)
export const createMilestone = async (data) => {
  try {
    const response = await api.post("/construction/milestone/", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating milestone:", error.response?.data || error.message);
    throw error;
  }
};

// Get all Milestones (GET)
export const getMilestones = async () => {
  try {
    const response = await api.get("/construction/milestone/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching milestones:", error.response?.data || error.message);
    throw error;
  }
};

// Get Milestones by Project ID (GET with query param)
export const getMilestonesByProject = async (projectId) => {
  try {
    const response = await api.get(`/construction/milestone/`, {
      params: { project_id: projectId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching milestones by project:", error.response?.data || error.message);
    throw error;
  }
};

// Get single Milestone by ID (GET)
export const getMilestoneById = async (milestoneId) => {
  try {
    const response = await api.get(`/construction/milestone/${milestoneId}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching milestone by id:", error.response?.data || error.message);
    throw error;
  }
};

// Update Milestone (PATCH)
export const updateMilestone = async (milestoneId, payload) => {
  try {
    const response = await api.patch(`/construction/milestone/${milestoneId}/`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating milestone:", error.response?.data || error.message);
    throw error;
  }
};

// Delete Milestone (DELETE)
export const deleteMilestone = async (milestoneId) => {
  try {
    const response = await api.delete(`/construction/milestone/${milestoneId}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting milestone:", error.response?.data || error.message);
    throw error;
  }
};


// GET /construction/labour-usage/vendor-report/
export const getLabourUsageVendorReport = async (params = {}) => {
  try {
    const response = await api.get("/construction/labour-usage/vendor-report/", { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching labour usage vendor report:", error.response?.data || error.message);
    throw error;
  }
};

