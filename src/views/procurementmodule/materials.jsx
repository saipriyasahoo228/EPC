import React, { useState , useEffect} from "react";
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
import { AddCircle, Edit, Delete,ArrowBackIos, ArrowForwardIos  } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import {getProjectsAccept } from '../../allapi/engineering';
import {createMaterialProcurement, getMaterialProcurements,deleteProcurement,updateMaterialProcurement } from '../../allapi/procurement';

const MaterialForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState('create'); // or 'update'
  const rowsPerPage = 1;
  const [currentPage, setCurrentPage] = useState(1);
  const [materialPage, setMaterialPage] = useState(1);
  const materialRowsPerPage = 5;


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
    paymentStatus:'',
    //purchaseOrder:'',
  });
  
  const [procurements, setProcurements] = useState([]);
  

  
  // ✅ Filtered projects based on search
  const filteredProjects = projects.filter((proj) =>
    proj.project_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

    


  //Fetch All Accepted Projects
  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const data = await getProjectsAccept();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load accepted projects:', error);
    }
  };

  fetchProjects();
}, []);

//Fetch all Procurement details
const fetchProcurements = async () => {
  try {
    const data = await getMaterialProcurements();
    setProcurements(data);
  } catch (error) {
    console.error('❌ Error loading procurements:', error);
  }
};

useEffect(() => {
  fetchProcurements(); // ✅ called when the component mounts
}, []);




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
  
const handleOpenForm = (projectId) => {
  const yearPrefix = new Date().getFullYear();
  const nextProcurementNumber = procurements.length + 1;
  const formattedNumber = nextProcurementNumber.toString().padStart(3, '0');

  const procurementId = `${yearPrefix}-PRC-${formattedNumber}`;

  setFormData({
    projectId,
    procurementId,
    materialName: '',
    materialCode: '',
    quantity: '',
    unitPrice: '',
    totalCost: '',
    requestedBy: '',
    requestDate: '',
    approvalStatus: 'Pending',
    paymentStatus: 'Pending',
    expectedDeliveryDate: '',
    //purchaseOrder: '',
  });

  setMode('create'); // ✅ Set mode
  setOpen(true);
};
const handleClose = () => setOpen(false);


  
// Submit form


const handleSubmit = async () => {
  const form = new FormData();

  form.append('project', formData.projectId);
  form.append('material_name', formData.materialName);
  form.append('material_code', formData.materialCode);
  form.append('quantity_requested', formData.quantity);
  form.append('unit_price', formData.unitPrice);
  form.append('requested_by', formData.requestedBy);
  form.append('request_date', formData.requestDate);
  //form.append('purchase_order', formData.purchaseOrder || '');
  form.append('approval_status', formData.approvalStatus || 'Pending');
  form.append('payment_status', formData.paymentStatus || 'Pending');

  if (formData.expectedDeliveryDate) {
    form.append('expected_delivery_date', formData.expectedDeliveryDate);
  }

  try {
    if (mode === 'update') {
      await updateMaterialProcurement(formData.procurementId, form);
      alert('✅ Material Procurement updated successfully!');
    } else {
      await createMaterialProcurement(form);
      alert('✅ Material Procurement submitted successfully!');
    }

    // Reset form
    setFormData({
      projectId: '',
      procurementId: '',
      materialName: '',
      materialCode: '',
      quantity: '',
      unitPrice: '',
      totalCost: '',
      requestedBy: '',
      requestDate: '',
      approvalStatus: '',
      paymentStatus: '',
      expectedDeliveryDate: '',
      //purchaseOrder: '',
    });

    setSelectedProjectId(null);
    setOpen(false);
    setMode('create'); // reset to create mode

    if (typeof fetchProcurements === 'function') {
      await fetchProcurements();
    }

  } catch (error) {
    const errData = error.response?.data;
    console.error('❌ Submission failed:', errData || error.message);

    let errorMsg = 'Submission failed. Please check form values.';
    if (errData && typeof errData === 'object') {
      const messages = Object.entries(errData).map(
        ([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`
      );
      errorMsg = messages.join('\n');
    }

    alert(`❌ ${errorMsg}`);
  }
};


//HandleEdit
  const handleEdit = (procurement) => {
  setFormData({
    projectId: procurement.project,
    procurementId: procurement.procurement_id,
    materialName: procurement.material_name,
    materialCode: procurement.material_code,
    quantity: procurement.quantity_requested,
    unitPrice: procurement.unit_price,
    totalCost: procurement.total_cost,
    requestedBy: procurement.requested_by,
    requestDate: procurement.request_date,
    approvalStatus: procurement.approval_status,
    paymentStatus: procurement.payment_status,
    expectedDeliveryDate: procurement.expected_delivery_date,
    //purchaseOrder: procurement.purchase_order,
  });

  setMode('update'); // Use this instead of setIsEditing(true)
  setOpen(true);     // Open the Dialog/Form
};

//Handle Delete Logic
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(`Delete ${id}?`);
  if (!confirmDelete) return;

  try {
    await deleteProcurement(id);
    alert(`Deleted ${id} successfully`);
    fetchProcurements(); // 🔁 refresh the data
    setProcurements((prev) => prev.filter((item) => item.procurementId !== id));
  } catch (err) {
    alert('Failed to delete. Check console for details.');
  }
};

  const filteredProcurements = procurements.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

const materialTotalPages = Math.ceil(filteredProcurements.length / materialRowsPerPage);

// Paginated designs
const paginatedMaterial = filteredProcurements.slice(
  (materialPage - 1) * materialRowsPerPage,
  materialPage * materialRowsPerPage
);

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Material Procurement</Typography>
     
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
  <Typography variant="h6" gutterBottom>
    PROJECT RECORDS
  </Typography>

  {/* Search Input */}
  <Box sx={{ my: 2, mx: 1 }}>
    <input
      type="text"
      placeholder="Search Project ID"
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
        <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}>
          <strong>Action</strong>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
  {paginatedProjects
    .filter((proj) =>
      proj.project_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((proj, i) => (
      <TableRow key={i}>
        <TableCell>{proj.project_id}</TableCell>
        <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => handleOpenForm(proj.project_id)} color="primary">
            <AddCircle sx={{ color: "#7267ef" }} />
          </IconButton>
        </TableCell>
      </TableRow>
    ))}
</TableBody>

  </Table>

   {/* ✅ Pagination Icons */}
           <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} pr={2}>
             <IconButton
               disabled={currentPage === 1}
               onClick={() => setCurrentPage((prev) => prev - 1)}
             >
               <ArrowBackIos />
             </IconButton>
     
             <Typography variant="body2" sx={{ mx: 2 }}>
               Page {currentPage} of {totalPages || 1}
             </Typography>
     
             <IconButton
               disabled={currentPage >= totalPages}
               onClick={() => setCurrentPage((prev) => prev + 1)}
             >
               <ArrowForwardIos />
             </IconButton>
           </Box>
</Paper>

        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>SUBMITTED MATERIALS PROCUREMENT RECORDS</Typography>
            <input
        type="text"
        placeholder="Search Materials Procurements Here...."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Procurement ID</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Purchase Order ID</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Material Name</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Material Code</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Quantity</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Unit Price</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Total Cost</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Requested By</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Request Date</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Approval Status</strong></TableCell>
                    <TableCell sx={{ color: '#7267ef' }}><strong>Payment Status</strong></TableCell>
                     <TableCell sx={{ color: '#7267ef' }}><strong>Expected Delivery Date</strong></TableCell>
                    <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {paginatedMaterial.map((p, i) => (
    <TableRow key={i}>
      <TableCell>{p.project}</TableCell>
      <TableCell>{p.procurement_id}</TableCell>
      <TableCell>{p.purchase_order || '-'}</TableCell>
      <TableCell>{p.material_name}</TableCell>
      <TableCell>{p.material_code}</TableCell>
      <TableCell>{p.quantity_requested}</TableCell>
      <TableCell>{p.unit_price}</TableCell>
      <TableCell>{p.total_cost}</TableCell>
      <TableCell>{p.requested_by}</TableCell>
      <TableCell>{p.request_date}</TableCell>
      <TableCell>{p.approval_status}</TableCell>
      <TableCell>{p.payment_status}</TableCell>
      <TableCell>{p.expected_delivery_date}</TableCell>
      <TableCell>
        <IconButton color="warning" onClick={() => handleEdit(p)}>
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        <IconButton color="error" onClick={() => handleDelete(p.procurement_id)}>
          <Delete sx={{ color: "red" }} />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

              </Table>
            </TableContainer>
             <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} pr={2}>
                              <IconButton
                                disabled={materialPage === 1}
                                onClick={() => setMaterialPage(prev => prev - 1)}
                              >
                                <ArrowBackIos />
                              </IconButton>
                            
                              <Typography variant="body2" sx={{ mx: 2 }}>
                                Page {materialPage} of {materialTotalPages || 1}
                              </Typography>
                            
                              <IconButton
                                disabled={materialPage >= materialTotalPages}
                                onClick={() => setMaterialPage(prev => prev + 1)}
                              >
                                <ArrowForwardIos />
                              </IconButton>
                            </Box>
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
     {/* <Grid item xs={6}>
          <label htmlFor="purchaseOrder">Purchase OrderId</label>
          <input
            id="purchaseOrder"
            name="purchaseOrder"
            className="input"
            value={formData.purchaseOrder || ''}
            onChange={handleChange}
          />
        </Grid> */}
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
                {mode === 'update' ? 'Update Procurement' : 'Submit Procurement'}
              </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaterialForm;
