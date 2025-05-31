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

const InventoryManagement = () => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [inventorymanagement, setInventoryManagement] = useState([]);

  
  const handleOpenForm = (projectId, index = null) => {
  setSelectedProjectId(projectId);
  setEditingIndex(index);

  if (index !== null) {
    setFormData(inventorymanagement[index]);
  } else {
    setFormData({});
  }

  setOpen(true);
};


 

  const handleClose = () => {
  setOpen(false);
  setEditingIndex(null);
  setFormData({});
};

 
  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};


  const handleSubmit = () => {
  const newInventory = { ...formData, projectId: selectedProjectId };

  if (editingIndex !== null) {
    const updatedProjects = [...inventorymanagement];
    updatedProjects[editingIndex] = newInventory;
    setInventoryManagement(updatedProjects);
  } else {
    setInventoryManagement([...inventorymanagement, newInventory]);
  }

  setFormData({});
  setEditingIndex(null);
  setOpen(false);
};


const handleDelete = (index) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this record?");
  if (confirmDelete) {
    const updatedProjects = [...inventorymanagement];
    updatedProjects.splice(index, 1);
    setInventoryManagement(updatedProjects);
  }
};



  const filteredInventory = inventorymanagement.filter((m) =>
    Object.values(m).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  

  return (
    <>
      <Typography variant="h5"  gutterBottom sx={{ mt: 5 }} >Project Management</Typography>
      
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
      <Typography variant="h6" gutterBottom>SUBMITTED MATERIALS & INVENTORIES</Typography>
      <input
        type="text"
        placeholder="Search Projects"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />

      <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Material ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Material Name</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Quantity Used</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Reorder Level</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Supplier ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Dalivery Date</strong></TableCell>
              <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((m, i) => (
              <TableRow key={i}>
                <TableCell>{m.projectId}</TableCell>
                <TableCell>{m.materialID}</TableCell>
                <TableCell>{m.materialName}</TableCell>
                <TableCell>{m.quantityUsed}</TableCell>
                <TableCell>{m.reorderLevel}</TableCell>
                <TableCell>{m.supplierID}</TableCell>
                <TableCell>{m.deliveryDate}</TableCell>
                
                <TableCell>
                <IconButton color="warning" onClick={() => handleOpenForm(m.projectId, i)}>
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
  <DialogTitle>Enter Project Details</DialogTitle>
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

      {/* Project Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Project ID </h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="projectId">Project ID</label>
            <input id="projectId" className="input" value={selectedProjectId} disabled />
          </Grid>
          
        </Grid>
      </Grid>

      {/* Design Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Material Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="materialID">Material ID</label>
            <input id="materialID" name="materialID" className="input" value={formData.materialID || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="materialName">Material Name</label>
            <input id="materialName" name="materialName" className="input" value={formData.materialName || ''} onChange={handleChange} />
          </Grid>
           <Grid item xs={6}>
            <label htmlFor="quantityUsed">Quantity Used</label>
            <input id="quantityUsed" name="quantityUsed" className="input" value={formData.quantityUsed || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Approval Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Order Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="reorderLevel">Reorder Level</label>
            <input 
            
            id="reorderLevel" 
            name="reorderLevel" 
            className="input" 
            value={formData.reorderLevel || ''} 
            onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="supplierID">Supplier ID</label>
            <input 
            id="supplierID" 
            name="supplierID" 
            className="input" 
            value={formData.supplierID || ''} 
            onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="deliveryDate">Delivery Date</label>
            <input 
            type="date"
            id="deliveryDate" 
            name="deliveryDate" 
            className="input" 
            value={formData.deliveryDate || ''} 
            onChange={handleChange} />
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

export default InventoryManagement;
