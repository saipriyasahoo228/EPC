

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
import { getProjectsAccept } from "../../allapi/engineering"; // adjust path as needed
import { getSystemIntegrations,createSystemIntegration,deleteSystemIntegration,updateSystemIntegration } from "../../allapi/commision";
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";




const SystemIntegration = () => {
  const MODULE_SLUG = 'commissioning';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  //const [formData, setFormData] = useState({});
  const [systemmanagement, setSystemManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [projects, setProjects] = useState([]);
    const [editingId, setEditingId] = useState(null);
   const [formData, setFormData] = useState({
    finalReportId: "",
    project: "",
    regulatory_body: "",
    inspection_date: "",
    inspector_name: "",
    compliance_checklist_id: "",
    compliance_status: "",
    non_compliance_issues: "",
    corrective_action: "",
  });

//Fetch all accepted project
useEffect(() => {
  const fetchProjects = async () => {
    try {
      const data = await getProjectsAccept();
      setProjects(data); // assuming API already returns an array
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    }
  };
  fetchProjects();
}, []);

//fetch all system integration
useEffect(() => {
  fetchReports();
}, []);

const fetchReports = async () => {
  try {
    const data = await getSystemIntegrations();
    setSystemManagement(data);
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
  }
};
const handleOpenForm = (projectId) => {
  setSelectedProjectId(projectId);
  const currentYear = new Date().getFullYear();
  const newSystemNumber = systemmanagement.length + 1;
  const paddedNumber = newSystemNumber.toString().padStart(4, '0');
  
  setFormData({ 
    systemmanagementID: `FIN-${currentYear}-${paddedNumber}`,
    projectId: projectId
  });
  
  setEditingId(null);   // ✅ reset properly
  setOpen(true);
};

  

  const handleDelete = async (finalReportId) => {
  if (!window.confirm("Are you sure you want to delete this report?")) return;

  try {
    await deleteSystemIntegration(finalReportId);
    await fetchReports(); // refresh list
    alert("Report deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting report:", error);
    alert("Failed to delete report. Please try again.");
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

 const handleEdit = (record) => {
  setFormData({
    systemmanagementID: record.final_report_id,
    projectId: record.project_id,
    testingInfo: record.summary_of_testing,
    defectRectification: record.defect_rectification_report,
    handoverConfirmation: record.handover_confirmation,
    complianceConfirmation: record.compliance_confirmation,
    documentLink: record.archival_document_link,
  });
  
  setEditingId(record.final_report_id);  // ✅ set for update
  setOpen(true);
};


//HandleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    project_id: selectedProjectId,
    summary_of_testing: formData.testingInfo || "",
    defect_rectification_report: formData.defectRectification || "",
    handover_confirmation: formData.handoverConfirmation || false,
    compliance_confirmation: formData.complianceConfirmation || false,
    archival_document_link: formData.documentLink || "",
  };

  try {
    if (editingId) {
      // 🔄 Update existing report
      const res = await updateSystemIntegration(editingId, payload);
      await fetchReports(); // refresh table
      setFormData({});
      setEditingId(null);
      setOpen(false);

      alert(
        `System Integration Report updated successfully!\nFinal Report ID: ${res.data.final_report_id}`
      );
    } else {
      // ➕ Create new report
      const res = await createSystemIntegration(payload);
      await fetchReports(); // refresh table
      setFormData({});
      setOpen(false);

      alert(
        `System Integration Report submitted successfully!\nFinal Report ID: ${res.data.final_report_id}`
      );
    }
  } catch (error) {
    console.error("❌ Error submitting system integration:", error);
    alert("Failed to submit System Integration Report. Please try again.");
  }
};


  const filteredSystem = systemmanagement.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>System Integration & Certification</Typography>
      
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
  {projects
    .filter(proj =>
      proj.project_id?.toLowerCase().includes(searchTerm.toLowerCase())
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
</TableBody>

            </Table>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>SYSTEM INTEGRATION & CERTIFICATION DETAILS</Typography>
            <input
              type="text"
              placeholder="Search System integration & certification"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Final Report ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing & Inspection</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Defect Rectification Report</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover Confirmation</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance Confirmation</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Archival Document Link</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
               <TableBody>
  {filteredSystem.map((t, i) => (
    <TableRow key={i}>
      <TableCell>{t.project_id}</TableCell>
      <TableCell>{t.final_report_id}</TableCell>
      <TableCell>{t.summary_of_testing}</TableCell>
      <TableCell>{t.defect_rectification_report}</TableCell>
      <TableCell>{t.handover_confirmation ? "✅" : "❌"}</TableCell>
      <TableCell>{t.compliance_confirmation ? "✅" : "❌"}</TableCell>
      <TableCell>
        {t.archival_document_link ? (
          <a href={t.archival_document_link} target="_blank" rel="noreferrer">
            View Doc
          </a>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

        <IconButton onClick={() => handleEdit(t)} color="warning">
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
        <IconButton onClick={() => handleDelete(t.final_report_id)} color="error">
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

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          {isEditMode ? "Edit System Integration Details" : "Enter System Integration Details"}
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
                    <label htmlFor="systemmanagementID">Final Report ID</label>
                    <input 
                      id="systemmanagementID" 
                      className="input" 
                      value={formData.systemmanagementID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Summary of Testing</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="testingInfo">Testing Info</label>
                    <input 
                      
                      id="testingInfo" 
                      name="testingInfo" 
                      className="input" 
                      value={formData.testingInfo || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="defectRectification">Defect Rectification</label>
                    <input
                      
                      id="defectRectification" 
                      name="defectRectification" 
                      className="input" 
                      value={formData.defectRectification || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
        

<Grid item xs={6}>
  <label>
    <input
      type="checkbox"
      name="handoverConfirmation"
      checked={formData.handoverConfirmation || false}
      onChange={(e) =>
        setFormData({ ...formData, handoverConfirmation: e.target.checked })
      }
    />
    &nbsp;Handover Confirmation
  </label>
</Grid>

<Grid item xs={6}>
  <label>
    <input
      type="checkbox"
      name="complianceConfirmation"
      checked={formData.complianceConfirmation || false}
      onChange={(e) =>
        setFormData({ ...formData, complianceConfirmation: e.target.checked })
      }
    />
    &nbsp;Compliance Confirmation
  </label>
</Grid>

                 
                  
                 
                 
                </Grid>
                <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Document Info..</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="documentLink">Document Link</label>
                    <input 
                      id="documentLink" 
                      name="documentLink" 
                      className="input" 
                      value={formData.documentLink || ''} 
                      onChange={handleChange} 
                     
                    />
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

export default SystemIntegration;