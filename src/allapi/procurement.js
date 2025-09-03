import api from '../api'; // your configured axios instance

//Post api for vendor details
export const createVendor = async (formData) => {
  try {
    const response = await api.post('/procurement/vendor/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error creating vendor:', error.response?.data || error.message);
    throw error;
  }
};

//Get all Vendor details
export const getVendors = async () => {
  const response = await api.get('/procurement/vendor/');
  return response.data;
};

//delete vendor details
export const deleteVendor = async (vendorId) => {
  try {
    const response = await api.delete(`/procurement/vendor/${vendorId}/`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete failed:', error.response?.data || error.message);
    throw error;
  }
};

//Update Vendor details
export const updateVendor = async (vendorId, formData) => {
  return await api.patch(`/procurement/vendor/${vendorId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

//Material Procurement Post API
export const createMaterialProcurement = async (formData) => {
  try {
    const response = await api.post('/procurement/material/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error creating material procurement:', error.response?.data || error.message);
    throw error;
  }
};

//Get api for procurement details
export const getMaterialProcurements = async () => {
  try {
    const response = await api.get('/procurement/material/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching material procurements:', error.response?.data || error.message);
    throw error;
  }
};


// PATCH Material Procurement with FormData
export const updateMaterialProcurement = async (procurementId, formData) => {
  try {
    const response = await api.patch(`/procurement/material/${procurementId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating material procurement:', error.response?.data || error.message);
    throw error;
  }
};

// delete material procurement
export const deleteProcurement = async (procurementId) => {
  try {
    const response = await api.delete(`/procurement/material/${procurementId}/`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete failed:', error.response?.data || error.message);
    throw error;
  }
};

//POST API FOR PURCHASE ORDER

export const createPurchaseOrder = async (formData) => {
  try {
    const response = await api.post('/procurement/purchase-order/', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error creating purchase order:', error.response?.data || error.message);
    throw error;
  }
};

//Get API to fetch purchase-order
export const getPurchaseOrders = async () => {
  try {
    const response = await api.get('/procurement/purchase-order/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching purchase orders:', error.response?.data || error.message);
    throw error;
  }
};

//Delete api for purchase order

export const deletePurchaseOrder = async (purchaseOrderId) => {
  try {
    const response = await api.delete(`/procurement/purchase-order/${purchaseOrderId}/`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete failed:', error.response?.data || error.message);
    throw error;
  }
};

export const updatePurchaseOrder = async (po_number, formData) => {
  try {
    const response = await api.patch(`/procurement/purchase-order/${po_number}/`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating purchase order:', error.response?.data || error.message);
    throw error;
  }
};

//POST api for logistic management
// Create Logistics
export const createLogistics = async (payload) => {
  try {
    const response = await api.post("/procurement/logistics/", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      Object.values(error.response?.data || {})[0] ||
      "Error creating Logistics!";
    throw new Error(backendMessage);
  }
};

// ✅ Fetch all logistics records
export const fetchLogistics = async () => {
  try {
    const response = await api.get("/procurement/logistics/");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching logistics:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Delete logistics by ID
export const deleteLogistics = (logisticId) => {
  return api.delete(`/procurement/logistics/${logisticId}/`);
};

// ✅ Update logistics by ID
export const updateLogistics = (logisticId, formData) => {
  return api.patch(`/procurement/logistics/${logisticId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
