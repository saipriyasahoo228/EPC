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


