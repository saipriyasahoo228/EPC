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
import { createHandover,getHandovers,updateHandover,deleteHandover } from "../../allapi/commision";



const HandoverProcess = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [handoverprocess, setHandoverProcess] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);



  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newHandoverNumber = handoverprocess.length + 1;
    const paddedNumber = newHandoverNumber.toString().padStart(3, '0');
    
    setFormData({ 
      handoverprocessID: `HND-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

//Fetch Project
   useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsAccept();
        setProjects(data); 
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

   // 🔹 Fetch handover  records
const fetchHandovers = async () => {
  try {
    const data = await getHandovers();   // API call
    setHandoverProcess(data);
  } catch (error) {
    console.error("❌ Error fetching handovers:", error);
  }
};

// 🔹 Load on mount
useEffect(() => {
  fetchHandovers();
}, []);

//HandleEdit Logic
const handleEdit = (handover) => {
  setFormData({
    handoverprocessID: handover.handover_id,
    handoverDate: handover.handover_date,
    receivingDepartment: handover.receiving_department,
    handoverDocID: handover.handover_document_id,
    componentList: handover.system_component_list,
    trainingprovided: handover.training_provided ? "true" : "false",
    document: handover.training_documentation,
    issues: handover.pending_issues,
    approvalStatus: handover.final_approval_status,
  });
  setEditingId(handover.handover_id);         // store handover_id for update
  setSelectedProjectId(handover.project_id);  // ✅ show project_id
  setIsEditMode(true);
  setOpen(true);
};


//HandleDelete Logic
  const handleDelete = async (handoverId) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete Handover ID: ${handoverId}?`
  );

  if (!confirmDelete) return; 

  try {
    await deleteHandover(handoverId);
    setHandoverProcess((prev) =>
      prev.filter((h) => h.handover_id !== handoverId)
    );
    alert(`✅ Handover ID ${handoverId} deleted successfully!`);
  } catch (error) {
    console.error("❌ Error deleting handover:", error);
    alert("⚠️ Failed to delete handover. Please try again.");
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

  try {
    // ✅ Validate required fields before submission
    if (!formData.handoverDocID || !formData.componentList || !formData.approvalStatus) {
      alert("⚠️ Please fill in all required fields!");
      return;
    }

    // ✅ Build payload mapping frontend → backend
    const payload = {
      project_id: selectedProjectId,
      handover_date: formData.handoverDate,
      receiving_department: formData.receivingDepartment,
      handover_document_id: formData.handoverDocID,
      system_component_list: formData.componentList,
      training_provided: formData.trainingprovided === "true",
      training_documentation: formData.document,
      pending_issues: formData.issues,
      final_approval_status: formData.approvalStatus,
    };

   if (isEditMode && editingId) {
  // 🔄 PUT update
  const updated = await updateHandover(editingId, payload);
  alert(`✏️ Handover updated successfully! Handover ID: ${updated.data.handover_id}`);
} else {
  // 🆕 POST create
  const created = await createHandover(payload);
  alert(`✅ Handover submitted successfully! Handover ID: ${created.data.handover_id}`);
}

    // 🔃 Refresh data
    fetchHandovers();

    // 🔄 Reset form
    setFormData({
      handoverprocessID: "",
      handoverDate: "",
      receivingDepartment: "",
      handoverDocID: "",
      componentList: "",
      trainingprovided: "",
      document: "",
      issues: "",
      approvalStatus: "",
    });

    setIsEditMode(false);
    setEditingId(null);
    handleClose();

  } catch (error) {
    console.error("❌ Submission error:", error);
    alert("⚠️ Submission failed! Please check your input.");
  }
};

const filteredHandover = handoverprocess.filter((h) =>
  Object.values(h).some(
    (val) =>
      val &&
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
  )
);

  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Handover Process</Typography>
      
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
          proj.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((proj, i) => (
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
            <Typography variant="h6" gutterBottom>HANDOVER PROCESS DETAILS</Typography>
            <input
              type="text"
              placeholder="Search Handover Process"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Receiving Department</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Handover Document ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>System/Component List</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Training Provided</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Training Documentation</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Pending Issues</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Final Approval</strong></TableCell>
                   
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
        {filteredHandover.map((h, i) => (
          <TableRow key={i}>
            <TableCell>{h.project_id}</TableCell>
            <TableCell>{h.handover_id}</TableCell>
            <TableCell>{h.handover_date}</TableCell>
            <TableCell>{h.receiving_department}</TableCell>
            <TableCell>{h.handover_document_id}</TableCell>
            <TableCell>{h.system_component_list}</TableCell>
            <TableCell>
  {h.training_provided === true ? "YES" : h.training_provided === false ? "NO" : "-"}
</TableCell>

            <TableCell>{h.training_documentation}</TableCell>
            <TableCell>{h.pending_issues}</TableCell>
            <TableCell>{h.final_approval_status}</TableCell>
            <TableCell>
              <IconButton onClick={() => handleEdit(h)} color="warning">
                <Edit sx={{ color: "orange" }} />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(h.handover_id)}
                color="error"
              >
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
          {isEditMode ? "Edit Handover Process" : "Enter Handover Process Details"}
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
                      // value={selectedProjectId} 
                       value={selectedProjectId || ""} 
                      disabled 
                      
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="handoverprocessID">Handover ID</label>
                    <input 
                      id="handoverprocessID" 
                      className="input" 
                      value={formData.handoverprocessID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Handover Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="handoverDate">Handover Date</label>
                    <input 
                      type="date"
                      id="handoverDate" 
                      name="handoverDate" 
                      className="input" 
                      value={formData.handoverDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="receivingDepartment">Recieving Department</label>
                    <input
                      
                      id="receivingDepartment" 
                      name="receivingDepartment" 
                      className="input" 
                      value={formData.receivingDepartment || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="handoverDocID">Handover DocumentID</label>
                    <input 
                      id="handoverDocID" 
                      name="handoverDocID" 
                      className="input" 
                      value={formData.handoverDocID || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="componentList">System/Component List</label>
                    <input 
                      id="componentList" 
                      name="componentList" 
                      className="input" 
                      value={formData.componentList || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="trainingprovided">Training Provided</label>
                    <select
                      id="trainingprovided"
                      name="trainingprovided"
                      className="input"
                      value={formData.trainingprovided || ''}
                      onChange={handleChange}
                      
                    >
                      <option value="">Select Status</option>
                      <option value="true">YES</option>
                      <option value="false">NO</option>
                    
                     
                    </select>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="document">Training Documentation</label>
                    <input 
                      id="document" 
                      name="document" 
                      className="input" 
                      value={formData.document || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                 
                 
                </Grid>
                <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Pending Issues & Final Status</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="issues">Pending Issues</label>
                    <input 
                      id="issues" 
                      name="issues" 
                      className="input" 
                      value={formData.issues || ''} 
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
                      <option value="">Select Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Conditional">Conditional</option>
                      <option value="Pending">Pending</option>
                     
                    </select>
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

export default HandoverProcess;