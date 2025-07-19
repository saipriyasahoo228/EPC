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


const PurchaseOrder = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formData, setFormData] = useState({
    projectId: '',
    purchaseOrderId:'',
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

  const filteredPurchase =procurements.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Purchase Order</Typography>

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
      {dummyProjects
        .filter((proj) =>
          `${proj.projectId} ${proj.procurementId} ${proj.purchaseOrderId}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
        .map((proj, i) => (
          <TableRow key={i}>
            <TableCell>{proj.projectId}</TableCell>
            <TableCell>{proj.procurementId}</TableCell>
            <TableCell>{proj.purchaseOrderId}</TableCell>
            <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleOpenForm(proj.projectId)} color="primary">
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
            <Typography variant="h6" gutterBottom>SUBMITTED PURCHASE RECORDS</Typography>
            <input
              type="text"
              placeholder="Search Purchase Order Details"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
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
                  {filteredPurchase.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.purchaseOrderId}</TableCell>
                      <TableCell>{p.vendorId}</TableCell>
                      <TableCell>{p.procurementId}</TableCell>
                      <TableCell>{p.orderDate}</TableCell>
                      <TableCell>{p.deliveryDate}</TableCell>
                      <TableCell>{p.totalOrderValue}</TableCell>
                      <TableCell>{p.totalCost}</TableCell>
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
    <label htmlFor="vendorId">Vendor ID</label>
    <input
      id="vendorId"
      name="vendorId"
      className="input"
      value={formData.vendorId || ''}
     // disabled // This makes it non-editable
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
      <h3 style={{ color: '#7267ef' }}>Material Information & Payment..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        
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
    onChange={handleChange}
   
  />
</Grid>
<Grid item xs={6}>
  <label htmlFor="orderStatus">Order Status</label>
  <select
    id="orderStatus"
    name="orderStatus"
    className="input"
    value={formData.orderStatus || ''}
    onChange={handleChange}
  >
    <option value="">Select Status</option> {/* Default option */}
    <option value="Issued">Issued</option>
    <option value="In Progress">In Progress</option>
    <option value="Delivered">Delivered</option>
    <option value="Canceled">Canceled</option>
  </select>
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
