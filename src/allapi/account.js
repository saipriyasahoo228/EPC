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
