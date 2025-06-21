

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
  { id: "2025-AST-001" },
  { id: "2025-AST-002" },
  { id: "2025-AST-003" },
];

const AssetScheduling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [maintenance, setMaintenance] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = maintenance.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(3, '0');
    
    setFormData({ 
      maintenanceID: `MNT-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (maintenanceItem) => {
    setFormData(maintenanceItem);
    setSelectedProjectId(maintenanceItem.projectId);
    setIsEditMode(true);
    setCurrentEditId(maintenanceItem.maintenanceID);
    setOpen(true);
  };

  const handleDelete = (maintenanceId) => {
    if (window.confirm("Are you sure you want to delete maintenance scheduling report!")) {
      setMaintenance(maintenance.filter(item => item.maintenanceID !== maintenanceId));
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
    setMaintenance(maintenance.map(item => 
      item.maintenanceID === currentEditId ? updatedFormData : item
    ));
  } else {
    // Add new record
    const newMaintenance = { ...updatedFormData, projectId: selectedProjectId };
    setMaintenance([...maintenance, newMaintenance]);
  }

  handleClose();
};


  const filteredMaintenance = maintenance.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Maintenance Scheduling Details</Typography>
      
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>
              ASSETS RECORDS
            </Typography>

            {/* Search Input */}
            <Box sx={{ my: 2, mx: 1 }}>
              <input
                type="text"
                placeholder="Search Asset ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Asset ID</strong></TableCell>
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
            <Typography variant="h6" gutterBottom>Maintenance Scheduling Details</Typography>
            <input
              type="text"
              placeholder="Search Maintenance Scheduling Details"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4, marginBottom: '16px' }}
            />

            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Maintenance ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Maintenance Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Scheduled Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Frequency</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Assigned TechnicianId</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Task Description</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Spare Parts Required</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Estimated Downtime</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Approval Status</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaintenance.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.projectId}</TableCell>
                      <TableCell>{t.maintenanceID}</TableCell>
                      <TableCell>{t.maintenanceType}</TableCell>
                      <TableCell>{t.scheduledDate}</TableCell>
                      <TableCell>{t.frequency}</TableCell>
                      <TableCell>{t.technicianId}</TableCell>
                      <TableCell>{t.taskDescription}</TableCell>
                      <TableCell>{t.sparePart}</TableCell>
                      <TableCell>{t.EstimatedDowntime}</TableCell>
                      <TableCell>{t.approvalStatus}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(t)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(t.maintenanceID)} color="error">
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
          {isEditMode ? "Edit Maintenance Scheduling Details" : "Enter Maintenance Scheduling Details"}
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
      <h3 style={{ color: '#7267ef' }}>Maintenance Scheduling Info..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <label htmlFor="projectId">Asset ID</label>
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
          <label htmlFor="maintenanceID">Maintenance ID</label>
          <input
            id="maintenanceID"
            name="maintenanceID"
            className="input"
            value={formData.maintenanceID || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
  <label htmlFor="maintenanceType">Maintenance Type</label>
  <select
    id="maintenanceType"
    name="maintenanceType"
    className="input"
    value={formData.maintenanceType || ''}
    onChange={handleChange}
  >
    <option value="">Select Type</option>
    <option value="Preventive">Preventive</option>
    <option value="Predictive">Predictive</option>
    <option value="Corrective">Corrective</option>
    <option value="Breakdown">Breakdown</option>
  </select>
</Grid>

        <Grid item xs={6}>
          <label htmlFor="scheduledDate">Scheduled Date</label>
          <input
            type="date"
            id="scheduledDate"
            name="scheduledDate"
            className="input"
            value={formData.scheduledDate || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="frequency">Frequency</label>
          <input
            id="frequency"
            name="frequency"
            className="input"
            value={formData.frequency || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="technicianId">Technician ID</label>
          <input
            id="technicianId"
            name="technicianId"
            className="input"
            value={formData.technicianId || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="taskDescription">Task Description</label>
          <input
            id="taskDescription"
            name="taskDescription"
            className="input"
            value={formData.taskDescription || ''}
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
          <label htmlFor="sparePart">Spare Parts Required</label>
          <input
            
            id="sparePart"
            name="sparePart"
            className="input"
            value={formData.sparePart || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={6}>
          <label htmlFor="EstimatedDowntime">Estimated Downtime</label>
          <input
            id="EstimatedDowntime"
            name="EstimatedDowntime"
            className="input"
            value={formData.EstimatedDowntime || ''}
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
    <option value="">-- Select Status --</option>
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
    <option value="Completed">Completed</option>
  </select>
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

export default AssetScheduling;