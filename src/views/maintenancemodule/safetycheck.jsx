

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

const SafetyCheck = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [safetycheck, setsafetyCheck] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = safetycheck.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(3, '0');
    
    setFormData({ 
      complianceID: `CMP-${currentYear}-${paddedNumber}`,
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
    setCurrentEditId(safetyItem.complianceID);
    setOpen(true);
  };

  const handleDelete = (complianceID) => {
    if (window.confirm("Are you sure you want to delete safety check report!")) {
      setsafetyCheck(safetycheck.filter(item => item.complianceID !== complianceID));
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
    setsafetyCheck(safetycheck.map(item => 
      item.complianceID === currentEditId ? updatedFormData : item
    ));
  } else {
    // Add new record
    const newSafety = { ...updatedFormData, projectId: selectedProjectId };
    setsafetyCheck([...safetycheck, newSafety]);
  }

  handleClose();
};


  const filteredSafetyCheck = safetycheck.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Compliance & Safety Checks</Typography>
      
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
            <Typography variant="h6" gutterBottom>Compliance & Safety Checks Details</Typography>
            <input
              type="text"
              placeholder="Search Safety Check Details"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspector ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Regulatory Standards</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Non-Compliance Issues</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Action Plan</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Certification ExpiryDate</strong></TableCell>
                   
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSafetyCheck.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.projectId}</TableCell>
                      <TableCell>{t.complianceID}</TableCell>
                      <TableCell>{t.inspectionDate}</TableCell>
                      <TableCell>{t.inspectionType}</TableCell>
                      <TableCell>{t.inspectorID}</TableCell>
                      <TableCell>{t.regulatoryStandards}</TableCell>
                      <TableCell>{t.nonComplianceIssues}</TableCell>
                      <TableCell>{t.correctiveActionPlan}</TableCell>
                      <TableCell>{t.certificationExpiryDate}</TableCell>
                    
                      <TableCell>
                        <IconButton onClick={() => handleEdit(t)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(t.complianceID)} color="error">
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
          {isEditMode ? "Edit Safety Check Details" : "Enter Safety Check Details"}
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
    {/* Compliance Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Compliance Information</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>

        <Grid item xs={6}>
          <label htmlFor="complianceID">Compliance ID</label>
          <input
            id="complianceID"
            name="complianceID"
            className="input"
            value={formData.complianceID || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>

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
          <label htmlFor="inspectionDate">Inspection Date</label>
          <input
            type="date"
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
          <label htmlFor="regulatoryStandards">Regulatory Standards</label>
          <input
            id="regulatoryStandards"
            name="regulatoryStandards"
            className="input"
            value={formData.regulatoryStandards || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="nonComplianceIssues">Non-Compliance Issues</label>
          <textarea
            id="nonComplianceIssues"
            name="nonComplianceIssues"
            className="input"
            rows="3"
            value={formData.nonComplianceIssues || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="correctiveActionPlan">Corrective Action Plan</label>
          <textarea
            id="correctiveActionPlan"
            name="correctiveActionPlan"
            className="input"
            rows="3"
            value={formData.correctiveActionPlan || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="certificationExpiryDate">Certification Expiry Date</label>
          <input
            type="date"
            id="certificationExpiryDate"
            name="certificationExpiryDate"
            className="input"
            value={formData.certificationExpiryDate || ''}
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

export default SafetyCheck;