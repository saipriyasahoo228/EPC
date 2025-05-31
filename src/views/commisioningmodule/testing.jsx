

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

const Testing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [testingmanagement, setTestingManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newTestingNumber = testingmanagement.length + 1;
    const paddedNumber = newTestingNumber.toString().padStart(3, '0');
    
    setFormData({ 
      testingmanagementID: `TST-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (testingItem) => {
    setFormData(testingItem);
    setSelectedProjectId(testingItem.projectId);
    setIsEditMode(true);
    setCurrentEditId(testingItem.testingmanagementID);
    setOpen(true);
  };

  const handleDelete = (testingId) => {
    if (window.confirm("Are you sure you want to delete testing management!")) {
      setTestingManagement(testingmanagement.filter(item => item.testingmanagementID !== testingId));
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
      setTestingManagement(testingmanagement.map(item => 
        item.testingmanagementID === currentEditId ? formData : item
      ));
    } else {
      // Add new record
      const newTesting = { ...formData, projectId: selectedProjectId };
      setTestingManagement([...testingmanagement, newTesting]);
    }
    handleClose();
  };

  const filteredTesting = testingmanagement.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Testing & Inspection</Typography>
      
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
            <Typography variant="h6" gutterBottom>TESTING MANAGEMENT DETAILS</Typography>
            <input
              type="text"
              placeholder="Search Testing Management"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Equipment Name</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing ConductedBy</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Test Procedure</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Performane Parameters</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Defects Identified</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Measures</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Retest Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing Date</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTesting.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.projectId}</TableCell>
                      <TableCell>{t.testingmanagementID}</TableCell>
                      <TableCell>{t.systemName}</TableCell>
                      <TableCell>{t.testingDate}</TableCell>
                      <TableCell>{t.testingBy}</TableCell>
                      <TableCell>{t.testProcedure}</TableCell>
                      <TableCell>{t.performance}</TableCell>
                      <TableCell>{t.defect}</TableCell>
                      <TableCell>{t.correction}</TableCell>
                      <TableCell>{t.retestDate}</TableCell>
                      <TableCell>{t.testingStatus}</TableCell>
                     
                      <TableCell>
                        <IconButton onClick={() => handleEdit(t)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(t.testingmanagementID)} color="error">
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
          {isEditMode ? "Edit Testing Management Details" : "Enter Testing Management Details"}
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
                    <label htmlFor="testingmanagementID">Testing ID</label>
                    <input 
                      id="testingmanagementID" 
                      className="input" 
                      value={formData.testingmanagementID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Testing & Equipment Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="systemName">System/Equipment Name</label>
                    <input 
                      
                      id="systemName" 
                      name="systemName" 
                      className="input" 
                      value={formData.systemName || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="testingDate">Testing Date</label>
                    <input
                      type="date"
                      id="testingDate" 
                      name="testingDate" 
                      className="input" 
                      value={formData.testingDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="testingBy">Testing CoductedBy</label>
                    <input 
                      id="testingBy" 
                      name="testingBy" 
                      className="input" 
                      value={formData.testingBy || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="testProcedure">Test Procedure</label>
                    <input 
                      id="testProcedure" 
                      name="testProcedure" 
                      className="input" 
                      value={formData.testProcedure || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="performance">Performance Parameters</label>
                    <input 
                      id="performance" 
                      name="performance" 
                      className="input" 
                      value={formData.performance || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="defect">Defects Identified</label>
                    <input 
                      id="defect" 
                      name="defect" 
                      className="input" 
                      value={formData.defect || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                 
                 
                </Grid>
                <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Correction Measure & Testing Status</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="correction">Correction Measure</label>
                    <input 
                      id="correction" 
                      name="correction" 
                      className="input" 
                      value={formData.correction || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="retestDate">Retest Date</label>
                    <input 
                      id="retestDate" 
                      name="retestDate" 
                      className="input" 
                      value={formData.retestDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="testingStatus">Testing Status</label>
                    <select
                      id="testingStatus"
                      name="testingStatus"
                      className="input"
                      value={formData.testingStatus || ''}
                      onChange={handleChange}
                      
                    >
                      <option value="">Select Status</option>
                      <option value="Pass">Pass</option>
                      <option value="Failed">Failed</option>
                      <option value="Retest">Retest</option>
                      <option value="Required">Required</option>
                    </select>
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

export default Testing;