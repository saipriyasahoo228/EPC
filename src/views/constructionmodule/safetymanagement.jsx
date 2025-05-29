

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

const SafetyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [safetymanagement, setSafetyManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newSafetyNumber = safetymanagement.length + 1;
    const paddedNumber = newSafetyNumber.toString().padStart(3, '0');
    
    setFormData({ 
      safetymanagementID: `SAF-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (safetyItem) => {
    setFormData(safetyItem);
    setSelectedProjectId(safetyItem.projectId);
    setIsEditMode(true);
    setCurrentEditId(safetyItem.safetymanagementID);
    setOpen(true);
  };

  const handleDelete = (safetyId) => {
    if (window.confirm("Are you sure you want to delete safety management!")) {
      setSafetyManagement(safetymanagement.filter(item => item.safetymanagementID !== safetyId));
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
    if (isEditMode) {
      // Update existing record
      setSafetyManagement(safetymanagement.map(item => 
        item.safetymanagementID === currentEditId ? formData : item
      ));
    } else {
      // Add new record
      const newSafety = { ...formData, projectId: selectedProjectId };
      setSafetyManagement([...safetymanagement, newSafety]);
    }
    handleClose();
  };

  const filteredSafety = safetymanagement.filter((s) =>
    Object.values(s).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Quality Control & Assurance</Typography>
      
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
            <Typography variant="h6" gutterBottom>SAFETY MANAGEMENT DETAILS</Typography>
            <input
              type="text"
              placeholder="Search Quality Control"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Safety Report ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Incident Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Incident Description</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Affected Personnel ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Injury Severity</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Measures</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Safety Training Conducted</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSafety.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{s.projectId}</TableCell>
                      <TableCell>{s.safetymanagementID}</TableCell>
                      <TableCell>{s.incidentDate}</TableCell>
                      <TableCell>{s.incidentDescription}</TableCell>
                      <TableCell>{s.affectedpersonnelID}</TableCell>
                      <TableCell>{s.injurySeverity}</TableCell>
                      <TableCell>{s.correctiveMeasures}</TableCell>
                      <TableCell>{s.injurySeverity}</TableCell>
                      <TableCell>{s.safetyTraining}</TableCell>
                     
                      <TableCell>
                        <IconButton onClick={() => handleEdit(s)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(s.safetymanagementID)} color="error">
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
          {isEditMode ? "Edit Safety Management Details" : "Enter Safety Management Details"}
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
                    <label htmlFor="safetymanagementID">Safety Report ID</label>
                    <input 
                      id="safetymanagementID" 
                      className="input" 
                      value={formData.safetymanagementID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Incident Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="incidentDate">Incident Date</label>
                    <input 
                      type='date' 
                      id="incidentDate" 
                      name="incidentDate" 
                      className="input" 
                      value={formData.incidentDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="incidentDescription">Incident Description</label>
                    <textarea
                      rows={3}
                      id="incidentDescription" 
                      name="incidentDescription" 
                      className="input" 
                      value={formData.incidentDescription || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="affectedpersonnelID">Affected Personnel ID</label>
                    <input 
                      id="affectedpersonnelID" 
                      name="affectedpersonnelID" 
                      className="input" 
                      value={formData.affectedpersonnelID || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="injurySeverity">Approval Status</label>
                    <select
                      id="injurySeverity"
                      name="injurySeverity"
                      className="input"
                      value={formData.injurySeverity || ''}
                      onChange={handleChange}
                      
                    >
                      <option value="">Select Severity</option>
                      <option value="Minor">Minor</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                      <option value="Fatal">Fatal</option>
                    </select>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                    <label htmlFor="correctiveMeasures">Corrective Measures</label>
                    <input 
                      id="correctiveMeasures" 
                      name="correctiveMeasures" 
                      className="input" 
                      value={formData.correctiveMeasures || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                 <Grid item xs={6}>
  <label htmlFor="safetyTraining">Safety Training Conducted</label>
  <input
    type="checkbox"
    id="safetyTraining"
    name="safetyTraining"
    checked={formData.safetyTraining || false}
    onChange={(e) =>
      setFormData({ ...formData, safetyTraining: e.target.checked })
    }
  />
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

export default SafetyManagement;