import React, { useState,useEffect } from 'react';
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
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import CloseIcon from '@mui/icons-material/Close';
import { createInventoryItem, getInventoryItems,deleteInventoryItem, updateInventoryItem } from '../../allapi/inventory';


const ItemMaster = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // To track the item being edited
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
  itemName: '',
  category: '',
  netWeight: '',
  unitOfMeasure: '',
  minStockLevel: '',
  maxStockLevel: '',
  reorderLevel: '',
  storageLocation: '',
  itemStatus: 'Active',
});


const fetchItems = async () => {
  try {
    const res = await getInventoryItems();
    setItems(res);
  } catch (err) {
    console.error('❌ Error fetching items:', err);
  }
};

useEffect(() => {
  fetchItems();
}, []);




  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // const handleOpen = (item = null) => {
  //   setEditItem(item); // Set the item to edit if passed
  //   setOpen(true);
  //   if (item) {
  //     // Pre-fill the form with existing item data for editing
  //     setFormData({
  //       itemName: item.itemName,
  //       category: item.category,
  //       unitOfMeasure: item.unitOfMeasure,
  //       minStockLevel: item.minStockLevel,
  //       maxStockLevel: item.maxStockLevel,
  //       reorderLevel: item.reorderLevel,
  //       storageLocation: item.storageLocation,
  //       itemStatus: item.itemStatus,
  //     });
  //   } else {
  //     setFormData({
  //       itemName: '',
  //       category: '',
  //       unitOfMeasure: '',
  //       minStockLevel: '',
  //       maxStockLevel: '',
  //       reorderLevel: '',
  //       storageLocation: '',
  //       itemStatus: '',
  //     });
  //   }
  // };

  const handleOpen = (item = null) => {
  setEditItem(item);
  setOpen(true);
  if (item) {
    setFormData({
      itemId:item.item_id || '',
      itemName: item.item_name || '',
      category: item.category || '',
      netWeight: item.net_weight || '',
      unitOfMeasure: item.unit_of_measure || '',
      minStockLevel: item.minimum_stock_level || '',
      maxStockLevel: item.maximum_stock_level || '',
      reorderLevel: item.reorder_level || '',
      storageLocation: item.storage_location || '',
      itemStatus: item.item_status || '',
    });
  } else {
    setFormData({
      itemId: '',
      itemName: '',
      category: '',
      netWeight: '',
      unitOfMeasure: '',
      minStockLevel: '',
      maxStockLevel: '',
      reorderLevel: '',
      storageLocation: '',
      itemStatus: '',
    });
  }
};

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateItemId = () => {
    const currentYear = new Date().getFullYear(); // Get the current year
    const nextId = items.length + 1; // Incremental ID based on current number of items
    return `ITM-${currentYear}-${String(nextId).padStart(3, '0')}`; // Return item ID with current year
  };

 

 


// const handleSubmit = async () => {
//   const form = new FormData();

//   form.append('item_name', formData.itemName);
//   form.append('category', formData.category);
//   form.append('net_weight', formData.netWeight);
//   form.append('unit_of_measure', formData.unitOfMeasure);
//   form.append('minimum_stock_level', formData.minStockLevel);
//   form.append('maximum_stock_level', formData.maxStockLevel);
//   form.append('reorder_level', formData.reorderLevel);
//   form.append('storage_location', formData.storageLocation);
//   form.append('item_status', formData.itemStatus);

//   try {
//     const res = await createInventoryItem(form);

//     // ✅ Success alert
//     alert(`✅ Item Created Successfully!\nItem ID: ${res.item_id || 'N/A'}`);
//     console.log('✅ Item Created:', res);

//     // Close dialog
//     handleClose();
//   } catch (err) {
//     console.error('❌ Error:', err);

//     // ❌ Show backend error message if available
//     if (err.response && err.response.data) {
//       const errorMsg =
//         typeof err.response.data === 'string'
//           ? err.response.data
//           : JSON.stringify(err.response.data);

//       alert(`⚠️ Failed to create item:\n${errorMsg}`);
//     } else {
//       alert('⚠️ Failed to create item. Please try again.');
//     }
//   }
// };



// const handleSubmit = async () => {
//   const form = new FormData();

//   // Convert camelCase → snake_case for API
//   form.append('item_name', formData.itemName);
//   form.append('category', formData.category);
//   form.append('net_weight', formData.netWeight || 0);
//   form.append('unit_of_measure', formData.unitOfMeasure);
//   form.append('minimum_stock_level', formData.minStockLevel || 0);
//   form.append('maximum_stock_level', formData.maxStockLevel || 0);
//   form.append('reorder_level', formData.reorderLevel || 0);
//   form.append('storage_location', formData.storageLocation);
//   form.append('item_status', formData.itemStatus);

//   try {
//     let res;

//     if (editItem && editItem.item_id) {
//       // ✅ Update existing item
//       res = await updateInventoryItem(editItem.item_id, form);
//       alert(`✅ Item ${editItem.item_id} updated successfully!`);
//       console.log('✅ Item Updated:', res);
//       await fetchItems();

//       // Update table instantly
//       setItems((prev) =>
//         prev.map((it) => (it.item_id === editItem.item_id ? { ...it, ...res } : it))
//       );

//     } else {
//       // ✅ Create new item
//       res = await createInventoryItem(form);
//       alert(`✅ Item Created Successfully!\nItem ID: ${res.item_id || 'N/A'}`);
//       console.log('✅ Item Created:', res);

//       // Add new item to table
//       setItems((prev) => [...prev, res]);
//     }

//     // Close dialog
//     handleClose();

//   } catch (err) {
//     console.error('❌ Error:', err);

//     // ❌ Show backend error message if available
//     if (err.response && err.response.data) {
//       const errorMsg =
//         typeof err.response.data === 'string'
//           ? err.response.data
//           : JSON.stringify(err.response.data);
//       alert(`⚠️ Failed to save item:\n${errorMsg}`);
//     } else {
//       alert('⚠️ Failed to save item. Please try again.');
//     }
//   }
// };

const handleSubmit = async () => {
  // ✅ Frontend Validation
  if (!(Number(formData.minStockLevel) < Number(formData.reorderLevel) && Number(formData.reorderLevel) < Number(formData.maxStockLevel))) {
    alert("⚠️ Validation Error:\nEnsure that: Minimum Stock Level < Reorder Level < Maximum Stock Level");
    return; // Stop submission
  }

  const form = new FormData();
  form.append('item_name', formData.itemName);
  form.append('category', formData.category);
  form.append('net_weight', formData.netWeight || 0);
  form.append('unit_of_measure', formData.unitOfMeasure);
  form.append('minimum_stock_level', formData.minStockLevel || 0);
  form.append('maximum_stock_level', formData.maxStockLevel || 0);
  form.append('reorder_level', formData.reorderLevel || 0);
  form.append('storage_location', formData.storageLocation);
  form.append('item_status', formData.itemStatus);

  try {
    let res;

    if (editItem && editItem.item_id) {
      // ✅ Update existing item
      res = await updateInventoryItem(editItem.item_id, form);
      alert(`✅ Item ${editItem.item_id} updated successfully!`);
      await fetchItems(); // refresh data
    } else {
      // ✅ Create new item
      res = await createInventoryItem(form);
      alert(`✅ Item Created Successfully!\nItem ID: ${res.item_id || 'N/A'}`);
      await fetchItems(); // refresh data
    }

    // ✅ Close dialog
    handleClose();

  } catch (err) {
    console.error('❌ Error:', err);

    if (err.response && err.response.data) {
      let errorMsg =
        typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data);
      alert(`⚠️ Failed to save item:\n${errorMsg}`);
    } else {
      alert('⚠️ Failed to save item. Please try again.');
    }
  }
};


  const handleDelete = async (itemId) => {
  if (window.confirm(`Are you sure you want to delete item ${itemId}?`)) {
    try {
      const res = await deleteInventoryItem(itemId);
      alert(`✅ Item ${itemId} deleted successfully!`);

      // Refresh items list after delete
      setItems((prev) => prev.filter((item) => item.item_id !== itemId));
    } catch (err) {
      console.error('❌ Error deleting item:', err);

      if (err.response && err.response.data) {
        alert(`⚠️ Failed to delete item:\n${JSON.stringify(err.response.data)}`);
      } else {
        alert('⚠️ Failed to delete item. Please try again.');
      }
    }
  }
};

  const filteredItems = items.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // PDF Export function
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredItems.map((item) => [
      item.itemId,
      item.itemName,
      item.category,
      item.netWeight,
      item.unitOfMeasure,
      item.minStockLevel,
      item.maxStockLevel,
      item.reorderLevel,
      item.storageLocation,
      item.itemStatus,
    ]);

    doc.autoTable({
      head: [
        [
          'Item ID',
          'Name',
          'Category',
          'Net Weight',
          'Unit',
          'Min Stock',
          'Max Stock',
          'Reorder Level',
          'Storage Location',
          'Status',
        ],
      ],
      body: tableData,
    });

    doc.save('inventory_report.pdf');
  };

  return (
    <div>
      <Button variant="contained" sx={{ mt: 4, mb: 2, backgroundColor: '#7267ef' }} onClick={() => handleOpen()}>
        Add Item
      </Button>

      {/* Form Popup */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#f3f3f3', color: '#7267ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  {editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
  <IconButton onClick={handleClose} sx={{ color: '#7267ef' }}>
    <CloseIcon />
  </IconButton>
</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} direction="column" sx={{ mt: 1 }}>
            
            <Grid item xs={12}>
  <label>Item ID</label>
  <input
    className="input"
    disabled
    value={editItem ? editItem.item_id : generateItemId()}
  />
</Grid>

            <Grid item xs={12}>
              <label>Item Name</label>
              <input
                className="input"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g., Steel Rods"
              />
            </Grid>
            <Grid item xs={12}>
              <label>Category</label>
              <input
                className="input"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Raw Materials"
              />
            </Grid>
             <Grid item xs={12}>
              <label>Net Weight</label>
              <input
                className="input"
                name="netWeight"
                value={formData.netWeight}
                onChange={handleChange}
                placeholder="e.g., 70"
              />
            </Grid>
            <Grid item xs={12}>
              <label>Unit of Measure</label>
              <input
                className="input"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                placeholder="e.g., KG"
              />
            </Grid>
            <Grid item xs={12}>
              <label>Minimum Stock Level</label>
              <input
                className="input"
                name="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <label>Maximum Stock Level</label>
              <input
                className="input"
                name="maxStockLevel"
                type="number"
                value={formData.maxStockLevel}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <label>Reorder Level</label>
              <input
                className="input"
                name="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <label>Storage Location</label>
              <input
                className="input"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                placeholder="e.g., Warehouse A"
              />
            </Grid>
            <Grid item xs={12}>
              <label>Item Status</label>
              <select
                className="input"
                name="itemStatus"
                value={formData.itemStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ outline: '2px solid #800000', color: '#800000' }}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={handleSubmit} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>
            {editItem ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Records Table */}
      <Paper sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
      <Grid container justifyContent="space-between" alignItems="center">
    <Grid item>
      <Typography variant="h6" gutterBottom sx={{ color: '#7267ef' }}>
        Inventory Items Report
      </Typography>
    </Grid>
    <Grid item>
      <Button onClick={handleExportPDF} sx={{ backgroundColor: '#7267ef', color: '#fff', mt: 2 ,mb:2}}>
        Export PDF
      </Button>
    </Grid>
  </Grid>
        <input
          type="text"
          placeholder="Search Item Details Here...."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#7267ef' }}><strong>Item ID</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Name</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Category</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Net Weight</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Unit</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Min</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Max</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Reorder</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Location</strong></TableCell>
              <TableCell sx={{ color: '#7267ef' }}><strong>Status</strong></TableCell>
              <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.item_id}</TableCell>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.net_weight}</TableCell>
                <TableCell>{item.unit_of_measure}</TableCell>
                <TableCell>{item.minimum_stock_level}</TableCell>
                <TableCell>{item.maximum_stock_level}</TableCell>
                <TableCell>{item.reorder_level}</TableCell>
                <TableCell>{item.storage_location}</TableCell>
                <TableCell>{item.item_status}</TableCell>
                <TableCell>
                  <IconButton color="warning" onClick={() => handleOpen(item)}>
                    <Edit sx={{ color: "orange" }}/>
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.item_id)}>
                    <Delete sx={{ color: 'red' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
       
      </Paper>
    </div>
  );
};

export default ItemMaster;
