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

const ProjectManagement = () => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [project, setProject] = useState([]);

  // const handleOpenForm = (projectId) => {
  //   setSelectedProjectId(projectId);
   
  //   setOpen(true);
  // };
  const handleOpenForm = (projectId, index = null) => {
  setSelectedProjectId(projectId);
  setEditingIndex(index);

  if (index !== null) {
    setFormData(project[index]);
  } else {
    setFormData({});
  }

  setOpen(true);
};


  // const handleClose = () => setOpen(false);

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


  // const handleSubmit = () => {
  //   const newProject = { ...formData, projectId: selectedProjectId };
  //   setProject([...project, newProject]);
  //   setOpen(false);
  // };

  const handleSubmit = () => {
  const newProject = { ...formData, projectId: selectedProjectId };

  if (editingIndex !== null) {
    const updatedProjects = [...project];
    updatedProjects[editingIndex] = newProject;
    setProject(updatedProjects);
  } else {
    setProject([...project, newProject]);
  }

  setFormData({});
  setEditingIndex(null);
  setOpen(false);
};


const handleDelete = (index) => {
  const updatedProjects = [...project];
  updatedProjects.splice(index, 1);
  setProject(updatedProjects);
};


  const filteredProjects = project.filter((p) =>
    Object.values(p).some(
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
      <Typography variant="h6" gutterBottom>SUBMITTED PROJECTS</Typography>
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
              <TableCell sx={{color:'#7267ef'}}><strong>Project Name</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Project Type</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Client Name</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Project Location</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Start Date</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>End Date</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Project Manager Id</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Project Manager Name</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Project Status</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Project Budget</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Project Milestones</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Resource Allocation</strong></TableCell>
              <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.projectId}</TableCell>
                <TableCell>{p.projectName}</TableCell>
                <TableCell>{p.projectType}</TableCell>
                <TableCell>{p.clientName}</TableCell>
                <TableCell>{p.projectLocation}</TableCell>
                <TableCell>{p.startDate}</TableCell>
                <TableCell>{p.endDate}</TableCell>
                <TableCell>{p.projectManagerId}</TableCell>
                <TableCell>{p.projectManagerName}</TableCell>
                <TableCell>{p.projectStatus}</TableCell>
                <TableCell>{p.projectBudget}</TableCell>
                <TableCell>{p.projectMilestone}</TableCell>
                <TableCell>{p.resourceAllocation}</TableCell>
                <TableCell>
                <IconButton color="warning" onClick={() => handleOpenForm(p.projectId, i)}>
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
        <h3 style={{ color: '#7267ef' }}>Project Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="projectName">Project Name</label>
            <input id="projectName" name="projectName" className="input" value={formData.projectName || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="projectType">Project Type</label>
            <input id="projectType" name="projectType" className="input" value={formData.projectType || ''} onChange={handleChange} />
          </Grid>
           <Grid item xs={6}>
            <label htmlFor="clientName">Client Name</label>
            <input id="clientName" name="clientName" className="input" value={formData.clientName || ''} onChange={handleChange} />
          </Grid>
          
          <Grid item xs={6}>
            <label htmlFor="projectLocation">Project Location</label>
            <input id="projectLocation" name="projectLocation" className="input" value={formData.projectLocation || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Approval Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Approval Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="startDate">Start Date</label>
            <input 
            type="date"
            id="startDate" 
            name="startDate" 
            className="input" 
            value={formData.startDate || ''} 
            onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="endDate">End Date</label>
            <input 
            type="date"
            id="endDate" 
            name="endDate" 
            className="input" 
            value={formData.endDate || ''} 
            onChange={handleChange} />
          </Grid>
          
          <Grid item xs={6}>
            <label htmlFor="projectManagerId">Project Manager ID</label>
            <input id="projectManagerId" name="projectManagerId" className="input" value={formData.projectManagerId || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="projectManagerName">Project Manager Name</label>
            <input id="projectManagerName" name="projectManagerName" className="input" value={formData.projectManagerName || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="projectStatus">Project Status</label>
            <select id="projectStatus" name="projectStatus" className="input" value={formData.projectStatus || ''} onChange={handleChange}>
              <option value="Planning">Planning</option>
              <option value="Progress">In Progress</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </Grid>
        </Grid>
      </Grid>

      {/* Budget/Requirements */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Budget and Requirements</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="projectBudget">Project Budget</label>
            <input id="projectBudget" name="projectBudget" className="input" value={formData.projectBudget || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="designConstraints">Design Constraints</label>
            <input id="designConstraints" name="designConstraints" className="input" value={formData.designConstraints || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="projectMilestone">Project Milestone</label>
            <input id="projectMilestone" name="projectMilestone" className="input" value={formData.projectMilestone || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="resourceAllocation">Resource Allocation</label>
            <input id="resourceAllocation" name="resourceAllocation" className="input"  value={formData.resourceAllocation || ''} onChange={handleChange} />
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

export default ProjectManagement;
