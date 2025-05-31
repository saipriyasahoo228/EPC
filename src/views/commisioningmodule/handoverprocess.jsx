

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

const HandoverProcess = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [handoverprocess, setHandoverProcess] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newHandoverNumber = handoverprocess.length + 1;
    const paddedNumber = newHandoverNumber.toString().padStart(3, '0');
    
    setFormData({ 
      handoverprocessID: `HND-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (handoverItem) => {
    setFormData(handoverItem);
    setSelectedProjectId(handoverItem.projectId);
    setIsEditMode(true);
    setCurrentEditId(handoverItem.handoverprocessID);
    setOpen(true);
  };

  const handleDelete = (handoverId) => {
    if (window.confirm("Are you sure you want to delete this handover process!")) {
      setHandoverProcess(handoverprocess.filter(item => item.handoverprocessID !== handoverId));
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
      setHandoverProcess(handoverprocess.map(item => 
        item.handoverprocessID === currentEditId ? formData : item
      ));
    } else {
      // Add new record
      const newHandover = { ...formData, projectId: selectedProjectId };
      setHandoverProcess([...handoverprocess, newHandover]);
    }
    handleClose();
  };
  const filteredHandover = handoverprocess.filter((h) =>
    Object.values(h).some(
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Receiving Department</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover Document ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>System/Component List</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Training Provided</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Training Documentation</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Pending Issues</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Final Approval</strong></TableCell>
                   
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHandover.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.projectId}</TableCell>
                      <TableCell>{h.handoverprocessID}</TableCell>
                      <TableCell>{h.handoverDate}</TableCell>
                      <TableCell>{h.receivingDepartment}</TableCell>
                      <TableCell>{h.handoverDocID}</TableCell>
                      <TableCell>{h.componentList}</TableCell>
                      <TableCell>{h.trainingprovided}</TableCell>
                      <TableCell>{h.document}</TableCell>
                      <TableCell>{h.issues}</TableCell>
                      <TableCell>{h.approvalStatus}</TableCell>
                     
                     
                      <TableCell>
                        <IconButton onClick={() => handleEdit(h)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(h.handoverprocessID)} color="error">
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
                    <label htmlFor="handoverprocessID">Handover ID</label>
                    <input 
                      id="handoverprocessID" 
                      className="input" 
                      value={formData.handoverprocessID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Handover Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="handoverDate">Handover Date</label>
                    <input 
                      type="date"
                      id="handoverDate" 
                      name="handoverDate" 
                      className="input" 
                      value={formData.handoverDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="receivingDepartment">Recieving Department</label>
                    <input
                      
                      id="receivingDepartment" 
                      name="receivingDepartment" 
                      className="input" 
                      value={formData.receivingDepartment || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="handoverDocID">Handover DocumentID</label>
                    <input 
                      id="handoverDocID" 
                      name="handoverDocID" 
                      className="input" 
                      value={formData.handoverDocID || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="componentList">System/Component List</label>
                    <input 
                      id="componentList" 
                      name="componentList" 
                      className="input" 
                      value={formData.componentList || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="trainingprovided">Training Provided</label>
                    <input 
                      id="trainingprovided" 
                      name="trainingprovided" 
                      className="input" 
                      value={formData.trainingprovided || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="document">Training Documentation</label>
                    <input 
                      id="document" 
                      name="document" 
                      className="input" 
                      value={formData.document || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                 
                 
                </Grid>
                <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Pending Issues & Final Status</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="issues">Pending Issues</label>
                    <input 
                      id="issues" 
                      name="issues" 
                      className="input" 
                      value={formData.issues || ''} 
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
                      <option value="Conditional">Conditional</option>
                      <option value="Pending">Pending</option>
                     
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

export default HandoverProcess;