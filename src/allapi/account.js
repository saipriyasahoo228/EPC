// api/ledgerApi.js
import api from "../api"; // your axios instance

// Create Ledger Entry
export const createLedger = async (payload) => {
  try {
    const response = await api.post("/account/ledger/create/", payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating ledger:", error.response?.data || error.message);
    throw error;
  }
};
// Get All Ledger Entries
export const getLedgers = async () => {
  try {
    const response = await api.get("/account/ledger/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching ledgers:", error.response?.data || error.message);
    throw error;
  }
};
// Update Ledger Entry
export const updateLedger = async (ledgerId, payload) => {
  const response = await api.patch(`/account/ledger/${ledgerId}/`, payload);
  return response.data;
};

// Delete Ledger Entry
export const deleteLedger = async (ledgerId) => {
  const response = await api.delete(`/account/ledger/${ledgerId}/`);
  return response.data;
};
// Get all payables
export const getPayables = async () => {
  const response = await api.get("/account/payable/");
  return response.data;
};

// Create a new payable (POST)
export const createPayable = async (payload) => {
  const response = await api.post("/account/payable/", payload);
  return response.data;
};
// delete payble
export const deletePayable = async (invoiceId) => {
  const response = await api.delete(`/account/payable/${invoiceId}/`);
  return response.data;
};
//Update payable
export const updatePayable = async (invoiceId, payload) => {
  const response = await api.patch(`/account/payable/${invoiceId}/`, payload);
  return response.data;
};
// Create a new guest (POST)
export const createGuest = async (payload) => {
  const response = await api.post("/account/guest/", payload);
  return response.data;
};
// Get all guests (GET)
export const getGuests = async () => {
  const response = await api.get("/account/guest/");
  return response.data;
};
// Delete guest by ID (DELETE)
export const deleteGuest = async (guestId) => {
  const response = await api.delete(`/account/guest/${guestId}/`);
  return response.data;
};
// Update guest by ID (PATCH)
export const updateGuest = async (guestId, payload) => {
  const response = await api.patch(`/account/guest/${guestId}/`, payload);
  return response.data;
};
//POST api to create account recievable
export const createReceivable = async (data) => {
  const response = await api.post("/account/receivable/", data);
  return response.data;
};
//GET api of account recievable
export const getReceivables = async () => {
  const response = await api.get("/account/receivable/");
  return response.data;
};
// ✅ Delete a receivable by invoice_id
export const deleteReceivable = async (invoiceId) => {
  const response = await api.delete(`/account/receivable/${invoiceId}/`);
  return response.data;
};
// Update (PATCH)
export const updateReceivable = async (invoiceId, updatedData) => {
  const response = await api.patch(`/account/receivable/${invoiceId}/`, updatedData);
  return response.data;
};
//POST api for financial report
export const createFinancialReport = async (data) => {
  const response = await api.post("/account/financial-report/", data);
  return response.data;
};
// GET all financial reports
export const getFinancialReports = async () => {
  const response = await api.get("/account/financial-report/");
  return response.data;
};
//Delete api for financial report
export const deleteFinancialReport = async (reportId) => {
  const response = await api.delete(`/account/financial-report/${reportId}/`);
  return response.data;
};
// Update api for financial report
export const updateFinancialReport = async (reportId, data) => {
  const response = await api.patch(`/account/financial-report/${reportId}/`, data);
  return response.data;
};

