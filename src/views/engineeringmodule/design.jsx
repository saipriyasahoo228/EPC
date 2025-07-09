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
import {getProjectsAccept} from '../../allapi/engineering';
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';


const dummyProjects = [
  { id: "PRJ-2025-001" },
  { id: "PRJ-2025-002" },
  { id: "PRJ-2025-003" },
];

const DesignForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [designs, setDesigns] = useState([]);

  const [projects, setProjects] = useState([]);



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


  const handleOpenForm = (projectId) => {
    setSelectedProjectId(projectId);
    setFormData({ designId: `DES-2025-${designs.length + 1}` });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newDesign = { ...formData, projectId: selectedProjectId };
    setDesigns([...designs, newDesign]);
    setOpen(false);
  };

  const filteredDesigns = designs.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
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
            {filteredDesigns.map((d, i) => (
              <TableRow key={i}>
                <TableCell>{d.projectId}</TableCell>
                <TableCell>{d.designId}</TableCell>
                <TableCell>{d.designName}</TableCell>
                <TableCell>{d.designType}</TableCell>
                <TableCell>{d.versionNumber}</TableCell>
                <TableCell>{d.preparedBy}</TableCell>
                <TableCell>{d.reviewedBy}</TableCell>
                <TableCell>{d.approvalStatus}</TableCell>
                <TableCell>{d.approvalDate}</TableCell>
                <TableCell>{d.complianceStandard}</TableCell>
                <TableCell>{d.designConstraints}</TableCell>
                <TableCell>{d.estimatedBudget}</TableCell>
                <TableCell>{d.resourceRequirements}</TableCell>
                <TableCell>{d.designCompletionDate}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell>
                <IconButton color="warning">
                  <Edit sx={{ color: "orange" }} />
                </IconButton>
                <IconButton color="error">
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
          <Grid item xs={6}>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" className="input" value={formData.status || ''} onChange={handleChange}>
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </Grid>
        </Grid>
      </Grid>

      {/* Attachments */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Attachments</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Button variant="contained" component="label">
          Upload Blueprints/Documents
          <input type="file" hidden multiple />
        </Button>
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

export default DesignForm;
