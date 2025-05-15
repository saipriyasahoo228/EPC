

// StockMaster.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const dummyItems = [
  { id: "ITM-2025-001" },
  { id: "ITM-2025-002" },
  { id: "ITM-2025-003" },
];

const StockReturn = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [formData, setFormData] = useState({});
  const [stockreturn, setStockReturn] = useState([]);

  const handleOpenForm = (itemId) => {
    const currentYear = new Date().getFullYear();
    setSelectedItemId(itemId);
    setFormData({
      itemId,
      stockReturnId: `RET-${currentYear}-${stockreturn.length + 1}`,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setFormData({});
    setOpen(false);
  };

  
  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};



  const handleSubmit = () => {
    const newReturn = { ...formData, itemId: selectedItemId };
    const exists = stockreturn.find(
      (item) => item.stockReturnId === newReturn.stockReturnId
    );

    if (exists) {
      const updated = stockreturn.map((item) =>
        item.stockReturnId === newReturn.stockReturnId ? newReturn : item
      );
      setStockReturn(updated);
    } else {
      setStockReturn([...stockreturn, newReturn]);
    }

    handleClose();
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setSelectedItemId(item.itemId);
    setOpen(true);
  };

  const handleDelete = (stockReturnId) => {
    const updatedItems = stockreturn.filter(
      (item) => item.stockReturnId !== stockReturnId
    );
    setStockReturn(updatedItems);
  };

  const filteredStockReturn = stockreturn.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Stock Returns
      </Typography>

      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: "#fff", border: "1px solid #ccc" }}>
            <Typography variant="h6" gutterBottom>
              ITEM RECORDS
            </Typography>

            <Box sx={{ my: 2, mx: 1 }}>
              <input
                type="text"
                placeholder="Search Item ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#7267ef" }}>
                    <strong>Item ID</strong>
                  </TableCell>
                  <TableCell
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      color: "#660000",
                    }}
                  >
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyItems
                  .filter((proj) =>
                    proj.id.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((proj, i) => (
                    <TableRow key={i}>
                      <TableCell>{proj.id}</TableCell>
                      <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <IconButton
                          onClick={() => handleOpenForm(proj.id)}
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
          <Paper sx={{ p: 2, backgroundColor: "#fff", border: "1px solid #ccc" }}>
            <Typography variant="h6" gutterBottom>
              SUBMITTED STOCK RETURNS
            </Typography>
            <input
              type="text"
              placeholder="Search Stock Returns"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "1rem",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
            <TableContainer sx={{ maxHeight: 400, overflow: "auto", border: "1px solid #ddd" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Item ID</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Stock Return ID</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Returned Quantity</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Return Reason</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Returned By</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Returned Date</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Stock Adjustment ID</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Adjustment Type</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Wastage Reason</strong></TableCell>
                    <TableCell sx={{ color: "#660000" }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStockReturn.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemId}</TableCell>
                      <TableCell>{item.stockReturnId}</TableCell>
                      <TableCell>{item.returnQuantity}</TableCell>
                      <TableCell>{item.returnReason}</TableCell>
                      <TableCell>{item.returnBy}</TableCell>
                      <TableCell>{item.returnDate}</TableCell>
                      <TableCell>{item.stockAdjustmentID}</TableCell>
                      <TableCell>{item.adjustmentType}</TableCell>
                      <TableCell>{item.wastageReason}</TableCell>
                      <TableCell>
                        <IconButton color="warning" onClick={() => handleEdit(item)}>
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(item.stockReturnId)}>
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

              {/* Stock Return Information */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Stock Returns Id's </h3>
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
                    <label htmlFor="stockReturnId">Stock Return Id</label>
                    <input 
                    id="stockReturnId" 
                    name="stockReturnId" 
                    className="input" 
                    value={formData.stockReturnId || ''} 
                    disabled 
                    />
                  </Grid>
                  
                  
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Stock Return Information</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
               <Grid item xs={6}>
                    <label htmlFor="returnQuantity">Return Quantity</label>
                    <input 
                    id="returnQuantity" 
                    name="returnQuantity" 
                    className="input" 
                    value={formData.returnQuantity || ''} 
                    onChange={handleChange} 
                    type="number"
                    />
                  </Grid>
                  <Grid item xs={6}>
  <label htmlFor="returnReason">Return Reason</label>
  <textarea
    id="returnReason"
    name="returnReason"
    className="input"
    rows={3} // you can adjust the number of visible rows
    value={formData.returnReason || ''}
    onChange={handleChange}
  />
</Grid>

                  <Grid item xs={6}>
                    <label htmlFor="returnBy">Return By</label>
                    <input 
                    id="returnBy" 
                    name="returnBy" 
                    className="input" 
                    value={formData.returnBy || ''} 
                    onChange={handleChange} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="returnDate">Return Date</label>
                    <input 
                    type="date"
                    id="returnDate" 
                    name="returnDate" 
                    className="input" 
                    value={formData.returnDate || ''} 
                    onChange={handleChange} 
                    />
                  </Grid>
              </Grid>

              
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Stock Adjustment info.</h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '80%' }} />
               <Grid item xs={6}>
                    <label htmlFor="stockAdjustmentID">Stock Adjustment ID</label>
                    <input 
                    id="stockAdjustmentID" 
                    name="stockAdjustmentID" 
                    className="input" 
                    value={formData.stockAdjustmentID || ''} 
                    onChange={handleChange} 
                    
                    />
                  </Grid>
                 <Grid item xs={6}>
  <label htmlFor="adjustmentType">Adjustment Type</label>
  <select
    id="adjustmentType"
    name="adjustmentType"
    className="input"
    value={formData.adjustmentType || ''}
    onChange={handleChange}
  >
    <option value="">-- Select Adjustment Type --</option>
    <option value="Addition">Addition</option>
    <option value="Deduction">Deduction</option>
    <option value="Scrap">Scrap</option>
  </select>
</Grid>

                  <Grid item xs={6}>
                    <label htmlFor="wastageReason">Wastage Reason</label>
                    <input 
            
                    id="wastageReason" 
                    name="wastageReason" 
                    className="input" 
                    value={formData.wastageReason || ''} 
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

export default StockReturn;
