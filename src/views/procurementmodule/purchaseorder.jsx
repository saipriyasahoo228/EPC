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
  { id: "2025-PurchaseOrder ID-001" },
  { id: "2025-PurchaseOrder ID-002" },
  { id: "2025-PurchaseOrder ID-003" },
];

const PurchaseOrder = () => {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formData, setFormData] = useState({
    purchaseNumber:'',
    vendorId:'',
    procurementId: '',
    orderDate: '',
    deliveryDate: '',
    totalOrderValue: '',
    paymentTerms: '',
    taxDetails: '',
    orderStatus: '',
    invoiceId: ''
    
  });
  
  const [procurements, setProcurements] = useState([]);
  const [selectedProcurementIndex, setSelectedProcurementIndex] = useState(null);


  // Open form with new procurement ID
  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    
    
    
   
  
    // Update formData with both procurementId and projectId in one call
    setFormData((prevFormData) => ({
      ...prevFormData,  // retain existing formData
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
            <Typography variant="h6" gutterBottom>PURCHASE ORDERS</Typography>
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
                    <TableCell sx={{ color: '#7267ef' }}><strong>PurchaseOrder ID</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Vendor ID </strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Procurement ID </strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Order Date </strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Dalivery Date</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Total Order Value</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Total Cost</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Payment Terms</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Tax Details</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Order Status</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Invoice Id</strong></TableCell>
                    <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {procurements.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.purchaseNumber}</TableCell>
                      <TableCell>{p.vendorId}</TableCell>
                      <TableCell>{p.procurementId}</TableCell>
                      <TableCell>{p.orderDate}</TableCell>
                      <TableCell>{p.deliveryDate}</TableCell>
                      <TableCell>{p.totalOrderValue}</TableCell>
                      <TableCell>{p.paymentTerms}</TableCell>
                      <TableCell>{p.taxDetails}</TableCell>
                      <TableCell>{p.orderStatus}</TableCell>
                      <TableCell>{p.invoiceId}</TableCell>
                      
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
        <DialogTitle>Enter Purchase Order Details</DialogTitle>
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
          <label htmlFor="projectId">Purchase Order ID</label>
          <input
            id="purchaseNumber"
            name="purchaseNumber"
            className="input"
            value={formData.purchaseNumber || ''}
            disabled // Make this non-editable
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="vendorId">Vendor ID</label>
          <input
            id="vendorId"
            name="vendorId"
            className="input"
            value={formData.vendorId || ''}
            disabled // Make this non-editable
          />
        </Grid>
      </Grid>
    </Grid>

    {/* Material Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Material Information & Payment..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <label htmlFor="procurementId">Procurement Id</label>
          <input
            id="procurementId"
            name="procurementId"
            className="input"
            value={formData.procurementId || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="deliveryDate">Dalivery Date </label>
          <input
          type="date"
            id="deliveryDate"
            name="deliveryDate"
            className="input"
            value={formData.deliveryDate || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="totalOrderValue">Total Order Value</label>
          <input
            id="totalOrderValue"
            name="totalOrderValue"
            className="input"
            value={formData.totalOrderValue || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="paymentTerms">Payment Terms</label>
          <input
            id="paymentTerms"
            name="paymentTerms"
            className="input"
            value={formData.paymentTerms || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Grid>

    {/* Total Cost & Other Info */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Tax & Order Status..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
      <Grid item xs={6}>
  <label htmlFor="taxDetails">Tax Details</label>
  <input
    id="taxDetails"
    name="taxDetails"
    className="input"
    value={formData.taxDetails || ''}
   
  />
</Grid>
        <Grid item xs={6}>
          <label htmlFor="orderStatus">Order Status</label>
          <input
            id="orderStatus"
            name="orderStatus"
            className="input"
            value={formData.orderStatus || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="requestDate">Invoice Id</label>
          <input
            
            id="invoiceId"
            name="invoiceId"
            className="input"
            value={formData.invoiceId || ''}
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

export default PurchaseOrder;
