// DesignForm.jsx
import React, { useState,useEffect } from "react";
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
import { getProjectsAccept } from "../../allapi/engineering"; 
import { createProject,fetchConstructionProjects,deleteConstructionProject ,updateConstructionProject} from "../../allapi/construction"; 
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";
import { Maximize2, Minimize2 } from "lucide-react";
import { formatDateDDMMYYYY } from '../../utils/date';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';





const ProjectManagement = () => {
  const MODULE_SLUG = 'construction';
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [project, setProject] = useState([]);
  const [constructionProjects, setConstructionProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false); 
  const [isModalMaximized, setIsModalMaximized] = useState(false);


  const [formData, setFormData] = useState({
  project: "",                // project_id
  projectName: "",
  projectType: "",
  clientName: "",
  projectLocation: "",
  startDate: "",
  endDate: "",
  projectManagerId: "",
  projectManagerName: "",
  projectStatus: "planning",  // default
  projectBudget: "",
  // projectMilestones: "",
  resourceAllocation: ""
});


const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };




//All accepted projects 
    useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsAccept();
        setProject(data); // assuming API returns array of projects
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  //All Constrauction Projects
  const loadProjects = async () => {
  try {
    const data = await fetchConstructionProjects();
    console.log("✅ Construction Projects:", data);
    setConstructionProjects(data);
  } catch (error) {
    console.error("❌ Failed to load construction projects:", error);
  }
};

// ✅ Call when component mounts
useEffect(() => {
  loadProjects();
}, []);

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

//HandleEdit logic
const handleEdit = (project) => {
  setFormData({
    projectName: project.project_name,
    projectType: project.project_type,
    clientName: project.client_name,
    projectLocation: project.project_location,
    startDate: project.start_date,
    endDate: project.end_date,
    projectManagerId: project.project_manager_id,
    projectManagerName: project.project_manager_name,
    projectStatus: project.project_status,
    projectBudget: project.project_budget,
    // projectMilestones: project.project_milestones,
    resourceAllocation: project.resource_allocation,
  });
  setSelectedProjectId(project.project); // backend project ID
  setIsEditing(true); // enable edit mode
  setOpen(true); // open modal
};

 
  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};



const handleSubmit = async () => {
  try {
    const payload = {
      project: selectedProjectId,
      project_name: formData.projectName,
      project_type: formData.projectType,
      client_name: formData.clientName,
      project_location: formData.projectLocation,
      start_date: formData.startDate,
      end_date: formData.endDate,
      project_manager_id: formData.projectManagerId,
      project_manager_name: formData.projectManagerName,
      project_status: formData.projectStatus?.toLowerCase() || "planning",
      project_budget: formData.projectBudget,
      // project_milestones: formData.projectMilestones,
      resource_allocation: formData.resourceAllocation,
    };

    let response;

    if (isEditing && selectedProjectId) {
      response = await updateConstructionProject(selectedProjectId, payload);
      console.log("✅ Project updated:", response);
      alert("Project updated successfully!");
    } else {
      response = await createProject(payload);
      console.log("✅ Project created:", response);
      alert("Project Details for Construction Submitted Successfully!!");
    }

    // Reset form and mode
    setFormData({
      projectName: "",
      projectType: "",
      clientName: "",
      projectLocation: "",
      startDate: "",
      endDate: "",
      projectManagerId: "",
      projectManagerName: "",
      projectStatus: "planning",
      projectBudget: "",
      // projectMilestones: "",
      resourceAllocation: "",
    });
    setSelectedProjectId("");
    setIsEditing(false);
    setOpen(false);
    loadProjects();

  } catch (error) {
    console.error("❌ Error in project submit:", error);

    if (error.response?.data) {
      const backendMessage =
        error.response.data.message ||
        error.response.data.error ||
        Object.values(error.response.data)[0];
      alert(`Error: ${backendMessage}`);
    } else {
      alert("Error in submitting Project Details for Construction!!");
    }
  }
};

//HandleDelete logic

const handleDelete = async (projectId) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete project with ID: ${projectId}?`
  );
  if (!confirmDelete) return;

  try {
    // ✅ Call API
    await deleteConstructionProject(projectId);

    alert("✅ Project deleted successfully!");

    // ✅ Refresh project list after deletion
    loadProjects();

  } catch (error) {
    console.error("❌ Error deleting project:", error);
    alert("❌ Failed to delete project.");
  }
};

  const filteredProjects = project.filter((p) =>
    Object.values(p).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  

  // Download PDF for Submitted Projects
  const downloadPDF = (rows) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('Construction Projects Report', 14, 15);

    const head = [[
      'Project ID',
      'Project Name',
      'Type',
      'Client',
      'Location',
      'Start Date',
      'End Date',
      'Manager ID',
      'Manager Name',
      'Status',
      'Budget',
      'Resource Allocation',
    ]];

    const body = (rows || []).map((p) => [
      p.project,
      p.project_name,
      p.project_type,
      p.client_name,
      p.project_location,
      formatDateDDMMYYYY(p.start_date),
      formatDateDDMMYYYY(p.end_date),
      p.project_manager_id,
      p.project_manager_name,
      p.project_status,
      p.project_budget,
      p.resource_allocation,
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 25,
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [114, 103, 239] },
      tableWidth: 'auto',
    });

    doc.save('construction_projects_report.pdf');
  };

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
  {filteredProjects.map((proj, i) => (
    <TableRow key={i}>
      <TableCell>{proj.project_id}</TableCell>
      <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
        <ShowIfCan slug={MODULE_SLUG} action="can_create">
        <IconButton onClick={() => handleOpenForm(proj.project_id)} color="primary">
          <AddCircle sx={{ color: "#7267ef" }} />
        </IconButton>
        </ShowIfCan>
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
      <Button
        startIcon={<DownloadIcon />}
        onClick={() => downloadPDF(constructionProjects)}
        sx={{ mr: 1 }}
      >
      </Button>
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
              {/* <TableCell sx={{color:'#7267ef'}}><strong>Project Milestones</strong></TableCell> */}
              <TableCell sx={{color:'#7267ef'}}><strong>Resource Allocation</strong></TableCell>
              <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
           <TableBody>
  {constructionProjects.map((p, i) => (
    <TableRow key={i}>
      <TableCell>{p.project}</TableCell>
      <TableCell>{p.project_name}</TableCell>
      <TableCell>{p.project_type}</TableCell>
      <TableCell>{p.client_name}</TableCell>
      <TableCell>{p.project_location}</TableCell>
      <TableCell>{formatDateDDMMYYYY(p.start_date)}</TableCell>
      <TableCell>{formatDateDDMMYYYY(p.end_date)}</TableCell>
      <TableCell>{p.project_manager_id}</TableCell>
      <TableCell>{p.project_manager_name}</TableCell>
      <TableCell>{p.project_status}</TableCell>
      <TableCell>{p.project_budget}</TableCell>
      {/* <TableCell>{p.project_milestones}</TableCell> */}
      <TableCell>{p.resource_allocation}</TableCell>
      <TableCell>
        <DisableIfCannot slug={MODULE_SLUG} action="can_update">
        <IconButton color="warning" onClick={() => handleEdit(p)}>
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
        <IconButton color="error" onClick={() => handleDelete(p.project)}>
          <Delete sx={{ color: "red" }} />
        </IconButton>
        </ShowIfCan>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

        </Table>
      </TableContainer>
    </Paper>
  </Grid>
</Grid>


     
<Dialog
             open={open}
             onClose={handleClose}
             fullWidth
             maxWidth="xl"
             PaperProps={{
               style: isModalMaximized
                 ? {
                     width: "100%",
                     height: "100vh", // fullscreen
                     margin: 0,
                   }
                 : {
                     width: "70%",
                     height: "97vh", // default size
                   },
             }}
           >

  <DialogTitle>Enter Project Details</DialogTitle>
  <DialogContent
                  sx={{
                    position: "relative",
                    overflowY: "auto", // ensures internal scrolling
                  }}
                >
               <IconButton
                    aria-label="toggle-size"
                    onClick={toggleModalSize}
                    sx={{
                      position: "absolute",
                      right: 40,
                      top: 8,
                      color: (theme) => theme.palette.grey[600],
                    }}
                  >
                    {isModalMaximized ? <Minimize2 /> : <Maximize2 />}
                  </IconButton>
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

      

      {/* Design Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Project Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="projectId">Project ID</label>
            <input id="projectId" className="input" value={selectedProjectId} disabled />
          </Grid>
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
           <Grid item xs={6}>
            <label htmlFor="projectStatus">Project Status</label>
            <select id="projectStatus" name="projectStatus" className="input" value={formData.projectStatus || ''} onChange={handleChange}>
              <option value="planning">Planning</option>
              <option value="in progress">In Progress</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>
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
         
          {/* <Grid item xs={6}>
            <label htmlFor="projectMilestones">Project Milestone</label>
            <input id="projectMilestones" name="projectMilestones" className="input" value={formData.projectMilestones || ''} onChange={handleChange} />
          </Grid> */}
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

<DisableIfCannot slug={MODULE_SLUG} action={isEditing ? 'can_update' : 'can_create'}>

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
  {isEditing ? "Update Project" : "Submit Project"}
</Button>
</DisableIfCannot>

  </DialogActions>
</Dialog>

    </>
  );
};

export default ProjectManagement;
