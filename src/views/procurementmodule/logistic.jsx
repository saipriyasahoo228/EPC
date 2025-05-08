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

const dummyProjects = [
  {
    projectId: "PRJ-2025-001",
    procurementId: "PROC-2025-001",
    purchaseOrderId: "PO-2025-001",
  },
  {
    projectId: "PRJ-2025-002",
    procurementId: "PROC-2025-002",
    purchaseOrderId: "PO-2025-002",
  },
  {
    projectId: "PRJ-2025-003",
    procurementId: "PROC-2025-003",
    purchaseOrderId: "PO-2025-003",
  },
];


const LogisticForm = () => {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
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
  
  const [procurements, setProcurements] = useState([]);
  const [selectedProcurementIndex, setSelectedProcurementIndex] = useState(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0); // Default to first project

  // Set the formData to the selected project data from dummyProjects
  useEffect(() => {
    if (open) {
      const selectedProject = dummyProjects[selectedProjectIndex];
      setFormData({
        ...formData,
        projectId: selectedProject.projectId,
        procurementId: selectedProject.procurementId,
        purchaseOrderId: selectedProject.purchaseOrderId,
      });
    }
  }, [open, selectedProjectIndex]); // Runs whenever open or selectedProjectIndex changes


  

  const handleOpenForm = () => {
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
  

  
  // Submit form
  

  const handleSubmit = () => {
    if (selectedProcurementIndex !== null) {
      // Editing existing procurement, retain the existing PO ID
      const updatedProcurements = [...procurements];
      updatedProcurements[selectedProcurementIndex] = {
        ...formData,
        poId: updatedProcurements[selectedProcurementIndex].poId, // Keep existing PO ID
      };
      setProcurements(updatedProcurements);
    } else {
      // Adding new procurement, use the manually entered PO ID from formData
      const updatedProcurement = {
        ...formData,
        projectId: selectedProjectId,
      };
      setProcurements((prev) => [...prev, updatedProcurement]);
    }
  
    // Reset form after submission
    setFormData({});
    setSelectedProjectId(null);
    setSelectedProcurementIndex(null);
    setOpen(false);
  };
  



  const handleEdit = (index) => {
    const procurementToEdit = procurements[index];
    setFormData(procurementToEdit);
    setSelectedProcurementIndex(index);
    setOpen(true);
  };

  const handleDelete = (index) => {
    const updatedProcurements = procurements.filter((_, i) => i !== index);
    setProcurements(updatedProcurements);
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Material Procurement</Typography>

      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>PURCHASE ORDERS</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Procurement ID</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Purchase Order ID</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyProjects.map((proj, i) => (
                  <TableRow key={i}>
                    <TableCell>{proj.projectId}</TableCell>
                    <TableCell>{proj.procurementId}</TableCell>
                    <TableCell>{proj.purchaseOrderId}</TableCell>

                    <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => handleOpenForm(proj.id)} color="primary">
                        <AddCircle sx={{ color: "#7267ef" }} />
                      </IconButton>
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
            <Typography variant="h6" gutterBottom>SUBMITTED MATERIALS PROCUREMENT RECORDS</Typography>

            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Procurement ID</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>PurchaseOrder ID</strong></TableCell>
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
                  {procurements.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.projectId}</TableCell>
                      <TableCell>{p.procurementId}</TableCell>
                      <TableCell>{p.purchaseOrderId}</TableCell>
                      <TableCell>{p.logisticId}</TableCell>
                      <TableCell>{p.transportId}</TableCell>
                      <TableCell>{p.vehicleDetails}</TableCell>
                      <TableCell>{p.driverName}</TableCell>
                      <TableCell>{p.dispatchDate}</TableCell>
                      <TableCell>{p.expectedArrivalDate}</TableCell>
                      <TableCell>{p.actualArrivalDate}</TableCell>
                      <TableCell>{p.deliveryLocation}</TableCell>
                      <TableCell>{p.shippingStatus}</TableCell>
                      <TableCell>{p.damageReport}</TableCell>
                      
                      <TableCell>
                        <IconButton color="warning" onClick={() => handleEdit(i)}>
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(i)}>
                          <Delete sx={{ color: "red" }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Enter Logistic Details</DialogTitle>
        <DialogContent sx={{ position: 'relative' }}>
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
    <label htmlFor="logisticId">Logistic ID</label>
    <input
      id="logisticId"
      name="logisticId"
      className="input"
      value={formData.logisticId || ''}
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
</Grid>

    </Grid>

    {/* Material Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Transport Information..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        
        <Grid item xs={6}>
          <label htmlFor="transportId">Transport provider Id</label>
          <input
          
            id="transportId"
            name="transportId"
            className="input"
            value={formData.transportId || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="vehicleDetails">Vehicle Details</label>
          <input
            id="vehicleDetails"
            name="vehicleDetails"
            className="input"
            value={formData.vehicleDetails || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="driverName">Driver Name</label>
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
  <label htmlFor="dispatchDate">Dispatch Date</label>
  <input
    id="dispatchDate"
    name="dispatchDate"
    className="input"
    value={formData.dispatchDate || ''}
    onChange={handleChange}
   
  />
</Grid>
<Grid item xs={6}>
  <label htmlFor="expectedArrivalDate">Expected Arrival Date</label>
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
  <label htmlFor="actualArrivalDate">Actual Arrival Date</label>
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
  <label htmlFor="deliveryLocation">Delivery Location</label>
  <input
    type="date"
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
    <option value="Issued">In Transit</option>
    <option value="In Progress">Delivered </option>
    <option value="Delivered">Delayed</option>
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
                Submit
              </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogisticForm;
