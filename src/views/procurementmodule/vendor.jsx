// DesignForm.jsx
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

const VendorForm = () => {
    // Initialize state variables
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [vendors, setVendors] = useState([]); // Initialize vendors state

    const [formData, setFormData] = useState({
        vendorId: '',
        vendorName: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        address: '',
        vendorRating: '',
        complianceStatus: 'Compliant', // Default value
        approvedSupplier: false,
        paymentTerms: '',
        contractExpiry: '',
      });

    
  
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
  
    // Submit the form
    const handleSubmit = () => {
        const updatedVendor = { ...formData, projectId: selectedProjectId };
      
        setVendors((prevVendors) => {
          const vendorIndex = prevVendors.findIndex(
            (vendor) => vendor.vendorId === updatedVendor.vendorId
          );
      
          if (vendorIndex !== -1) {
            // Update existing vendor
            const newVendors = [...prevVendors];
            newVendors[vendorIndex] = updatedVendor;
            return newVendors;
          } else {
            // Add new vendor
            return [...prevVendors, updatedVendor];
          }
        });
      
        setOpen(false);
      };
      


    // Handle editing a vendor
const handleEdit = (index) => {
    const vendorToEdit = vendors[index];
    setFormData(vendorToEdit);
    setOpen(true); // Open the form dialog for editing
  };
  
  // Handle deleting a vendor
  const handleDelete = (index) => {
    const updatedVendors = vendors.filter((_, i) => i !== index);
    setVendors(updatedVendors);
  };
  

  const filteredVendors = vendors.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

    
  

  return (
    <>
      <Typography variant="h5"  gutterBottom sx={{ mt: 5 }} >Vendor Management</Typography>
      
        <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
  <Grid item xs={12}>
    {/* <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
      <Typography variant="h6" gutterBottom>PROJECT RECORDS</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
            <TableCell sx={{ display: 'flex', justifyContent: 'flex-end',color:'#660000'}}><strong>Action</strong></TableCell>
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
    </Paper> */}
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
      {dummyProjects
        .filter(proj => proj.id.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((proj, i) => (
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
    {filteredVendors.map((v, i) => (
      <TableRow key={i}>
        <TableCell>{v.projectId}</TableCell>
        <TableCell>{v.vendorId}</TableCell>
        <TableCell>{v.vendorName}</TableCell>
        <TableCell>{v.contactPerson}</TableCell>
        <TableCell>{v.phoneNumber}</TableCell>
        <TableCell>{v.email}</TableCell>
        <TableCell>{v.address}</TableCell>
        <TableCell>{v.vendorRating}</TableCell>
        <TableCell>{v.complianceStatus}</TableCell>
        <TableCell>{v.approvedSupplier ? "Yes" : "No"}</TableCell>
        <TableCell>{v.paymentTerms}</TableCell>
        <TableCell>{v.contractExpiry}</TableCell>
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
            <select
  id="complianceStatus"
  name="complianceStatus"
  className="input"
  value={formData.complianceStatus}
  onChange={handleChange}
>
  <option value="Compliant">Compliant</option>
  <option value="Non-Compliant">Non-Compliant</option>
</select>

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
                <option value={true}>Yes</option>
                <option value={false}>No</option>
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
      Submit
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default VendorForm;
