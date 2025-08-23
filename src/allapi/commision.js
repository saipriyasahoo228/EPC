import api from '../api'; // your configured axios instance
export const createTesting = async (payload) => {
  const response = await api.post("/testing/create/", payload);
  return response.data;
};
// GET
export const getTestingRecords = async () => {
  const response = await api.get("/testing/create/");
  return response.data;
};
//Delete api
export const deleteTesting = async (testingId) => {
  const res = await api.delete(`/testing/update/${testingId}/`);
  return res.data;
};
// Update testing record
export const updateTesting = async (testingId, data) => {
  const res = await api.patch(`/testing/update/${testingId}/`, data);
  return res.data; // backend response
};