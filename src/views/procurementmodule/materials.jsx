import React, { useState } from "react";
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
  { id: "PRJ-2025-001" },
  { id: "PRJ-2025-002" },
  { id: "PRJ-2025-003" },
];

const MaterialForm = () => {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formData, setFormData] = useState({
    projectId:'',
    procurementId: '',
    materialName: '',
    materialCode: '',
    quantity: '',
    unitPrice: '',
    totalCost: '',
    requestedBy: '',
    requestDate: '',
    approvalStatus: 'Pending',
    poId: '',
    expectedDeliveryDate: '',
    paymentStatus:''
  });
  
  const [procurements, setProcurements] = useState([]);
  const [selectedProcurementIndex, setSelectedProcurementIndex] = useState(null);


  // Open form with new procurement ID
  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    
    const yearPrefix = new Date().getFullYear();
    const nextProcurementNumber = procurements.length + 1;
    const formattedNumber = nextProcurementNumber.toString().padStart(3, '0');
    
    const procurementId = `${yearPrefix}-PROC-${formattedNumber}`;
  
    // Update formData with both procurementId and projectId in one call
    setFormData((prevFormData) => ({
      ...prevFormData,  // retain existing formData
      procurementId,    // add/update procurementId
      projectId,        // add/update projectId
    }));
  
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);

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
    const currentYear = new Date().getFullYear(); // Get the current year
  
    // Filter procurements for the current year to find the highest PO number
    const currentYearProcurements = procurements.filter(
      (p) => p.poId && p.poId.startsWith(`${currentYear}-PO`)
    );
  
    // Find the highest PO number for the current year and increment it
    const maxPoNumber = currentYearProcurements.reduce((max, p) => {
      const poNumber = parseInt(p.poId.split('-')[2], 10); // Extract the number part of PO ID
      return poNumber > max ? poNumber : max;
    }, 0);
  
    const nextPoNumber = maxPoNumber + 1;  // Auto-increment PO number
    const poId = `${currentYear}-PurchaseOrder ID-${nextPoNumber}`; // Generate PO ID
  
    if (selectedProcurementIndex !== null) {
      // Editing existing procurement, keep the same PO ID
      const updatedProcurements = [...procurements];
      updatedProcurements[selectedProcurementIndex] = {
        ...formData,
        poId: updatedProcurements[selectedProcurementIndex].poId, // Retain the same PO ID
      };
      setProcurements(updatedProcurements);
    } else {
      // Adding new procurement, generate a new PO ID
      const updatedProcurement = {
        ...formData,
        projectId: selectedProjectId,
        poId: poId, // Add the generated PO ID
      };
      setProcurements((prev) => [...prev, updatedProcurement]);
    }
  
    // Show PO ID in an alert
    if (selectedProcurementIndex === null) {
      alert(`PO ID generated: ${poId}`);
    }
  
    // Reset the form after submission
    setFormData({});  // Reset form data
    setSelectedProjectId(null);  // Clear selected project
    setSelectedProcurementIndex(null);  // Clear selected procurement index

    setOpen(false); // Close the form
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
            <Typography variant="h6" gutterBottom>PROJECT RECORDS</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyProjects.map((proj, i) => (
                  <TableRow key={i}>
                    <TableCell>{proj.id}</TableCell>
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
                    <TableCell sx={{ color: '#7267ef' }}><strong>Material Name</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Quantity</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Unit Price</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Total Cost</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Requested By</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Request Date</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Approval Status</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Payment Status</strong></TableCell>
                    <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {procurements.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.projectId}</TableCell>
                      <TableCell>{p.procurementId}</TableCell>
                      <TableCell>{p.poId}</TableCell>
                      <TableCell>{p.materialName}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{p.unitPrice}</TableCell>
                      <TableCell>{p.totalCost}</TableCell>
                      <TableCell>{p.requestedBy}</TableCell>
                      <TableCell>{p.requestDate}</TableCell>
                      <TableCell>{p.approvalStatus}</TableCell>
                      <TableCell>{p.paymentStatus}</TableCell>
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
        <DialogTitle>Enter Procurement Details</DialogTitle>
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
      <h3 style={{ color: '#7267ef' }}>Project & Procurement Info</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <label htmlFor="projectId">Project ID</label>
          <input
            id="projectId"
            name="projectId"
            className="input"
            value={formData.projectId || ''}
            disabled // Make this non-editable
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="procurementId">Procurement ID</label>
          <input
            id="procurementId"
            name="procurementId"
            className="input"
            value={formData.procurementId || ''}
            disabled // Make this non-editable
          />
        </Grid>
      </Grid>
    </Grid>

    {/* Material Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Material Information</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <label htmlFor="materialName">Material Name</label>
          <input
            id="materialName"
            name="materialName"
            className="input"
            value={formData.materialName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="materialCode">Material Code</label>
          <input
            id="materialCode"
            name="materialCode"
            className="input"
            value={formData.materialCode || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            name="quantity"
            className="input"
            value={formData.quantity || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="unitPrice">Unit Price</label>
          <input
            id="unitPrice"
            name="unitPrice"
            className="input"
            value={formData.unitPrice || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Grid>

    {/* Total Cost & Other Info */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Cost & Info</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
      <Grid item xs={6}>
  <label htmlFor="totalCost">Total Cost</label>
  <input
    id="totalCost"
    name="totalCost"
    className="input"
    value={formData.totalCost || ''}
    disabled // Make it non-editable
  />
</Grid>
        <Grid item xs={6}>
          <label htmlFor="requestedBy">Requested By</label>
          <input
            id="requestedBy"
            name="requestedBy"
            className="input"
            value={formData.requestedBy || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="requestDate">Request Date</label>
          <input
            type="date"
            id="requestDate"
            name="requestDate"
            className="input"
            value={formData.requestDate || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Grid>

    <Grid item xs={12}>
  <h3 style={{ color: '#7267ef' }}>Approval & Payment</h3>
  <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
  <Grid container spacing={2}>
  <Grid item xs={6}>
  <label htmlFor="approvalStatus">Approval Status</label>
  <select
    id="approvalStatus"
    name="approvalStatus"
    className="input"
    value={formData.approvalStatus || ''}
    onChange={handleChange}
  >
    <option value="">Select Approval Status</option>
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
    <option value="Rejected">Rejected</option>
  </select>
</Grid>

   
    <Grid item xs={6}>
      <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
      <input
        type="date"
        id="expectedDeliveryDate"
        name="expectedDeliveryDate"
        className="input"
        value={formData.expectedDeliveryDate || ''}
        onChange={handleChange}
      />
    </Grid>
    {/* Payment Status */}
    <Grid item xs={6}>
      <label htmlFor="paymentStatus">Payment Status</label>
      <select
        id="paymentStatus"
        name="paymentStatus"
        className="input"
        value={formData.paymentStatus || ''}
        onChange={handleChange}
      >
        <option value="">Select Payment Status</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Partially Paid">Partially Paid</option>
      </select>
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

export default MaterialForm;
