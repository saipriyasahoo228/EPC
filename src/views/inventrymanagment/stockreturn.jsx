// StockMaster.jsx
import React, { useState,useEffect } from "react";
import axios from 'axios';
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
import { AddCircle, Edit, Delete ,ArrowBackIos, ArrowForwardIos} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { getInventoryItems,createStockReturn,getStockReturns,deleteStockReturn,updateStockReturn } from "../../allapi/inventory";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";
import { Maximize2, Minimize2 } from "lucide-react";
import { formatDateDDMMYYYY } from '../../utils/date';


const StockReturn = () => {
  const MODULE_SLUG = 'inventory';
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockReturns, setStockReturns] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const rowsPerPage = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalMaximized, setIsModalMaximized] = useState(false);


  const [formData, setFormData] = useState({
  itemId: "",
  returnQuantity: "",
  returnReason: "",
  returnBy: "",
  returnDate: "",
  stockAdjustmentID: "",
  adjustmentType: "",
  wastageReason: "",
});


const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };




// Filter inventory items first
const filteredInventoryItems = inventoryItems.filter((item) =>
  item.item_id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
);

// Calculate total pages based on filtered data
const totalPages = Math.ceil(filteredInventoryItems.length / rowsPerPage) || 1;

// Slice data for the current page
const paginatedInventoryItems = filteredInventoryItems.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

// Reset to page 1 when search term changes
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);



  useEffect(() => {
  const fetchItems = async () => {
    try {
      const data = await getInventoryItems();
      setInventoryItems(data); // Make sure the backend returns items in expected structure
    } catch (error) {
      console.error("Failed to fetch inventory items:", error);
    }
  };

  fetchItems();
}, []);


  // Fetch stock returns
  const fetchStockReturns = async () => {
    try {
      const data = await getStockReturns();
      setStockReturns(data);
    } catch (err) {
      console.error('Failed to load stock returns:', err);
    }
  };

  useEffect(() => {
    fetchStockReturns(); // Fetch on mount
  }, []);


//Delete api 
const handleDelete = async (returnId) => {
  const confirmed = window.confirm(`Are you sure you want to delete Return ID: ${returnId}?`);

  if (!confirmed) return;

  try {
    await deleteStockReturn(returnId); // Call your delete API
    alert(`✅ Return ${returnId} deleted successfully.`);
    fetchStockReturns(); // Refresh the list
  } catch (error) {
    console.error('❌ Error deleting return:', error);
    alert(`❌ Failed to delete return: ${error.message}`);
  }
};


    const filteredStockReturn = stockReturns.filter((item) =>
    Object.values(item).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );


 

  const handleOpenForm = (itemId) => {
  const currentYear = new Date().getFullYear();
  const paddedId = String(stockReturns.length + 1).padStart(4, '0'); // Pads to 4 digits
  setSelectedItemId(itemId);
  setFormData({
    itemId,
    stockReturnId: `RET-${currentYear}-${paddedId}`,
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


// 🔹 Reset form helper
const resetForm = () => {
  setFormData({
    itemId: "",
    returnQuantity: "",
    returnReason: "",
    returnBy: "",
    returnDate: "",
    stockAdjustmentID: "",
    adjustmentType: "",
    wastageReason: "",
  });
  setEditingId(null);
};

// 🔹 Edit button click handler
const handleEdit = (item) => {
  setEditingId(item.return_id);
  setFormData({
    itemId: item.item,
    returnQuantity: item.return_quantity,
    returnReason: item.return_reason,
    returnBy: item.returned_by,
    returnDate: item.return_date,
    stockAdjustmentID: item.stock_adjustment_id,
    adjustmentType: item.adjustment_type,
    wastageReason: item.wastage_reason || "",
  });
  setOpen(true);
};



// 🔹 Submit form handler (Add + Edit)
const handleSubmit = async () => {
  const payload = {
    item: formData.itemId,
    return_quantity: formData.returnQuantity,
    return_reason: formData.returnReason,
    returned_by: formData.returnBy,
    return_date: formData.returnDate,
    stock_adjustment_id: formData.stockAdjustmentID,
    adjustment_type: formData.adjustmentType.toLowerCase(), // Backend expects lowercase
    wastage_reason: formData.wastageReason || "",
  };

  try {
    if (editingId) {
      // ✅ Update
      await updateStockReturn(editingId, payload);
      setStockReturns((prev) =>
        prev.map((sr) =>
          sr.return_id === editingId ? { ...sr, ...payload } : sr
        )
      );
      alert(`✅ Stock return ${editingId} updated successfully!`);
    } else {
      // ✅ Create
      const res = await createStockReturn(payload); // POST API
      fetchStockReturns(); // refresh table
      alert(`✅ Stock return ${res.return_id} created successfully!`);
    }

    setOpen(false);
    resetForm(); // clear form after submit
  } catch (error) {
    console.error("❌ Error submitting stock return:", error);
  }
};



 

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
  {paginatedInventoryItems.map((item, i) => (
    <TableRow key={i}>
      <TableCell>{item.item_id}</TableCell>
      <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
      <ShowIfCan slug={MODULE_SLUG} action="can_create">

        <IconButton
          onClick={() => handleOpenForm(item.item_id)}
          color="primary"
        >
          <AddCircle sx={{ color: "#7267ef" }} />
        </IconButton>
      </ShowIfCan>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

            </Table>
             <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} pr={2}>
  <IconButton
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((prev) => prev - 1)}
  >
    <ArrowBackIos />
  </IconButton>

  <Typography variant="body2" sx={{ mx: 2 }}>
    Page {currentPage} of {totalPages}
  </Typography>

  <IconButton
    disabled={currentPage >= totalPages}
    onClick={() => setCurrentPage((prev) => prev + 1)}
  >
    <ArrowForwardIos />
  </IconButton>
</Box>

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
      <TableCell>{item.item}</TableCell>
      <TableCell>{item.return_id}</TableCell>
      <TableCell>{item.return_quantity}</TableCell>
      <TableCell>{item.return_reason}</TableCell>
      <TableCell>{item.returned_by}</TableCell>
      <TableCell>{formatDateDDMMYYYY(item.return_date)}</TableCell>
      <TableCell>{item.stock_adjustment_id}</TableCell>
      <TableCell>{item.adjustment_type}</TableCell>
      <TableCell>{item.wastage_reason}</TableCell>
      <TableCell>
      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

        <IconButton color="warning" onClick={() => handleEdit(item)}>
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">

        <IconButton color="error" onClick={() => handleDelete(item.return_id)}>
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

        <DialogTitle>Enter Stock Management Details</DialogTitle>
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

              {/* Stock Return Information */}
              <Grid item xs={12}>
                <h3 style={{ color: '#7267ef' }}>Stock Returns Id's </h3>
                <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
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
  

              <Grid item xs={10}>
  <h3 style={{ color: '#7267ef' }}>Stock Return Information</h3>
  <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />

  {/* First Row */}
  <Grid container spacing={2}>
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
        rows={3}
        value={formData.returnReason || ''}
        onChange={handleChange}
      />
    </Grid>
  </Grid>

  {/* Second Row */}
  <Grid container spacing={2} sx={{ mt: 1 }}>
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
</Grid>



              <Grid item xs={12}>
  <h3 style={{ color: '#7267ef' }}>Stock Adjustment Info</h3>
  <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />

  {/* First Row */}
  <Grid container spacing={2}>
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
  </Grid>

  {/* Second Row */}
  <Grid container spacing={2} sx={{ mt: 1 }}>
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
            {editingId ? "Update Return" : "Submit Return"}
         </Button>
         </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StockReturn;
