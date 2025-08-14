

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
  { id: "2025-VND-001" },
  { id: "2025-VND-002" },
  { id: "2025-VND-003" },
];

const AssetManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [assetmanagement, setAssetManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = assetmanagement.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(3, '0');
    
    setFormData({ 
      assetmanagementID: `AST-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (assetItem) => {
    setFormData(assetItem);
    setSelectedProjectId(assetItem.projectId);
    setIsEditMode(true);
    setCurrentEditId(assetItem.assetmanagementID);
    setOpen(true);
  };

  const handleDelete = (assetId) => {
    if (window.confirm("Are you sure you want to delete asset management report!")) {
      setAssetManagement(assetmanagement.filter(item => item.assetmanagementID !== assetId));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
    setIsEditMode(false);
    setCurrentEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
  // Convert boolean fields to "T" or "F"
  const updatedFormData = {
    ...formData,
  
  };

  if (isEditMode) {
    // Update existing record
    setAssetManagement(assetmanagement.map(item => 
      item.assetmanagementID === currentEditId ? updatedFormData : item
    ));
  } else {
    // Add new record
    const newSystem = { ...updatedFormData, projectId: selectedProjectId };
    setAssetManagement([...assetmanagement, newSystem]);
  }

  handleClose();
};


  const filteredAsset = assetmanagement.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Assets Management</Typography>
      
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>
              VENDOR RECORDS
            </Typography>

            {/* Search Input */}
            <Box sx={{ my: 2, mx: 1 }}>
              <input
                type="text"
                placeholder="Search Vendor ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Vendor ID</strong></TableCell>
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
            <Typography variant="h6" gutterBottom>Assets Details</Typography>
            <input
              type="text"
              placeholder="Search Assets Management Details"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4, marginBottom: '16px' }}
            />

            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset Name</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset Value</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Model Number</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Serial Number</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Location</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Purchase Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Warranty Expiry Date</strong></TableCell>
                    
                    <TableCell sx={{color:'#7267ef'}}><strong>Maintenance Requirment</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Current Condition</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Depreciation Value</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAsset.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.projectId}</TableCell>
                      <TableCell>{t.assetmanagementID}</TableCell>
                      <TableCell>{t.assetName}</TableCell>
                      <TableCell>{t.assetType}</TableCell>
                      <TableCell>{t.assetValue}</TableCell>
                      <TableCell>{t.modelNumber}</TableCell>
                      <TableCell>{t.serialNumber}</TableCell>
                      <TableCell>{t.location}</TableCell>
                      <TableCell>{t.purchaseDate}</TableCell>
                      <TableCell>{t.warrantyExpiryDate}</TableCell>
                      <TableCell>{t.maintenanceRequirement}</TableCell>
                      <TableCell>{t.currentCondition}</TableCell>
                      <TableCell>{t.depreciationValue}</TableCell>

                     
                     
                      <TableCell>
                        <IconButton onClick={() => handleEdit(t)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(t.assetmanagementID)} color="error">
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
        <DialogTitle>
          {isEditMode ? "Edit Asset Management Details" : "Enter Assets Management Details"}
        </DialogTitle>
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
    {/* Asset Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Asset Information</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <label htmlFor="assetmanagementID">Asset ID</label>
          <input
            id="assetmanagementID"
            name="assetmanagementID"
            className="input"
            value={formData.assetmanagementID || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="projectId">Vendor ID</label>
          <input
            id="projectId"
            name="projectId"
            className="input"
            value={formData.projectId || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="assetName">Asset Name</label>
          <input
            id="assetName"
            name="assetName"
            className="input"
            value={formData.assetName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="assetType">Asset Type</label>
          <input
            id="assetType"
            name="assetType"
            className="input"
            value={formData.assetType || ''}
            onChange={handleChange}
          />
        </Grid>
         <Grid item xs={6}>
          <label htmlFor="assetValue">Asset Value</label>
          <input
            id="assetValue"
            name="assetValue"
            className="input"
            value={formData.assetValue || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="modelNumber">Model Number</label>
          <input
            id="modelNumber"
            name="modelNumber"
            className="input"
            value={formData.modelNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="serialNumber">Serial Number</label>
          <input
            id="serialNumber"
            name="serialNumber"
            className="input"
            value={formData.serialNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            className="input"
            value={formData.location || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="purchaseDate">Purchase Date</label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            className="input"
            value={formData.purchaseDate || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="warrantyExpiryDate">Warranty Expiry Date</label>
          <input
            type="date"
            id="warrantyExpiryDate"
            name="warrantyExpiryDate"
            className="input"
            value={formData.warrantyExpiryDate || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={6}>
          <label htmlFor="maintenanceRequirement">Maintenance Requirement</label>
          <input
            id="maintenanceRequirement"
            name="maintenanceRequirement"
            className="input"
            value={formData.maintenanceRequirement || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="currentCondition">Current Condition</label>
          <input
            id="currentCondition"
            name="currentCondition"
            className="input"
            value={formData.currentCondition || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="depreciationValue">Depreciation Value</label>
          <input
            type="number"
            step="0.01"
            id="depreciationValue"
            name="depreciationValue"
            className="input"
            value={formData.depreciationValue || ''}
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
              outline: '2px solid #800000',
              color: '#800000',
              '&:hover': {
                outline: '2px solid #b30000',
                color: '#b30000',
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="outlined"
            onClick={handleSubmit}
            sx={{
              borderColor: '#7267ef',
              color: '#7267ef',
              '&:hover': {
                borderColor: '#9e8df2',
                color: '#9e8df2',
              }
            }}
          >
            {isEditMode ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetManagement;