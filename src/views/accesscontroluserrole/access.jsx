
// import React, { useState } from 'react';
// import {
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Paper,
//   Typography,
//   IconButton,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

// const modulesList = [
//   'Inventory',
//   'Reports',
//   'Financial',
//   'Accounts Payable',
//   'Accounts Receivable',
//   'Projects',
// ];

// const UserRoleAccessControl = () => {
//   const [open, setOpen] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [formData, setFormData] = useState({
//     name: '',
//     username: '',
//     role: '',
//     permissions: {},
//   });
//   const [editUserId, setEditUserId] = useState(null);

//   // Open Dialog (add or edit)
//   const handleOpen = (user = null) => {
//     if (user) {
//       setFormData({
//         name: user.name,
//         username: user.username,
//         role: user.role,
//         permissions: user.permissions,
//       });
//       setEditUserId(user.id);
//     } else {
//       const permissionsInit = {};
//       modulesList.forEach((mod) => {
//         permissionsInit[mod] = { read: false, write: false, update: false };
//       });
//       setFormData({
//         name: '',
//         username: '',
//         role: '',
//         permissions: permissionsInit,
//       });
//       setEditUserId(null);
//     }
//     setOpen(true);
//   };

//   const handleClose = () => setOpen(false);

//   // Handle text field change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Toggle permission checkbox
//   const handlePermissionChange = (module, perm) => {
//     setFormData((prev) => ({
//       ...prev,
//       permissions: {
//         ...prev.permissions,
//         [module]: {
//           ...prev.permissions[module],
//           [perm]: !prev.permissions[module][perm],
//         },
//       },
//     }));
//   };

//   // Save user (add or update)
//   const handleSubmit = () => {
//     if (editUserId) {
//       // Update existing user
//       const updated = users.map((u) =>
//         u.id === editUserId ? { ...u, ...formData } : u
//       );
//       setUsers(updated);
//     } else {
//       // Add new user
//       const newUser = {
//         id: `USR-${new Date().getFullYear()}-${String(users.length + 1).padStart(3, '0')}`,
//         ...formData,
//       };
//       setUsers([...users, newUser]);
//     }
//     handleClose();
//   };

//   // Delete user
//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       const updated = users.filter((u) => u.id !== id);
//       setUsers(updated);
//     }
//   };

//   return (
//     <div>
//       <Button
//         variant="contained"
//         sx={{ mt: 4, mb: 2, backgroundColor: '#7267ef' }}
//         onClick={() => handleOpen()}
//       >
//         Add User with Access Control
//       </Button>

//       {/* Form Dialog */}
//       <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//         <DialogTitle
//           sx={{
//             backgroundColor: '#f3f3f3',
//             color: '#7267ef',
//             display: 'flex',
//             justifyContent: 'space-between',
//           }}
//         >
//           {editUserId ? 'Edit User Access Control' : 'Add User Access Control'}
//           <IconButton onClick={handleClose} sx={{ color: '#7267ef' }}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={6}>
//               <label>Name</label>
//               <input
//                 className="input"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter name"
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <label>Username</label>
//               <input
//                 className="input"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 placeholder="Enter username"
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <label>Role</label>
//               <input
//                 className="input"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 placeholder="Enter user role"
//               />
//             </Grid>

//             <Grid item xs={12}>
//   <Typography
//     variant="h6"
//     sx={{ color: '#7267ef', mt: 2, mb: 1 }}
//   >
//     Module Permissions
//   </Typography>
//   <Paper sx={{ p: 2, border: '1px solid #ccc', width: '100%', overflowX: 'auto' }}>
//     <Table sx={{ minWidth: '100%' }}>
//       <TableHead>
//         <TableRow sx={{ backgroundColor: '#f3f3f3' }}>
//           <TableCell><strong>Module</strong></TableCell>
//           <TableCell align="center"><strong>Read</strong></TableCell>
//           <TableCell align="center"><strong>Write</strong></TableCell>
//           <TableCell align="center"><strong>Update</strong></TableCell>
//         </TableRow>
//       </TableHead>
//       <TableBody>
//         {modulesList.map((mod) => (
//           <TableRow key={mod}>
//             <TableCell>{mod}</TableCell>
//             {['read', 'write', 'update'].map((perm) => (
//               <TableCell key={perm} align="center">
//                 <input
//                   type="checkbox"
//                   checked={
//                     formData.permissions[mod]
//                       ? formData.permissions[mod][perm]
//                       : false
//                   }
//                   onChange={() => handlePermissionChange(mod, perm)}
//                 />
//               </TableCell>
//             ))}
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   </Paper>
// </Grid>

//           </Grid>
//         </DialogContent>
//         <DialogActions sx={{ pr: 3, pb: 2 }}>
//           <Button
//             onClick={handleClose}
//             sx={{ outline: '2px solid #800000', color: '#800000' }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="outlined"
//             onClick={handleSubmit}
//             sx={{ borderColor: '#7267ef', color: '#7267ef' }}
//           >
//             {editUserId ? 'Update' : 'Submit'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* User Report */}
//       <Paper sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
//         <Typography variant="h6" sx={{ color: '#7267ef', mb: 2 }}>
//           User Roles & Permissions Report
//         </Typography>
//         {users.length === 0 ? (
//           <Typography>No records yet.</Typography>
//         ) : (
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell sx={{ color: '#7267ef' }}>
//                   <strong>User ID</strong>
//                 </TableCell>
//                 <TableCell sx={{ color: '#7267ef' }}>
//                   <strong>Name</strong>
//                 </TableCell>
//                 <TableCell sx={{ color: '#7267ef' }}>
//                   <strong>Username</strong>
//                 </TableCell>
//                 <TableCell sx={{ color: '#7267ef' }}>
//                   <strong>Role</strong>
//                 </TableCell>
//                 <TableCell sx={{ color: '#7267ef' }}>
//                   <strong>Permissions</strong>
//                 </TableCell>
//                 <TableCell sx={{ color: '#7267ef' }}>
//                   <strong>Actions</strong>
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {users.map((u, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{u.id}</TableCell>
//                   <TableCell>{u.name}</TableCell>
//                   <TableCell>{u.username}</TableCell>
//                   <TableCell>{u.role}</TableCell>
//                   <TableCell>
//                     {Object.entries(u.permissions)
//                       .filter(([_, perms]) =>
//                         Object.values(perms).some(Boolean)
//                       )
//                       .map(([mod, perms]) => (
//                         <div key={mod}>
//                           <strong>{mod}:</strong>{' '}
//                           {['read', 'write', 'update']
//                             .filter((p) => perms[p])
//                             .join(', ')}
//                         </div>
//                       ))}
//                   </TableCell>
//                   <TableCell>
//                     <IconButton
//                       color="primary"
//                       onClick={() => handleOpen(u)}
//                     >
//                       <EditIcon sx={{ color: "orange" }}/>
//                     </IconButton>
//                     <IconButton
//                       color="error"
//                       onClick={() => handleDelete(u.id)}
//                     >
//                       <DeleteIcon sx={{ color: "red" }}/>
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </Paper>
//     </div>
//   );
// };

// export default UserRoleAccessControl;















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
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const modulesList = [
  'Inventory',
  'Reports',
  'Financial',
  'Accounts Payable',
  'Accounts Receivable',
  'Projects',
];

const UserRoleAccessControl = () => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: '',
    permissions: {},
  });
  const [editUserId, setEditUserId] = useState(null);

  // Open Dialog (add or edit)
  const handleOpen = (user = null) => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      });
      setEditUserId(user.id);
    } else {
      const permissionsInit = {};
      modulesList.forEach((mod) => {
        permissionsInit[mod] = { read: false, write: false, update: false };
      });
      setFormData({
        name: '',
        username: '',
        role: '',
        permissions: permissionsInit,
      });
      setEditUserId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Handle text field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle permission checkbox
  const handlePermissionChange = (module, perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [perm]: !prev.permissions[module][perm],
        },
      },
    }));
  };

  // Save user (add or update)
  const handleSubmit = () => {
    if (editUserId) {
      // Update existing user
      const updated = users.map((u) =>
        u.id === editUserId ? { ...u, ...formData } : u
      );
      setUsers(updated);
    } else {
      // Add new user
      const newUser = {
        id: `USR-${new Date().getFullYear()}-${String(users.length + 1).padStart(3, '0')}`,
        ...formData,
      };
      setUsers([...users, newUser]);
    }
    handleClose();
  };

  // Delete user
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        sx={{ mt: 4, mb: 2, backgroundColor: '#7267ef' }}
        onClick={() => handleOpen()}
      >
        Add User with Access Control
      </Button>

      {/* Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: '#f3f3f3',
            color: '#7267ef',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {editUserId ? 'Edit User Access Control' : 'Add User Access Control'}
          <IconButton onClick={handleClose} sx={{ color: '#7267ef' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <label>Name</label>
              <input
                className="input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={6}>
              <label>Username</label>
              <input
                className="input"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12}>
              <label>Role</label>
              <input
                className="input"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Enter user role"
                style={{ width: '100%' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ color: '#7267ef', mt: 2, mb: 1 }}
              >
                Module Permissions
              </Typography>
              <Paper
                sx={{
    p: 2,
    border: '1px solid #7267ef',
    width: '100%',
    overflowX: 'auto',
  }}
              >
                <Table sx={{ minWidth: '800px' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f3f3f3' }}>
                      <TableCell><strong>Module</strong></TableCell>
                      <TableCell align="center"><strong>Read</strong></TableCell>
                      <TableCell align="center"><strong>Write</strong></TableCell>
                      <TableCell align="center"><strong>Update</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modulesList.map((mod) => (
                      <TableRow key={mod}>
                        <TableCell>{mod}</TableCell>
                        {['read', 'write', 'update'].map((perm) => (
                          <TableCell key={perm} align="center">
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions[mod]
                                  ? formData.permissions[mod][perm]
                                  : false
                              }
                              onChange={() => handlePermissionChange(mod, perm)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            sx={{ outline: '2px solid #800000', color: '#800000' }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleSubmit}
            sx={{ borderColor: '#7267ef', color: '#7267ef' }}
          >
            {editUserId ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Report */}
      <Paper sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
        <Typography variant="h6" sx={{ color: '#7267ef', mb: 2 }}>
          User Roles & Permissions Report
        </Typography>
        {users.length === 0 ? (
          <Typography>No records yet.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#7267ef' }}>
                  <strong>User ID</strong>
                </TableCell>
                <TableCell sx={{ color: '#7267ef' }}>
                  <strong>Name</strong>
                </TableCell>
                <TableCell sx={{ color: '#7267ef' }}>
                  <strong>Username</strong>
                </TableCell>
                <TableCell sx={{ color: '#7267ef' }}>
                  <strong>Role</strong>
                </TableCell>
                <TableCell sx={{ color: '#7267ef' }}>
                  <strong>Permissions</strong>
                </TableCell>
                <TableCell sx={{ color: '#7267ef' }}>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, i) => (
                <TableRow key={i}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    {Object.entries(u.permissions)
                      .filter(([_, perms]) =>
                        Object.values(perms).some(Boolean)
                      )
                      .map(([mod, perms]) => (
                        <div key={mod}>
                          <strong>{mod}:</strong>{' '}
                          {['read', 'write', 'update']
                            .filter((p) => perms[p])
                            .join(', ')}
                        </div>
                      ))}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(u)}
                    >
                      <EditIcon sx={{ color: 'orange' }} />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(u.id)}
                    >
                      <DeleteIcon sx={{ color: 'red' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </div>
  );
};

export default UserRoleAccessControl;
