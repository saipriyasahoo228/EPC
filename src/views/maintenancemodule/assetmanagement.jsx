

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
  const [systemmanagement, setSystemManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = systemmanagement.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(3, '0');
    
    setFormData({ 
      systemmanagementID: `FIN-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (systemItem) => {
    setFormData(systemItem);
    setSelectedProjectId(systemItem.projectId);
    setIsEditMode(true);
    setCurrentEditId(systemItem.systemmanagementID);
    setOpen(true);
  };

  const handleDelete = (systemId) => {
    if (window.confirm("Are you sure you want to delete system integration and final report!")) {
      setSystemManagement(systemmanagement.filter(item => item.systemmanagementID !== systemId));
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
    handoverConfirmation: formData.handoverConfirmation ? 'T' : 'F',
    complianceConfirmation: formData.complianceConfirmation ? 'T' : 'F',
  };

  if (isEditMode) {
    // Update existing record
    setSystemManagement(systemmanagement.map(item => 
      item.systemmanagementID === currentEditId ? updatedFormData : item
    ));
  } else {
    // Add new record
    const newSystem = { ...updatedFormData, projectId: selectedProjectId };
    setSystemManagement([...systemmanagement, newSystem]);
  }

  handleClose();
};


  const filteredSystem = systemmanagement.filter((t) =>
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
            <Typography variant="h6" gutterBottom>SYSTEM INTEGRATION & CERTIFICATION DETAILS</Typography>
            <input
              type="text"
              placeholder="Search System integration & certification"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Final Report ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing & Inspection</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Defect Rectification Report</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover Confirmation</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance Confirmation</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Archival Document Link</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSystem.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.projectId}</TableCell>
                      <TableCell>{t.systemmanagementID}</TableCell>
                      <TableCell>{t.testingInfo}</TableCell>
                      <TableCell>{t.defectRectification}</TableCell>
                      <TableCell>{t.handoverConfirmation}</TableCell>
                      <TableCell>{t.complianceConfirmation}</TableCell>
                      <TableCell>{t.documentLink}</TableCell>
                     
                     
                      <TableCell>
                        <IconButton onClick={() => handleEdit(t)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(t.systemmanagementID)} color="error">
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
          {isEditMode ? "Edit System Integration Details" : "Enter System Integration Details"}
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
              {/* Project Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Project Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="projectId">Project ID</label>
                    <input 
                      id="projectId" 
                      className="input" 
                      value={selectedProjectId} 
                      disabled 
                      
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="systemmanagementID">Final Report ID</label>
                    <input 
                      id="systemmanagementID" 
                      className="input" 
                      value={formData.systemmanagementID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Summary of Testing</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="testingInfo">Testing Info</label>
                    <input 
                      
                      id="testingInfo" 
                      name="testingInfo" 
                      className="input" 
                      value={formData.testingInfo || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="defectRectification">Defect Rectification</label>
                    <input
                      
                      id="defectRectification" 
                      name="defectRectification" 
                      className="input" 
                      value={formData.defectRectification || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
        

<Grid item xs={6}>
  <label>
    <input
      type="checkbox"
      name="handoverConfirmation"
      checked={formData.handoverConfirmation || false}
      onChange={(e) =>
        setFormData({ ...formData, handoverConfirmation: e.target.checked })
      }
    />
    &nbsp;Handover Confirmation
  </label>
</Grid>

<Grid item xs={6}>
  <label>
    <input
      type="checkbox"
      name="complianceConfirmation"
      checked={formData.complianceConfirmation || false}
      onChange={(e) =>
        setFormData({ ...formData, complianceConfirmation: e.target.checked })
      }
    />
    &nbsp;Compliance Confirmation
  </label>
</Grid>

                 
                  
                 
                 
                </Grid>
                <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Document Info..</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="documentLink">Document Link</label>
                    <input 
                      id="documentLink" 
                      name="documentLink" 
                      className="input" 
                      value={formData.documentLink || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   
                  
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