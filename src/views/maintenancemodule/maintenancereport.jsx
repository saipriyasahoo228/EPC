

import React, { useState ,useEffect} from "react";
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
import { getAssets,createWorkOrder ,getWorkOrders,updateWorkOrder,deleteWorkOrder} from "../../allapi/maintenance";



const MaintenanceReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [maintenancereport, setMaintenanceReport] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false); 

  // ✅ Fetch assets on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssets();
        setAssets(data); // assuming API returns an array
      } catch (error) {
        console.error("❌ Error loading assets:", error);
      }
    };

    fetchAssets();
  }, []);


  useEffect(() => {
  // fetch initial records
  const fetchReports = async () => {
    try {
      const data = await getWorkOrders();
      setMaintenanceReport(data);
    } catch (error) {
      console.error("❌ Failed to load work orders:", error);
    }
  };
  fetchReports();
}, []);


  const handleOpenForm = (assetId) => {
    setSelectedProjectId(assetId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = maintenancereport.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(4, '0');
    
    setFormData({ 
      workOrderID: `WO-${currentYear}-${paddedNumber}`,
      assetId: assetId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (record) => {
  setFormData({
    workOrderID:record.work_order_id,
    assetId: record.asset,
    reportedIssue: record.reported_issue,
    issueReportedBy: record.issue_reported_by,
    reportDate: record.report_date,
    inspectionDate: record.inspection_date,
    technicianId: record.technician_id,
    repairWorkDone: record.repair_work_done,
    partsReplaced: record.parts_replaced,
    totalMaintenanceCost: record.total_maintenance_cost,
    completionDate: record.completion_date,
    finalStatus: record.final_status,
  });
  setEditingId(record.work_order_id); // tells handleSubmit to run PUT
  setOpen(true);
};


  const handleDelete = async (workOrderId) => {
  if (!window.confirm(`Are you sure you want to delete this work order?  ${workOrderId}`)) return;

  try {
    await deleteWorkOrder(workOrderId);
    alert(`🗑️ Work order ${workOrderId} deleted successfully`);

    // 🔹 remove from state without refetch
    setMaintenanceReport((prev) =>
      prev.filter((wo) => wo.work_order_id !== workOrderId)
    );
  } catch (error) {
    alert("❌ Failed to delete work order");
    console.error(error);
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



const handleSubmit = async () => {
  try {
    const payload = {
      asset: formData.assetId,
      reported_issue: formData.reportedIssue,
      issue_reported_by: formData.issueReportedBy,
      report_date: formData.reportDate,
      inspection_date: formData.inspectionDate || null,
      technician_id: formData.technicianId,
      repair_work_done: formData.repairWorkDone,
      parts_replaced: formData.partsReplaced || null,
      total_maintenance_cost: parseFloat(formData.totalMaintenanceCost || 0),
      completion_date: formData.completionDate || null,
      final_status: formData.finalStatus,
    };

    if (editingId) {
      // 🔹 Update existing record
      const res = await updateWorkOrder(editingId, payload);
      alert(`✏️ Work order updated: ${res.work_order_id}`);
    } else {
      // 🔹 Create new record
      const res = await createWorkOrder(payload);
      alert(`✅ Work order created: ${res.work_order_id}`);
    }

    // 🔹 Refresh list
    const updated = await getWorkOrders();
    setMaintenanceReport(updated);

    handleClose();
    setEditingId(null); // reset
    setFormData({});   // clear form
  } catch (error) {
    alert("❌ Failed to save work order");
    console.error(error);
  }
};


  const filteredMaintenancereport = maintenancereport.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Maintenance Management Report</Typography>
      
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
            <Typography variant="h6" gutterBottom>Maintenance Management Report</Typography>
            <input
              type="text"
              placeholder="Search Maintenance Details"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>WorkOrder ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Reported Issuees</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Issuees ReportedBy</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Report Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Technician ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Repair WorkDone</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Parts Replaced</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Total Maintenance Cost</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Completion Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Final Status</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaintenancereport.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.asset}</TableCell>
                      <TableCell>{t.work_order_id}</TableCell>
                      <TableCell>{t.reported_issue}</TableCell>
                      <TableCell>{t.issue_reported_by}</TableCell>
                      <TableCell>{t.report_date}</TableCell>
                      <TableCell>{t.inspection_date}</TableCell>
                      <TableCell>{t.technician_id}</TableCell>
                      <TableCell>{t.repair_work_done}</TableCell>
                      <TableCell>{t.parts_replaced}</TableCell>
                      <TableCell>{t.total_maintenance_cost}</TableCell>
                      <TableCell>{t.completion_date}</TableCell>
                      <TableCell>{t.final_status}</TableCell>
                      
                      <TableCell>
                        <IconButton onClick={() => handleEdit(t)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(t.work_order_id)} color="error">
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
          {isEditMode ? "Edit Maintenance Report" : "Enter Maintenance Report"}
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
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Maintenance Report</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <label htmlFor="projectId">Asset ID</label>
          <input
            id="projectId"
            name="projectId"
            className="input"
            value={formData.assetId || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="workOrderID">Work Order ID</label>
          <input
            id="workOrderID"
            name="workOrderID"
            className="input"
            value={formData.workOrderID || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>

        

        <Grid item xs={6}>
          <label htmlFor="reportedIssue">Reported Issue</label>
          <textarea
            id="reportedIssue"
            name="reportedIssue"
            className="input"
            rows="3"
            value={formData.reportedIssue || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="issueReportedBy">Issue Reported By</label>
          <input
            id="issueReportedBy"
            name="issueReportedBy"
            className="input"
            value={formData.issueReportedBy || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="reportDate">Report Date</label>
          <input
            type="date"
            id="reportDate"
            name="reportDate"
            className="input"
            value={formData.reportDate || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="inspectionDate">Inspection Date</label>
          <input
            type="date"
            id="inspectionDate"
            name="inspectionDate"
            className="input"
            value={formData.inspectionDate || ''}
            onChange={handleChange}
          />
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
          <label htmlFor="repairWorkDone">Repair Work Done</label>
          <textarea
            id="repairWorkDone"
            name="repairWorkDone"
            className="input"
            rows="3"
            value={formData.repairWorkDone || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="partsReplaced">Parts Replaced</label>
          <textarea
            id="partsReplaced"
            name="partsReplaced"
            className="input"
            rows="2"
            value={formData.partsReplaced || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="totalMaintenanceCost">Total Maintenance Cost</label>
          <input
            type="number"
            step="0.01"
            id="totalMaintenanceCost"
            name="totalMaintenanceCost"
            className="input"
            value={formData.totalMaintenanceCost || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="completionDate">Completion Date</label>
          <input
            type="date"
            id="completionDate"
            name="completionDate"
            className="input"
            value={formData.completionDate || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="finalStatus">Final Status</label>
          <select
            id="finalStatus"
            name="finalStatus"
            className="input"
            value={formData.finalStatus || ''}
            onChange={handleChange}
          >
            <option value="">-- Select Status --</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending Approval</option>
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
           {editingId ? "Update" : "Create"}

          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaintenanceReport;