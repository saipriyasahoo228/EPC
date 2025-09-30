

import React, { useState,useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

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
import DownloadIcon from "@mui/icons-material/Download";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { getProjectsAccept } from "../../allapi/engineering";
import { createSafetyManagement,getSafetyManagements,deleteSafetyManagement,updateSafetyManagement } from "../../allapi/construction";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";
import { formatDateDDMMYYYY } from '../../utils/date';
const SafetyManagement = () => {
  const MODULE_SLUG = 'construction';
  const [isModalMaximized, setIsModalMaximized] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [safetymanagement, setSafetyManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [safetyRecords, setSafetyRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };



  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsAccept();
        setProjects(data); // store API data in state
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

useEffect(() => {
  fetchSafety(); // call on mount
}, []);

const fetchSafety = async () => {
  try {
    const data = await getSafetyManagements();
    setSafetyRecords(data);
  } catch (error) {
    console.error("❌ Error fetching safety records:", error);
  }
};
 
 

 const handleOpenForm = (projectId) => {
  console.log("handleOpenForm called with projectId:", projectId);
  console.log("Current safetyRecords data:", safetyRecords); // Check this instead
  
  setSelectedProjectId(projectId);
  const currentYear = new Date().getFullYear();

  // Use safetyRecords instead of safetymanagement
  const currentYearIDs = safetyRecords
    .filter(item => item.safety_report_id && item.safety_report_id.includes(`-${currentYear}-`))
    .map(item => {
      const parts = item.safety_report_id.split("-");
      const numPart = parts[parts.length - 1];
      return parseInt(numPart, 10);
    })
    .filter(num => !isNaN(num));

  console.log("Filtered currentYearIDs:", currentYearIDs);

  // Find the maximum number
  const maxNumber = currentYearIDs.length > 0 ? Math.max(...currentYearIDs) : 0;
  console.log("Max number found:", maxNumber);

  // Generate preview ID
  const previewNumber = maxNumber + 1;
  const paddedNumber = previewNumber.toString().padStart(4, "0");
  const previewId = `SAF-${currentYear}-${paddedNumber}`;

  setFormData({
    safetymanagementID: previewId,
    projectId: projectId,
  });

  setIsEditMode(false);
  setCurrentEditId(null);
  setOpen(true);
};


// HandleEdit logic for Safety Management
const handleEdit = (safety) => {
  setFormData({
    safetymanagementID:safety.safety_report_id,
    incidentDate: safety.incident_date,
    incidentDescription: safety.incident_description,
    affectedpersonnelID: safety.affected_personnel_id,
    injurySeverity: safety.injury_severity,
    correctiveMeasures: safety.corrective_measure,
    safetyTraining: safety.safety_training_conducted,
  });

  setSelectedProjectId(safety.project);   // ✅ if you’re showing project in a disabled field
  setEditingId(safety.safety_report_id);  // ✅ this tells handleSubmit to PATCH instead of POST
  setOpen(true);                          // open dialog
};


//HandleDelete Logic
const handleDelete = async (safetyId) => {
  if (
    !window.confirm(`Are you sure you want to delete Safety ID: ${safetyId}?`)
  )
    return;

  console.log("🆔 Safety ID to delete:", safetyId); // for debugging

  try {
    await deleteSafetyManagement(safetyId);
    alert("✅ Record deleted successfully");
    fetchSafety();

    // Update local state to remove deleted record
    setSafetyRecords((prev) =>
      prev.filter((item) => item.safetyId !== safetyId)
    );
  } catch (error) {
    console.error("❌ Error deleting safety record:", error);
    alert("❌ Failed to delete record");
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


const handleSubmit = async () => {
  try {
    const payload = {
      project: selectedProjectId,
      incident_date: formData.incidentDate,
      incident_description: formData.incidentDescription,
      affected_personnel_id: formData.affectedpersonnelID,
      injury_severity: formData.injurySeverity?.toLowerCase(),
      corrective_measure: formData.correctiveMeasures,
      safety_training_conducted: formData.safetyTraining,
    };

    let response;

    if (editingId) {
      // Update existing record
      response = await updateSafetyManagement(editingId, payload);
      alert(`✏️ Safety Management updated! Report ID: ${response.safety_report_id}`);
    } else {
      // Create new record
      response = await createSafetyManagement(payload);
      alert(`✅ Safety Management created! Report ID: ${response.safety_report_id}`);
    }

    handleClose(); // close the form
  } catch (error) {
    // Only show backend error message
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Something went wrong on the server.";

    alert(`❌ Failed to save Safety Management record.\n\nError: ${backendMessage}`);
    console.error("❌ Error saving Safety Management record:", error.response?.data || error.message);
  }
};



  const filteredSafety = safetymanagement.filter((s) =>
    Object.values(s).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const downloadPDF = (safetyRecords) => {
    const doc = new jsPDF("l", "mm", "a4"); // landscape
    doc.setFontSize(16);
    doc.text("All Safety Management Report", 14, 15);

    const tableColumn = [
      "Project ID",
      "Safety Report ID",
      "Incident Date",
      "Incident Description",
      "Affected Personnel ID",
      "Injury Severity",
      "Corrective Measures",
      "Safety Training Conducted",
    ];

    const tableRows = safetyRecords.map((s) => [
      s.project,
      s.safety_report_id,
      formatDateDDMMYYYY(s.incident_date),
      s.incident_description,
      s.affected_personnel_id,
      s.injury_severity,
      s.corrective_measure,
      s.safety_training_conducted ? "Yes" : "No",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 6,        // shrink font a bit
        cellPadding: 2,
        cellWidth: "auto",  // auto-adjust column width
        overflow: "linebreak",
      },
      headStyles: { fillColor: [114, 103, 239] },
      tableWidth: "auto",   // fit entire table to page
    });

    doc.save("all_safety_management_report.pdf");
  };
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Safety Management</Typography>
      
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
              {projects
  .filter(proj =>
    String(proj.id).toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map((proj, i) => (
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

            </Table>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => downloadPDF(safetyRecords)}
            >
              Download PDF
            </Button>
            <Typography variant="h6" gutterBottom>SAFETY MANAGEMENT DETAILS</Typography>
            <input
              type="text"
              placeholder="Search Safety Management"
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
      {safetyRecords.map((s, i) => (
        <TableRow key={i}>
          <TableCell>{s.project}</TableCell>
          <TableCell>{s.safety_report_id}</TableCell>
          <TableCell>{formatDateDDMMYYYY(s.incident_date)}</TableCell>
          <TableCell>{s.incident_description}</TableCell>
          <TableCell>{s.affected_personnel_id}</TableCell>
          <TableCell>{s.injury_severity}</TableCell>
          <TableCell>{s.corrective_measure}</TableCell>
          <TableCell>{s.safety_training_conducted ? "Yes" : "No"}</TableCell>

          <TableCell>
            <DisableIfCannot slug={MODULE_SLUG} action="can_update">
            <IconButton onClick={() => handleEdit(s)} color="warning">
              <Edit sx={{ color: "orange" }} />
            </IconButton>
            </DisableIfCannot>
            <ShowIfCan slug={MODULE_SLUG} action="can_delete">
            <IconButton onClick={() => handleDelete(s.safety_report_id)} color="error">
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


        <DialogTitle>
          {isEditMode ? "Edit Safety Management Details" : "Enter Safety Management Details"}
        </DialogTitle>
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
                    <label htmlFor="injurySeverity">Injury Severity</label>
                    <select
                      id="injurySeverity"
                      name="injurySeverity"
                      className="input"
                      value={formData.injurySeverity || ''}
                      onChange={handleChange}
                      
                    >
                      <option value="">Select Severity</option>
                      <option value="Minor">Minor</option>
                      <option value="moerate">Moderate</option>
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
          <DisableIfCannot slug={MODULE_SLUG} action={editingId ? 'can_update' : 'can_create'}>

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
            {editingId ? "Update" : "Submit"}
          </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SafetyManagement;