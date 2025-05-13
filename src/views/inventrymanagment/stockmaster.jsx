
// DesignForm.jsx
import React, { useState } from "react";
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

const dummyItems = [
  { id: "ITM-2025-001" },
  { id: "ITM-2025-002" },
  { id: "ITM-2025-003" },
];

const StockMaster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [formData, setFormData] = useState({});
  const [stockmanagement, setStockManagement] = useState([]);

  const handleOpenForm = (itemId) => {
    const currentYear = new Date().getFullYear(); // get system year
    setSelectedItemId(itemId);
    setFormData({ 
      itemId,
      stockManagementId: `STK-${currentYear}-${stockmanagement.length + 1}`,
    }); // dynamic year
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    const newStock = { ...formData, itemId: selectedItemId };
    setStockManagement([...stockmanagement, newStock]);
    setOpen(false);
  };

  const handleEdit = (item) => {
    // Prepopulate the form with study data
    setFormData({
      ...item,
      itemId: item.itemId, // Maintain projectId for edit
      stockManagementId: item.stockManagementId, // Keep the same ID during edit
    });
    setOpen(true); // Open the dialog to edit
  };
  
  const handleDelete = (stockManagementId) => {
    // Delete the selected study from the state
    const updatedItem = stockmanagement.filter(item => item.stockManagementId !== stockManagementId);
    setStockManagement(updatedItem);
  };
  
  const filteredStockManagement =stockmanagement.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }} >Stock Management</Typography>
      
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
  <Typography variant="h6" gutterBottom>
    ITEM RECORDS
  </Typography>

  {/* Search Input */}
  <Box sx={{ my: 2, mx: 1 }}>
    <input
      type="text"
      placeholder="Search Item ID"
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
      {dummyItems
        .filter(proj => proj.id.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((proj, i) => (
          <TableRow key={i}>
            <TableCell>{proj.id}</TableCell>
            <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleOpenForm(proj.id)} color="primary">
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
            <Typography variant="h6" gutterBottom>SUBMITTED FEASIBILITY STUDIES</Typography>
            <input
              type="text"
              placeholder="Search Feasibility Studies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color:'#7267ef'}}><strong>Item ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Stock ID</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Opening Stock</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Stock Issued</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Stock Issued By</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Stock Balance</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Stock Valuation</strong></TableCell>
                    <TableCell sx={{color:'#7267ef'}}><strong>Last Updated</strong></TableCell>
                    <TableCell sx={{color:'#660000'}}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredStockManagement.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemId}</TableCell>
                      <TableCell>{item.stockManagementId}</TableCell>
                      <TableCell>{item.openingStock}</TableCell>
                      <TableCell>{item.stockIssued}</TableCell>
                      <TableCell>{item.stockIssuedBy}</TableCell>
                      <TableCell>{item.stockBalance}</TableCell>
                      <TableCell>{item.stockValuation}</TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
  {/* Edit Button */}
  <IconButton color="warning" onClick={() => handleEdit(item)}>
    <Edit sx={{ color: "orange" }} />
  </IconButton>
  
  {/* Delete Button */}
  <IconButton color="error" onClick={() => handleDelete(item.stockManagementId)}>
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
        <DialogTitle>Enter Stock Management Details</DialogTitle>
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

              {/* Stock Information */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Stock Id's Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="itemId">Item ID</label>
                    <input 
                    id="itemId" 
                    name="itemId" 
                    className="input" 
                    value={formData.itemId || ''} 
                    disabled 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="stockManagementId">Stock Id</label>
                    <input 
                    id="stockManagementId" 
                    name="stockManagementId" 
                    className="input" 
                    value={formData.stockManagementId || ''} 
                    disabled 
                    />
                  </Grid>
                  
                  
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Stock Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
               <Grid item xs={6}>
                    <label htmlFor="openingStock">Opening Stock</label>
                    <input 
                    id="openingStock" 
                    name="openingStock" 
                    className="input" 
                    value={formData.openingStock || ''} 
                    onChange={handleChange} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="stockIssued">Stock Issued</label>
                    <input 
                    id="stockIssued" 
                    name="stockIssued" 
                    className="input" 
                    value={formData.stockIssued || ''} 
                    onChange={handleChange} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="stockIssuedBy">Stock Issued By</label>
                    <input 
                    id="stockIssuedBy" 
                    name="stockIssuedBy" 
                    className="input" 
                    value={formData.stockIssuedBy || ''} 
                    onChange={handleChange} 
                    />
                  </Grid>
              </Grid>

              {/* Upload Reports */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Stock Balance and Valuations</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
               <Grid item xs={6}>
                    <label htmlFor="stockBalance">Stock Balance</label>
                    <input 
                    id="stockBalance" 
                    name="stockBalance" 
                    className="input" 
                    value={formData.stockBalance || ''} 
                    onChange={handleChange} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="stockValuation">Stock Valuation</label>
                    <input 
                    id="stockValuation" 
                    name="stockValuation" 
                    className="input" 
                    value={formData.stockValuation || ''} 
                    onChange={handleChange} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="lastUpdated">Last Updated </label>
                    <input 
                    type="date"
                    id="lastUpdated" 
                    name="lastUpdated" 
                    className="input" 
                    value={formData.lastUpdated || ''} 
                    onChange={handleChange} 
                    />
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
           Submit
         </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StockMaster;
