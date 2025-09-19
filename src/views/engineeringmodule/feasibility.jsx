
// DesignForm.jsx
import React, { useState,useEffect, useRef} from "react";
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
import { AddCircle, Edit, Delete ,ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import {getProjectsAccept, createFeasibilityStudy, fetchFeasibilityStudies, patchFeasibilityStudy, deleteFeasibilityStudy} from '../../allapi/engineering';
import { DisableIfCannot, ShowIfCan } from '../../components/auth/RequirePermission';
import { Maximize2, Minimize2 } from "lucide-react";


const FeasibilityForm = () => {
  const MODULE_SLUG = 'engineering';
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [feasibilityStudies, setFeasibilityStudies] = useState([]);
  const [mode, setMode] = useState('create'); 
  const rowsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);
  const [feasibilityPage, setFeasibilityPage] = useState(1);
  const feasibilityRowsPerPage = 5;
  const [formData, setFormData] = useState({
  feasibilityStudyId: null,   
  studyTitle: "",
  preparedBy: "",
  studyType: "",
  reports: null,
  riskAssessment: "",
  regulatoryCompliance: "",
  projectedROI: "",
  estimatedCompletionTime: "",
  recommendations: "",
  approvalStatus: "Pending",   // default
  approvalDate: "",
  status: "Draft",             // default
});



  
  // ✅ Filtered projects based on search
  const filteredProjects = projects.filter((proj) =>
    proj.project_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );


  //Fetch all accepted projects
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

  //Get feasibility studies report
 
const loadFeasibilityStudies = async () => {
  try {
    const data = await fetchFeasibilityStudies();
    setFeasibilityStudies(data);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
};

useEffect(() => {
  loadFeasibilityStudies();
}, []);

  


// For editing
const handleEdit = (study) => {
  setMode('edit');
  setSelectedProjectId(study.project);
  setFormData({
    feasibilityStudyId: study.feasibility_study_id,
    studyTitle: study.study_title,
    preparedBy: study.prepared_by,
    studyType: study.study_type,
    reports: null, // can't prefill file input
    riskAssessment: study.risk_assessment,
    regulatoryCompliance: study.regulatory_compliance,
    projectedROI: study.projected_roi,
    estimatedCompletionTime: study.estimated_completion_time,
    recommendations: study.recommendations,
    approvalStatus: study.approval_status,
    approvalDate: study.approval_date,
    status: study.status,
  });
  setOpen(true);
};

//Handle submit logic
  
const handleSubmit = async () => {
  const form = new FormData();

  form.append('project', selectedProjectId);
  form.append('study_title', formData.studyTitle);
  form.append('prepared_by', formData.preparedBy);
  form.append('study_type', formData.studyType);
  if (formData.reports) {
    form.append('reports', formData.reports);
  }
  form.append('risk_assessment', formData.riskAssessment);
  form.append('regulatory_compliance', formData.regulatoryCompliance);
  form.append('projected_roi', formData.projectedROI);
  form.append('estimated_completion_time', formData.estimatedCompletionTime);
  form.append('recommendations', formData.recommendations);
  form.append('approval_status', formData.approvalStatus);
  form.append('approval_date', formData.approvalDate);
  form.append('status', formData.status);

  try {
    if (mode === 'edit') {
      await patchFeasibilityStudy(formData.feasibilityStudyId, form);
      alert('Feasibility study updated successfully!');
    } else {
      await createFeasibilityStudy(form);
      alert('Feasibility study submitted successfully!');
    }

    await loadFeasibilityStudies();
    setOpen(false);
    setMode('create'); // reset mode after closing
    setFormData({
      studyTitle: '',
      preparedBy: '',
      studyType: '',
      reports: null,
      riskAssessment: '',
      regulatoryCompliance: '',
      projectedROI: '',
      estimatedCompletionTime: '',
      recommendations: '',
      approvalStatus: 'Pending',
      approvalDate: '',
      status: 'Draft',
    });
    if (fileInputRef.current) fileInputRef.current.value = null;

  } catch (err) {
    console.error('Submission failed:', err);
    alert('Failed to submit/update feasibility study.');
  }
};

  const handleOpenForm = (projectId) => {
  setSelectedProjectId(projectId);
  const currentYear = new Date().getFullYear(); // get system year
  const paddedId = String(feasibilityStudies.length + 1).padStart(4, '0'); // ensures 4-digit format
  setFormData({ feasibilityStudyId: `FS-${currentYear}-${paddedId}` });
  setOpen(true);
};

//HandleDelete api
const handleDelete = async (feasibilityStudyId) => {
  if (!window.confirm(`Are you sure you want to delete ${feasibilityStudyId}?`)) return;

  try {
    await deleteFeasibilityStudy(feasibilityStudyId);
    alert(`✅ Feasibility study ${feasibilityStudyId} deleted successfully!`);
    await loadFeasibilityStudies(); // Refresh table
  } catch (error) {
    alert('❌ Failed to delete. See console for details.');
  }
};

  
  const handleClose = () => setOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  



const filteredFeasibility = feasibilityStudies.filter((study) =>
    Object.values(study).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  // Total pages for designs
const feasibityTotalPages = Math.ceil(filteredFeasibility.length / feasibilityRowsPerPage);

// Paginated designs
const paginatedFeasibility = filteredFeasibility.slice(
  (feasibilityPage - 1) * feasibilityRowsPerPage,
  feasibilityPage * feasibilityRowsPerPage
);

const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };


  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }} >Feasibility Study Management</Typography>
      
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to page 1 on search
          }}
          className="input"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#7267ef' }}>
              <strong>Project ID</strong>
            </TableCell>
            <TableCell
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                color: '#660000',
              }}
            >
              <strong>Action</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProjects.length > 0 ? (
            paginatedProjects.map((proj, i) => (
              <TableRow key={i}>
                <TableCell>{proj.project_id}</TableCell>
                <TableCell
                  sx={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <ShowIfCan slug={MODULE_SLUG} action="can_create">
                  <IconButton
                    onClick={() => handleOpenForm(proj.project_id)}
                    color="primary"
                  >
                    <AddCircle sx={{ color: '#7267ef' }} />
                  </IconButton>
                  </ShowIfCan>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">
                No records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ✅ Pagination Icons */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} pr={2}>
        <IconButton
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          <ArrowBackIos />
        </IconButton>

        <Typography variant="body2" sx={{ mx: 2 }}>
          Page {currentPage} of {totalPages || 1}
        </Typography>

        <IconButton
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
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
                  {paginatedFeasibility.map((study, index) => (
                    <TableRow key={index}>
                      <TableCell>{study.project}</TableCell>
                      <TableCell>{study.feasibility_study_id}</TableCell>
                      <TableCell>{study.study_title}</TableCell>
                      <TableCell>{study.study_type}</TableCell>
                      <TableCell>{study.prepared_by}</TableCell>
                      <TableCell>{study.risk_assessment}</TableCell>
                      <TableCell>{study.regulatory_compliance}</TableCell>
                      <TableCell>{study.projected_roi}</TableCell>
                      <TableCell>{study.estimated_completion_time}</TableCell>
                      <TableCell>{study.recommendations}</TableCell>
                      <TableCell>{study.approval_status}</TableCell>
                      <TableCell>{study.approval_date}</TableCell>
                      <TableCell>{study.status}</TableCell>

                      <TableCell>
  {/* Edit Button */}
  <DisableIfCannot slug={MODULE_SLUG} action="can_edit">
  <IconButton color="warning" onClick={() => handleEdit(study)}>
    <Edit sx={{ color: "orange" }} />
  </IconButton>
  </DisableIfCannot>
  
  {/* Delete Button */}
  <ShowIfCan slug={MODULE_SLUG} action="can_delete">
  <IconButton color="error" onClick={() => handleDelete(study.feasibility_study_id)}>
  <Delete sx={{ color: "red" }} />
</IconButton>
</ShowIfCan>

</TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} pr={2}>
              <IconButton
                disabled={feasibilityPage === 1}
                onClick={() => setFeasibilityPage(prev => prev - 1)}
              >
                <ArrowBackIos />
              </IconButton>
            
              <Typography variant="body2" sx={{ mx: 2 }}>
                Page {feasibilityPage} of {feasibityTotalPages || 1}
              </Typography>
            
              <IconButton
                disabled={feasibilityPage >= feasibityTotalPages}
                onClick={() => setFeasibilityPage(prev => prev + 1)}
              >
                <ArrowForwardIos />
              </IconButton>
            </Box>
            
          </Paper>
        </Grid>
      </Grid>

      {/* <Dialog open={open} onClose={handleClose} fullWidth> */}
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
        <DialogTitle>Enter Feasibility Study Details</DialogTitle>
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

              {/* Feasibility Study Information */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Feasibility Study Information & Documents</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="projectId">Project ID</label>
                    <input id="projectId" name="projectId" className="input" value={selectedProjectId} disabled />
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
                  <Grid item xs={6}>
                    <label>Upload</label>
                      <input
  type="file"
  className="input"
  ref={fileInputRef} // needed for reset
  onChange={(e) => {
    setFormData((prev) => ({
      ...prev,
      reports: e.target.files[0],
    }));
  }}
/>
                  </Grid>
                </Grid>
              </Grid>

              

              
{/* //         Risk and Compliance */}
         <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Risk and Compliance</h3>
           <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
           <Grid container spacing={2}>
             <Grid item xs={6}>
               <label htmlFor="riskAssessment">Risk Assessment</label>
               <textarea id="riskAssessment" name="riskAssessment" className="input" rows={3} value={formData.riskAssessment || ''} onChange={handleChange} />
             </Grid>
             <Grid item xs={6}>
               <label htmlFor="regulatoryCompliance">Regulatory Compliance</label>               
               <input id="regulatoryCompliance" name="regulatoryCompliance" className="input" value={formData.regulatoryCompliance || ''} onChange={handleChange} />
             </Grid>
           </Grid>
         </Grid>

         {/* Financial Info */}
        <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Financial Information</h3>           
           <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
           <Grid container spacing={2}>
             <Grid item xs={6}>
               <label htmlFor="projectedROI">Projected ROI (%)</label>
              <input type="number" id="projectedROI" name="projectedROI" className="input" value={formData.projectedROI || ''} onChange={handleChange} />
            </Grid>
             <Grid item xs={6}>
               <label htmlFor="estimatedCompletionTime">Estimated Completion Time (Months/Years)</label>
               <input type="number" id="estimatedCompletionTime" name="estimatedCompletionTime" className="input" value={formData.estimatedCompletionTime || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
               <label htmlFor="recommendations">Recommendations</label>
               <textarea id="recommendations" name="recommendations" className="input" rows={3} value={formData.recommendations || ''} onChange={handleChange} />
             </Grid>
           </Grid>
         </Grid>


         {/* Approval Info */}
         <Grid item xs={12}>
           <h3 style={{ color: '#7267ef' }}>Approval Information & Study Status</h3>
           <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
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
          <DisableIfCannot slug={MODULE_SLUG} action={mode === 'edit' ? 'can_update' : 'can_create'}>
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
          {mode === 'edit' ? 'Update' : 'Submit'}
           
         </Button>
         </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeasibilityForm;
