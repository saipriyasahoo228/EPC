

// StockMaster.jsx
import React, { useState,useEffect } from "react";
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
import { getInventoryItems,createStock,getStockManagement ,deleteStock,updateStock } from "../../allapi/inventory";



const StockMaster = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [formData, setFormData] = useState({});
  const [stockmanagement, setStockManagement] = useState([]);
  //const [stockList, setStockList] = useState([]);
  




  
const handleOpenForm = (itemId) => {
  const currentYear = new Date().getFullYear();

  // Use stockManagement instead of stockList
  const nextId = stockmanagement.length + 1; 
  const newStockId = `STK-${currentYear}-${String(nextId).padStart(3, '0')}`;

  setSelectedItemId(null);f

  setFormData({
    itemId,
    stockManagementId: newStockId,
    openingStock: '',
    stockIssued: '',
    stockIssuedBy: '',
    stockBalance: '',
    stockValuation: '',
    lastUpdated: new Date().toISOString().split("T")[0]
  });

  setOpen(true);
};


  const handleClose = () => {
    setFormData({});
    setOpen(false);
  };

  // ✅ Fetch data from API on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getInventoryItems();
        setItems(data);
      } catch (error) {
        console.error("Error loading inventory items:", error);
      }
    };
    fetchItems();
  }, []);

   useEffect(() => {
    fetchStockManagement();
  }, []);

  const fetchStockManagement = async () => {
    try {
      const data = await getStockManagement();
      setStockManagement(data);
      setFilteredStockManagement(data); // Default without filter
    } catch (err) {
      console.error("Error loading stock management:", err);
    }
  };

 
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => {
    let updatedData = { ...prev, [name]: value };

    if (name === "openingStock" || name === "stockIssued") {
      const opening = parseFloat(updatedData.openingStock) || 0;
      const issued = parseFloat(updatedData.stockIssued) || 0;
      updatedData.stockBalance = opening - issued;
    }

    return updatedData;
  });
};



// const handleSubmit = async () => {
//   try {
//     const stockData = {
//       item: formData.itemId,
//       opening_stock: Number(formData.openingStock) || 0,
//       stock_issued: Number(formData.stockIssued) || 0,
//       stock_issued_by: formData.stockIssuedBy,
//       stock_valuation: Number(formData.stockValuation) || 0,
//       last_updated: formData.lastUpdated || new Date().toISOString().split("T")[0]
//     };

//     const res = await createStock(stockData);
//     console.log("✅ API Response:", res);

//     // ✅ Build alert message
//     let alertMsg = `✅ ${res.message}\nStock ID: ${res.data?.stock_id || "Not Available"}`;

//     if (res.alert) {
//       alertMsg += `\n\n⚠️ ${res.alert}`;
//     }

//     alert(alertMsg);

//     //await fetchStockList(); // Refresh the table

//     handleClose();

//   } catch (error) {
//     console.error("❌ Error creating stock:", error);
//     alert(`⚠️ Failed to create stock:\n${error.response?.data || error.message}`);
//   }
// };

  // const handleEdit = (item) => {
  //   setFormData({ ...item });
  //   setSelectedItemId(item.itemId);
  //   setOpen(true);
  // };
const handleEdit = (item) => {
  setFormData({
    stockManagementId:item.stock_id,
    itemId: item.item, // or item.itemId depending on API response
    openingStock: item.opening_stock,
    stockIssued: item.stock_issued,
    stockIssuedBy: item.stock_issued_by,
    stockBalance:item.stock_balance,
    stockValuation: item.stock_valuation,
    lastUpdated: item.last_updated, // should be in YYYY-MM-DD format
  });
  setSelectedItemId(item.stock_id || item.stockManagementId); // store actual backend ID
  setOpen(true);
};


const handleSubmit = async () => {
  try {
    const stockData = {
      item: formData.itemId,
      opening_stock: Number(formData.openingStock) || 0,
      stock_issued: Number(formData.stockIssued) || 0,
      stock_issued_by: formData.stockIssuedBy,
      stock_valuation: Number(formData.stockValuation) || 0,
      last_updated: formData.lastUpdated || new Date().toISOString().split("T")[0]
    };

    let res;
    if (selectedItemId) {
      // Update existing stock
      res = await updateStock(selectedItemId, stockData);
    } else {
      // Create new stock
      res = await createStock(stockData);
    }

    console.log("✅ API Response:", res);

    let alertMsg = `✅ ${res.message || (selectedItemId ? "Stock updated" : "Stock created")}`;
    if (res.data?.stock_id) {
      alertMsg += `\nStock ID: ${res.data.stock_id}`;
    }
    if (res.alert) {
      alertMsg += `\n\n⚠️ ${res.alert}`;
    }

    alert(alertMsg);

    // Refresh table
    await fetchStockManagement();

    // Reset form & close dialog
    setFormData({});
    setSelectedItemId(null);
    handleClose();

  } catch (error) {
    console.error(`❌ Error ${selectedItemId ? "updating" : "creating"} stock:`, error);
    alert(`⚠️ Failed to ${selectedItemId ? "update" : "create"} stock:\n${error.response?.data || error.message}`);
  }
};

 

const handleDelete = async (stockManagementId) => {
  const isConfirmed = window.confirm(`Are you sure you want to delete stock ${stockManagementId}?`);
  if (!isConfirmed) return;

  try {
    // 1️⃣ Delete from backend
    await deleteStock(stockManagementId);

    // 2️⃣ Refetch updated stock list
    await fetchStockManagement();

    alert(`✅ Stock ${stockManagementId} deleted successfully`);
  } catch (error) {
    alert(`❌ Failed to delete stock ${stockManagementId}`);
    console.error(`Error deleting stock ${stockManagementId}:`, error);
  }
};


  const filteredStockManagement = stockmanagement.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Stock Management
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
              {items
                .filter((item) =>
                  item.item_id.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.item_id}</TableCell>
                    <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <IconButton
                        onClick={() => handleOpenForm(item.item_id)}
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
              SUBMITTED STOCKS
            </Typography>
            <input
              type="text"
              placeholder="Search Stock Management"
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
                    <TableCell sx={{ color: "#7267ef" }}><strong>Stock ID</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Opening Stock</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Stock Issued</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Stock Issued By</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Stock Balance</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Stock Valuation</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Last Updated</strong></TableCell>
                    <TableCell sx={{ color: "#660000" }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {filteredStockManagement.map((item, index) => (
    <TableRow key={index}>
      <TableCell>{item.item}</TableCell> {/* Item ID */}
      <TableCell>{item.stock_id}</TableCell> {/* Stock ID */}
      <TableCell>{item.opening_stock}</TableCell>
      <TableCell>{item.stock_issued}</TableCell>
      <TableCell>{item.stock_issued_by}</TableCell>
      <TableCell>{item.stock_balance}</TableCell>
      <TableCell>{item.stock_valuation}</TableCell>
      <TableCell>{item.last_updated}</TableCell>
      <TableCell>
        <IconButton color="warning" onClick={() => handleEdit(item)}>
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => handleDelete(item.stock_id)}
        >
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
                    type="number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="stockIssued">Stock Issued</label>
                    <input 
                    type="number"
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
                    readOnly
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
