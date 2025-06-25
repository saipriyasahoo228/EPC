import React, { useState } from 'react';
import {
  Button,
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
  IconButton,
  TablePagination,
  
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const UserRole = () => {
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = (user = null) => {
    setEditUser(user);
    setOpen(true);
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        password: user.password,
        confirmPassword: user.password,
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: '',
      });
    }
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateUserId = () => {
    const currentYear = new Date().getFullYear();
    const nextId = users.length + 1;
    return `USR-${currentYear}-${String(nextId).padStart(3, '0')}`;
  };

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (editUser) {
      const updated = users.map(u =>
        u.userId === editUser.userId ? { ...u, ...formData } : u
      );
      setUsers(updated);
    } else {
      const newUser = {
        userId: generateUserId(),
        ...formData,
      };
      setUsers([...users, newUser]);
    }
    setFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    setEditUser(null);
    handleClose();
  };

  const handleDelete = (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      const updated = users.filter((u) => u.userId !== userId);
      setUsers(updated);
    }
  };

  const filteredUsers = users.filter((u) =>
    Object.values(u).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredUsers.map((u) => [
      u.userId,
      u.name,
      u.username,
      u.role,
    ]);

    doc.autoTable({
      head: [['User ID', 'Name', 'Username', 'Role']],
      body: tableData,
    });

    doc.save('user_roles.pdf');
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div>
      <Button variant="contained" sx={{ mt: 4, mb: 2, backgroundColor: '#7267ef' }} onClick={() => handleOpen()}>
        Add User Role
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f3f3f3', color: '#7267ef', display: 'flex', justifyContent: 'space-between' }}>
          {editUser ? 'Edit User Role' : 'Add User Role'}
          <IconButton onClick={handleClose} sx={{ color: '#7267ef' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction="column" sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <label>User ID (Auto)</label>
              <input className="input" disabled value={editUser ? editUser.userId : generateUserId()} />
            </Grid>
            <Grid item xs={12}>
              <label>Name</label>
              <input className="input" name="name" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <label>Username</label>
              <input className="input" name="username" value={formData.username} onChange={handleChange} />
            </Grid>
       
           
<Grid item xs={12}>
  <label>Password</label>
  <div style={{ position: 'relative' }}>
    <input
      className="input"
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Enter password"
      style={{ paddingRight: '30px' }} // make space for the icon
    />
    {passwordsMatch && (
      <CheckCircleIcon
        sx={{
          color: 'green',
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}
      />
    )}
  </div>
</Grid>

<Grid item xs={12}>
  <label>Confirm Password</label>
  <div style={{ position: 'relative' }}>
    <input
      className="input"
      type="password"
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleChange}
      placeholder="Re-enter password"
      style={{ paddingRight: '30px' }}
    />
    {passwordsMatch && (
      <CheckCircleIcon
        sx={{
          color: 'green',
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}
      />
    )}
  </div>
</Grid>

            <Grid item xs={12}>
              <label>Role</label>
              <select className="input" name="role" value={formData.role} onChange={handleChange}>
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Manager">Manager</option>
              </select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <Button variant="outlined" onClick={handleSubmit} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6" gutterBottom sx={{ color: '#7267ef' }}>User Roles Report</Typography>
          </Grid>
          <Grid item>
            <Button onClick={handleExportPDF} sx={{ backgroundColor: '#7267ef', color: '#fff', mt: 2, mb: 2 }}>Export PDF</Button>
          </Grid>
        </Grid>
        <input
          type="text"
          placeholder="Search Users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#7267ef' }}><strong>User ID</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Name</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Username</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Role</strong></TableCell>
              <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u, i) => (
              <TableRow key={i}>
                <TableCell>{u.userId}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <IconButton color="warning" onClick={() => handleOpen(u)}>
                    <Edit sx={{ color: "orange" }} />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(u.userId)}>
                    <Delete sx={{ color: 'red' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    </div>
  );
};

export default UserRole;
