import api from '../api'; // your configured axios instance
//POST api testing management
export const createTesting = async (payload) => {
  const response = await api.post("/testing/create/", payload);
  return response.data;
};
// GET api testing management
export const getTestingRecords = async () => {
  const response = await api.get("/testing/create/");
  return response.data;
};
//Delete api api testing management
export const deleteTesting = async (testingId) => {
  const res = await api.delete(`/testing/update/${testingId}/`);
  return res.data;
};
// Update testing record
export const updateTesting = async (testingId, data) => {
  const res = await api.patch(`/testing/update/${testingId}/`, data);
  return res.data; // backend response
};

// POST Handover
export const createHandover = async (payload) => {
  const response = await api.post("/testing/handover/", payload);
  return response.data;
};

//GET api for handover
export const getHandovers = async () => {
  const response = await api.get("/testing/handover/");
  return response.data;
};

// 🔹 Delete API for Handover
export const deleteHandover = async (handoverId) => {
  const res = await api.delete(`/testing/handover/${handoverId}/`);
  return res.data;
};

// ✅ PUT API - Update Handover
export const updateHandover = async (handoverId, payload) => {
  const res = await api.put(`/testing/handover/${handoverId}/`, payload);
  return res.data;
};


// POST - create compliance
export const createCompliance = async (payload) => {
  const response = await api.post("/testing/compliance/", payload);
  return response.data;
};

// GET - all compliance records
export const getComplianceList = async () => {
  const response = await api.get("/testing/compliance/");
  return response.data;
};

// PATCH - update compliance
export const updateCompliance = async (complianceId, payload) => {
  const response = await api.put(`/testing/compliance/${complianceId}/`, payload);
  return response.data;
};
// DELETE - delete compliance
export const deleteCompliance = async (complianceId) => {
  const response = await api.delete(`/testing/compliance/${complianceId}/`);
  return response.data;
};
// GET all system integration reports
export const getSystemIntegrations = async () => {
  const response = await api.get("/testing/system-integration/");
  return response.data;
};

// POST new system integration report
export const createSystemIntegration = async (payload) => {
  const response = await api.post("/testing/system-integration/", payload);
  return response.data;
};
// DELETE system integration report by final_report_id
export const deleteSystemIntegration = async (finalReportId) => {
  const response = await api.delete(`/testing/system-integration/${finalReportId}/`);
  return response.data;
};
// PATCH system integration report by final_report_id
export const updateSystemIntegration = async (finalReportId, payload) => {
  const response = await api.put(`/testing/system-integration/${finalReportId}/`, payload);
  return response.data;
};
