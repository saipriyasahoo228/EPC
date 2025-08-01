// DesignForm.jsx
import React, { useState,useEffect } from "react";
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
import { AddCircle, Edit, Delete,ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import {getProjectsAccept} from '../../allapi/engineering';
import {createVendor,getVendors,deleteVendor,updateVendor} from '../../allapi/procurement';



const VendorForm = () => {
    // Initialize state variables
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [vendors, setVendors] = useState([]); // Initialize vendors state
    const [projects, setProjects] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [mode, setMode] = useState('create'); // 'create' | 'edit'
    const rowsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    const [vendorPage, setVendorPage] = useState(1);
    const vendorRowsPerPage = 5;
    
    



    const [formData, setFormData] = useState({
        vendorId: '',
        vendorName: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        address: '',
        vendorRating: '',
        complianceStatus: '', 
        approvedSupplier: '',
        paymentTerms: '',
        contractExpiryDate: '',
      });



      
  
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

    
  
    // Open form with a new vendor ID
    const handleOpenForm = (projectId) => {
        setSelectedProjectId(projectId);
      
        // Determine the next vendor ID
        const yearPrefix = new Date().getFullYear(); // e.g., 2025
        const nextVendorNumber = vendors.length + 1; // Auto-increment logic
        const formattedNumber = nextVendorNumber.toString().padStart(3, '0'); // Ensures 3-digit format
      
        const vendorId = `${yearPrefix}-VND-${formattedNumber}`;
      
        setFormData({ vendorId });
        setOpen(true);
      };
      
    // Close the form
    const handleClose = () => setOpen(false);
  
    // Handle input changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    //Get Project Details
   useEffect(() => {
  const fetchProjects = async () => {
    try {
      const data = await getProjectsAccept();
      console.log('Fetched projects:', data); // ✅ Check actual field names
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch accepted projects:', error);
    }
  };

  fetchProjects();
}, []);

//HandleSubmit Logic


const handleSubmit = async () => {
  const form = new FormData();

  form.append('project', selectedProjectId);
  form.append('vendor_name', formData.vendorName);
  form.append('contact_person', formData.contactPerson);
  form.append('phone_number', formData.phoneNumber);
  form.append('email', formData.email);
  form.append('address', formData.address);
  form.append('vendor_rating', formData.vendorRating);
  form.append('compliance_status', formData.complianceStatus);

  // ✅ Convert to boolean correctly
  if (formData.approvedSupplier !== '') {
    form.append('approved_supplier', formData.approvedSupplier === 'true');
  }

  form.append('payment_terms', formData.paymentTerms);
  form.append('contract_expiry_date', formData.contractExpiryDate);

  try {
    if (editingId) {
      await updateVendor(editingId, form);
      alert('✅ Vendor updated successfully!');
    } else {
      await createVendor(form);
      alert('✅ Vendor submitted successfully!');
    }

    // Reset form
    setFormData({
      vendorId: '',
      vendorName: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      vendorRating: '',
      complianceStatus: '',
      approvedSupplier: '',
      paymentTerms: '',
      contractExpiryDate: '',
    });

    setSelectedProjectId(null);
    setEditingId(null);
    setOpen(false);
    await fetchVendors?.(); // Reload table

  } catch (error) {
    console.error('❌ Submission failed:', error.response?.data || error.message);
    alert(`❌ Submission failed:\n${JSON.stringify(error.response?.data || {}, null, 2)}`);
  }
};


//Delete Vendor Details
const handleDelete = async (vendorId) => {
  if (!vendorId) {
    alert("❌ Vendor ID is missing.");
    return;
  }

  const confirmDelete = window.confirm(`Are you sure you want to delete ${vendorId}?`);
  if (!confirmDelete) return;

  try {
    await deleteVendor(vendorId);
    alert(`✅ Vendor ${vendorId} deleted successfully!`);
    await fetchVendors?.();
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    alert(`❌ Failed to delete vendor: ${JSON.stringify(errMsg)}`);
  }
};

//Fetch Vendor Details
 // ✅ Define fetchVendors outside useEffect so you can reuse it
  const fetchVendors = async () => {
    try {
      const data = await getVendors();
      setVendors(data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);


 // Handle editing logic

  
 const handleEdit = (vendor) => {
  if (!vendor || !vendor.vendor_id) {
    console.error("Invalid vendor data:", vendor);
    return;
  }

  setEditingId(vendor.vendor_id); // Used for PATCH
  setSelectedProjectId(vendor.project); // ForeignKey to project

  setFormData({
    vendorId: vendor.vendor_id,
    vendorName: vendor.vendor_name || '',
    contactPerson: vendor.contact_person || '',
    phoneNumber: vendor.phone_number || '',
    email: vendor.email || '',
    address: vendor.address || '',
    vendorRating: vendor.vendor_rating || '',
    complianceStatus: vendor.compliance_status || '',
    approvedSupplier:
      vendor.approved_supplier !== undefined
        ? vendor.approved_supplier.toString()
        : '',
    paymentTerms: vendor.payment_terms || '',
    contractExpiryDate: vendor.contract_expiry_date || '',
  });

  setMode('edit'); // Optional: to control button label
  setOpen(true);   // Open the form dialog
};




  const filteredVendors = vendors.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

const vendorTotalPages = Math.ceil(filteredVendors.length / vendorRowsPerPage);

// Paginated designs
const paginatedVendor = filteredVendors.slice(
  (vendorPage - 1) * vendorRowsPerPage,
  vendorPage * vendorRowsPerPage
);
    
  

  return (
    <>
      <Typography variant="h5"  gutterBottom sx={{ mt: 5 }} >Vendor Management</Typography>
      
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
             onChange={(e) => {
               setSearchTerm(e.target.value);
               setCurrentPage(1); // Reset to page 1 on search
             }}
             className="input"
             style={{
               width: '100%',
               padding: '8px',
               border: '1px solid #ccc',
               borderRadius: 4,
             }}
           />
         </Box>
   
         <Table>
           <TableHead>
             <TableRow>
               <TableCell sx={{ color: '#7267ef' }}>
                 <strong>Project ID</strong>
               </TableCell>
               <TableCell
                 sx={{
                   display: 'flex',
                   justifyContent: 'flex-end',
                   color: '#660000',
                 }}
               >
                 <strong>Action</strong>
               </TableCell>
             </TableRow>
           </TableHead>
           <TableBody>
             {paginatedProjects.length > 0 ? (
               paginatedProjects.map((proj, i) => (
                 <TableRow key={i}>
                   <TableCell>{proj.project_id}</TableCell>
                   <TableCell
                     sx={{ display: 'flex', justifyContent: 'flex-end' }}
                   >
                     <IconButton
                       onClick={() => handleOpenForm(proj.project_id)}
                       color="primary"
                     >
                       <AddCircle sx={{ color: '#7267ef' }} />
                     </IconButton>
                   </TableCell>
                 </TableRow>
               ))
             ) : (
               <TableRow>
                 <TableCell colSpan={2} align="center">
                   No records found
                 </TableCell>
               </TableRow>
             )}
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
      <Typography variant="h6" gutterBottom>SUBMITTED VENDOR RECORDS</Typography>
      <input
        type="text"
        placeholder="Search Vendors"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />
      <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
      <Table stickyHeader>
  <TableHead>
    <TableRow>
      <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Vendor ID</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Vendor Name</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Contact Person</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Phone Number</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Email Address</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Address</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Rating</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Compliance Status</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Approved</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Payment Terms</strong></TableCell>
      <TableCell sx={{ color: '#7267ef' }}><strong>Contract Expiry</strong></TableCell>
      <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {paginatedVendor.map((v, i) => (
      <TableRow key={i}>
        <TableCell>{v.project}</TableCell>
        <TableCell>{v.vendor_id}</TableCell>
        <TableCell>{v.vendor_name}</TableCell>
        <TableCell>{v.contact_person}</TableCell>
        <TableCell>{v.phone_number}</TableCell>
        <TableCell>{v.email}</TableCell>
        <TableCell>{v.address}</TableCell>
        <TableCell>{v.vendor_rating}</TableCell>
        <TableCell>{v.compliance_status}</TableCell>
        <TableCell>{v.approvedSupplier ? "Yes" : "No"}</TableCell>
        <TableCell>{v.payment_terms}</TableCell>
        <TableCell>{v.contract_expiry_date}</TableCell>
        <TableCell>
          <IconButton color="warning" onClick={() => handleEdit(v)}>
  <Edit sx={{ color: 'orange' }} />
</IconButton>

         <IconButton color="error" onClick={() => handleDelete(v.vendor_id)}>
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
                    disabled={vendorPage === 1}
                    onClick={() => setVendorPage(prev => prev - 1)}
                  >
                    <ArrowBackIos />
                  </IconButton>
                
                  <Typography variant="body2" sx={{ mx: 2 }}>
                    Page {vendorPage} of {vendorTotalPages || 1}
                  </Typography>
                
                  <IconButton
                    disabled={vendorPage >= vendorTotalPages}
                    onClick={() => setVendorPage(prev => prev + 1)}
                  >
                    <ArrowForwardIos />
                  </IconButton>
                </Box>
    </Paper>
    
  </Grid>
</Grid>

<Dialog open={open} onClose={handleClose} fullWidth>
  <DialogTitle>Enter Vendor Details</DialogTitle>
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

        {/* Vendor Info */}
        <Grid item xs={12}>
          <h3 style={{ color: '#7267ef' }}>Vendor Information</h3>
          <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <label htmlFor="vendorId">Vendor ID</label>
              <input
                id="vendorId"
                name="vendorId"
                className="input"
                value={formData.vendorId || ''}
                onChange={handleChange}
                disabled
              />
            </Grid>
             <Grid item xs={6}>
                        <label htmlFor="projectId">Project ID</label>
                        <input id="projectId" className="input" value={selectedProjectId} disabled />
                      </Grid>
            <Grid item xs={6}>
              <label htmlFor="vendorName">Vendor Name</label>
              <input
                id="vendorName"
                name="vendorName"
                className="input"
                value={formData.vendorName || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label htmlFor="contactPerson">Contact Person</label>
              <input
                id="contactPerson"
                name="contactPerson"
                className="input"
                value={formData.contactPerson || ''}
                onChange={handleChange}
              />
            </Grid>
           
          </Grid>
        </Grid>

        {/* Compliance and Status */}
        <Grid item xs={12}>
          <h3 style={{ color: '#7267ef' }}>Compliance & Status</h3>
          <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </Grid>
             <Grid item xs={6}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                className="input"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                className="input"
                rows={3}
                value={formData.address || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label htmlFor="vendorRating">Vendor Rating</label>
              <input
                type="number"
                id="vendorRating"
                name="vendorRating"
                className="input"
                value={formData.vendorRating || ''}
                onChange={handleChange}
                min={0}
                max={5}
              />
            </Grid>
            <Grid item xs={6}>
  <label htmlFor="complianceStatus">Compliance Status</label>
  <select
    id="complianceStatus"
    name="complianceStatus"
    className="input"
    value={formData.complianceStatus}  // ✅ fallback default
    onChange={handleChange}
  >
     <option value="">Select</option>
    <option value="Compliant">Compliant</option>
    <option value="Non-Compliant">Non-Compliant</option>
  </select>
</Grid>

          </Grid>
        </Grid>

        {/* Approval & Payment */}
        <Grid item xs={12}>
          <h3 style={{ color: '#7267ef' }}>Approval & Payment</h3>
          <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <label htmlFor="approvedSupplier">Approved Supplier</label>
            <select
  id="approvedSupplier"
  name="approvedSupplier"
  className="input"
  value={formData.approvedSupplier || ''}
  onChange={handleChange}
>
  <option value="">Select</option>
  <option value="true">Yes</option>
  <option value="false">No</option>
</select>


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
            <Grid item xs={6}>
              <label htmlFor="contractExpiryDate">Contract Expiry Date</label>
              <input
                type="date"
                id="contractExpiryDate"
                name="contractExpiryDate"
                className="input"
                value={formData.contractExpiryDate || ''}
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
       {editingId ? 'Update Vendor' : 'Submit Vendor'}
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default VendorForm;
