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
import { getTenders,getTenderbyID  } from '../../allapi/tenderAllocation'; // Adjust the path as needed


// const initialTenders = [
//   { tenderId: 'TND-2025-001', title: 'Road Construction Phase 1', status: 'pending' },
//   { tenderId: 'TND-2025-002', title: 'Bridge Repair Project', status: 'pending' },
//   { tenderId: 'TND-2025-003', title: 'Bridge Construction Project', status: 'pending' },
// ];

const ProjectCreation = () => {
  const today = new Date().toISOString().split('T')[0];
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [mode, setMode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
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
        status: 'pending', // <-- default status in frontend
      }));
      setTenders(enrichedData);
    } catch (err) {
      console.error('Error fetching tenders:', err);
    }
  };

  fetchTenders();
}, []);

  // Function to log audit trail entries
  const logAuditTrail = (action, tenderId, details = {}) => {
    const newEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      tenderId,
      user: 'currentUser', // Replace with actual user from your auth system
      details
    };
    setAuditTrails(prev => [...prev, newEntry]);
  };

  // const handleOpenDialog = (type, tender) => {
  //   setSelectedTender(tender);
  //   setMode(type);
  //   setDialogOpen(true);

  //   if (type === 'accept') {
  //     const currentYear = new Date().getFullYear();
  //     const projectCount = projects.length + 1;
  //     const projectId = `${currentYear}-PRJ-${String(projectCount).padStart(3, '0')}`;
  //     setFormData((prev) => ({ ...prev, projectId }));
  //   }

  //   if (type === 'view') {
  //     logAuditTrail('Viewed tender details', tender.tenderId);
  //   }
  // };
  const handleOpenDialog = async (type, tender) => {
  setMode(type);
  setDialogOpen(true);

  if (type === 'accept') {
    const currentYear = new Date().getFullYear();
    const projectCount = projects.length + 1;
    const projectId = `${currentYear}-PRJ-${String(projectCount).padStart(3, '0')}`;
    setFormData((prev) => ({ ...prev, projectId }));
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

  const handleSubmit = () => {
    if (!selectedTender) return;

    const updatedTenders = tenders.map((t) =>
      t.tenderId === selectedTender.tenderId
        ? { ...t, status: mode === 'accept' ? 'accepted' : 'cancelled' }
        : t
    );

    setTenders(updatedTenders);

    if (mode === 'accept') {
      logAuditTrail('Accepted tender', selectedTender.tenderId, {
        projectId: formData.projectId,
        allocationDate: formData.jobAllocationDate,
        status: formData.allocationStatus
      });
    } else if (mode === 'cancel') {
      logAuditTrail('Cancelled tender', selectedTender.tenderId, {
        refundDate: formData.refundDate,
        cancellationNote: formData.cancellationNote
      });
    }

    console.log(mode === 'accept' ? 'Accepted Project:' : 'Cancelled Tender:', {
      ...formData,
      tenderId: selectedTender.tenderId,
    });

    handleCloseDialog();
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
                      disabled={tender.status !== 'pending'}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleOpenDialog('cancel', tender)}
                      disabled={tender.status !== 'pending'}
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
            // <>
            //   <Typography><strong>Tender ID:</strong> {selectedTender?.tenderId}</Typography>
            //   <Typography><strong>Title:</strong> {selectedTender?.title}</Typography>
            // </>
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
                    value={formData.jobAllocationDate || today}
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
                  <label htmlFor="projectId">Project ID</label>
                  <input
                    type="text"
                    id="projectId"
                    value={formData.projectId}
                    readOnly
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

              <Typography variant="subtitle1" sx={{ mt: 3 }}>
                Project Summary
              </Typography>
              <Table size="small" sx={{ mt: 1 }}>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Tender ID</strong></TableCell>
                    <TableCell>{selectedTender?.tenderId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Project ID</strong></TableCell>
                    <TableCell>{formData.projectId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Govt. Project ID</strong></TableCell>
                    <TableCell>{formData.govtProjectId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Job Allocation Date</strong></TableCell>
                    <TableCell>{formData.jobAllocationDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell>{formData.allocationStatus}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <label htmlFor="refundDate">Security Money Refund Date</label>
                <input
                  type="date"
                  id="refundDate"
                  value={formData.refundDate || today}
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