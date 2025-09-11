

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
import { createCompliance, updateCompliance, getComplianceList,deleteCompliance} from "../../allapi/commision";
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";


const ComplianceForm = () => {
  const MODULE_SLUG = 'commissioning';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [complianceList, setComplianceList] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);


  // ✅ Fetch accepted projects on mount
useEffect(() => {
  const fetchProjects = async () => {
    try {
      const data = await getProjectsAccept();
      setProjects(data); // store API projects
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
    }
  };
  fetchProjects();
}, []);

 // 🔹 Fetch compliance list on load
  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      const data = await getComplianceList();
      setComplianceList(data);
    } catch (error) {
      console.error("❌ Error fetching compliance:", error);
    }
  };

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newComplianceNumber = complianceList.length + 1;
    const paddedNumber = newComplianceNumber.toString().padStart(4, '0');
    
    setFormData({ 
      complianceprocessID: `CMP-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

 const handleEdit = (record) => {
  setFormData({
    complianceprocessID: record.compliance_id,
    regulatoryBody: record.regulatory_body,
    inspectionDate: record.inspection_date,
    inspectorName: record.inspector_name,
    checkListID: record.compliance_checklist_id,
    complianceStatus: record.compliance_status,
    issues: record.non_compliance_issues,
    actionplan: record.corrective_action_plan,
    certificationID: record.certification_id,
    expiryDate: record.certification_expiry_date,
  });
  setSelectedProjectId(record.project);   // project_id
  setEditingId(record.compliance_id);     // store ID for PATCH
  setIsEditMode(true);
  setOpen(true);
};


  const handleDelete = async (complianceId) => {
  const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this compliance?");
  if (!confirmDelete) return;

  try {
    await deleteCompliance(complianceId);
    alert(`🗑️ Compliance ${complianceId} deleted successfully`);
    fetchCompliance(); // ✅ Refresh the list after delete
  } catch (error) {
    console.error("❌ Error deleting compliance:", error);
    alert("Error while deleting compliance. Please try again.");
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


//HandleSubmit Logic
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    project: selectedProjectId,
    regulatory_body: formData.regulatoryBody || "",
    inspection_date: formData.inspectionDate || "",
    inspector_name: formData.inspectorName || "",
    compliance_checklist_id: formData.checkListID || "",
    compliance_status: formData.complianceStatus || "",
    non_compliance_issues: formData.issues || "",
    corrective_action_plan: formData.actionplan || "",
    certification_id: formData.certificationID || "",
    certification_expiry_date: formData.expiryDate || "",
  };

  try {
    let response;

    if (isEditMode && editingId) {
      // ✅ PUT existing compliance
      response = await updateCompliance(editingId, payload);
      alert(`✅ Compliance updated successfully. Compliance ID: ${response.data.compliance_id}`);
    } else {
      // ✅ POST new compliance
      response = await createCompliance(payload);
      alert(`✅ Compliance submitted successfully. Compliance ID: ${response.data.compliance_id}`);
    }

    // Refresh compliance list
    fetchCompliance();

    // Reset after success
    setFormData({
      complianceprocessID: "",
      regulatoryBody: "",
      inspectionDate: "",
      inspectorName: "",
      checkListID: "",
      complianceStatus: "",
      issues: "",
      actionplan: "",
      certificationID: "",
      expiryDate: "",
    });
    setSelectedProjectId("");
    setEditingId(null);
    setIsEditMode(false);
    handleClose();

  } catch (error) {
    console.error("❌ Error saving compliance:", error);

    // ✅ Show backend validation error if available
    if (error.response && error.response.data) {
      const backendErrors = error.response.data;

      // If backend sends an object of validation errors
      if (typeof backendErrors === "object") {
        let errorMessages = [];
        for (let key in backendErrors) {
          errorMessages.push(`${key}: ${backendErrors[key]}`);
        }
        alert("❌ Validation Errors:\n" + errorMessages.join("\n"));
      } else {
        // If backend sends a single error string
        alert(`❌ Error: ${backendErrors}`);
      }
    } else {
      alert("❌ Error while saving compliance. Please try again.");
    }
  }
};


  const filteredCompliance = complianceList.filter((c) =>
    Object.values(c).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Compliance & Certification</Typography>
      
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
      proj.project_id.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Typography variant="h6" gutterBottom>COMPLIANCE & CERTIFICATION DETAILS</Typography>
            <input
              type="text"
              placeholder="Search Compliance & Certification"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance Process ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Regulatory Body</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspector Name</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance Checklist ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance Status</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Non-Compliance Issues</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Action Plan</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Certification ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Certification Expiry Date</strong></TableCell>
                   
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {filteredCompliance.map((c, i) => (
    <TableRow key={i}>
      <TableCell>{c.project}</TableCell>
      <TableCell>{c.compliance_id}</TableCell>
      <TableCell>{c.regulatory_body}</TableCell>
      <TableCell>{c.inspection_date}</TableCell>
      <TableCell>{c.inspector_name}</TableCell>
      <TableCell>{c.compliance_checklist_id}</TableCell>
      <TableCell>{c.compliance_status}</TableCell>
      <TableCell>{c.non_compliance_issues}</TableCell>
      <TableCell>{c.corrective_action_plan}</TableCell>
      <TableCell>{c.certification_id}</TableCell>
      <TableCell>{c.certification_expiry_date}</TableCell>

      <TableCell>
        <DisableIfCannot slug={MODULE_SLUG} action="can_update">
        <IconButton onClick={() => handleEdit(c)} color="warning">
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
        <IconButton onClick={() => handleDelete(c.compliance_id)} color="error">
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
          {isEditMode ? "Edit Compliance Details" : "Enter Compliance Details"}
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
                    <label htmlFor="complianceprocessID">Compliance ID</label>
                    <input 
                      id="complianceprocessID" 
                      className="input" 
                      value={formData.complianceprocessID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Compliance & Certification Infor..</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="regulatoryBody">Regulatory Body</label>
                    <input 
                      
                      id="regulatoryBody" 
                      name="regulatoryBody" 
                      className="input" 
                      value={formData.regulatoryBody || ''} 
                      onChange={handleChange} 
                     
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
                    <label htmlFor="inspectorName">Inspector Name</label>
                    <input 
                      id="inspectorName" 
                      name="inspectorName" 
                      className="input" 
                      value={formData.inspectorName || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="checkListID">Compliance CheckList ID</label>
                    <input 
                      id="checkListID" 
                      name="checkListID" 
                      className="input" 
                      value={formData.checkListID || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="complianceStatus">Compliance Status</label>
                    <select
                      id="complianceStatus"
                      name="complianceStatus"
                      className="input"
                      value={formData.complianceStatus || ''}
                      onChange={handleChange}
                      
                    >
                      <option value="">Select Status</option>
                      <option value="Compliant">Compliant</option>
                      <option value="Pending">Pending</option>
                      
                     
                    </select>
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="issues">Non-Compliant Issues</label>
                    <input 
                      id="issues" 
                      name="issues" 
                      className="input" 
                      value={formData.issues || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="actionplan">Corrective Action Plan</label>
                    <input 
                      id="actionplan" 
                      name="actionplan" 
                      className="input" 
                      value={formData.actionplan || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                 
                 
                </Grid>
                <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Certification ID & Expiry Date</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="certificationID">Certification ID</label>
                    <input 
                      id="certificationID" 
                      name="certificationID" 
                      className="input" 
                      value={formData.certificationID || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="expiryDate">Certification Expiry Date</label>
                    <input 
                      type="date"
                      id="expiryDate" 
                      name="expiryDate" 
                      className="input" 
                      value={formData.expiryDate || ''} 
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
          <DisableIfCannot slug={MODULE_SLUG} action={isEditMode && editingId ? 'can_update' : 'can_create'}>

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
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComplianceForm;