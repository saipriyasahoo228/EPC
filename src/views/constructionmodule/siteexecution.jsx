
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
import {createSiteExecution,getSiteExecutions,deleteSiteExecution ,updateSiteExecution} from "../../allapi/construction";


const SiteExecution = () => {
  const [siteCounter, setSiteCounter] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [site, setSite] = useState([]);
  const [project, setProject] = useState([]);
  const [siteExecutions, setSiteExecutions] = useState([]);
  const [filteredSite, setFilteredSite] = useState([]);
  const [editingId, setEditingId] = useState(null);


  
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

    //Get api for site-execution
   const fetchSiteExecutions = async () => {
  try {
    const data = await getSiteExecutions();
    console.log("✅ Site Executions:", data);
    setSiteExecutions(data);
    setFilteredSite(data);
  } catch (err) {
    console.error("❌ Failed to fetch site executions:", err);
  }
};

// 🔹 run once on mount
useEffect(() => {
  fetchSiteExecutions();
}, []);



const handleOpenForm = (projectId) => {
  setSelectedProjectId(projectId);

  const currentYear = new Date().getFullYear();
  
  // Find the highest site number for the current year
  const currentYearSites = siteExecutions.filter(s => s.site_id?.startsWith(`SIT-${currentYear}-`));
  
  let maxNumber = 0;
  if (currentYearSites.length > 0) {
    currentYearSites.forEach(s => {
      const parts = s.site_id?.split('-');
      if (parts && parts.length === 3) {
        const num = parseInt(parts[2]);
        if (num > maxNumber) maxNumber = num;
      }
    });
  }

  const newSiteNumber = maxNumber + 1;
  const paddedNumber = String(newSiteNumber).padStart(4, '0');

  setFormData({
    siteId: `SIT-${currentYear}-${paddedNumber}`,
    project: projectId,
  });

  setOpen(true);
};
const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


// const handleSubmit = async () => {
//   try {
//     const payload = {
//       project: selectedProjectId,
//       site_supervisor_id: formData.siteSupervisorID,
//       daily_progress_report_id: formData.dailyProgressReportID,
//       work_completed: formData.workCompleted,
//       manpower_utilized: formData.manpowerUtilize,
//       equipment_used: formData.equipmentUsed,
//       weather_conditions: formData.wetherCondition,
//       safety_compliance_report: formData.safetyCompliance,
//       material_consumption: formData.materialConsumption,
//       site_issues: formData.siteIssues,
//       site_execution_status: formData.siteStatus || "on track",
//     };

//     if (editingId) {
//       // 🔹 PATCH (edit mode)
//       await updateSiteExecution(editingId, payload);
//       alert("✅ Site Execution updated successfully!");
//     } else {
//       // 🔹 POST (create mode)
//       const data = await createSiteExecution(payload);
//       alert(`✅ Site Execution saved!\nSite ID: ${data.site_id}`);
//     }

//     // Reset form & close dialog
//     setFormData({});
//     setEditingId(null);
//     handleClose();

//     // 🔹 Refresh table
//     fetchSiteExecutions();
//   } catch (err) {
//     console.error("❌ Failed to save site execution:", err);
//   }
// };
const handleSubmit = async () => {
  try {
    const payload = {
      project: selectedProjectId,
      site_supervisor_id: formData.siteSupervisorID,
      daily_progress_report_id: formData.dailyProgressReportID,
      work_completed: formData.workCompleted,
      manpower_utilized: formData.manpowerUtilize,
      equipment_used: formData.equipmentUsed,
      weather_conditions: formData.wetherCondition,
      safety_compliance_report: formData.safetyCompliance,
      material_consumption: formData.materialConsumption,
      site_issues: formData.siteIssues,
      site_execution_status: formData.siteStatus || "on track",
    };

    if (editingId) {
      // 🔹 PATCH (edit mode)
      await updateSiteExecution(editingId, payload);
      alert("✅ Site Execution updated successfully!");
    } else {
      // 🔹 POST (create mode)
      const data = await createSiteExecution(payload);
      alert(`✅ Site Execution saved!\nSite ID: ${data.site_id}`);
    }

    // Reset form & close dialog
    setFormData({});
    setEditingId(null);
    handleClose();

    // 🔹 Refresh table
    fetchSiteExecutions();
  } catch (err) {
    console.error("❌ Failed to save site execution:", err);

    // Show backend error response if available
    if (err.response && err.response.data) {
      const errorMsg = err.response.data.detail || JSON.stringify(err.response.data);
      alert(`❌ Error: ${errorMsg}`);
    } else {
      alert("❌ An unexpected error occurred. Please try again.");
    }
  }
};

// 🔹 In your component
const handleDelete = async (project) => {
  if (!window.confirm(`Are you sure you want to delete this site execution with projectID: ${project  }?`)) {
    return;
  }

  try {
    await deleteSiteExecution(project);
    alert(`✅ Site execution with projectID: ${project} deleted successfully!`);

    // 🔹 Refresh the table after delete
    fetchSiteExecutions();
  } catch (err) {
    console.error("❌ Failed to delete site execution:", err);
    alert("❌ Failed to delete site execution. Please try again.");
  }
};

const handleEdit = (s) => {
  setFormData({
    siteId:s.site_id,
    siteSupervisorID: s.site_supervisor_id,
    dailyProgressReportID: s.daily_progress_report_id,
    workCompleted: s.work_completed,
    manpowerUtilize: s.manpower_utilized,
    equipmentUsed: s.equipment_used,
    wetherCondition: s.weather_conditions,
    safetyCompliance: s.safety_compliance_report,
    materialConsumption: s.material_consumption,
    siteIssues: s.site_issues,
    siteStatus: s.site_execution_status,
  });

  setSelectedProjectId(s.project);
  setEditingId(s.project);   // ✅ use `s.id` instead of `s.project` for PATCH
  setOpen(true);        // open the form dialog for editing
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
      {filteredProjects.map((proj, i) => (
        <TableRow key={i}>
          <TableCell>{proj.project_id}</TableCell>
          <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => handleOpenForm(proj.project_id)} color="primary">
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
              <TableCell sx={{color:'#7267ef'}}><strong>ProjectID</strong></TableCell>
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
      <TableCell>{s.project}</TableCell>
      <TableCell>{s.site_id}</TableCell>
      <TableCell>{s.site_supervisor_id}</TableCell>
      <TableCell>{s.daily_progress_report_id}</TableCell>
      <TableCell>{s.work_completed}</TableCell>
      <TableCell>{s.manpower_utilized}</TableCell>
      <TableCell>{s.equipment_used}</TableCell>
      <TableCell>{s.weather_conditions}</TableCell>
      <TableCell>{s.safety_compliance_report}</TableCell>
      <TableCell>{s.material_consumption}</TableCell>
      <TableCell>{s.site_issues}</TableCell>
      <TableCell>{s.site_execution_status}</TableCell>

      <TableCell>
        <IconButton color="warning">
          <Edit sx={{ color: "orange" }}  onClick={() => handleEdit(s)} />
        </IconButton>
        <IconButton color="error">
          <Delete sx={{ color: "red" }}  onClick={() => handleDelete(s.project)}/>
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
  <select
    id="siteStatus"
    name="siteStatus"
    className="input"
    value={formData.siteStatus || "on track"}
    onChange={handleChange}
  >
    <option value="on track">On Track</option>
    <option value="delayed">Delayed</option>
    <option value="halted">Halted</option>
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
