

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
import { getProjectsAccept } from "../../allapi/engineering"; // adjust path
import { createTesting , getTestingRecords,updateTesting,deleteTesting} from "../../allapi/commision";
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";



const Testing = () => {
  const MODULE_SLUG = 'commissioning';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [testingmanagement, setTestingManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [projects, setProjects] = useState([]); 
  const [editingId, setEditingId] = useState(null);



   useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsAccept();
        setProjects(data); // API response
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
  fetchTestingRecords();
}, []);

const fetchTestingRecords = async () => {
  try {
    const data = await getTestingRecords();
    setTestingManagement(data);
  } catch (error) {
    console.error("❌ Error fetching testing records:", error);
  }
};

  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    const currentYear = new Date().getFullYear();
    const newTestingNumber = testingmanagement.length + 1;
    const paddedNumber = newTestingNumber.toString().padStart(3, '0');
    
    setFormData({ 
      testingmanagementID: `TST-${currentYear}-${paddedNumber}`,
      projectId: projectId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

 const handleEdit = (record) => {
  setFormData({
    testingmanagementID: record.testing_id,
    systemName: record.system_equipment_name,
    testingDate: record.testing_date,
    testingBy: record.test_conducted_by,
    testProcedure: record.test_procedure,
    performance: record.performance_parameters,
    defect: record.defects_identified,
    correction: record.correction_measures,
    retestDate: record.retest_date,
    testingStatus: record.testing_status,
  });
  setEditingId(record.testing_id); // store the testing_id for update
  setSelectedProjectId(record.project_id); // keep project selected
  setOpen(true);
};


const handleDelete = async (testingId) => {
  // Show confirmation with testing_id
  const confirmDelete = window.confirm(
    `Are you sure you want to delete the testing record with ID: ${testingId}?`
  );
  if (!confirmDelete) return;

  try {
    const res = await deleteTesting(testingId);

    // ✅ show success message including testing_id
    if (res.MSG) {
      alert(`✅ ${res.MSG}\nDeleted Testing ID: ${testingId}`);
    } else {
      alert(`✅ Record deleted successfully!\nDeleted Testing ID: ${testingId}`);
    }

    // remove the deleted record from state
    setTestingManagement((prev) =>
      prev.filter((t) => t.testing_id !== testingId)
    );
  } catch (err) {
    console.error("❌ Delete failed:", err);
    alert(
      `❌ Failed to delete Testing ID: ${testingId}\n${
        err.response?.data?.MSG || err.message || "Unknown error"
      }`
    );
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

//HandleSubmit

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      project_id: selectedProjectId,
      system_equipment_name: formData.systemName,
      testing_date: formData.testingDate,
      test_conducted_by: formData.testingBy,
      test_procedure: formData.testProcedure,
      performance_parameters: formData.performance,
      defects_identified: formData.defect || null,
      correction_measures: formData.correction || null,
      retest_date: formData.retestDate || null,
      testing_status: formData.testingStatus,
    };

    if (editingId) {
      // ✅ Update existing record
      const res = await updateTesting(editingId, payload);
      alert(`✅ Record updated successfully!\nUpdated Testing ID: ${editingId}`);
    } else {
      // ✅ Create new record
      const res = await createTesting(payload);
      alert(`✅ Record created successfully!\nGenerated Testing ID: ${res.Data.testing_id}`);
    }

    // refresh list after create/update
    fetchTestingRecords();

    // reset form and close dialog
    setFormData({});
    setEditingId(null);
    setOpen(false);
  } catch (err) {
    console.error("❌ Error saving testing record:", err);
    alert(
      `❌ Error: ${err.response?.data?.MSG || err.message || "Something went wrong"}`
    );
  }
};


const filteredTesting = testingmanagement.filter((t) =>
  Object.values(t).some(
    (val) =>
      val &&
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
  )
);

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Testing & Inspection</Typography>
      
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
            <Typography variant="h6" gutterBottom>TESTING MANAGEMENT DETAILS</Typography>
            <input
              type="text"
              placeholder="Search Testing Management"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Equipment Name</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing ConductedBy</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Test Procedure</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Performane Parameters</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Defects Identified</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Measures</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Retest Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Testing Date</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {filteredTesting.map((t, i) => (
    <TableRow key={i}>
      <TableCell>{t.project_id}</TableCell>
      <TableCell>{t.testing_id}</TableCell>
      <TableCell>{t.system_equipment_name}</TableCell>
      <TableCell>{t.testing_date}</TableCell>
      <TableCell>{t.test_conducted_by}</TableCell>
      <TableCell>{t.test_procedure}</TableCell>
      <TableCell>{t.performance_parameters}</TableCell>
      <TableCell>{t.defects_identified}</TableCell>
      <TableCell>{t.correction_measures}</TableCell>
      <TableCell>{t.retest_date || "-"}</TableCell>
      <TableCell>{t.testing_status}</TableCell>
      <TableCell>
      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

        <IconButton onClick={() => handleEdit(t)} color="warning">
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
        {/* 👇 Here use `t.id` for delete */}
        <IconButton onClick={() => handleDelete(t.testing_id)} color="error">
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
          {isEditMode ? "Edit Testing Management Details" : "Enter Testing Management Details"}
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
                    <label htmlFor="testingmanagementID">Testing ID</label>
                    <input 
                      id="testingmanagementID" 
                      className="input" 
                      value={formData.testingmanagementID || ''} 
                      disabled 
                      
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Design Info */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Testing & Equipment Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="systemName">System/Equipment Name</label>
                    <input 
                      
                      id="systemName" 
                      name="systemName" 
                      className="input" 
                      value={formData.systemName || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <label htmlFor="testingDate">Testing Date</label>
                    <input
                      type="date"
                      id="testingDate" 
                      name="testingDate" 
                      className="input" 
                      value={formData.testingDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="testingBy">Testing CoductedBy</label>
                    <input 
                      id="testingBy" 
                      name="testingBy" 
                      className="input" 
                      value={formData.testingBy || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="testProcedure">Test Procedure</label>
                    <input 
                      id="testProcedure" 
                      name="testProcedure" 
                      className="input" 
                      value={formData.testProcedure || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="performance">Performance Parameters</label>
                    <input 
                      id="performance" 
                      name="performance" 
                      className="input" 
                      value={formData.performance || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="defect">Defects Identified</label>
                    <input 
                      id="defect" 
                      name="defect" 
                      className="input" 
                      value={formData.defect || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                 
                 
                </Grid>
                <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Correction Measure & Testing Status</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="correction">Correction Measure</label>
                    <input 
                      id="correction" 
                      name="correction" 
                      className="input" 
                      value={formData.correction || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="retestDate">Retest Date</label>
                    <input 
                      type="date"
                      id="retestDate" 
                      name="retestDate" 
                      className="input" 
                      value={formData.retestDate || ''} 
                      onChange={handleChange} 
                     
                    />
                  </Grid>
                   <Grid item xs={6}>
                    <label htmlFor="testingStatus">Testing Status</label>
                    <select
  id="testingStatus"
  name="testingStatus"
  className="input"
  value={formData.testingStatus || ''}
  onChange={handleChange}
>
  <option value="">Select Status</option>
  <option value="Passed">Passed</option>
  <option value="Failed">Failed</option>
  <option value="Retest Required">Retest Required</option>
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

export default Testing;