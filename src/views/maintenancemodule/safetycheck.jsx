import React, { useState,useEffect } from "react";
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
import { getAssets ,createCompliance,getCompliances,deleteCompliance,updateCompliance} from "../../allapi/maintenance";
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";



const SafetyCheck = () => {
  const MODULE_SLUG = 'maintenance';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [safetycheck, setsafetyCheck] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);   // stores compliance_id for edit
  const [currentEditId, setCurrentEditId] = useState(null);
  const [assets, setAssets] = useState([]);


  const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };

useEffect(() => {
  const fetchAssets = async () => {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (error) {
      console.error("❌ Failed to fetch assets:", error);
    }
  };

  fetchAssets();
}, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getCompliances();
      setsafetyCheck(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchData();
}, []);


  const handleOpenForm = (assetId) => {
    setSelectedProjectId(assetId);
    const currentYear = new Date().getFullYear();
    const newSystemNumber = safetycheck.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(4, '0');
    
    setFormData({ 
      complianceID: `CMS-${currentYear}-${paddedNumber}`,
      assetId: assetId
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setOpen(true);
  };

 const handleEdit = (record) => {
  setFormData({
    complianceID: record.compliance_id,   // system-generated
    assetId: record.asset,                // FK asset_id
    inspectionDate: record.inspection_date,
    inspectionType: record.inspection_type,
    inspectorID: record.inspector_id,
    regulatoryStandards: record.regulatory_standards,
    nonComplianceIssues: record.non_compliance_issues || "",
    correctiveActionPlan: record.corrective_action_plan || "",
    certificationExpiryDate: record.certification_expiry_date || "",
  });
  setEditingId(record.compliance_id); // ✅ store compliance_id for PUT
  setIsEditMode(true);                // optional flag for button label
  setOpen(true);                      // open dialog
};

 // Delete handler with confirmation
const handleDelete = async (compliance_id) => {
  const confirmDelete = window.confirm(
    `⚠️ Are you sure you want to delete Compliance ID: ${compliance_id}?`
  );
  if (!confirmDelete) return; // stop if user cancels

  try {
    await deleteCompliance(compliance_id);  // ✅ pass compliance_id
    alert(`✅ Compliance ${compliance_id} deleted successfully`);

    // refresh list
    const updated = await getCompliances();
    setsafetyCheck(updated);
  } catch (error) {
    alert("❌ Failed to delete compliance");
    console.error("Delete error:", error);
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
      asset: formData.assetId, // asset_id (must be valid)
      inspection_date: formData.inspectionDate,
      inspection_type: formData.inspectionType,
      inspector_id: formData.inspectorID,
      regulatory_standards: formData.regulatoryStandards,
      non_compliance_issues: formData.nonComplianceIssues || null,
      corrective_action_plan: formData.correctiveActionPlan || null,
      certification_expiry_date: formData.certificationExpiryDate || null,
    };

    let res;
    if (editingId) {
      // 🔹 Update mode
      res = await updateCompliance(editingId, payload);
      alert(`✅ Safety Check updated: ${res.compliance_id}`);
    } else {
      // 🔹 Create mode
      res = await createCompliance(payload);
      alert(`✅ Safety Check created: ${res.compliance_id}`);
    }

    // refresh safety check records
    const updated = await getCompliances();
    setsafetyCheck(updated);

    // reset + close
    setFormData({});
    setEditingId(null);
    setIsEditMode(false);
    handleClose();
  } catch (error) {
    console.error("❌ handleSubmit error:", error);
    alert("❌ Failed to submit safety check");
  }
};



  const filteredSafetyCheck = safetycheck.filter((t) =>
    Object.values(t).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Compliance & Safety Checks</Typography>
      
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
    .filter(asset => asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((asset, i) => (
      <TableRow key={i}>
        <TableCell>{asset.asset_id}</TableCell>
        <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
        <ShowIfCan slug={MODULE_SLUG} action="can_create">

          <IconButton onClick={() => handleOpenForm(asset.asset_id)} color="primary">
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
            <Typography variant="h6" gutterBottom>Compliance & Safety Checks Details</Typography>
            <input
              type="text"
              placeholder="Search Safety Check Details"
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
                    <TableCell sx={{color:'#7267ef'}}><strong>Compliance ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Date</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspection Type</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Inspector ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Regulatory Standards</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Non-Compliance Issues</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Corrective Action Plan</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Certification ExpiryDate</strong></TableCell>
                   
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSafetyCheck.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.asset}</TableCell>
                      <TableCell>{t.compliance_id}</TableCell>
                      <TableCell>{t.inspection_date}</TableCell>
                      <TableCell>{t.inspection_type}</TableCell>
                      <TableCell>{t.inspector_id}</TableCell>
                      <TableCell>{t.regulatory_standards}</TableCell>
                      <TableCell>{t.non_compliance_issues}</TableCell>
                      <TableCell>{t.corrective_action_plan}</TableCell>
                      <TableCell>{t.certification_expiry_date}</TableCell>
                    
                      <TableCell>
                      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

                        <IconButton onClick={() => handleEdit(t)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        </DisableIfCannot>
                        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                        <IconButton onClick={() => handleDelete(t.compliance_id)} color="error">
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
          {isEditMode ? "Edit Safety Check Details" : "Enter Safety Check Details"}
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
    {/* Compliance Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Compliance Information</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
      <Grid container spacing={2}>

        <Grid item xs={6}>
          <label htmlFor="complianceID">Compliance ID</label>
          <input
            id="complianceID"
            name="complianceID"
            className="input"
            value={formData.complianceID || ''}
            onChange={handleChange}
            disabled
          />
        </Grid>

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
          <label htmlFor="inspectionType">Inspection Type</label>
          <input
            id="inspectionType"
            name="inspectionType"
            className="input"
            value={formData.inspectionType || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="inspectorID">Inspector ID</label>
          <input
            id="inspectorID"
            name="inspectorID"
            className="input"
            value={formData.inspectorID || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="regulatoryStandards">Regulatory Standards</label>
          <input
            id="regulatoryStandards"
            name="regulatoryStandards"
            className="input"
            value={formData.regulatoryStandards || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="nonComplianceIssues">Non-Compliance Issues</label>
          <textarea
            id="nonComplianceIssues"
            name="nonComplianceIssues"
            className="input"
            rows="3"
            value={formData.nonComplianceIssues || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="correctiveActionPlan">Corrective Action Plan</label>
          <textarea
            id="correctiveActionPlan"
            name="correctiveActionPlan"
            className="input"
            rows="3"
            value={formData.correctiveActionPlan || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <label htmlFor="certificationExpiryDate">Certification Expiry Date</label>
          <input
            type="date"
            id="certificationExpiryDate"
            name="certificationExpiryDate"
            className="input"
            value={formData.certificationExpiryDate || ''}
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
            {isEditMode ? "Update" : "Submit"}
          </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SafetyCheck;