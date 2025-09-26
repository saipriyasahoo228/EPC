import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid, 
  Typography,
  IconButton,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import { getMaterialProcurements , createLogistics,fetchLogistics,deleteLogistics,updateLogistics} from "../../allapi/procurement";
import { DisableIfCannot, ShowIfCan } from '../../components/auth/RequirePermission';
import { Maximize2, Minimize2 } from "lucide-react";
import { formatDateDDMMYYYY } from '../../utils/date';



const LogisticForm = () => {
  const MODULE_SLUG = 'procurement';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [logisticsList, setLogisticsList] = useState([]);
  const [filteredLogistic, setFilteredLogistic] = useState([]);
  const [materialProjects, setMaterialProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [procurements, setProcurements] = useState([]);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    purchaseOrderId:'',
    logisticId:'',
    transportId: '',
    vehicleDetails:'',
    driverName:'',
    dispatchDate:'',
    expectedArrivalDate:'',
    actualArrivalDate:'',
    deliveryLocation:'',
    shippingStatus:'',
    damageReport:'',
   
    
  });
  
  const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };
  

  

   // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMaterialProcurements();
        setMaterialProjects(data);
        console.log("✅ Material procurements:", data);
      } catch (error) {
        console.error("❌ Failed to fetch material procurements:", error);
      }
    };

    fetchData();
  }, []);


  // Fetch logistics data
const loadLogistics = async () => {
  try {
    const data = await fetchLogistics(); // GET API
    setLogisticsList(data);

    // Map API response to table-friendly format
    const mappedData = data.map((item) => ({
      logisticId: item.logistics_id,
      transportId: item.transport_provider_id,
      vehicleDetails: item.vehicle_details,
      driverName: item.driver_name,
      dispatchDate: item.dispatch_date,
      expectedArrivalDate: item.expected_arrival_date,
      actualArrivalDate: item.actual_arrival_date,
      deliveryLocation: item.delivery_location,
      shippingStatus: item.shipping_status,
      damageReport: item.damage_report,
    }));

    setFilteredLogistic(mappedData);

  } catch (error) {
    console.error("Failed to load logistics:", error);
  }
};

// Load on mount
useEffect(() => {
  loadLogistics();
}, []);

// Generate next Logistic ID based on existing logistics
const generateLogisticId = () => {
  const currentYear = new Date().getFullYear();

  // Find the last numeric part from all existing logistics
  const lastId = logisticsList?.reduce((max, item) => {
    if (item.logistics_id?.startsWith(`LOG-${currentYear}-`)) {
      const num = parseInt(item.logistics_id.split('-')[2], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0) || 0;

  const nextNumber = String(lastId + 1).padStart(3, '0');
  return `LOG-${currentYear}-${nextNumber}`;
};

  

// Open form
const handleOpenForm = (index) => {
  const selected = materialProjects?.[index];
  if (!selected) return;

  setSelectedIndex(index);
  setFormData({
    projectId: selected.project,
    procurementId: selected.procurement_id,
    purchaseOrderId: selected.purchase_order,
    logisticId: generateLogisticId(), // auto-generate unique ID
    transportId: '',
    vehicleDetails: '',
    driverName: '',
    dispatchDate: '',
    expectedArrivalDate: '',
    actualArrivalDate: '',
    deliveryLocation: '',
    shippingStatus: '',
    damageReport: '',
  });

  setOpen(true);
};

  const handleClose = () => {
    setOpen(false);
  };


  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
  
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
  
      // Auto-calculate total cost if quantity or unit price changes
      if (name === 'quantity' || name === 'unitPrice') {
        const quantity = parseFloat(updatedFormData.quantity) || 0;
        const unitPrice = parseFloat(updatedFormData.unitPrice) || 0;
        const totalCost = (quantity * unitPrice).toFixed(2); // Calculate total cost and keep it two decimal places
        updatedFormData.totalCost = totalCost; // Update total cost in the form data
      }
  
      return updatedFormData;
    });
  };
  

 
  //HandleSubmit
//   const handleSubmit = async () => {
//   try {
//     // Build payload for backend
//     const payload = {
//       logistics_id: formData.logisticId,         // auto-generated
//       po_number: formData.purchaseOrderId,       // FK
//       transport_provider_id: formData.transportId,
//       vehicle_details: formData.vehicleDetails,
//       driver_name: formData.driverName,
//       dispatch_date: formData.dispatchDate,
//       expected_arrival_date: formData.expectedArrivalDate,
//       actual_arrival_date: formData.actualArrivalDate || null,
//       delivery_location: formData.deliveryLocation,
//       shipping_status: formData.shippingStatus || "In Transit",
//       damage_report: formData.damageReport || "",
//     };

//     const response = await createLogistics(payload);
//     console.log("✅ Logistics created:", response);
//     alert("Logistics details submitted successfully!");

//     // Reset form
//     setFormData({
//       projectId: '',
//       purchaseOrderId:'',
//       logisticId: '', // will be regenerated next time
//       transportId: '',
//       vehicleDetails:'',
//       driverName:'',
//       dispatchDate:'',
//       expectedArrivalDate:'',
//       actualArrivalDate:'',
//       deliveryLocation:'',
//       shippingStatus:'In Transit',
//       damageReport:'',
//     });

//     setOpen(false);
//     // Optional: refresh logistics list if you have one
//     loadLogistics();

//   } catch (error) {
//     console.error("❌ Error creating logistics:", error);
//     alert(`Error: ${error.message}`);
//   }
// };

const handleSubmit = async () => {
  if (!formData.transportId || !formData.transportId.trim()) {
    alert('Please provide the transport provider ID.');
    return;
  }

  if (!formData.vehicleDetails || !formData.vehicleDetails.trim()) {
    alert('Please enter the vehicle details.');
    return;
  }

  if (!formData.driverName || !formData.driverName.trim()) {
    alert('Please enter the driver name.');
    return;
  }

  if (!formData.dispatchDate) {
    alert('Please select the dispatch date.');
    return;
  }

  if (!formData.expectedArrivalDate) {
    alert('Please select the expected delivery date.');
    return;
  }

  if (!formData.actualArrivalDate) {
    alert('Please select the actual delivery date.');
    return;
  }

  if (!formData.deliveryLocation || !formData.deliveryLocation.trim()) {
    alert('Please enter the delivery location.');
    return;
  }

  try {
    const payload = {
      po_number: formData.purchaseOrderId,
      transport_provider_id: formData.transportId,
      vehicle_details: formData.vehicleDetails,
      driver_name: formData.driverName,
      dispatch_date: formData.dispatchDate,
      expected_arrival_date: formData.expectedArrivalDate,
      actual_arrival_date: formData.actualArrivalDate || null,
      delivery_location: formData.deliveryLocation,
      shipping_status: formData.shippingStatus || "In Transit",
      damage_report: formData.damageReport || "",
    };

    if (isEditing) {
      // ✅ Update existing record
      await updateLogistics(formData.logisticId, payload);
      alert("Logistics details updated successfully!");
    } else {
      // ✅ Create new record
      await createLogistics({
        ...payload,
        logistics_id: formData.logisticId, // auto-generated
      });
      alert("Logistics details submitted successfully!");
    }

    // Reset form
    setFormData({
      projectId: '',
      procurementId: '',
      purchaseOrderId: '',
      logisticId: '',
      transportId: '',
      vehicleDetails: '',
      driverName: '',
      dispatchDate: '',
      expectedArrivalDate: '',
      actualArrivalDate: '',
      deliveryLocation: '',
      shippingStatus: 'In Transit',
      damageReport: '',
    });

    setIsEditing(false);
    setOpen(false);
    loadLogistics(); // refresh the table

  } catch (error) {
    console.error("❌ Error submitting logistics:", error);
    alert(`Error: ${error.message}`);
  }
};


const handleDelete = async (logisticId, index) => {
  const confirmDelete = window.confirm(`Are you sure you want to delete logistics ID: ${logisticId}?`);
  if (!confirmDelete) return;

  try {
    await deleteLogistics(logisticId);

    // Remove from state
    const updatedList = [...logisticsList];
    updatedList.splice(index, 1);
    setLogisticsList(updatedList);

    alert("✅ Logistics deleted successfully!");
    loadLogistics();
  } catch (error) {
    console.error("❌ Error deleting logistics:", error);
    alert("❌ Failed to delete logistics.");
    
  }
};



  // const handleEdit = (index) => {
  //   const procurementToEdit = procurements[index];
  //   setFormData(procurementToEdit);
  //   setSelectedProcurementIndex(index);
  //   setOpen(true);
  // };

//   const handleEdit = (index) => {
//   const selected = logisticsList?.[index];
//   if (!selected) return;

//   setSelectedIndex(index);
//   setIsEditing(true);
//   setFormData({
//     projectId: selected.projectId,
//     procurementId: selected.procurementId,
//     purchaseOrderId: selected.purchaseOrderId,
//     logisticId: selected.logisticId, // non-editable
//     transportId: selected.transportId,
//     vehicleDetails: selected.vehicleDetails,
//     driverName: selected.driverName,
//     dispatchDate: selected.dispatchDate,
//     expectedArrivalDate: selected.expectedArrivalDate,
//     actualArrivalDate: selected.actualArrivalDate,
//     deliveryLocation: selected.deliveryLocation,
//     shippingStatus: selected.shippingStatus,
//     damageReport: selected.damageReport,
//   });

//   setOpen(true);
// };
const handleEdit = (index) => {
  const selected = logisticsList?.[index];
  if (!selected) return;

  setSelectedIndex(index);
  setIsEditing(true);
  setFormData({
    
    purchaseOrderId: selected.po_number || '',     // FK
    logisticId: selected.logistics_id || '',       // non-editable
    transportId: selected.transport_provider_id || '',
    vehicleDetails: selected.vehicle_details || '',
    driverName: selected.driver_name || '',
    dispatchDate: selected.dispatch_date || '',
    expectedArrivalDate: selected.expected_arrival_date || '',
    actualArrivalDate: selected.actual_arrival_date || '',
    deliveryLocation: selected.delivery_location || '',
    shippingStatus: selected.shipping_status || 'In Transit',
    damageReport: selected.damage_report || '',
  });

  setOpen(true);
};



  const filteredProcurement =procurements.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );


  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Logistic Management</Typography>

      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
  <Typography variant="h6" gutterBottom>PURCHASE ORDERS</Typography>

  {/* Search Input */}
  <Box sx={{ my: 2, mx: 1 }}>
    <input
      type="text"
      placeholder="Search Purchase Orders"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="input"
      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
    />
  </Box>

  <Table>
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Procurement ID</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Purchase Order ID</strong></TableCell>
        <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}>
          <strong>Action</strong>
        </TableCell>
      </TableRow>
    </TableHead>
     <TableBody>
        {materialProjects
          .filter((proj) =>
            `${proj.project_id} ${proj.procurement_id} ${proj.purchase_order_id}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .map((proj, i) => (
            <TableRow key={i}>
              <TableCell>{proj.project}</TableCell>
              <TableCell>{proj.procurement_id}</TableCell>
              <TableCell>{proj.purchase_order}</TableCell>
              <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ShowIfCan slug={MODULE_SLUG} action="can_create">
                <IconButton onClick={() => handleOpenForm(i)} color="primary">
                  <AddCircle sx={{ color: "#7267ef" }} />
                </IconButton>
                </ShowIfCan>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
  </Table>
</Paper>

        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>SUBMITTED LOGISTIC RECORDS</Typography>
            <input
              type="text"
              placeholder="Search Logistic Management Here.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                  
                    
                    <TableCell sx={{ color: '#7267ef' }}><strong>Logistic ID </strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Transport Provider Id </strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Vehicle Details</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Driver Name</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Dispatch Date</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Expected Arrival Date</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Actual Arrival Date</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Delivery Location</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Shipping Status</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Damage Report</strong></TableCell>
                    <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogistic.map((p, i) => (
                    <TableRow key={i}>
                     
                      
                      <TableCell>{p.logisticId}</TableCell>
                      <TableCell>{p.transportId}</TableCell>
                      <TableCell>{p.vehicleDetails}</TableCell>
                      <TableCell>{p.driverName}</TableCell>
                      <TableCell>{formatDateDDMMYYYY(p.dispatchDate)}</TableCell>
                      <TableCell>{formatDateDDMMYYYY(p.expectedArrivalDate)}</TableCell>
                      <TableCell>{formatDateDDMMYYYY(p.actualArrivalDate)}</TableCell>
                      <TableCell>{p.deliveryLocation}</TableCell>
                      <TableCell>{p.shippingStatus}</TableCell>
                      <TableCell>{p.damageReport}</TableCell>
                      
                      <TableCell>
                        <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                        <IconButton color="warning" onClick={() => handleEdit(i)}>
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        </DisableIfCannot>
                        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                         <IconButton color="error" onClick={() => handleDelete(p.logisticId, i)}>
                          <Delete sx={{ color: "red" }} />
                        </IconButton>
                        </ShowIfCan>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
             open={open}
             onClose={handleClose}
             fullWidth
             maxWidth="xl"
             PaperProps={{
               style: isModalMaximized
                 ? {
                     width: "100%",
                     height: "100vh", // fullscreen
                     margin: 0,
                   }
                 : {
                     width: "70%",
                     height: "97vh", // default size
                   },
             }}
           >

        <DialogTitle>Enter Logistic Details</DialogTitle>
         <DialogContent
                  sx={{
                    position: "relative",
                    overflowY: "auto", // ensures internal scrolling
                  }}
                >
               <IconButton
                    aria-label="toggle-size"
                    onClick={toggleModalSize}
                    sx={{
                      position: "absolute",
                      right: 40,
                      top: 8,
                      color: (theme) => theme.palette.grey[600],
                    }}
                  >
                    {isModalMaximized ? <Minimize2 /> : <Maximize2 />}
                  </IconButton>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box component="form" sx={{ mt: 2 }}>
  <Grid container spacing={3} direction="column">
    {/* Non-editable fields */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Purchase Order & Vendor info..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
  <Grid item xs={6}>
    <label htmlFor="purchaseOrderId">Purchase Order ID</label>
    <input
      id="purchaseOrderId"
      name="purchaseOrderId"
      className="input"
      value={formData.purchaseOrderId || ''}
      disabled // This makes it non-editable
    />
  </Grid>


  <Grid item xs={6}>
    <label htmlFor="projectId">Project ID</label>
    <input
      id="projectId"
      name="projectId"
      className="input"
      value={formData.projectId || ''}
      disabled // This makes it non-editable
    />
  </Grid>

  <Grid item xs={6}>
    <label htmlFor="procurementId">Procurement ID</label>
    <input
      id="procurementId"
      name="procurementId"
      className="input"
      value={formData.procurementId || ''}
      disabled // This makes it non-editable
    />
  </Grid>
    <Grid item xs={6}>
    <label htmlFor="logisticId">Logistic ID</label>
    <input
      id="logisticId"
      name="logisticId"
      className="input"
      value={formData.logisticId || ''}
      disabled // This makes it non-editable
    />
  </Grid>
</Grid>

    </Grid>

    {/* Material Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Transport Information..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        
        <Grid item xs={6}>
          <label htmlFor="transportId">Transport Provider ID <span style={{color: 'red'}}>*</span></label>
          <input
          
            id="transportId"
            name="transportId"
            className="input"
            value={formData.transportId || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="vehicleDetails">Vehicle Details <span style={{color: 'red'}}>*</span></label>
          <input
            id="vehicleDetails"
            name="vehicleDetails"
            className="input"
            value={formData.vehicleDetails || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="driverName">Driver Name <span style={{color: 'red'}}>*</span></label>
          <input
            id="driverName"
            name="driverName"
            className="input"
            value={formData.driverName || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Grid>

    {/* Total Cost & Other Info */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Shipping Status..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
      <Grid item xs={6}>
  <label htmlFor="dispatchDate">Dispatch Date <span style={{color: 'red'}}>*</span></label>
  <input
    type="date"
    id="dispatchDate"
    name="dispatchDate"
    className="input"
    value={formData.dispatchDate || ''}
    onChange={handleChange}
   
  />
</Grid>
<Grid item xs={6}>
  <label htmlFor="expectedArrivalDate">Expected Arrival Date <span style={{color: 'red'}}>*</span></label>
  <input
    type="date"
    id="expectedArrivalDate"
    name="expectedArrivalDate"
    className="input"
    value={formData.expectedArrivalDate || ''}
    onChange={handleChange}
   
  />
</Grid>
<Grid item xs={6}>
  <label htmlFor="actualArrivalDate">Actual Arrival Date <span style={{color: 'red'}}>*</span></label>
  <input
    type="date"
    id="actualArrivalDate"
    name="actualArrivalDate"
    className="input"
    value={formData.actualArrivalDate || ''}
    onChange={handleChange}
   
  />
</Grid>
<Grid item xs={6}>
  <label htmlFor="deliveryLocation">Delivery Location <span style={{color: 'red'}}>*</span></label>
  <input
    
    id="deliveryLocation"
    name="deliveryLocation"
    className="input"
    value={formData.deliveryLocation || ''}
    onChange={handleChange}
   
  />
</Grid>
<Grid item xs={6}>
  <label htmlFor="shippingStatus">Shipping Status</label>
  <select
    id="shippingStatus"
    name="shippingStatus"
    className="input"
    value={formData.shippingStatus || ''}
    onChange={handleChange}
  >
    <option value="">Select Status</option> {/* Default option */}
    <option value="In Transit">In Transit</option>
    <option value="Delivered">Delivered </option>
    <option value="Delayed">Delayed</option>
    <option value="Canceled">Canceled</option>
  </select>
</Grid>

        <Grid item xs={6}>
          <label htmlFor="damageReport">Damage Report</label>
          <input
            
            id="damageReport"
            name="damageReport"
            className="input"
            value={formData.damageReport || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Grid>

    


   

  </Grid>
</Box>

        </DialogContent>
        <DialogActions>
          <Button
                onClick={handleClose}
                sx={{
                  outline: '2px solid #800000',  // Dark maroon outline
                  color: '#800000',              // Dark maroon text color
                  '&:hover': {
                    outline: '2px solid #b30000',  // Lighter maroon outline on hover
                    color: '#b30000',              // Lighter maroon text color on hover
                  }
                }}
              >
                Cancel
              </Button>
              <DisableIfCannot slug={MODULE_SLUG} action={isEditing ? 'can_update' : 'can_create'}>

              <Button
                variant="outlined"
                onClick={handleSubmit}
                sx={{
                  borderColor: '#7267ef',  // Border color
                  color: '#7267ef',        // Text color
                  '&:hover': {
                    borderColor: '#9e8df2',  // Lighter border color on hover
                    color: '#9e8df2',         // Lighter text color on hover
                  }
                }}
              >
                {isEditing ? "Update Logistic Details" : "Submit Logistic Details"}
              </Button>
              </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogisticForm;
