import React, { useState ,useEffect} from "react";
import { Maximize2, Minimize2 } from "lucide-react";
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
import { getPurchaseOrders } from "../../allapi/procurement"; 
import { createAsset ,getAssets,deleteAsset,updateAsset} from "../../allapi/maintenance";
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";
import { formatDateDDMMYYYY } from '../../utils/date';

const AssetManagement = () => {
  const MODULE_SLUG = 'maintenance';
  const [editingId, setEditingId] = useState(null);
  const [isModalMaximized, setIsModalMaximized] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [assetmanagement, setAssetManagement] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);


  const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPurchaseOrders();
        // 🟢 adapt response to match table structure
        const formatted = data.map((item) => ({
          poId: item.po_number,          // <-- backend PO field
          procurementId: item.procurement, // <-- backend Procurement ID
        }));
        setPurchaseOrders(formatted);
      } catch (error) {
        console.error("❌ Error fetching purchase orders:", error);
      }
    };

    fetchData();
  }, []);

   // ✅ Fetch assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssets();
        setAssetManagement(data);
      } catch (error) {
        console.error("❌ Failed to load assets:", error);
      }
    };

    fetchAssets();
  }, []);
  

  const handleOpenForm = (poId,procurementId) => {
    setSelectedProjectId(poId,procurementId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = assetmanagement.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(3, '0');
    
    setFormData({ 
      assetId: `AST-${currentYear}-${paddedNumber}`,
      poId: poId,
      procurementId:procurementId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

  const handleEdit = (record) => {
  setFormData({
    assetId:record.asset_id || "",
    assetName: record.asset_name || "",
    assetType: record.asset_type || "",
    modelNumber: record.model_number || "",
    serialNumber: record.serial_number || "",
    location: record.location || "",
    purchaseDate: record.purchase_date || "",
    warrantyExpiryDate: record.warranty_expiry_date || "",
    procurementId: record.procurement_id || "",
    maintenanceRequirement: record.maintenance_requirement || "",
    currentCondition: record.current_condition || "",
    usefullLife: record.useful_life_years || "",
    poId: record.purchase_order || "",
  });

  setEditingId(record.asset_id); // ⚡ Use asset_id for PATCH
  setOpen(true); // open the form dialog
};

  // delete handler
const handleDelete = async (assetId) => {
  if (!window.confirm(`Are you sure you want to delete asset ${assetId}?`)) return;
  try {
    await deleteAsset(assetId);
    alert(`✅ Asset ${assetId} deleted successfully`);
    setAssetManagement((prev) => prev.filter((a) => a.asset_id !== assetId));
  } catch (error) {
    alert(`❌ Failed to delete asset ${assetId}`);
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

//HandleSubmit

const handleSubmit = async () => {
  try {
    const payload = {
      asset_name: formData.assetName || "",
      asset_type: formData.assetType || "",
      model_number: formData.modelNumber || "",
      serial_number: formData.serialNumber || "",
      location: formData.location || "",
      purchase_date: formData.purchaseDate || "",
      warranty_expiry_date: formData.warrantyExpiryDate || "",
      procurement_id: formData.procurementId || "",
      maintenance_requirement: formData.maintenanceRequirement || "",
      current_condition: formData.currentCondition || "",
      useful_life_years: formData.usefullLife || 5,
      purchase_order: formData.poId || "",
    };

    let res;

    if (editingId) {
      // 🔹 Update existing asset (PATCH)
      res = await updateAsset(editingId, payload);
      alert(`✏️ Asset updated successfully! (${editingId})`);
    } else {
      // 🔹 Create new asset (POST)
      res = await createAsset(payload);
      alert(`✅ Asset created successfully!\nGenerated Asset ID: ${res.asset_id}`);
    }

    // 🔹 Refresh list after submit/update
    const updatedAssets = await getAssets();
    setAssetManagement(updatedAssets);

    // Reset state
    setFormData({});
    setEditingId(null);
    handleClose();
  } catch (error) {
    // ✅ Show exact backend error in alert
    const message = error.response?.data?.detail || error.response?.data || error.message;
    alert(`❌ Failed to submit asset:\n${JSON.stringify(message, null, 2)}`);
    console.error("❌ Error submitting asset:", error);
  }
};


  const filteredAsset = assetmanagement.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Assets Management</Typography>
      
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>
              Purchase & Procurement Details
            </Typography>

            {/* Search Input */}
            <Box sx={{ my: 2, mx: 1 }}>
              <input
                type="text"
                placeholder="Search Purchase & Procurement"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>PurchaseOrder ID</strong></TableCell>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Procurement ID</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
      {purchaseOrders
        .filter(
          (proj) =>
            proj.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proj.procurementId.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((proj, i) => (
          <TableRow key={i}>
            <TableCell>{proj.poId}</TableCell>
            <TableCell>{proj.procurementId}</TableCell>
            <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ShowIfCan slug={MODULE_SLUG} action="can_create">

              <IconButton onClick={() => handleOpenForm(proj.poId,proj.procurementId)} color="primary">
                <AddCircle sx={{ color: "#7267ef" }} />
              </IconButton>
              </ShowIfCan>
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
            <Typography variant="h6" gutterBottom>Assets Details</Typography>
            <input
              type="text"
              placeholder="Search Assets Management Details"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4, marginBottom: '16px' }}
            />

            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color:'#7267ef'}}><strong>Purchase Order</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>ProcurementId</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset Name</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Asset Type</strong></TableCell>
                    
                    <TableCell sx={{color:'#7267ef'}}><strong>Model Number</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Serial Number</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Location</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Purchase Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Warranty Expiry Date</strong></TableCell>
                    
                    <TableCell sx={{color:'#7267ef'}}><strong>Maintenance Requirment</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Current Condition</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Usefull Life</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Depreciation Value</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
               <TableBody>
  {filteredAsset.map((t, i) => (
    <TableRow key={i}>
       <TableCell>{t.purchase_order}</TableCell>   
      <TableCell>{t.procurement_id}</TableCell>   
      <TableCell>{t.asset_id}</TableCell>
      <TableCell>{t.asset_name}</TableCell>
      <TableCell>{t.asset_type}</TableCell>
      <TableCell>{t.model_number}</TableCell>
      <TableCell>{t.serial_number}</TableCell>
      <TableCell>{t.location}</TableCell>
      <TableCell>{formatDateDDMMYYYY(t.purchase_date)}</TableCell>
      <TableCell>{formatDateDDMMYYYY(t.warranty_expiry_date)}</TableCell>
      <TableCell>{t.maintenance_requirement}</TableCell>
      <TableCell>{t.current_condition}</TableCell>
      <TableCell>{t.useful_life_years}</TableCell>
      <TableCell>{t.depreciation_value}</TableCell>
     

      <TableCell>
      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

        <IconButton onClick={() => handleEdit(t)} color="warning">
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
        <IconButton onClick={() => handleDelete(t.asset_id)} color="error">
          <Delete sx={{ color: "red" }} />
        </IconButton>
        </ShowIfCan>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      
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


        <DialogTitle>
          {isEditMode ? "Edit Asset Management Details" : "Enter Assets Management Details"}
        </DialogTitle>
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
    {/* Asset Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Asset Information</h3>
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
          <label htmlFor="procurementId">procurement ID</label>
          <input
            id="procurementId"
            name="procurementId"
            className="input"
            value={formData.procurementId || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="poId">PurchaseOrder ID</label>
          <input
            id="poId"
            name="poId"
            className="input"
            value={formData.poId || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="assetName">Asset Name</label>
          <input
            id="assetName"
            name="assetName"
            className="input"
            value={formData.assetName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="assetType">Asset Type</label>
          <input
            
            id="assetType"
            name="assetType"
            className="input"
            value={formData.assetType || ''}
            onChange={handleChange}
          />
        </Grid>
         
        <Grid item xs={6}>
          <label htmlFor="modelNumber">Model Number</label>
          <input
            id="modelNumber"
            name="modelNumber"
            className="input"
            value={formData.modelNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="serialNumber">Serial Number</label>
          <input
            id="serialNumber"
            name="serialNumber"
            className="input"
            value={formData.serialNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            className="input"
            value={formData.location || ''}
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
          <label htmlFor="warrantyExpiryDate">Warranty Expiry Date</label>
          <input
            type="date"
            id="warrantyExpiryDate"
            name="warrantyExpiryDate"
            className="input"
            value={formData.warrantyExpiryDate || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={6}>
  <label htmlFor="maintenanceRequirement">Maintenance Requirement</label>
  <select
    id="maintenanceRequirement"
    name="maintenanceRequirement"
    className="input"
    value={formData.maintenanceRequirement || ''}
    onChange={handleChange}
  >
    <option value="">-- Select Maintenance Requirement --</option>
    <option value="Regular">Regular</option>
    <option value="Preventive">Preventive</option>
    <option value="Emergency">Emergency</option>
  </select>
</Grid>

       <Grid item xs={6}>
  <label htmlFor="currentCondition">Current Condition</label>
  <select
    id="currentCondition"
    name="currentCondition"
    className="input"
    value={formData.currentCondition || ''}
    onChange={handleChange}
  >
    <option value="">-- Select Current Condition --</option>
    <option value="Operational">Operational</option>
    <option value="Needs Repair">Needs Repair</option>
    <option value="Decommissioned">Decommissioned</option>
  </select>
</Grid>

        <Grid item xs={6}>
          <label htmlFor="usefullLife">Usefull Life</label>
          <input
            type="number"
            id="usefullLife"
            name="usefullLife"
            className="input"
            value={formData.usefullLife || ''}
            onChange={handleChange}
          />
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
          <DisableIfCannot slug={MODULE_SLUG} action={editingId ? 'can_update' : 'can_create'}>

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
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetManagement;