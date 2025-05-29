
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

const SiteExecution = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [site, setSite] = useState([]);

  const handleOpenForm = (projectId) => {
  setSelectedProjectId(projectId);

  const currentYear = new Date().getFullYear(); // Get system year dynamically
  const newSiteNumber = site.length + 1;
  const paddedNumber = newSiteNumber.toString().padStart(3, '0'); // e.g., "001"

  setFormData({ siteId: `SIT-${currentYear}-${paddedNumber}` });

  setOpen(true);
};

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newSite = { ...formData, projectId: selectedProjectId };
    setSite([...site, newSite]);
    setOpen(false);
  };

  const filteredSite = site.filter((s) =>
    Object.values(s).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  

  return (
    <>
      <Typography variant="h5"  gutterBottom sx={{ mt: 5 }} >Site Management</Typography>
      
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
      <Typography variant="h6" gutterBottom>SITE EXECUTION DETAILS</Typography>
      <input
        type="text"
        placeholder="Search Site"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />

      <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Site ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Site Supervisor ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Daily Progress Report ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Work Completed</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Manpower Utilized</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Equipment Used</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Weather Conditions</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Safety Compliance Report</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Material Consumption </strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Site Issues</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Site Execution Status</strong></TableCell>
              <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSite.map((s, i) => (
              <TableRow key={i}>
                <TableCell>{s.projectId}</TableCell>
                <TableCell>{s.siteId}</TableCell>
                <TableCell>{s.siteSupervisorID}</TableCell>
                <TableCell>{s.dailyProgressReportID}</TableCell>
                <TableCell>{s.workCompleted}</TableCell>
                <TableCell>{s.manpowerUtilize}</TableCell>
                <TableCell>{s.equipmentUsed}</TableCell>
                <TableCell>{s.wetherCondition}</TableCell>
                <TableCell>{s.safetyCompliance}</TableCell>
                <TableCell>{s.materialConsumption}</TableCell>
                <TableCell>{s.siteIssues}</TableCell>
                <TableCell>{s.SiteExecution}</TableCell>
                
              
                <TableCell>
                <IconButton color="warning">
                  <Edit sx={{ color: "orange" }} />
                </IconButton>
                <IconButton color="error">
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
  <DialogTitle>Enter Site Execution Details</DialogTitle>
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
            <input id="projectId" className="input" value={selectedProjectId} disabled />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="siteId">Site ID</label>
            <input id="siteId" className="input" value={formData.siteId || ''} disabled />
          </Grid>
        </Grid>
      </Grid>

      {/* Design Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Site Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="siteSupervisorID">Site Supervisor ID</label>
            <input id="siteSupervisorID" name="siteSupervisorID" className="input" value={formData.siteSupervisorID || ''} onChange={handleChange} />
          </Grid>
          
          <Grid item xs={6}>
            <label htmlFor="dailyProgressReportID">Daily Progress Report ID</label>
            <input id="dailyProgressReportID" name="dailyProgressReportID" className="input" value={formData.dailyProgressReportID || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="workCompleted">Work Completed</label>
            <input id="workCompleted" name="workCompleted" className="input" value={formData.workCompleted || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="manpowerUtilize">ManPower Utilized</label>
            <input type='number' id="manpowerUtilize" name="manpowerUtilize" className="input" value={formData.manpowerUtilize || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Approval Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Weather Condition and Material Consumption</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="equipmentUsed">Equipment Used</label>
            <input id="equipmentUsed" name="equipmentUsed" className="input" value={formData.equipmentUsed || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="wetherCondition">Wether Condition</label>
            <input id="wetherCondition" name="wetherCondition" className="input" value={formData.wetherCondition || ''} onChange={handleChange} />
          </Grid>
          
          <Grid item xs={6}>
            <label htmlFor="safetyCompliance">Safety Compliance Report</label>
            <input id="safetyCompliance" name="safetyCompliance" className="input" value={formData.safetyCompliance || ''} onChange={handleChange} />
          </Grid>
           <Grid item xs={6}>
            <label htmlFor="materialConsumption">Material Consumption</label>
            <input id="materialConsumption" name="materialConsumption" className="input" value={formData.materialConsumption || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Budget/Requirements */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Site Issues & Status</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="siteIssues">Site Issues</label>
            <textarea id="siteIssues" name="siteIssues" className="input" rows={3} value={formData.siteIssues || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="siteStatus">Site Execution Status</label>
            <input id="siteStatus" name="siteStatus" className="input" value={formData.siteStatus || ''} onChange={handleChange} />
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

export default SiteExecution;
