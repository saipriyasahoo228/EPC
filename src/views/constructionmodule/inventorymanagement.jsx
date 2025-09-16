// DesignForm.jsx
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
import { getProjectsAccept } from "../../allapi/engineering"; 
import { getInventoryItems } from "../../allapi/inventory";
import { createMaterialInventory,getMaterialInventory,updateMaterialInventory,deleteMaterialInventory } from "../../allapi/construction";
import {getVendors} from "../../allapi/procurement";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";


const InventoryManagement = () => {
  const MODULE_SLUG = 'construction';
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [inventorymanagement, setInventoryManagement] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
  materialID: "",       // material (FK → item_id)
  materialName: "",     // material_name
  quantityUsed: "",     // quantity_used
  reorderLevel: "",     // reorder_level
  supplierID: "",       // supplier (FK → vendor_id)
  deliveryDate: "",     // delivery_date
});

const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };

  
  // Fetch accepted projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsAccept();
        setProjects(data); // assuming API returns array of projects
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

   // Fetch inventory items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getInventoryItems();
        setInventoryItems(data);
      } catch (error) {
        console.error("❌ Error loading inventory items:", error);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
  const fetchVendors = async () => {
    try {
      const data = await getVendors();
      setVendors(data);
    } catch (error) {
      console.error("❌ Error fetching vendors:", error);
    }
  };

  fetchVendors();
}, []);

const fetchInventory = async () => {
  try {
    const data = await getMaterialInventory();
    setInventory(data);
  } catch (error) {
    console.error("❌ Error loading inventory:", error);
  }
};

// 🔄 Fetch when component mounts
useEffect(() => {
  fetchInventory();
}, []);



    // Handle selection of material
  const handleMaterialSelect = (e) => {
    const selectedId = e.target.value;
    const selectedItem = inventoryItems.find((item) => item.item_id === selectedId);

    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        materialID: selectedItem.item_id,
        materialName: selectedItem.item_name,
      }));
    }
  };




  
  const handleOpenForm = (projectId, index = null) => {
  setSelectedProjectId(projectId);
  setEditingIndex(index);

  if (index !== null) {
    setFormData(inventorymanagement[index]);
  } else {
    setFormData({});
  }

  setOpen(true);
};


 

  const handleClose = () => {
  setOpen(false);
  setEditingIndex(null);
  setFormData({});
};

 
  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};



//HandleSubmit
const handleSubmit = async () => {
  try {
    const payload = {
      material: formData.materialID,          // FK to ItemMaster
      project: selectedProjectId,             // FK to Project
      material_name: formData.materialName,
      quantity_used: formData.quantityUsed,
      reorder_level: formData.reorderLevel,
      supplier: formData.supplierID,          // FK to Vendor
      delivery_date: formData.deliveryDate,
    };

    let response;

    if (editingId) {
      // ✅ UPDATE
      response = await updateMaterialInventory(editingId, payload);
      alert(`✏️ Updated successfully!`);
    } else {
      // ✅ CREATE
      response = await createMaterialInventory(payload);
      alert(`✅ Material inventory created!`);
    }

    // Reset form & refresh
    handleClose();
    setFormData({
      materialID: "",
      materialName: "",
      quantityUsed: "",
      reorderLevel: "",
      supplierID: "",
      deliveryDate: "",
    });
    setEditingId(null); // reset edit mode
    fetchInventory();
  } catch (error) {
    const msg = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : error.message;
    alert(`❌ Failed to save:\n${msg}`);
  }
};

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;

  try {
    await deleteMaterialInventory(id);
    alert("🗑️ Record deleted successfully!");

    // Update the inventory state directly
    setInventory((prev) => prev.filter((rec) => rec.id !== id));

  } catch (error) {
    const msg = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : error.message;
    alert(`❌ Failed to delete:\n${msg}`);
  }
};

const handleEdit = (record) => {
  // Set projectId separately for your disabled input
  setSelectedProjectId(record.project);

  // Fill other form fields
  setFormData({
    materialID: record.material,
    materialName: record.material_name,
    quantityUsed: record.quantity_used,
    reorderLevel: record.reorder_level,
    supplierID: record.supplier,
    deliveryDate: record.delivery_date,
  });

  // Store record ID for PATCH operation
  setEditingId(record.id);

  // Open dialog for editing
  setOpen(true);
};



const filteredInventory = inventory.filter((m) =>
  Object.values(m).some(
    (val) =>
      val &&
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
  )
);



  return (
    <>
      <Typography variant="h5"  gutterBottom sx={{ mt: 5 }} >Material & InventoryManagement</Typography>
      
        <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
  <Grid item xs={12}>
   
    <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
  <Typography variant="h6" gutterBottom>
    PROJECT RECORDS
  </Typography>

  {/* Search Input */}
  <Box sx={{ my: 2, mx: 1 }}>
    <input
      type="text"
      placeholder="Search Project ID"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="input"
      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
    />
  </Box>

  <Table>
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
        <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}>
          <strong>Action</strong>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {projects
        .filter((proj) =>
          proj.project_id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((proj, i) => (
          <TableRow key={i}>
            {/* Adjust key names as per your API response */}
            <TableCell>{proj.project_id}</TableCell>
            <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ShowIfCan slug={MODULE_SLUG} action="can_create">

              <IconButton onClick={() => handleOpenForm(proj.project_id)} color="primary">
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
      <Typography variant="h6" gutterBottom>SUBMITTED MATERIALS & INVENTORIES</Typography>
      <input
        type="text"
        placeholder="Search Projects"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />

      <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#7267ef'}}><strong>Project ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Material ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Material Name</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Quantity Used</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Reorder Level</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Supplier ID</strong></TableCell>
              <TableCell sx={{color:'#7267ef'}}><strong>Dalivery Date</strong></TableCell>
              <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {filteredInventory.map((m, i) => (
    <TableRow key={m.id}>
      <TableCell>{m.project}</TableCell>
      <TableCell>{m.material}</TableCell>
      <TableCell>{m.material_name}</TableCell>
      <TableCell>{m.quantity_used}</TableCell>
      <TableCell>{m.reorder_level}</TableCell>
      <TableCell>{m.supplier}</TableCell>
      <TableCell>{m.delivery_date}</TableCell>

      <TableCell>
      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

        <IconButton color="warning" onClick={() => handleEdit(m, i)}>
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
        <IconButton color="error" onClick={() => handleDelete(m.id)}>
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

  <DialogTitle>Enter Project Details</DialogTitle>
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

      {/* Project Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Project ID </h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="projectId">Project ID</label>
            <input id="projectId" className="input" value={selectedProjectId} disabled />
          </Grid>
          
        </Grid>
      </Grid>

      {/* Design Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Material Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
        
           <Grid item xs={6}>
        <label htmlFor="materialID">Material ID</label>
        <select
          id="materialID"
          name="materialID"
          className="input"
          value={formData.materialID || ""}
          onChange={handleMaterialSelect}
        >
          <option value="">-- Select Material ID --</option>
          {inventoryItems.map((item) => (
            <option key={item.id} value={item.item_id}>
              {item.item_id}
            </option>
          ))}
        </select>
      </Grid>

      <Grid item xs={6}>
        <label htmlFor="materialName">Material Name</label>
        <input
          id="materialName"
          name="materialName"
          className="input"
          value={formData.materialName || ""}
          onChange={handleChange}
          disabled
        />
      </Grid>
           <Grid item xs={6}>
            <label htmlFor="quantityUsed">Quantity Used</label>
            <input id="quantityUsed" name="quantityUsed" className="input" value={formData.quantityUsed || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </Grid>

      {/* Approval Info */}
      <Grid item xs={12}>
        <h3 style={{ color: '#7267ef' }}>Order Information</h3>
        <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="reorderLevel">Reorder Level</label>
            <input 
            
            id="reorderLevel" 
            name="reorderLevel" 
            className="input" 
            value={formData.reorderLevel || ''} 
            onChange={handleChange} />
          </Grid>
          {/* <Grid item xs={6}>
            <label htmlFor="supplierID">Supplier ID</label>
            <input 
            id="supplierID" 
            name="supplierID" 
            className="input" 
            value={formData.supplierID || ''} 
            onChange={handleChange} />
          </Grid> */}
          <Grid item xs={6}>
  <label htmlFor="supplierID">Supplier</label>
  <select
    id="supplierID"
    name="supplierID"
    className="input"
    value={formData.supplierID || ''}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        supplierID: e.target.value, // save only vendor_id
      }))
    }
  >
    <option value="">-- Select Supplier --</option>
    {vendors.map((vendor) => (
      <option key={vendor.id} value={vendor.vendor_id}>
        {vendor.vendor_id} - {vendor.vendor_name}
      </option>
    ))}
  </select>
</Grid>

          <Grid item xs={6}>
            <label htmlFor="deliveryDate">Delivery Date</label>
            <input 
            type="date"
            id="deliveryDate" 
            name="deliveryDate" 
            className="input" 
            value={formData.deliveryDate || ''} 
            onChange={handleChange} />
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

<DisableIfCannot slug={MODULE_SLUG} action={editingId ? 'can_update' : 'can_create'}>

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
  {editingId ? "Update" : "Submit"}
</Button>
</DisableIfCannot>

  </DialogActions>
</Dialog>

    </>
  );
};

export default InventoryManagement;
