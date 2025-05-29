
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

const QualityControl = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [qualitycontrol, setQualityControl] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newQualityNumber = qualitycontrol.length + 1;
    const paddedNumber = newQualityNumber.toString().padStart(3, '0');
    
    setFormData({ 
      qualitycontrolID: `QC-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (qualityItem) => {
    setFormData(qualityItem);
    setSelectedProjectId(qualityItem.projectId);
    setIsEditMode(true);
    setCurrentEditId(qualityItem.qualitycontrolID);
    setOpen(true);
  };

  const handleDelete = (qualityId) => {
    if (window.confirm("Are you sure you want to delete this quality control record?")) {
      setQualityControl(qualitycontrol.filter(item => item.qualitycontrolID !== qualityId));
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
      setQualityControl(qualitycontrol.map(item => 
        item.qualitycontrolID === currentEditId ? formData : item
      ));
    } else {
      // Add new record
      const newQuality = { ...formData, projectId: selectedProjectId };
      setQualityControl([...qualitycontrol, newQuality]);
    }
    handleClose();
  };

  const filteredQuality = qualitycontrol.filter((q) =>
    Object.values(q).some(
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
            <Typography variant="h6" gutterBottom>QUALITY CONTROL & ASSUARANCE DETAILS</Typography>
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Quality Control ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspector ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Test Results</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance Standards</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Defects Identified</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Actions</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Approval Status</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Next Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuality.map((q, i) => (
                    <TableRow key={i}>
                      <TableCell>{q.projectId}</TableCell>
                      <TableCell>{q.qualitycontrolID}</TableCell>
                      <TableCell>{q.inspectionDate}</TableCell>
                      <TableCell>{q.inspectionType}</TableCell>
                      <TableCell>{q.inspectorID}</TableCell>
                      <TableCell>{q.testResult}</TableCell>
                      <TableCell>{q.complianceStandards}</TableCell>
                      <TableCell>{q.defectIdentified}</TableCell>
                      <TableCell>{q.correctiveAction}</TableCell>
                      <TableCell>{q.approvalStatus}</TableCell>
                      <TableCell>{q.nextInspectionDate}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(q)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(q.qualitycontrolID)} color="error">
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
          {isEditMode ? "Edit Quality Control & Assurance Details" : "Enter Quality Control & Assurance Details"}
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
                    <label htmlFor="qualitycontrolID">Quality Assurance ID</label>
                    <input 
                      id="qualitycontrolID" 
                      className="input" 
                      value={formData.qualitycontrolID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Inspection Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="inspectionDate">Inspection Date</label>
                    <input 
                      type='date' 
                      id="inspectionDate" 
                      name="inspectionDate" 
                      className="input" 
                      value={formData.inspectionDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="inspectionType">Inspection Type</label>
                    <input 
                      id="inspectionType" 
                      name="inspectionType" 
                      className="input" 
                      value={formData.inspectionType || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="inspectorID">Inspector ID</label>
                    <input 
                      id="inspectorID" 
                      name="inspectorID" 
                      className="input" 
                      value={formData.inspectorID || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="testResult">Test Results</label>
                    <input 
                      id="testResult" 
                      name="testResult" 
                      className="input" 
                      value={formData.testResult || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Approval Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Compliance Standards & Approval Status</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="complianceStandards">Compliance Standards</label>
                    <input 
                      id="complianceStandards" 
                      name="complianceStandards" 
                      className="input" 
                      value={formData.complianceStandards || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="defectIdentified">Defects Identified</label>
                    <input 
                      id="defectIdentified" 
                      name="defectIdentified" 
                      className="input" 
                      value={formData.defectIdentified || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="correctiveAction">Corrective Actions</label>
                    <input 
                      id="correctiveAction" 
                      name="correctiveAction" 
                      className="input" 
                      value={formData.correctiveAction || ''} 
                      onChange={handleChange} 
                      
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="approvalStatus">Approval Status</label>
                    <select
                      id="approvalStatus"
                      name="approvalStatus"
                      className="input"
                      value={formData.approvalStatus || ''}
                      onChange={handleChange}
                      
                    >
                      <option value="">Select Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Rework Required">Rework Required</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="nextInspectionDate">Next Inspection Date</label>
                    <input 
                      type="date" 
                      id="nextInspectionDate" 
                      name="nextInspectionDate" 
                      className="input" 
                      value={formData.nextInspectionDate || ''} 
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

export default QualityControl;