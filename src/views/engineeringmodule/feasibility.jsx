
// DesignForm.jsx
import React, { useState } from "react";
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

const dummyProjects = [
  { id: "PRJ-2025-001" },
  { id: "PRJ-2025-002" },
  { id: "PRJ-2025-003" },
];

const FeasibilityForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [feasibilityStudies, setFeasibilityStudies] = useState([]);

  const handleOpenForm = (projectId) => {
    const currentYear = new Date().getFullYear(); // get system year
    setSelectedProjectId(projectId);
    setFormData({ 
      projectId,
      feasibilityStudyId: `FST-${currentYear}-${feasibilityStudies.length + 1}`,
    }); // dynamic year
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    const newStudy = { ...formData, projectId: selectedProjectId };
    setFeasibilityStudies([...feasibilityStudies, newStudy]);
    setOpen(false);
  };

  const handleEdit = (study) => {
    // Prepopulate the form with study data
    setFormData({
      ...study,
      projectId: study.projectId, // Maintain projectId for edit
      feasibilityStudyId: study.feasibilityStudyId, // Keep the same ID during edit
    });
    setOpen(true); // Open the dialog to edit
  };
  
  const handleDelete = (feasibilityStudyId) => {
    // Delete the selected study from the state
    const updatedStudies = feasibilityStudies.filter(study => study.feasibilityStudyId !== feasibilityStudyId);
    setFeasibilityStudies(updatedStudies);
  };
  
  const filteredFeasibility =feasibilityStudies.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }} >Feasibility Study Management</Typography>
      
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>PROJECT RECORDS</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end',color:'#660000'}}><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyProjects.map((proj, i) => (
                  <TableRow key={i}>
                    <TableCell>{proj.id}</TableCell>
                    <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => handleOpenForm(proj.id)} color="primary">
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
            <Typography variant="h6" gutterBottom>SUBMITTED FEASIBILITY STUDIES</Typography>
            <input
              type="text"
              placeholder="Search Feasibility Studies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Feasibility Study ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Study Title</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Study Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Prepared By</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Risk Assessment</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Regulatory Compliance</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Projected ROI (%)</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Est. Completion Time</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Recommendations</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Approval Status</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Approval Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Status</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredFeasibility.map((study, index) => (
                    <TableRow key={index}>
                      <TableCell>{study.projectId}</TableCell>
                      <TableCell>{study.feasibilityStudyId}</TableCell>
                      <TableCell>{study.studyTitle}</TableCell>
                      <TableCell>{study.studyType}</TableCell>
                      <TableCell>{study.preparedBy}</TableCell>
                      <TableCell>{study.riskAssessment}</TableCell>
                      <TableCell>{study.regulatoryCompliance}</TableCell>
                      <TableCell>{study.projectedROI}</TableCell>
                      <TableCell>{study.estimatedCompletionTime}</TableCell>
                      <TableCell>{study.recommendations}</TableCell>
                      <TableCell>{study.approvalStatus}</TableCell>
                      <TableCell>{study.approvalDate}</TableCell>
                      <TableCell>{study.status}</TableCell>
                      <TableCell>
  {/* Edit Button */}
  <IconButton color="warning" onClick={() => handleEdit(study)}>
    <Edit sx={{ color: "orange" }} />
  </IconButton>
  
  {/* Delete Button */}
  <IconButton color="error" onClick={() => handleDelete(study.feasibilityStudyId)}>
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
        <DialogTitle>Enter Feasibility Study Details</DialogTitle>
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

              {/* Feasibility Study Information */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Feasibility Study Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="projectId">Project ID</label>
                    <input id="projectId" name="projectId" className="input" value={formData.projectId || ''} disabled />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="feasibilityStudyId">Feasibility Study ID</label>
                    <input id="feasibilityStudyId" name="feasibilityStudyId" className="input" value={formData.feasibilityStudyId || ''} disabled />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="studyTitle">Study Title</label>
                    <input id="studyTitle" name="studyTitle" className="input" value={formData.studyTitle || ''} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="preparedBy">Prepared By</label>
                    <input id="preparedBy" name="preparedBy" className="input" value={formData.preparedBy || ''} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="studyType">Study Type</label>
                    <select id="studyType" name="studyType" className="input" value={formData.studyType || ''} onChange={handleChange}>
                      <option value="">Select Type</option>
                      {['Technical', 'Financial', 'Environmental', 'Operational'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </Grid>
                </Grid>
              </Grid>

              {/* Upload Reports */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Reports and Documents</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <input type="file" className="input" />
              </Grid>

              
{/* //         Risk and Compliance */}
         <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Risk and Compliance</h3>
           <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
           <Grid container spacing={2}>
             <Grid item xs={6}>
               <label htmlFor="riskAssessment">Risk Assessment</label>
               <textarea id="riskAssessment" name="riskAssessment" className="input" rows={3} value={formData.riskAssessment || ''} onChange={handleChange} />
             </Grid>
             <Grid item xs={6}>
               <label htmlFor="regulatoryCompliance">Regulatory Compliance</label>               <input id="regulatoryCompliance" name="regulatoryCompliance" className="input" value={formData.regulatoryCompliance || ''} onChange={handleChange} />
             </Grid>
           </Grid>
         </Grid>

         {/* Financial Info */}
        <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Financial Information</h3>           
           <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
           <Grid container spacing={2}>
             <Grid item xs={6}>
               <label htmlFor="projectedROI">Projected ROI (%)</label>
              <input type="number" id="projectedROI" name="projectedROI" className="input" value={formData.projectedROI || ''} onChange={handleChange} />
            </Grid>
             <Grid item xs={6}>
               <label htmlFor="estimatedCompletionTime">Estimated Completion Time (Months/Years)</label>
               <input type="number" id="estimatedCompletionTime" name="estimatedCompletionTime" className="input" value={formData.estimatedCompletionTime || ''} onChange={handleChange} />
            </Grid>
           </Grid>
         </Grid>

         {/* Recommendations */}
         <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Recommendations</h3>
           <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
           <Grid container spacing={2}>
             <Grid item xs={12}>
               <label htmlFor="recommendations">Recommendations</label>
               <textarea id="recommendations" name="recommendations" className="input" rows={3} value={formData.recommendations || ''} onChange={handleChange} />
             </Grid>
           </Grid>
         </Grid>

         {/* Approval Info */}
         <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Approval Information</h3>
           <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
           <Grid container spacing={2}>
             <Grid item xs={6}>
               <label htmlFor="approvalStatus">Approval Status</label>
               <select id="approvalStatus" name="approvalStatus" className="input" value={formData.approvalStatus || ''} onChange={handleChange}>
                 <option value="Pending">Pending</option>
                 <option value="Approved">Approved</option>
                 <option value="Rejected">Rejected</option>
               </select>
             </Grid>
             <Grid item xs={6}>
               <label htmlFor="approvalDate">Approval Date</label>               
               <input type="date" id="approvalDate" name="approvalDate" className="input" value={formData.approvalDate || ''} onChange={handleChange} />
             </Grid>
           </Grid>
         </Grid>

         {/* Study Status */}
         <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Study Status</h3>
           <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
           <Grid container spacing={2}>
             <Grid item xs={6}>
               <label htmlFor="status">Status</label>
               <select id="status" name="status" className="input" value={formData.status || ''} onChange={handleChange}>
                 <option value="Draft">Draft</option>
                 <option value="Under Review">Under Review</option>
                 <option value="Completed">Completed</option>
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

export default FeasibilityForm;
