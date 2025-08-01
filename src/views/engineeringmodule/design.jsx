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
import {getProjectsAccept, createDesignPlan, getDesignPlans,updateDesignPlan, deleteDesignPlan } from '../../allapi/engineering';
import { AddCircle, Edit, Delete , ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';




const DesignForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [designs, setDesigns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null); // null means create mode
  const [mode, setMode] = useState('create'); // or 'edit'
  const rowsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [designsPage, setDesignsPage] = useState(1);
  const designsRowsPerPage = 5;





  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const data = await getProjectsAccept();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  fetchProjects();
}, []);

//Fetch Designs
// Define fetchDesigns outside useEffect
const fetchDesigns = async () => {
  try {
    const data = await getDesignPlans();
    setDesigns(data);
  } catch (error) {
    console.error('Error fetching design plans:', error);
  }
};

// Run once when component mounts
useEffect(() => {
  fetchDesigns();
}, []);


//  Handle Submit Logic

const handleSubmit = async () => {
  const data = new FormData();

  // Required: Numeric PK for ForeignKey
  data.append('project', selectedProjectId);

  // Design Info
  data.append('design_name', formData.designName);
  data.append('design_type', formData.designType);
  data.append('prepared_by', formData.preparedBy);
  data.append('version_number', formData.versionNumber);

  // Optional fields
  data.append('reviewed_by', formData.reviewedBy || '');
  data.append('approval_status', formData.approvalStatus || 'Pending');
  data.append('approval_date', formData.approvalDate || '');

  // Budget / Requirements
  data.append('compliance_standard', formData.complianceStandard);
  data.append('design_constraints', formData.designConstraints);
  data.append('estimated_budget', formData.estimatedBudget);
  data.append('resource_requirements', formData.resourceRequirements);

  // Completion / Status
  data.append('design_completion_date', formData.designCompletionDate);
  data.append('status', formData.status);

  // File upload
  if (formData.blueprint) {
    data.append('blueprint', formData.blueprint);
  } else if (!editingId) {
    alert("Please upload a blueprint file.");
    return;
  }

  try {
    let response;

    if (editingId) {
      // Update mode
      data.append('design_id', formData.designId);
      response = await updateDesignPlan(editingId, data);
      alert('✅ Design updated successfully');
    } else {
      // Create mode
      response = await createDesignPlan(data);
      alert('✅ Design submitted successfully');
    }

    await fetchDesigns(); // Refresh list

    // ✅ Reset form state
    setFormData({
      designName: '',
      designType: '',
      preparedBy: '',
      versionNumber: '',
      reviewedBy: '',
      approvalStatus: '',
      approvalDate: '',
      complianceStandard: '',
      designConstraints: '',
      estimatedBudget: '',
      resourceRequirements: '',
      designCompletionDate: '',
      status: '',
      blueprint: null,
      projectCode: '',
      designId: '',
    });

    setSelectedProjectId(null);
    setEditingId(null);
    setOpen(false);

  } catch (err) {
    // ✅ Show backend error response
    if (err.response) {
      console.error('Backend Error:', err.response.data);

      // Convert object errors to readable string
      const errorMessage = typeof err.response.data === 'object'
        ? Object.entries(err.response.data)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n')
        : err.response.data;

      alert(`❌ Submission failed:\n${errorMessage}`);
    } else {
      console.error('Network/Other Error:', err.message);
      alert(`❌ Submission failed: ${err.message}`);
    }
  }
};


const handleEdit = (design) => {
  setMode('edit'); // Ensure mode is set to 'edit'
  setEditingId(design.design_id); // Using custom ID like DES-2025-0003
  setSelectedProjectId(design.project); // ForeignKey project

  setFormData({
    designId: design.design_id,
    designName: design.design_name,
    designType: design.design_type,
    versionNumber: design.version_number,
    preparedBy: design.prepared_by,
    reviewedBy: design.reviewed_by,
    approvalStatus: design.approval_status,
    approvalDate: design.approval_date,
    complianceStandard: design.compliance_standard,
    designConstraints: design.design_constraints,
    estimatedBudget: design.estimated_budget,
    resourceRequirements: design.resource_requirements,
    designCompletionDate: design.design_completion_date,
    status: design.status,
    blueprint: null, // File input can't be pre-filled
    projectCode: '',
  });

  setOpen(true); // Open the dialog/form
};



//Delete Logic
const handleDelete = async (designId) => {
  if (!window.confirm(`Are you sure you want to delete ${designId}?`)) return;

  try {
    await deleteDesignPlan(designId); // should be like DES-2025-0001
    alert(`Design ${designId} deleted successfully ✅`);
    await fetchDesigns(); // Refresh list
  } catch (error) {
    console.error('Delete failed:', error.response?.data || error.message);
    alert('❌ Failed to delete the design.');
  }
};

//Handle Open Form

const handleOpenForm = (projectId) => {
  setMode('create'); // ✅ Explicitly set to create mode
  setSelectedProjectId(projectId);

  const currentYear = new Date().getFullYear(); // ✅ Get current year dynamically
  const paddedId = String(designs.length + 1).padStart(4, '0');

  setFormData({
    designId: `DES-${currentYear}-${paddedId}`,  // ✅ Uses system year
    designName: '',
    designType: '',
    preparedBy: '',
    versionNumber: '',
    reviewedBy: '',
    approvalStatus: 'Pending',
    approvalDate: '',
    complianceStandard: '',
    designConstraints: '',
    estimatedBudget: '',
    resourceRequirements: '',
    designCompletionDate: '',
    status: '',
    blueprint: null,
    projectCode: '',
  });

  setEditingId(null); // 🧼 Clear any previous ID
  setOpen(true);
};



  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const filteredDesigns = designs.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  // Total pages for designs
const designsTotalPages = Math.ceil(filteredDesigns.length / designsRowsPerPage);

// Paginated designs
const paginatedDesigns = filteredDesigns.slice(
  (designsPage - 1) * designsRowsPerPage,
  designsPage * designsRowsPerPage
);


  return (
    <>
      <Typography variant="h5"  gutterBottom sx={{ mt: 5 }} >Design Management</Typography>
      
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
        .filter(proj => proj.project_id.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
        .map((proj, i) => (
          <TableRow key={i}>
            <TableCell>{proj.project_id}</TableCell>
            <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleOpenForm(proj.project_id)} color="primary">
                <AddCircle sx={{ color: "#7267ef" }} />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>

 {/* Pagination Icons */}
<Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} pr={2}>
  <IconButton
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(prev => prev - 1)}
  >
    <ArrowBackIos />
  </IconButton>

  <Typography variant="body2" sx={{ mx: 2 }}>
    Page {currentPage} of {Math.ceil(projects.filter(proj => proj.project_id.toLowerCase().includes(searchTerm.toLowerCase())).length / rowsPerPage)}
  </Typography>

  <IconButton
    disabled={
      currentPage >=
      Math.ceil(projects.filter(proj => proj.project_id.toLowerCase().includes(searchTerm.toLowerCase())).length / rowsPerPage)
    }
    onClick={() => setCurrentPage(prev => prev + 1)}
  >
    <ArrowForwardIos />
  </IconButton>
</Box>

</Paper>
  </Grid>
</Grid>
      <Grid container spacing={2}>
  <Grid item xs={12}>
    <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
      <Typography variant="h6" gutterBottom>SUBMITTED DESIGNS</Typography>
      <input
        type="text"
        placeholder="Search Designs"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />

      <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Design ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Name</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Type</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Version</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Prepared By</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Reviewed By</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Approval Status</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Approval Date</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Compliance</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Constraints</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Budget</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Resources</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Completion Date</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Status</strong></TableCell>
              <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {paginatedDesigns.map((d, i) => (
    <TableRow key={i}>
      <TableCell>{d.project}</TableCell>
      <TableCell>{d.design_id}</TableCell>
      <TableCell>{d.design_name}</TableCell>
      <TableCell>{d.design_type}</TableCell>
      <TableCell>{d.version_number}</TableCell>
      <TableCell>{d.prepared_by}</TableCell>
      <TableCell>{d.reviewed_by}</TableCell>
      <TableCell>{d.approval_status}</TableCell>
      <TableCell>{d.approval_date}</TableCell>
      <TableCell>{d.compliance_standard}</TableCell>
      <TableCell>{d.design_constraints}</TableCell>
      <TableCell>{d.estimated_budget}</TableCell>
      <TableCell>{d.resource_requirements}</TableCell>
      <TableCell>{d.design_completion_date}</TableCell>
      <TableCell>{d.status}</TableCell>
      <TableCell>
        <IconButton color="warning" onClick={() => handleEdit(d)}>
  <Edit sx={{ color: "orange" }} />
</IconButton>


      <IconButton color="error" onClick={() => handleDelete(d.design_id)}>
  <Delete sx={{ color: "red" }} />
</IconButton>

      </TableCell>
    </TableRow>
  ))}
</TableBody>

        </Table>
      </TableContainer>
     <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} pr={2}>
  <IconButton
    disabled={designsPage === 1}
    onClick={() => setDesignsPage(prev => prev - 1)}
  >
    <ArrowBackIos />
  </IconButton>

  <Typography variant="body2" sx={{ mx: 2 }}>
    Page {designsPage} of {designsTotalPages || 1}
  </Typography>

  <IconButton
    disabled={designsPage >= designsTotalPages}
    onClick={() => setDesignsPage(prev => prev + 1)}
  >
    <ArrowForwardIos />
  </IconButton>
</Box>

    </Paper>
  </Grid>
</Grid>


      <Dialog open={open} onClose={handleClose} fullWidth>
  <DialogTitle>Enter Design Details</DialogTitle>
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
            <label htmlFor="designId">Design ID</label>
            <input id="designId" className="input" value={formData.designId || ''} disabled />
          </Grid>
        </Grid>
      </Grid>

      {/* Design Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Design Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="designName">Design Name</label>
            <input id="designName" name="designName" className="input" value={formData.designName || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="designType">Design Type</label>
            <select id="designType" name="designType" className="input" value={formData.designType || ''} onChange={handleChange}>
              <option value="">Select Type</option>
              {['Architectural', 'Structural', 'Electrical', 'Mechanical', 'Civil'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="versionNumber">Version Number</label>
            <input id="versionNumber" name="versionNumber" className="input" value={formData.versionNumber || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Approval Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Approval Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="preparedBy">Prepared By</label>
            <input id="preparedBy" name="preparedBy" className="input" value={formData.preparedBy || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="reviewedBy">Reviewed By</label>
            <input id="reviewedBy" name="reviewedBy" className="input" value={formData.reviewedBy || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="approvalStatus">Approval Status</label>
            <select id="approvalStatus" name="approvalStatus" className="input" value={formData.approvalStatus || ''} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Under Review">Under Review</option>
            </select>
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="approvalDate">Approval Date</label>
            <input type="date" id="approvalDate" name="approvalDate" className="input" value={formData.approvalDate || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Budget/Requirements */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Budget and Requirements</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="complianceStandard">Compliance Standard</label>
            <input id="complianceStandard" name="complianceStandard" className="input" value={formData.complianceStandard || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="designConstraints">Design Constraints</label>
            <textarea id="designConstraints" name="designConstraints" className="input" rows={3} value={formData.designConstraints || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="estimatedBudget">Estimated Budget</label>
            <input type="number" id="estimatedBudget" name="estimatedBudget" className="input" value={formData.estimatedBudget || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <label htmlFor="resourceRequirements">Resource Requirements</label>
            <textarea id="resourceRequirements" name="resourceRequirements" className="input" rows={3} value={formData.resourceRequirements || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Status & Completion */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Status and Actions</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="designCompletionDate">Design Completion Date</label>
            <input type="date" id="designCompletionDate" name="designCompletionDate" className="input" value={formData.designCompletionDate || ''} onChange={handleChange} />
          </Grid>
          
          <select
  id="status"
  name="status"
  className="input"
  value={formData.status || ''}
  onChange={handleChange}
  required
>
  <option value="">Select Status</option>
  <option value="Draft">Draft</option>
  <option value="In Progress">In Progress</option>
  <option value="Completed">Completed</option>
</select>

        </Grid>
      </Grid>

      {/* Attachments */}
     
      <Button variant="contained" component="label">
  Upload Blueprints/Documents
  <input
    type="file"
    hidden
    onChange={(e) =>
      setFormData({ ...formData, blueprint: e.target.files[0] })
    }
  />
</Button>


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
  {mode === 'edit' ? 'Update Design' : 'Submit Design'}

  
</Button>


  </DialogActions>
</Dialog>

    </>
  );
};

export default DesignForm;
