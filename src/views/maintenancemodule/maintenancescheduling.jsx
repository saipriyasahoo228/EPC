

import React, { useState , useEffect} from "react";
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
import { getAssets ,createMaintenanceSchedule,getMaintenanceSchedules,deleteMaintenanceSchedule,updateMaintenanceSchedule} from "../../allapi/maintenance";



const AssetScheduling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [formData, setFormData] = useState({});
  const [maintenance, setMaintenance] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [editingId, setEditingId] = useState(null);




  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssets();
        setAssets(data); // API should return a list of assets
      } catch (error) {
        console.error("❌ Failed to fetch assets:", error);
      }
    };
    fetchAssets();
  }, []);

//Get all maintenance schedules
  const fetchSchedules = async () => {
  try {
    const data = await getMaintenanceSchedules();
    setMaintenance(data);
    console.log(data);
  } catch (error) {
    console.error("❌ Error loading schedules:", error);
  }
};

// ✅ run fetchSchedules on mount
useEffect(() => {
  fetchSchedules();
}, []);


  const handleOpenForm = (assetId) => {
    setSelectedAssetId(assetId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = maintenance.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(3, '0');
    
    setFormData({ 
      maintenanceID: `MNT-${currentYear}-${paddedNumber}`,
      assetId: assetId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (record) => {
  setFormData({
    assetId: record.asset || "",
    maintenanceID: record.maintenance_id || "",
    maintenanceType: record.maintenance_type || "",
    scheduledDate: record.scheduled_date || "",
    frequency: record.frequency || "",
    technicianId: record.assigned_technician_id || "",
    taskDescription: record.task_description || "",
    sparePart: record.spare_parts_required || "",
    EstimatedDowntime: record.estimated_downtime || "",
    approvalStatus: record.approval_status || "Pending",
  });

  setEditingId(record.maintenance_id); // ⚡ store ID for PATCH
  setOpen(true); // open the form dialog
};


  const handleDelete = async (maintenanceId) => {
  if (!window.confirm(`Are you sure you want to delete schedule ${maintenanceId}?`)) return;

  try {
    await deleteMaintenanceSchedule(maintenanceId);
    alert(`✅ Schedule ${maintenanceId} deleted successfully!`);
    
    // refresh the list
    const updatedSchedules = await getMaintenanceSchedules();
    setMaintenance(updatedSchedules);
  } catch (error) {
    alert(`❌ Failed to delete schedule:\n${JSON.stringify(error.response?.data || error.message, null, 2)}`);
    console.error("❌ Delete error:", error);
  }
};


  const handleClose = () => {
    setOpen(false);
    setFormData({});
    setIsEditMode(false);
    setCurrentEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



// 🔹 Handle submit
const handleSubmit = async () => {
  try {
    const payload = {
      asset_id: formData.assetId || "",
      maintenance_type: formData.maintenanceType || "",
      scheduled_date: formData.scheduledDate || "",
      frequency: formData.frequency || "",
      assigned_technician_id: formData.technicianId || "",
      task_description: formData.taskDescription || "",
      spare_parts_required: formData.sparePart || "",
      estimated_downtime: formData.EstimatedDowntime || null,
      approval_status: formData.approvalStatus || "Pending",
    };

    const res = await createMaintenanceSchedule(payload);

    alert(`✅ Maintenance Schedule created!\nGenerated ID: ${res.data.maintenance_id}`);

    // 🔹 Refresh schedules list after submit
    fetchSchedules();

    // 🔹 Reset + Close
    setFormData({});
    handleClose();
  } catch (error) {
    const message = error.response?.data?.detail || error.response?.data || error.message;
    alert(`❌ Failed to create schedule:\n${JSON.stringify(message, null, 2)}`);
  }
};
// const handleSubmit = async () => {
//   try {
//     const payload = {
//       asset: formData.assetId || "",
//       maintenance_type: formData.maintenanceType || "",
//       scheduled_date: formData.scheduledDate || "",
//       frequency: formData.frequency || "",
//       assigned_technician_id: formData.technicianId || "",
//       task_description: formData.taskDescription || "",
//       spare_parts_required: formData.sparePart || "",
//       estimated_downtime: formData.EstimatedDowntime || null,
//       approval_status: formData.approvalStatus || "Pending",
//     };

//     let res;

//     if (editingId) {
//       // 🔹 Update
//       res = await updateMaintenanceSchedule(editingId, payload);
//       alert(`✅ Maintenance Schedule updated!\nID: ${res.data.maintenance_id}`);
//     } else {
//       // 🔹 Create
//       res = await createMaintenanceSchedule(payload);
//       alert(`✅ Maintenance Schedule created!\nID: ${res.data.maintenance_id}`);
//     }

//     // 🔹 Refresh schedules
//     const updatedSchedules = await getMaintenanceSchedules();
//     setMaintenance(updatedSchedules);

//     // 🔹 Reset + Close
//     setFormData({});
//     setEditingId(null);
//     handleClose();
//   } catch (error) {
//     const message = error.response?.data?.detail || error.response?.data || error.message;
//     alert(`❌ Failed to submit schedule:\n${JSON.stringify(message, null, 2)}`);
//     console.error("❌ HandleSubmit error:", error);
//   }
// };


  const filteredMaintenance = maintenance.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Maintenance Scheduling Details</Typography>
      
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>
              ASSETS RECORDS
            </Typography>

            {/* Search Input */}
            <Box sx={{ my: 2, mx: 1 }}>
              <input
                type="text"
                placeholder="Search Asset ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Asset ID</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
      {assets
        .filter(asset =>
          asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((asset, i) => (
          <TableRow key={i}>
            <TableCell>{asset.asset_id}</TableCell>
            <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                onClick={() => handleOpenForm(asset.asset_id)}
                color="primary"
              >
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
            <Typography variant="h6" gutterBottom>Maintenance Scheduling Details</Typography>
            <input
              type="text"
              placeholder="Search Maintenance Scheduling Details"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4, marginBottom: '16px' }}
            />

            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Maintenance ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Maintenance Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Scheduled Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Frequency</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Assigned TechnicianId</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Task Description</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Spare Parts Required</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Estimated Downtime</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Approval Status</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
               <TableBody>
  {filteredMaintenance.map((t, i) => (
    <TableRow key={i}>
      <TableCell>{t.asset_id}</TableCell>
      <TableCell>{t.maintenance_id}</TableCell>
      <TableCell>{t.maintenance_type}</TableCell>
      <TableCell>{t.scheduled_date}</TableCell>
      <TableCell>{t.frequency}</TableCell>
      <TableCell>{t.assigned_technician_id}</TableCell>
      <TableCell>{t.task_description}</TableCell>
      <TableCell>{t.spare_parts_required}</TableCell>
      <TableCell>{t.estimated_downtime}</TableCell>
      <TableCell>{t.approval_status}</TableCell>
      <TableCell>
        <IconButton onClick={() => handleEdit(t)} color="warning">
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        <IconButton onClick={() => handleDelete(t.maintenance_id)} color="error">
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
        <DialogTitle>
          {isEditMode ? "Edit Maintenance Scheduling Details" : "Enter Maintenance Scheduling Details"}
        </DialogTitle>
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
    {/* Asset Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Maintenance Scheduling Info..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <label htmlFor="assetId">Asset ID</label>
          <input
            id="assetId"
            name="assetId"
            className="input"
            value={formData.assetId || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="maintenanceID">Maintenance ID</label>
          <input
            id="maintenanceID"
            name="maintenanceID"
            className="input"
            value={formData.maintenanceID || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
  <label htmlFor="maintenanceType">Maintenance Type</label>
  <select
    id="maintenanceType"
    name="maintenanceType"
    className="input"
    value={formData.maintenanceType || ''}
    onChange={handleChange}
  >
    <option value="">Select Type</option>
    <option value="Preventive">Preventive</option>
    <option value="Predictive">Predictive</option>
    <option value="Corrective">Corrective</option>
    <option value="Breakdown">Breakdown</option>
  </select>
</Grid>

        <Grid item xs={6}>
          <label htmlFor="scheduledDate">Scheduled Date</label>
          <input
            type="date"
            id="scheduledDate"
            name="scheduledDate"
            className="input"
            value={formData.scheduledDate || ''}
            onChange={handleChange}
          />
        </Grid>
       <Grid item xs={6}>
  <label htmlFor="frequency">Frequency</label>
  <select
    id="frequency"
    name="frequency"
    className="input"
    value={formData.frequency || ""}
    onChange={handleChange}
  >
    <option value="">-- Select Frequency --</option>
    <option value="Daily">Daily</option>
    <option value="Weekly">Weekly</option>
    <option value="Monthly">Monthly</option>
    <option value="Quarterly">Quarterly</option>
    <option value="Annually">Annually</option>
  </select>
</Grid>

        <Grid item xs={6}>
          <label htmlFor="technicianId">Technician ID</label>
          <input
            id="technicianId"
            name="technicianId"
            className="input"
            value={formData.technicianId || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="taskDescription">Task Description</label>
          <input
            id="taskDescription"
            name="taskDescription"
            className="input"
            value={formData.taskDescription || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="purchaseDate">Purchase Date</label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            className="input"
            value={formData.purchaseDate || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="sparePart">Spare Parts Required</label>
          <input
            
            id="sparePart"
            name="sparePart"
            className="input"
            value={formData.sparePart || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={6}>
          <label htmlFor="EstimatedDowntime">Estimated Downtime</label>
          <input
            type="number"
            id="EstimatedDowntime"
            name="EstimatedDowntime"
            className="input"
            value={formData.EstimatedDowntime || ''}
            onChange={handleChange}
          />
        </Grid>
       <Grid item xs={6}>
  <label htmlFor="approvalStatus">Approval Status</label>
  <select
    id="approvalStatus"
    name="approvalStatus"
    className="input"
    value={formData.approvalStatus || ''}
    onChange={handleChange}
  >
    <option value="">-- Select Status --</option>
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
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
              outline: '2px solid #800000',
              color: '#800000',
              '&:hover': {
                outline: '2px solid #b30000',
                color: '#b30000',
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="outlined"
            onClick={handleSubmit}
            sx={{
              borderColor: '#7267ef',
              color: '#7267ef',
              '&:hover': {
                borderColor: '#9e8df2',
                color: '#9e8df2',
              }
            }}
          >
             {editingId ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetScheduling;