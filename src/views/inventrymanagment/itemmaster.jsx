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
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import CloseIcon from '@mui/icons-material/Close';


const ItemMaster = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // To track the item being edited
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    unitOfMeasure: '',
    minStockLevel: '',
    maxStockLevel: '',
    reorderLevel: '',
    storageLocation: '',
    itemStatus: '',
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = (item = null) => {
    setEditItem(item); // Set the item to edit if passed
    setOpen(true);
    if (item) {
      // Pre-fill the form with existing item data for editing
      setFormData({
        itemName: item.itemName,
        category: item.category,
        unitOfMeasure: item.unitOfMeasure,
        minStockLevel: item.minStockLevel,
        maxStockLevel: item.maxStockLevel,
        reorderLevel: item.reorderLevel,
        storageLocation: item.storageLocation,
        itemStatus: item.itemStatus,
      });
    } else {
      setFormData({
        itemName: '',
        category: '',
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

  const handleSubmit = () => {
    if (editItem) {
      // If editing, update the existing item
      const updatedItems = items.map((item) =>
        item.itemId === editItem.itemId ? { ...item, ...formData } : item
      );
      setItems(updatedItems);
    } else {
      // If adding a new item, create a new item and add to the list
      const newItem = {
        itemId: generateItemId(),
        ...formData,
      };
      setItems([...items, newItem]);
    }
    setFormData({
      itemName: '',
      category: '',
      unitOfMeasure: '',
      minStockLevel: '',
      maxStockLevel: '',
      reorderLevel: '',
      storageLocation: '',
      itemStatus: '',
    });
    setEditItem(null); // Clear edit state
    handleClose();
  };

  const handleDelete = (itemId) => {
    const updatedItems = items.filter((item) => item.itemId !== itemId);
    setItems(updatedItems);
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
              <label>Item ID (Auto)</label>
              <input className="input" disabled value={editItem ? editItem.itemId : generateItemId()} />
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
            Submit
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
                <TableCell>{item.itemId}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.unitOfMeasure}</TableCell>
                <TableCell>{item.minStockLevel}</TableCell>
                <TableCell>{item.maxStockLevel}</TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>{item.storageLocation}</TableCell>
                <TableCell>{item.itemStatus}</TableCell>
                <TableCell>
                  <IconButton color="warning" onClick={() => handleOpen(item)}>
                    <Edit sx={{ color: "orange" }}/>
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.itemId)}>
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
