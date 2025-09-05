import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useMediaQuery,
  TableContainer,
  Snackbar,
  Alert,
  Divider,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { Edit, PersonOutline, EmailOutlined, PhoneIphone, LockOutlined, WorkOutline, GroupsOutlined, PersonAddAlt1, Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { createUser, getUser, getUserById, updateUser, getGroups } from '../../allapi/user';

// Role choices as provided
const ROLE_CHOICES = [
  { value: 'project manager', label: 'Project Manager' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'procurement officer', label: 'Procurement Officer' },
  { value: 'inventory manager', label: 'Inventory Manager' },
  { value: 'site supervisor', label: 'Site Supervisor' },
  { value: 'maintenance staff', label: 'Maintenance Staff' },
];

const UserRole = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Data
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Add user form
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    role: '',
    groups: [],
    password: '',
    password2: '',
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // Edit user form
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editGroups, setEditGroups] = useState([]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [usersData, groupsData] = await Promise.all([getUser(), getGroups()]);
        setUsers(usersData || []);
        setGroups(groupsData || []);
      } catch (e) {
        setError('Failed to load users or groups.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Handlers - pagination
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Search
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const parts = [
        u.user_id,
        u.full_name,
        u.email,
        u.mobile_number,
        u.role,
        ...(Array.isArray(u.groups) ? u.groups : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return parts.includes(q);
    });
  }, [users, searchQuery]);

  // Helper to show role label
  const roleLabel = (value) => ROLE_CHOICES.find((r) => r.value === value)?.label || (value || '-');

  // Open dialogs
  const openAddDialog = () => {
    setAddForm({
      full_name: '',
      email: '',
      mobile_number: '',
      role: '',
      groups: [],
      password: '',
      password2: '',
    });
    setAddOpen(true);
  };

  const openEditDialog = async (u) => {
    setSelectedUserId(u.user_id);
    setEditOpen(true);
    try {
      setLoading(true);
      const detail = await getUserById(u.user_id);
      const currentGroups = Array.isArray(detail?.groups) ? detail.groups : [];
      setEditGroups(currentGroups);
    } catch (e) {
      setError('Failed to load user details.');
      setEditGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Close dialogs
  const closeAdd = () => setAddOpen(false);
  const closeEdit = () => setEditOpen(false);

  // Add user submit
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddGroupsChange = (e) => {
    const value = e.target.value;
    setAddForm((prev) => ({ ...prev, groups: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleCreateUser = async () => {
    if (!addForm.full_name || !addForm.password || !addForm.password2) {
      setError('Please fill all required fields.');
      return;
    }
    if (addForm.password !== addForm.password2) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await createUser(addForm);
      setSuccess('User created successfully.');
      closeAdd();
      // Refresh list
      const newUsers = await getUser();
      setUsers(newUsers || []);
    } catch (e) {
      setError('Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  // Edit user submit (only groups)
  const handleEditGroupsChange = (e) => {
    const value = e.target.value;
    setEditGroups(typeof value === 'string' ? value.split(',') : value);
  };

  const handleUpdateUserGroups = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      await updateUser(selectedUserId, { groups: editGroups });
      setSuccess('User groups updated.');
      closeEdit();
      // Refresh list
      const updated = await getUser();
      setUsers(updated || []);
    } catch (e) {
      setError('Failed to update user groups.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
        <Grid item>
          <Typography variant="h6" sx={{ color: '#7267ef' }}>Users & Roles</Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={openAddDialog} sx={{ backgroundColor: '#7267ef' }}>Add User</Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                  <TableCell sx={{ color: '#7267ef' }}><strong>User ID</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Name</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Email</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Mobile</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Role</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Groups</strong></TableCell>
                  <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((u) => (
                    <TableRow key={u.user_id} hover>
                      <TableCell>{u.user_id}</TableCell>
                      <TableCell>{u.full_name || '-'}</TableCell>
                      <TableCell>{u.email || '-'}</TableCell>
                      <TableCell>{u.mobile_number || '-'}</TableCell>
                      <TableCell>{roleLabel(u.role)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(Array.isArray(u.groups) ? u.groups : []).map((g) => (
                            <Chip key={`${u.user_id}-${g}`} label={g} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton color="warning" onClick={() => openEditDialog(u)} aria-label="Edit groups">
                          <Edit sx={{ color: 'orange' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add User Dialog */}
      <Dialog
        open={addOpen}
        onClose={closeAdd}
        maxWidth="xl"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 3,
            boxShadow: 6,
            width: fullScreen ? '100vw' : 'min(1100px, 94vw)'
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#f7f7fb', color: '#2f2a8d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Create User</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Add a new team member and assign access</Typography>
          </Box>
          <IconButton onClick={closeAdd} sx={{ color: '#7267ef' }} aria-label="Close dialog">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: '#fff' }}>
          <Grid container spacing={4} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>Basic Information</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={addForm.full_name}
                onChange={handleAddChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={addForm.email}
                onChange={handleAddChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile_number"
                value={addForm.mobile_number}
                onChange={handleAddChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphone fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>Roles</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required variant="outlined" sx={{ minWidth: '100%', display: 'block' }}>
                <InputLabel id="role-label" shrink>Role</InputLabel>
                <Select
                  fullWidth
                  sx={{ width: '100%', '& .MuiSelect-select': { py: 1.75 } }}
                  size="medium"
                  displayEmpty
                  labelId="role-label"
                  id="role-select"
                  label="Role"
                  name="role"
                  value={addForm.role}
                  onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value }))}
                  input={<OutlinedInput label="Role" />}
                  renderValue={(selected) =>
                    selected ? (
                      ROLE_CHOICES.find((r) => r.value === selected)?.label || selected
                    ) : (
                      <Typography sx={{ color: 'text.disabled' }}>Select a role</Typography>
                    )
                  }
                >
                  {ROLE_CHOICES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>Groups</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required variant="outlined" sx={{ minWidth: '100%', display: 'block' }}>
                <InputLabel id="add-groups-label" shrink>Groups</InputLabel>
                <Select
                  fullWidth
                  sx={{ width: '100%', '& .MuiSelect-select': { py: 1.75 } }}
                  size="medium"
                  displayEmpty
                  labelId="add-groups-label"
                  id="groups-select"
                  multiple
                  value={addForm.groups}
                  onChange={handleAddGroupsChange}
                  label="Groups"
                  input={<OutlinedInput label="Groups" />}
                  renderValue={(selected) => {
                    if (!selected || selected.length === 0) {
                      return <Typography sx={{ color: 'text.disabled' }}>Select groups</Typography>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    );
                  }}
                >
                  {groups.map((g) => (
                    <MenuItem key={g.id} value={g.name}>
                      {g.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>Security</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={addForm.password}
                onChange={handleAddChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="password2"
                type={showPassword2 ? 'text' : 'password'}
                value={addForm.password2}
                onChange={handleAddChange}
                helperText={addForm.password && addForm.password2 && addForm.password !== addForm.password2 ? 'Passwords do not match' : ' '}
                error={Boolean(addForm.password && addForm.password2 && addForm.password !== addForm.password2)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword2 ? 'Hide confirm password' : 'Show confirm password'}
                        onClick={() => setShowPassword2((v) => !v)}
                        edge="end"
                      >
                        {showPassword2 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={closeAdd} variant="outlined" color="inherit">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={saving}
            sx={{ backgroundColor: '#7267ef' }}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <PersonAddAlt1 />}
          >
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Groups Dialog */}
      <Dialog open={editOpen} onClose={closeEdit} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle sx={{ backgroundColor: '#f3f3f3', color: '#7267ef', display: 'flex', justifyContent: 'space-between' }}>
          Update User Groups
          <IconButton onClick={closeEdit} sx={{ color: '#7267ef' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Only groups can be modified for an existing user.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="edit-groups-label">Groups</InputLabel>
            <Select
              labelId="edit-groups-label"
              multiple
              value={editGroups}
              onChange={handleEditGroupsChange}
              label="Groups"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.name}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={closeEdit} sx={{ color: '#800000' }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUserGroups} disabled={saving} sx={{ backgroundColor: '#7267ef' }}>
            {saving ? 'Saving...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError('')} severity="error" variant="filled">{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRole;
