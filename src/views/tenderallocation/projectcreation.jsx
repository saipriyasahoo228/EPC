import React, { useRef, useState, useEffect} from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HistoryIcon from '@mui/icons-material/History';
import { v4 as uuidv4 } from 'uuid';
import { getTenders,getTenderbyID,createProjectFromTender,cancelTender,getProjects } from '../../allapi/tenderAllocation'; // Adjust the path as needed




const ProjectCreation = () => {
  const today = new Date().toISOString().split('T')[0];
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [mode, setMode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  //const [projects, setProjects] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [auditTrails, setAuditTrails] = useState([]);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    jobAllocationDate: '',
    govtProjectId: '',
    projectId: uuidv4(),
    allocationStatus: 'Allocated',
    refundDate: '',
    cancellationNote: '',
    
  });

  // Refs for input focus control
  const jobDateRef = useRef();
  const govtIdRef = useRef();
  const allocationStatusRef = useRef();
  const refundDateRef = useRef();
  const cancellationNoteRef = useRef();

  const filteredTenders = tenders.filter((tender) =>
    tender.tenderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tender.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

//Fetch Tender Details
useEffect(() => {
  const fetchTenders = async () => {
    try {
      const data = await getTenders();
      const enrichedData = data.map((d) => ({
        tenderId: d.tender_id,
        title: d.tender_ref_no || 'Untitled Tender',
        status: d.status || '', // optional if you want to show status icon
      }));
      setTenders(enrichedData);
    } catch (err) {
      console.error('Error fetching tenders:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjectData(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  fetchTenders();
  fetchProjects();
}, []);



  // Function to log audit trail entries
  const logAuditTrail = (action, tenderId, details = {}) => {
    const newEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      tenderId,
      user: 'currentUser', 
      details
    };
    setAuditTrails(prev => [...prev, newEntry]);
  };



const handleOpenDialog = async (type, tender) => {
  setMode(type);
  setDialogOpen(true);

  if (type === 'accept') {
    setSelectedTender(tender);
  }

  if (type === 'view') {
    try {
      const tenderDetails = await getTenderbyID(tender.tenderId);
      setSelectedTender(tenderDetails); // overwrite with full backend data
      logAuditTrail('Viewed tender details', tender.tenderId);
    } catch (error) {
      console.error('Error fetching tender by ID:', error);
      alert('Failed to fetch tender details.');
    }
  }

  if (type === 'cancel') {
    setSelectedTender(tender);
  }
};

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setMode(null);
    setSelectedTender(null);
  };

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
//Handle Submit Logic
const handleSubmit = async () => {
  try {
    if (!selectedTender) return;

    if (mode === 'accept') {
      const payload = {
        status: 'Accept',
        job_allocation_date: formData.jobAllocationDate,
        govt_project_id: formData.govtProjectId,
        allocation_state: formData.allocationStatus,
      };

      const response = await createProjectFromTender(selectedTender.tenderId, payload);
      console.log('Project created successfully:', response);
      alert(`Project ${response.project_id} created successfully!`);

      setTenders((prev) =>
        prev.map((t) =>
          t.tenderId === selectedTender.tenderId ? { ...t, status: 'Accept' } : t
        )
      );

      const updatedProjects = await getProjects();
      setProjectData(updatedProjects); // ✅ updates table
    }

    if (mode === 'cancel') {
      const payload = {
        status: 'Cancel',
        security_money_refund_date: formData.refundDate,
        description: formData.cancellationNote,
      };

      const response = await cancelTender(selectedTender.tenderId, payload);
      console.log('Tender cancelled successfully:', response);
      alert('Tender cancelled successfully!');

      setTenders((prev) =>
        prev.map((t) =>
          t.tenderId === selectedTender.tenderId ? { ...t, status: 'Cancel' } : t
        )
      );

      const updatedProjects = await getProjects();
      setProjectData(updatedProjects); // ✅ updates table
    }

    setFormData({
      jobAllocationDate: '',
      govtProjectId: '',
      projectId: '',
      allocationStatus: 'Allocated',
      refundDate: '',
      cancellationNote: '',
    });
    setDialogOpen(false);
    setSelectedTender(null);
    setMode(null);
  } catch (error) {
    console.error('Error submitting:', error);
    alert('Submission failed. Please check data and try again.');
  }
};

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon color="success" />;
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <HourglassEmptyIcon color="disabled" />;
    }
  };

  const handleOpenAuditDialog = () => {
    setAuditDialogOpen(true);
  };

  const handleCloseAuditDialog = () => {
    setAuditDialogOpen(false);
  };

  return (
    <div style={{ padding: '1rem', position: 'relative' }}>
      {/* Header with title and audit trail button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2,mb:2 }}>
        <Typography variant="h6" sx={{ color: '#7267ef' }}>
          TENDER STATUS FOR PROJECT CREATION
        </Typography>
        
        <Tooltip title="View Audit Trail">
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={handleOpenAuditDialog}
            disabled={auditTrails.length === 0}
            sx={{
              borderColor: '#7267ef',
              color: '#7267ef',
              '&:hover': {
                borderColor: '#5a55d7',
                backgroundColor: '#e0e0f7',
              },
            }}
          >
            Audit Trail ({auditTrails.length})
          </Button>
        </Tooltip>
      </Box>

      <TableContainer component={Paper} sx={{ border: '1px solid #7267ef' }}>
        
        <Box mx={2} my={1}>
      <input
        type="text"
        placeholder="Search Tenders"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input"
      />
      </Box>
        <Table>
          <TableHead>
          
            <TableRow>
              <TableCell sx={{ color: '#7267ef' }}>Status</TableCell>
              <TableCell sx={{ color: '#7267ef' }}>Tender ID</TableCell>
              <TableCell sx={{ color: '#7267ef' }}>Tender Ref.No</TableCell>
              <TableCell align="center" sx={{ paddingLeft: '160px', color: '#800000' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenders.map((tender) => (
              <TableRow key={tender.tenderId}>
                <TableCell>{renderStatusIcon(tender.status)}</TableCell>
                <TableCell>{tender.tenderId}</TableCell>
                <TableCell>{tender.title}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog('view', tender)}
                      sx={{
                        borderColor: '#7267ef',
                        color: '#7267ef',
                        '&:hover': {
                          borderColor: '#5a55d7',
                          backgroundColor: '#e0e0f7',
                        },
                      }}
                    >
                      View
                    </Button>

                    <Button
  variant="contained"
  color="success"
  onClick={() => handleOpenDialog('accept', tender)}
 
>
  Accept
</Button>

<Button
  variant="contained"
  color="error"
  onClick={() => handleOpenDialog('cancel', tender)}
 
>
  Cancel
</Button>

                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        
      </TableContainer>



{/* Project List Table */}
<Box mt={4}>
  <Typography variant="h6" sx={{ color: '#7267ef', mb: 1 }}>
    PROJECT ALLOCATION REPORT
  </Typography>
  <TableContainer component={Paper} sx={{ border: '1px solid #7267ef' }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ color: '#7267ef' }}>Tender ID</TableCell>
         
          <TableCell sx={{ color: '#7267ef' }}>Project ID</TableCell>
          <TableCell sx={{ color: '#7267ef' }}>Govt Project ID</TableCell>
          <TableCell sx={{ color: '#7267ef' }}>Job Allocation Date</TableCell>
          <TableCell sx={{ color: '#7267ef' }}>Allocation State</TableCell>
          <TableCell sx={{ color: '#7267ef' }}>Refund Date</TableCell>
          <TableCell sx={{ color: '#7267ef' }}>Cancellation Note</TableCell>
           <TableCell sx={{ color: '#7267ef' }}>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {projectData.length > 0 ? (
          projectData.map((proj) => (
            <TableRow key={proj.id}>
              <TableCell>{proj.tender}</TableCell>
             
              <TableCell>{proj.project_id || '-'}</TableCell>
              <TableCell>{proj.govt_project_id || '-'}</TableCell>
              <TableCell>{proj.job_allocation_date || '-'}</TableCell>
              <TableCell>{proj.allocation_state || '-'}</TableCell>
              <TableCell>{proj.security_money_refund_date || '-'}</TableCell>
              <TableCell>{proj.description || '-'}</TableCell>
              <TableCell>
                {proj.status === 'Accept' ? (
                  <CheckCircleIcon color="success" />
                ) : proj.status === 'Cancel' ? (
                  <CancelIcon color="error" />
                ) : (
                  <HourglassEmptyIcon color="disabled" />
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} align="center">
              No project records found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
</Box>


      {/* Main Dialog for tender actions */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {mode === 'accept'
            ? 'Project Allocation Details'
            : mode === 'cancel'
            ? 'Cancellation Details'
            : 'Tender Details'}
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {mode === 'view' ? (
            
             <>
    <Typography><strong>Tender ID:</strong> {selectedTender?.tender_id}</Typography>
    <Typography><strong>Reference No:</strong> {selectedTender?.tender_ref_no}</Typography>
    <Typography><strong>Location:</strong> {selectedTender?.location}</Typography>
    <Typography><strong>Release Date:</strong> {selectedTender?.release_date}</Typography>
    <Typography><strong>Tender Value:</strong> ₹{selectedTender?.tender_value}</Typography>

    <Typography><strong>EMD Details:</strong></Typography>
    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
      <li><strong>Amount:</strong> ₹{selectedTender?.emd_details?.amount}</li>
      <li><strong>Validity:</strong> {selectedTender?.emd_details?.validity}</li>
      <li><strong>Conditions:</strong> {selectedTender?.emd_details?.conditions}</li>
    </ul>

    <Typography><strong>Authority:</strong> {selectedTender?.authority}</Typography>
    <Typography><strong>Contact:</strong> {selectedTender?.contact}</Typography>
    <Typography><strong>Authorized Personnel:</strong> {selectedTender?.authorized_personnel}</Typography>
    <Typography><strong>Start Date:</strong> {selectedTender?.start_date}</Typography>
    <Typography><strong>End Date:</strong> {selectedTender?.end_date}</Typography>
    <Typography><strong>Description:</strong> {selectedTender?.tender_description}</Typography>
    <Typography><strong>Status:</strong> {selectedTender?.status}</Typography>
  </>
          ) : mode === 'accept' ? (
            <>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <label htmlFor="jobAllocationDate">Job Allocation Date</label>
                  <input
                    type="date"
                    id="jobAllocationDate"
                    value={formData.jobAllocationDate}
                    onChange={handleChange('jobAllocationDate')}
                    onKeyDown={(e) => handleKeyDown(e, govtIdRef)}
                    ref={jobDateRef}
                    className="input"
                  />
                </Grid>
                <Grid item xs={12}>
                  <label htmlFor="govtProjectId">Govt. Project ID</label>
                  <input
                    type="text"
                    id="govtProjectId"
                    value={formData.govtProjectId}
                    onChange={handleChange('govtProjectId')}
                    onKeyDown={(e) => handleKeyDown(e, allocationStatusRef)}
                    ref={govtIdRef}
                    className="input"
                  />
                </Grid>
              
                <Grid item xs={12}>
                  <label htmlFor="allocationStatus">Status</label>
                  <select
                    id="allocationStatus"
                    value={formData.allocationStatus}
                    onChange={handleChange('allocationStatus')}
                    ref={allocationStatusRef}
                    className="input"
                  >
                    <option value="Allocated">Allocated</option>
                    <option value="Not Allocated">Not Allocated</option>
                  </select>
                </Grid>
              </Grid>

              
            </>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <label htmlFor="refundDate">Security Money Refund Date</label>
                <input
                  type="date"
                  id="refundDate"
                  value={formData.refundDate}
                  onChange={handleChange('refundDate')}
                  onKeyDown={(e) => handleKeyDown(e, cancellationNoteRef)}
                  ref={refundDateRef}
                  className="input"
                />
              </Grid>
              <Grid item xs={12}>
                <label htmlFor="cancellationNote">Cancellation Notes</label>
                <textarea
                  id="cancellationNote"
                  rows={3}
                  value={formData.cancellationNote}
                  onChange={handleChange('cancellationNote')}
                  ref={cancellationNoteRef}
                  className="input"
                />
              </Grid>
            </Grid>
          )}

          {mode !== 'view' && (
            <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Grid item>
                <Button
                  onClick={handleCloseDialog}
                  variant="outlined"
                  sx={{
                    borderColor: 'darkred',
                    color: 'darkred',
                    '&:hover': {
                      borderColor: 'darkred',
                      backgroundColor: 'rgba(139, 0, 0, 0.1)',
                    },
                  }}
                >
                  Close
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={handleSubmit}
                  variant="outlined"
                  sx={{
                    borderColor: '#7267ef',
                    color: '#7267ef',
                    '&:hover': {
                      color: '#7267ef',
                    },
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Trail Dialog */}
      <Dialog open={auditDialogOpen} onClose={handleCloseAuditDialog} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          System Audit Trail
          <IconButton onClick={handleCloseAuditDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Tender ID</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditTrails.length > 0 ? (
                  [...auditTrails].reverse().map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{entry.tenderId}</TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell>
                        {entry.details && Object.keys(entry.details).length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {Object.entries(entry.details).map(([key, value]) => (
                              <li key={key}>
                                <strong>{key}:</strong> {value}
                              </li>
                            ))}
                          </ul>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{entry.user}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No audit records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectCreation;