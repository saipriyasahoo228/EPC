
import React, { useEffect, useMemo, useState } from "react";
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
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Drawer,
  useMediaQuery,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { AddCircle, Edit, Delete, ReportProblem, ShoppingCart } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import { getProjectsAccept } from "../../allapi/engineering"; 
import {createSiteExecution,getSiteExecutions,deleteSiteExecution ,updateSiteExecution} from "../../allapi/construction";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";


const SiteExecution = () => {
  const MODULE_SLUG = 'construction';
  const [siteCounter, setSiteCounter] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // projects search
  const [searchQuery, setSearchQuery] = useState(''); // sites search
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [site, setSite] = useState([]);
  const [project, setProject] = useState([]);
  const [siteExecutions, setSiteExecutions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Quick actions state
  const [qaSite, setQaSite] = useState(null); // currently selected site for quick action
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [materialOpen, setMaterialOpen] = useState(false);
  const [materialItem, setMaterialItem] = useState('');
  const [materialQty, setMaterialQty] = useState('');
  // Mobile sheet actions
  const isMobile = useMediaQuery('(max-width:600px)');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSite, setSheetSite] = useState(null);
  const openSheet = (s) => { setSheetSite(s); setSheetOpen(true); };


  
  //All accepted projects 
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsAccept();
        setProject(data ?? []); // assuming API returns array of projects
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

    //Get api for site-execution
   const fetchSiteExecutions = async () => {
  try {
    setLoading(true);
    const data = await getSiteExecutions();
    setSiteExecutions(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("❌ Failed to fetch site executions:", err);
  } finally {
    setLoading(false);
  }
};

// 🔹 run once on mount
useEffect(() => {
  fetchSiteExecutions();
}, []);



const handleOpenForm = (projectId) => {
  setSelectedProjectId(projectId);

  const currentYear = new Date().getFullYear();
  
  // Find the highest site number for the current year
  const currentYearSites = siteExecutions.filter(s => s.site_id?.startsWith(`SIT-${currentYear}-`));
  
  let maxNumber = 0;
  if (currentYearSites.length > 0) {
    currentYearSites.forEach(s => {
      const parts = s.site_id?.split('-');
      if (parts && parts.length === 3) {
        const num = parseInt(parts[2]);
        if (num > maxNumber) maxNumber = num;
      }
    });
  }

  const newSiteNumber = maxNumber + 1;
  const paddedNumber = String(newSiteNumber).padStart(4, '0');

  setFormData({
    siteId: `SIT-${currentYear}-${paddedNumber}`,
    project: projectId,
  });

  setOpen(true);
};
const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


// const handleSubmit = async () => {
//   try {
//     const payload = {
//       project: selectedProjectId,
//       site_supervisor_id: formData.siteSupervisorID,
//       daily_progress_report_id: formData.dailyProgressReportID,
//       work_completed: formData.workCompleted,
//       manpower_utilized: formData.manpowerUtilize,
//       equipment_used: formData.equipmentUsed,
//       weather_conditions: formData.wetherCondition,
//       safety_compliance_report: formData.safetyCompliance,
//       material_consumption: formData.materialConsumption,
//       site_issues: formData.siteIssues,
//       site_execution_status: formData.siteStatus || "on track",
//     };

//     if (editingId) {
//       // 🔹 PATCH (edit mode)
//       await updateSiteExecution(editingId, payload);
//       alert("✅ Site Execution updated successfully!");
//     } else {
//       // 🔹 POST (create mode)
//       const data = await createSiteExecution(payload);
//       alert(`✅ Site Execution saved!\nSite ID: ${data.site_id}`);
//     }

//     // Reset form & close dialog
//     setFormData({});
//     setEditingId(null);
//     handleClose();

//     // 🔹 Refresh table
//     fetchSiteExecutions();
//   } catch (err) {
//     console.error("❌ Failed to save site execution:", err);
//   }
// };
const handleSubmit = async () => {
  try {
    const payload = {
      project: selectedProjectId,
      site_supervisor_id: formData.siteSupervisorID,
      daily_progress_report_id: formData.dailyProgressReportID,
      work_completed: formData.workCompleted,
      manpower_utilized: formData.manpowerUtilize,
      equipment_used: formData.equipmentUsed,
      weather_conditions: formData.wetherCondition,
      safety_compliance_report: formData.safetyCompliance,
      material_consumption: formData.materialConsumption,
      site_issues: formData.siteIssues,
      site_execution_status: formData.siteStatus || "on track",
    };

    if (editingId) {
      // 🔹 PATCH (edit mode)
      await updateSiteExecution(editingId, payload);
      alert("✅ Site Execution updated successfully!");
    } else {
      // 🔹 POST (create mode)
      const data = await createSiteExecution(payload);
      alert(`✅ Site Execution saved!\nSite ID: ${data.site_id}`);
    }

    // Reset form & close dialog
    setFormData({});
    setEditingId(null);
    handleClose();

    // 🔹 Refresh table
    fetchSiteExecutions();
  } catch (err) {
    console.error("❌ Failed to save site execution:", err);

    // Show backend error response if available
    if (err.response && err.response.data) {
      const errorMsg = err.response.data.detail || JSON.stringify(err.response.data);
      alert(`❌ Error: ${errorMsg}`);
    } else {
      alert("❌ An unexpected error occurred. Please try again.");
    }
  }
};

// 🔹 In your component
const handleDelete = async (project) => {
  if (!window.confirm(`Are you sure you want to delete this site execution with siteId: ${project  }?`)) {
    return;
  }

  try {
    await deleteSiteExecution(project);
    alert(`✅ Site execution with siteID: ${project} deleted successfully!`);

    // 🔹 Refresh the table after delete
    fetchSiteExecutions();
  } catch (err) {
    console.error("❌ Failed to delete site execution:", err);
    alert("❌ Failed to delete site execution. Please try again.");
  }
};

const handleEdit = (s) => {
  setFormData({
    siteId:s.site_id,
    siteSupervisorID: s.site_supervisor_id,
    dailyProgressReportID: s.daily_progress_report_id,
    workCompleted: s.work_completed,
    manpowerUtilize: s.manpower_utilized,
    equipmentUsed: s.equipment_used,
    wetherCondition: s.weather_conditions,
    safetyCompliance: s.safety_compliance_report,
    materialConsumption: s.material_consumption,
    siteIssues: s.site_issues,
    siteStatus: s.site_execution_status,
  });

  setSelectedProjectId(s.project);
  setEditingId(s.site_id);   // ✅ use `s.id` instead of `s.project` for PATCH
  setOpen(true);        // open the form dialog for editing
};

// Quick one-tap status update from cards (outside of useEffect)
const quickUpdateStatus = async (s, newStatus) => {
  const prev = [...siteExecutions];
  // Optimistic UI update
  setSiteExecutions((list) => list.map((row) => (
    row.site_id === s.site_id ? { ...row, site_execution_status: newStatus } : row
  )));
  try {
    await updateSiteExecution(s.site_id, { site_execution_status: newStatus });
  } catch (e) {
    console.error('Failed to update status', e);
    // Revert on failure
    setSiteExecutions(prev);
    alert('Failed to update status. Please try again.');
  }
};



  const filteredProjects = useMemo(() => (
    (project || []).filter((p) =>
      Object.values(p).some((val) =>
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  ), [project, searchTerm]);

  // Compute stats for summary cards
  const stats = useMemo(() => {
    const total = siteExecutions.length;
    const byStatus = siteExecutions.reduce((acc, s) => {
      const k = (s.site_execution_status || '').toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return {
      total,
      onTrack: byStatus['on track'] || 0,
      delayed: byStatus['delayed'] || 0,
      halted: byStatus['halted'] || 0,
    };
  }, [siteExecutions]);

  // Visible sites with filters & search
  const visibleSites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (siteExecutions || [])
      .filter((s) => {
        if (statusFilter === 'all') return true;
        return (s.site_execution_status || '').toLowerCase() === statusFilter;
      })
      .filter((s) => {
        if (!q) return true;
        const text = [
          s.project,
          s.site_id,
          s.site_supervisor_id,
          s.daily_progress_report_id,
          s.work_completed,
          s.manpower_utilized,
          s.equipment_used,
          s.weather_conditions,
          s.safety_compliance_report,
          s.material_consumption,
          s.site_issues,
          s.site_execution_status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
  }, [siteExecutions, statusFilter, searchQuery]);

 
  

  return (
    <>
      <Box sx={{
        mt: 2,
        mb: 2,
        px: 2,
        py: 2,
        borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(114,103,239,0.12) 0%, rgba(114,103,239,0.04) 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography variant="h5" sx={{ color: '#2f2a8d', fontWeight: 700 }}>
          Site Execution
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track progress, log issues, and request materials in one tap.
        </Typography>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[{ label: 'Total', value: stats.total, color: '#7267ef' },
          { label: 'On Track', value: stats.onTrack, color: '#2e7d32' },
          { label: 'Delayed', value: stats.delayed, color: '#ed6c02' },
          { label: 'Halted', value: stats.halted, color: '#d32f2f' }].map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>{c.label}</Typography>
              <Typography variant="h5" sx={{ color: c.color, fontWeight: 700 }}>{c.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Project records & quick create */}
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Grid item>
                <Typography variant="h6" sx={{ color: '#7267ef' }}>Project Records</Typography>
              </Grid>
              <Grid item>
                <Chip label={`${filteredProjects.length} projects`} size="small" />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              size="small"
              placeholder="Search project by any field (e.g., ID)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">🔎</InputAdornment>
              }}
              sx={{ mb: 2 }}
            />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
                  <TableCell align="right" sx={{ color: '#660000' }}><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((proj, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{proj.project_id}</TableCell>
                    <TableCell align="right">
                    <ShowIfCan slug={MODULE_SLUG} action="can_create">

                      <Tooltip title="Create site execution for this project">
                        <IconButton onClick={() => handleOpenForm(proj.project_id)} color="primary">
                          <AddCircle sx={{ color: "#7267ef" }} />
                        </IconButton>
                      </Tooltip>
                    </ShowIfCan>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="body2" color="text.secondary">No projects found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Sites list with filters */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #eee' }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: '#7267ef' }}>Site Executions</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search sites"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                      sx={{ flexWrap: 'wrap', rowGap: 1, columnGap: 1 }}
                    >
                      {[
                        { key: 'all', label: `All (${stats.total})` },
                        { key: 'on track', label: `On Track (${stats.onTrack})` },
                        { key: 'delayed', label: `Delayed (${stats.delayed})` },
                        { key: 'halted', label: `Halted (${stats.halted})` },
                      ].map((opt) => (
                        <Chip
                          key={opt.key}
                          label={opt.label}
                          color={statusFilter === opt.key ? 'primary' : 'default'}
                          variant={statusFilter === opt.key ? 'filled' : 'outlined'}
                          onClick={() => setStatusFilter(opt.key)}
                          size="small"
                          sx={{ borderRadius: 999, px: 1, mr: 0, mb: 0 }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md="auto">
                    <ToggleButtonGroup
                      size="small"
                      value={viewMode}
                      exclusive
                      onChange={(_e, v) => v && setViewMode(v)}
                      aria-label="view mode"
                    >
                      <ToggleButton value="cards" aria-label="cards view">Cards</ToggleButton>
                      <ToggleButton value="table" aria-label="table view">Table</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {loading ? (
              <Box display="flex" alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : viewMode === 'table' ? (
              <TableContainer sx={{ maxHeight: 420, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{color:'#7267ef'}}><strong>Project</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Site ID</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Supervisor</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>DPR ID</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Work Completed</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Manpower</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Equipment</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Weather</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Safety</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Materials</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Issues</strong></TableCell>
                      <TableCell sx={{color:'#7267ef'}}><strong>Status</strong></TableCell>
                      <TableCell sx={{color:'#660000'}} align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleSites.map((s, i) => (
                      <TableRow key={`${s.site_id}-${i}`} hover>
                        <TableCell>{s.project}</TableCell>
                        <TableCell>{s.site_id}</TableCell>
                        <TableCell>{s.site_supervisor_id}</TableCell>
                        <TableCell>{s.daily_progress_report_id}</TableCell>
                        <TableCell>
                          <Tooltip title={s.work_completed || ''}>
                            <span>{(s.work_completed || '').slice(0, 24)}{(s.work_completed || '').length > 24 ? '…' : ''}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{s.manpower_utilized}</TableCell>
                        <TableCell>
                          <Tooltip title={s.equipment_used || ''}>
                            <span>{(s.equipment_used || '').slice(0, 16)}{(s.equipment_used || '').length > 16 ? '…' : ''}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{s.weather_conditions}</TableCell>
                        <TableCell>
                          <Tooltip title={s.safety_compliance_report || ''}>
                            <span>{(s.safety_compliance_report || '').slice(0, 16)}{(s.safety_compliance_report || '').length > 16 ? '…' : ''}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={s.material_consumption || ''}>
                            <span>{(s.material_consumption || '').slice(0, 16)}{(s.material_consumption || '').length > 16 ? '…' : ''}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={s.site_issues || ''}>
                            <span>{(s.site_issues || '').slice(0, 20)}{(s.site_issues || '').length > 20 ? '…' : ''}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const st = (s.site_execution_status || '').toLowerCase();
                            const map = {
                              'on track': { color: 'success', label: 'On Track' },
                              'delayed': { color: 'warning', label: 'Delayed' },
                              'halted': { color: 'error', label: 'Halted' }
                            };
                            const cfg = map[st] || { color: 'default', label: s.site_execution_status || '-' };
                            return <Chip label={cfg.label} color={cfg.color} size="small" variant={cfg.color === 'default' ? 'outlined' : 'filled'} />;
                          })()}
                        </TableCell>
                        <TableCell align="right">
                        <DisableIfCannot slug={MODULE_SLUG} action="can_update">

                          <Tooltip title="Edit">
                            <IconButton color="warning" onClick={() => handleEdit(s)}>
                              <Edit sx={{ color: "orange" }} />
                            </IconButton>
                          </Tooltip>
                          </DisableIfCannot>
                          <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                          <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleDelete(s.site_id)}>
                              <Delete sx={{ color: "red" }} />
                            </IconButton>
                          </Tooltip>
                          </ShowIfCan>
                        </TableCell>
                      </TableRow>
                    ))}
                    {visibleSites.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={13}>
                          <Typography variant="body2" color="text.secondary">No site executions found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <>
                {visibleSites.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">No site executions found</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {visibleSites.map((s, i) => {
                      const st = (s.site_execution_status || '').toLowerCase();
                      const statusCfg = {
                        'on track': { color: 'success', label: 'On Track' },
                        'delayed': { color: 'warning', label: 'Delayed' },
                        'halted': { color: 'error', label: 'Halted' }
                      }[st] || { color: 'default', label: s.site_execution_status || '-' };

                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={`${s.site_id}-${i}`}>
                          <Card onClick={() => { if (isMobile) openSheet(s); }} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 2, transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: 3 }, cursor: isMobile ? 'pointer' : 'default' }}>
                            <CardContent sx={{ pb: 1 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">{s.project}</Typography>
                                <Chip label={statusCfg.label} color={statusCfg.color} size="small" variant={statusCfg.color === 'default' ? 'outlined' : 'filled'} />
                              </Stack>
                              <Typography variant="h6" sx={{ color: '#2f2a8d', mb: 0.5 }}>{s.site_id}</Typography>
                              <Typography variant="body2" color="text.secondary">Supervisor: {s.site_supervisor_id || '-'}</Typography>
                              <Typography variant="body2" color="text.secondary">DPR: {s.daily_progress_report_id || '-'}</Typography>
                              {!!s.work_completed && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  <strong>Work:</strong> {(s.work_completed || '').slice(0, 90)}{(s.work_completed || '').length > 90 ? '…' : ''}
                                </Typography>
                              )}
                              {!!s.site_issues && (
                                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                  <strong>Issue:</strong> {(s.site_issues || '').slice(0, 90)}{(s.site_issues || '').length > 90 ? '…' : ''}
                                </Typography>
                              )}
                            </CardContent>
                            <CardActions sx={{ mt: 'auto', p: 1.5, pt: 0 }}>
                              <Stack direction="column" spacing={1} sx={{ width: '100%' }}>
                                <Stack direction="row" spacing={1}>
                                <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                                <Button fullWidth variant="contained" color="success" size="small" onClick={(e) => { e.stopPropagation(); quickUpdateStatus(s, 'on track'); }}>On Track</Button></DisableIfCannot>
                                <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                                <Button fullWidth variant="contained" color="warning" size="small" onClick={(e) => { e.stopPropagation(); quickUpdateStatus(s, 'delayed'); }}>Delay</Button></DisableIfCannot>
                                <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                                  <Button fullWidth variant="contained" color="error" size="small" onClick={(e) => { e.stopPropagation(); quickUpdateStatus(s, 'halted'); }}>Halt</Button></DisableIfCannot>
                                </Stack>
                                

                                <Stack direction="row" spacing={1}>
                                <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                                  <Button fullWidth variant="outlined" color="warning" size="small" startIcon={<ReportProblem />} onClick={(e) => { e.stopPropagation(); setQaSite(s); setIssueText(''); setIssueOpen(true); }}>Log Issue</Button></DisableIfCannot>
                                  <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                                  <Button fullWidth variant="outlined" color="info" size="small" startIcon={<ShoppingCart />} onClick={(e) => { e.stopPropagation(); setQaSite(s); setMaterialItem(''); setMaterialQty(''); setMaterialOpen(true); }}>Request Materials</Button></DisableIfCannot>
                                </Stack>
                                                    
                                <Stack direction="row" spacing={1}>
                                  <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                                  <Button fullWidth variant="outlined" size="small" startIcon={<Edit />} onClick={(e) => { e.stopPropagation(); handleEdit(s); }}>Update</Button>
                                  </DisableIfCannot>
                                  <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                                  <Button fullWidth variant="outlined" color="error" size="small" startIcon={<Delete />} onClick={(e) => { e.stopPropagation(); handleDelete(s.site_id); }}>Delete</Button>
                                  </ShowIfCan>
                                </Stack>
                              </Stack>
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>


      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
  <DialogTitle sx={{ backgroundColor: '#f7f7fb', color: '#2f2a8d' }}>Enter Site Execution Details</DialogTitle>
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
            <TextField fullWidth size="small" label="Project ID" id="projectId" value={selectedProjectId} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Site ID" id="siteId" value={formData.siteId || ''} disabled />
          </Grid>
        </Grid>
      </Grid>

      {/* Design Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Site Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Site Supervisor ID" id="siteSupervisorID" name="siteSupervisorID" value={formData.siteSupervisorID || ''} onChange={handleChange} />
          </Grid>
          
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Daily Progress Report ID" id="dailyProgressReportID" name="dailyProgressReportID" value={formData.dailyProgressReportID || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Work Completed" id="workCompleted" name="workCompleted" value={formData.workCompleted || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" type='number' label="Manpower Utilized" id="manpowerUtilize" name="manpowerUtilize" value={formData.manpowerUtilize || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Approval Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Weather & Materials</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Equipment Used" id="equipmentUsed" name="equipmentUsed" value={formData.equipmentUsed || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Weather Condition" id="wetherCondition" name="wetherCondition" value={formData.wetherCondition || ''} onChange={handleChange} />
          </Grid>
          
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Safety Compliance Report" id="safetyCompliance" name="safetyCompliance" value={formData.safetyCompliance || ''} onChange={handleChange} />
          </Grid>
           <Grid item xs={6}>
            <TextField fullWidth size="small" label="Material Consumption" id="materialConsumption" name="materialConsumption" value={formData.materialConsumption || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Budget/Requirements */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Site Issues & Status</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Site Issues" id="siteIssues" name="siteIssues" multiline minRows={3} value={formData.siteIssues || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              size="small"
              id="siteStatus"
              name="siteStatus"
              label="Site Execution Status"
              SelectProps={{ native: true }}
              value={formData.siteStatus || "on track"}
              onChange={handleChange}
            >
              <option value="on track">On Track</option>
              <option value="delayed">Delayed</option>
              <option value="halted">Halted</option>
            </TextField>
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

<DisableIfCannot slug={MODULE_SLUG} action="can_create">
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

</DisableIfCannot>
  </DialogActions>
</Dialog>

      {/* Log Issue Dialog */}
      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f7f7fb', color: '#2f2a8d' }}>Log Issue</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Site: {qaSite?.site_id || '-'} | Project: {qaSite?.project || '-'}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Describe the issue"
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#7267ef' }}
            onClick={async () => {
              if (!qaSite || !issueText.trim()) { setIssueOpen(false); return; }
              const ts = new Date().toLocaleString();
              const entry = `[${ts}] ISSUE: ${issueText.trim()}`;
              // Optimistic
              const prev = [...siteExecutions];
              setSiteExecutions((list) => list.map((row) => (
                row.site_id === qaSite.site_id
                  ? { ...row, site_issues: ((row.site_issues || '') + (row.site_issues ? '\n' : '') + entry) }
                  : row
              )));
              try {
                await updateSiteExecution(qaSite.site_id, { site_issues: ((qaSite.site_issues || '') + (qaSite.site_issues ? '\n' : '') + entry) });
              } catch (e) {
                setSiteExecutions(prev);
                alert('Failed to log issue');
              } finally {
                setIssueOpen(false);
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Materials Dialog */}
      <Dialog open={materialOpen} onClose={() => setMaterialOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f7f7fb', color: '#2f2a8d' }}>Request Materials</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Site: {qaSite?.site_id || '-'} | Project: {qaSite?.project || '-'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth size="small" label="Material Item" value={materialItem} onChange={(e) => setMaterialItem(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" type="number" label="Qty" value={materialQty} onChange={(e) => setMaterialQty(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">A simple note will be appended to Site Issues to notify procurement.</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaterialOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#7267ef' }}
            onClick={async () => {
              if (!qaSite || !materialItem.trim() || !materialQty) { setMaterialOpen(false); return; }
              const ts = new Date().toLocaleString();
              const entry = `[${ts}] MATERIAL REQUEST: ${materialItem.trim()} x ${materialQty}`;
              const prev = [...siteExecutions];
              setSiteExecutions((list) => list.map((row) => (
                row.site_id === qaSite.site_id
                  ? { ...row, site_issues: ((row.site_issues || '') + (row.site_issues ? '\n' : '') + entry) }
                  : row
              )));
              try {
                await updateSiteExecution(qaSite.site_id, { site_issues: ((qaSite.site_issues || '') + (qaSite.site_issues ? '\n' : '') + entry) });
              } catch (e) {
                setSiteExecutions(prev);
                alert('Failed to request materials');
              } finally {
                setMaterialOpen(false);
              }
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Quick Add button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', right: 24, bottom: 24, backgroundColor: '#7267ef', boxShadow: 6 }}
        onClick={() => {
          const first = filteredProjects[0];
          if (first?.project_id) handleOpenForm(first.project_id);
        }}
        aria-label="quick add"
      >
        <AddCircle />
      </Fab>

      {/* Mobile Bottom Sheet Actions */}
      <Drawer
        anchor="bottom"
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        PaperProps={{ sx: { borderTopLeftRadius: 12, borderTopRightRadius: 12 } }}
      >
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {sheetSite?.site_id || 'Site'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supervisor: {sheetSite?.site_supervisor_id || '-'} · Project: {sheetSite?.project || '-'}
          </Typography>
        </Box>
        <List>
          <ListItemButton onClick={() => { if (sheetSite) quickUpdateStatus(sheetSite, 'on track'); setSheetOpen(false); }}>
            <ListItemIcon><Chip size="small" color="success" label="On" /></ListItemIcon>
            <ListItemText primary="Mark On Track" />
          </ListItemButton>
          <ListItemButton onClick={() => { if (sheetSite) quickUpdateStatus(sheetSite, 'delayed'); setSheetOpen(false); }}>
            <ListItemIcon><Chip size="small" color="warning" label="Delay" /></ListItemIcon>
            <ListItemText primary="Mark Delayed" />
          </ListItemButton>
          <ListItemButton onClick={() => { if (sheetSite) quickUpdateStatus(sheetSite, 'halted'); setSheetOpen(false); }}>
            <ListItemIcon><Chip size="small" color="error" label="Halt" /></ListItemIcon>
            <ListItemText primary="Mark Halted" />
          </ListItemButton>
          <Divider />
          <ListItemButton onClick={() => { if (sheetSite) { setQaSite(sheetSite); setIssueText(''); setIssueOpen(true); } setSheetOpen(false); }}>
            <ListItemIcon><ReportProblem color="warning" /></ListItemIcon>
            <ListItemText primary="Log Issue" secondary="Add a quick issue note" />
          </ListItemButton>
          <ListItemButton onClick={() => { if (sheetSite) { setQaSite(sheetSite); setMaterialItem(''); setMaterialQty(''); setMaterialOpen(true); } setSheetOpen(false); }}>
            <ListItemIcon><ShoppingCart color="info" /></ListItemIcon>
            <ListItemText primary="Request Materials" secondary="Send a simple request" />
          </ListItemButton>
          <Divider />
          <ListItemButton onClick={() => { if (sheetSite) handleEdit(sheetSite); setSheetOpen(false); }}>
            <ListItemIcon><Edit /></ListItemIcon>
            <ListItemText primary="Update Details" />
          </ListItemButton>
          <ListItemButton onClick={() => { if (sheetSite) handleDelete(sheetSite.site_id); setSheetOpen(false); }}>
            <ListItemIcon><Delete color="error" /></ListItemIcon>
            <ListItemText primary="Delete" />
          </ListItemButton>
        </List>
      </Drawer>

    </>
  );
};

export default SiteExecution;
