
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
import {createQualityControl,getQualityControls,updateQualityControl,deleteQualityControl} from "../../allapi/construction";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";

const QualityControl = () => {
  const MODULE_SLUG = 'construction';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [qualitycontrol, setQualityControl] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredQuality, setFilteredQuality] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
  qcId: "",
  projectId: "",
  inspectionDate: "",
  inspectionType: "",
  inspectorID: "",
  testResult: "",
  complianceStandards: "",
  defectIdentified: "",
  correctiveAction: "",
  approvalStatus: "",
  nextInspectionDate: "",
});



  //To fetch accepted projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsAccept();
        setProjects(data); // assuming API returns an array
      } catch (err) {
        console.error("Error fetching accepted projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // 🔹 Fetch function
const fetchQualityControls = async () => {
  try {
    const data = await getQualityControls();
    setQualityControl(data);
    console.log("✅ Quality Control records:", data);
  } catch (err) {
    console.error("❌ Failed to fetch quality control records:", err);
  }
};

// 🔹 useEffect for initial mount
useEffect(() => {
  fetchQualityControls();
}, []);

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newQualityNumber = qualitycontrol.length + 1;
    const paddedNumber = newQualityNumber.toString().padStart(4, '0');
    
    setFormData({ 
      qualitycontrolID: `QC-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

 // HandleEdit logic for QualityControl
// const handleEdit = (qc) => {
//   setFormData({
//     qualitycontrolID: qc.qc_id,
//     projectId: qc.project,
//     inspectionDate: qc.inspection_date,
//     inspectionType: qc.inspection_type,
//     inspectorID: qc.inspector_id,
//     testResult: qc.test_results,
//     complianceStandards: qc.compliance_standard,
//     defectIdentified: qc.defects_identified,
//     correctiveAction: qc.corrective_actions,
//     approvalStatus: qc.approval_status,
//     nextInspectionDate: qc.next_inspection_date,
//   });

//   setEditingId(qc.qc_id);   // ✅ store qc_id instead of true
//   setOpen(true);
// };

const handleEdit = (qc) => {
  setFormData({
    qualitycontrolID: qc.qc_id,
    projectId: qc.project,
    inspectionDate: qc.inspection_date,
    inspectionType: qc.inspection_type,
    inspectorID: qc.inspector_id,
    testResult: qc.test_results,
    complianceStandards: qc.compliance_standard,
    defectIdentified: qc.defects_identified,
    correctiveAction: qc.corrective_actions,
    approvalStatus: qc.approval_status,
    nextInspectionDate: qc.next_inspection_date,
  });

  setSelectedProjectId(qc.project);  // ✅ add this
  setEditingId(qc.qc_id);
  setOpen(true);
};



  const handleDelete = async (qc_id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this record?");
  if (!confirmDelete) return;

  try {
    await deleteQualityControl(qc_id);
    alert("✅ Record deleted successfully");

    // 🔄 Re-fetch records from API to stay in sync
    await fetchQualityControls();

  } catch (error) {
    console.error("❌ Failed to delete record:", error);
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



// ✅ Handle Submit Logic (Create or Update)
const handleSubmit = async () => {
  try {
    const payload = {
      project: selectedProjectId,          // project ID from your form
      inspection_date: formData.inspectionDate,
      inspection_type: formData.inspectionType,
      inspector_id: formData.inspectorID,
      test_results: formData.testResult,
      compliance_standard: formData.complianceStandards,
      defects_identified: formData.defectIdentified || "",
      corrective_actions: formData.correctiveAction || "",
      approval_status: formData.approvalStatus || "pending",
      next_inspection_date: formData.nextInspectionDate || null,
    };

    let data;
    if (editingId) {
      // ✅ Update existing record
      data = await updateQualityControl(editingId, payload);
      alert(`✏️ Quality Control updated!\nQC ID: ${data.qc_id}`);
    } else {
      // ✅ Create new record
      data = await createQualityControl(payload);
      alert(`✅ Quality Control saved!\nQC ID: ${data.qc_id}`);
    }

    // Reset form + close modal
    setFormData({});
    setEditingId(null);  // clear edit state
    handleClose();

    // Refresh table
    fetchQualityControls();
  } catch (err) {
    console.error("❌ Failed to submit Quality Control:", err);
    alert(`❌ Failed to submit. ${err.response?.data || err.message}`);
  }
};

  
// 🔹 Filter based on search
useEffect(() => {
  const filtered = qualitycontrol.filter((q) =>
    Object.values(q).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  setFilteredQuality(filtered);
}, [searchQuery, qualitycontrol]);
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Quality Control & Assurance</Typography>
      
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
          proj.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((proj, i) => (
          <TableRow key={i}>
            <TableCell>{proj.project_id}</TableCell>
            <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ShowIfCan slug={MODULE_SLUG} action="can_create">

              <IconButton
                onClick={() => handleOpenForm(proj.project_id)} // ✅ passing project id
                color="primary"
              >
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
            <Typography variant="h6" gutterBottom>QUALITY CONTROL & ASSUARANCE DETAILS</Typography>
            <input
              type="text"
              placeholder="Search Quality Control"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Quality Control ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspector ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Test Results</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance Standards</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Defects Identified</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Actions</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Approval Status</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Next Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuality.map((q, i) => (
                    <TableRow key={i}>
                      <TableCell>{q.project}</TableCell>
                      <TableCell>{q.qc_id}</TableCell>
                      <TableCell>{q.inspection_date}</TableCell>
                      <TableCell>{q.inspection_type}</TableCell>
                      <TableCell>{q.inspector_id}</TableCell>
                      <TableCell>{q.test_results}</TableCell>
                      <TableCell>{q.compliance_standard}</TableCell>
                      <TableCell>{q.defects_identified}</TableCell>
                      <TableCell>{q.corrective_actions}</TableCell>
                      <TableCell>{q.approval_status}</TableCell>
                      <TableCell>{q.next_inspection_date}</TableCell>
                      <TableCell>

                      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

                        <IconButton onClick={() => handleEdit(q)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        </DisableIfCannot>
                        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                        <IconButton onClick={() => handleDelete(q.qc_id)} color="error">
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
          {isEditMode ? "Edit Quality Control & Assurance Details" : "Enter Quality Control & Assurance Details"}
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
                    <label htmlFor="qualitycontrolID">Quality Assurance ID</label>
                    <input 
                      id="qualitycontrolID" 
                      className="input" 
                      value={formData.qualitycontrolID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Inspection Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="inspectionDate">Inspection Date</label>
                    <input 
                      type='date' 
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
                    <label htmlFor="testResult">Test Results</label>
                    <input 
                      id="testResult" 
                      name="testResult" 
                      className="input" 
                      value={formData.testResult || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Approval Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Compliance Standards & Approval Status</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="complianceStandards">Compliance Standards</label>
                    <input 
                      id="complianceStandards" 
                      name="complianceStandards" 
                      className="input" 
                      value={formData.complianceStandards || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="defectIdentified">Defects Identified</label>
                    <input 
                      id="defectIdentified" 
                      name="defectIdentified" 
                      className="input" 
                      value={formData.defectIdentified || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="correctiveAction">Corrective Actions</label>
                    <input 
                      id="correctiveAction" 
                      name="correctiveAction" 
                      className="input" 
                      value={formData.correctiveAction || ''} 
                      onChange={handleChange} 
                      
                    />
                  </Grid>
                  <Grid item xs={6}>
  <label htmlFor="approvalStatus">Approval Status</label>
  <select
    id="approvalStatus"
    name="approvalStatus"
    className="input"
    value={formData.approvalStatus || ""}
    onChange={handleChange}
  >
    <option value="">Select Status</option>
    <option value="pending">Pending</option>
    <option value="approved">Approved</option>
    <option value="rejected">Rejected</option>
    <option value="rework required">Rework Required</option>
  </select>
</Grid>

                  <Grid item xs={6}>
                    <label htmlFor="nextInspectionDate">Next Inspection Date</label>
                    <input 
                      type="date" 
                      id="nextInspectionDate" 
                      name="nextInspectionDate" 
                      className="input" 
                      value={formData.nextInspectionDate || ''} 
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
            {isEditMode ? "Update" : "Submit"}
          </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QualityControl;