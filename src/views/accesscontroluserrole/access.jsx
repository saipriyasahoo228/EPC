import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Snackbar,
  Alert,
  TextField,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getModules, getEffectiveUserPermissions, updateUserModulePermissions, createModules } from '../../allapi/access';
import { getUser } from '../../allapi/user';

const UserRoleAccessControl = () => {
  // Data
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);

  // State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [effectivePerms, setEffectivePerms] = useState({}); // moduleId -> {can_read, can_create, can_update, can_delete}
  const [loading, setLoading] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingModuleId, setSavingModuleId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Module dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    description: '',
    default_read: false,
    default_create: false,
    default_update: false,
    default_delete: false,
  });

  // Init load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [usersData, modulesData] = await Promise.all([getUser(), getModules()]);
        setUsers(usersData || []);
        setModules(modulesData || []);
      } catch (e) {
        setError('Failed to load users or modules.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load effective permissions when a user is selected
  useEffect(() => {
    const fetchPerms = async () => {
      if (!selectedUserId) return;
      setLoadingPerms(true);
      try {
        const permsList = await getEffectiveUserPermissions(selectedUserId);
        // Normalize to map by module.id
        const map = {};
        (permsList || []).forEach((item) => {
          const m = item.module;
          map[m.id] = {
            can_read: Boolean(item.permissions?.can_read),
            can_create: Boolean(item.permissions?.can_create),
            can_update: Boolean(item.permissions?.can_update),
            can_delete: Boolean(item.permissions?.can_delete),
          };
        });
        // For modules without explicit perms, use defaults from module
        modules.forEach((m) => {
          if (!map[m.id]) {
            map[m.id] = {
              can_read: Boolean(m.default_read),
              can_create: Boolean(m.default_create),
              can_update: Boolean(m.default_update),
              can_delete: Boolean(m.default_delete),
            };
          }
        });
        setEffectivePerms(map);
      } catch (e) {
        setError('Failed to load user permissions.');
        setEffectivePerms({});
      } finally {
        setLoadingPerms(false);
      }
    };
    fetchPerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, modules.length]);

  const rows = useMemo(() => modules.map((m) => ({
    module: m,
    perms: effectivePerms[m.id] || {
      can_read: Boolean(m.default_read),
      can_create: Boolean(m.default_create),
      can_update: Boolean(m.default_update),
      can_delete: Boolean(m.default_delete),
    },
  })), [modules, effectivePerms]);

  const handleToggle = async (moduleId, key) => {
    if (!selectedUserId) {
      setError('Please select a user first.');
      return;
    }
    const current = effectivePerms[moduleId] || {};
    const next = { ...current, [key]: !current[key] };
    // Optimistic update
    setEffectivePerms((prev) => ({ ...prev, [moduleId]: next }));
    setSavingModuleId(moduleId);
    try {
      await updateUserModulePermissions(selectedUserId, moduleId, next);
      setSuccess('Permissions updated.');
    } catch (e) {
      // Revert
      setEffectivePerms((prev) => ({ ...prev, [moduleId]: current }));
      setError('Failed to update permissions.');
    } finally {
      setSavingModuleId(null);
    }
  };

  // Bulk actions
  const bulkApply = async (value) => {
    if (!selectedUserId) {
      setError('Please select a user first.');
      return;
    }
    const payload = {
      can_read: value,
      can_create: value,
      can_update: value,
      can_delete: value,
    };
    // Optimistic
    const old = effectivePerms;
    const optimistic = { ...effectivePerms };
    modules.forEach((m) => {
      optimistic[m.id] = payload;
    });
    setEffectivePerms(optimistic);
    try {
      await Promise.all(
        modules.map((m) => updateUserModulePermissions(selectedUserId, m.id, payload))
      );
      setSuccess(value ? 'All permissions granted.' : 'All permissions revoked.');
    } catch (e) {
      setEffectivePerms(old);
      setError('Bulk update failed.');
    }
  };

  // Create module handlers
  const openCreate = () => {
    setCreateForm({
      name: '',
      slug: '',
      description: '',
      default_read: false,
      default_create: false,
      default_update: false,
      default_delete: false,
    });
    setCreateOpen(true);
  };
  const closeCreate = () => setCreateOpen(false);
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((p) => ({ ...p, [name]: value }));
  };
  const handleCreateToggle = (name) => {
    setCreateForm((p) => ({ ...p, [name]: !p[name] }));
  };
  const submitCreateModule = async () => {
    if (!createForm.name || !createForm.slug) {
      setError('Name and slug are required.');
      return;
    }
    setCreating(true);
    try {
      await createModules(createForm);
      setSuccess('Module created.');
      closeCreate();
      // Refresh modules
      const modulesData = await getModules();
      setModules(modulesData || []);
      // Recompute effective perms with defaults for new module
      setEffectivePerms((prev) => ({ ...prev }));
    } catch (e) {
      setError('Failed to create module.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <FormControl fullWidth size="small" sx={{ minWidth: { md: 480 } }}>
              <InputLabel id="user-select-label">Select User</InputLabel>
              <Select
                labelId="user-select-label"
                label="Select User"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <MenuItem value="">Select User</MenuItem> {/* blank option to clear selection */}
                {users.map((u) => (
                  <MenuItem key={u.user_id} value={u.user_id}>
                    {u.user_id} - {u.full_name || u.email || u.mobile_number}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button variant="outlined" onClick={() => bulkApply(true)} disabled={!selectedUserId || loading || loadingPerms}>
                Select All
              </Button>
              <Button variant="outlined" color="warning" onClick={() => bulkApply(false)} disabled={!selectedUserId || loading || loadingPerms}>
                Revoke All
              </Button>
              {/* <Button variant="contained" onClick={openCreate} sx={{ backgroundColor: '#7267ef' }}>
                Create Module
              </Button> */}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Grid item>
            <Typography variant="h6" sx={{ color: '#7267ef' }}>Module Permissions</Typography>
          </Grid>
          <Grid item>
            {(loading || loadingPerms) && <CircularProgress size={20} />}
          </Grid>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Module</strong></TableCell>
                  <TableCell align="center" sx={{ color: '#7267ef' }}><strong>Read</strong></TableCell>
                  <TableCell align="center" sx={{ color: '#7267ef' }}><strong>Create</strong></TableCell>
                  <TableCell align="center" sx={{ color: '#7267ef' }}><strong>Update</strong></TableCell>
                  <TableCell align="center" sx={{ color: '#7267ef' }}><strong>Delete</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({ module: m, perms }) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.name}</TableCell>
                    {(['can_read', 'can_create', 'can_update', 'can_delete']).map((k) => (
                      <TableCell key={k} align="center">
                        <Checkbox
                          checked={Boolean(perms[k])}
                          onChange={() => handleToggle(m.id, k)}
                          disabled={!selectedUserId || savingModuleId === m.id}
                          color="primary"
                          inputProps={{ 'aria-label': `${m.name} ${k}` }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create Module Dialog */}
      <Dialog open={createOpen} onClose={closeCreate} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f7f7fb', color: '#2f2a8d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create Module
          <IconButton onClick={closeCreate} sx={{ color: '#7267ef' }} aria-label="Close dialog">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" name="name" value={createForm.name} onChange={handleCreateChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Slug" name="slug" value={createForm.slug} onChange={handleCreateChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label="Description" name="description" value={createForm.description} onChange={handleCreateChange} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Default Permissions</Typography>
              <FormGroup row>
                <FormControlLabel control={<Checkbox checked={createForm.default_read} onChange={() => handleCreateToggle('default_read')} />} label="Read" />
                <FormControlLabel control={<Checkbox checked={createForm.default_create} onChange={() => handleCreateToggle('default_create')} />} label="Create" />
                <FormControlLabel control={<Checkbox checked={createForm.default_update} onChange={() => handleCreateToggle('default_update')} />} label="Update" />
                <FormControlLabel control={<Checkbox checked={createForm.default_delete} onChange={() => handleCreateToggle('default_delete')} />} label="Delete" />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={closeCreate} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={submitCreateModule} disabled={creating} sx={{ backgroundColor: '#7267ef' }}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError('')} severity="error" variant="filled">{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={2000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRoleAccessControl;
