
// export default InventoryValuationForm;
import React, { useState, useRef,useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getStockManagement ,submitValuationReport,getValuationReports,deleteValuationReport } from "../../allapi/inventory";
import { DisableIfCannot, ShowIfCan } from '../../components/auth/RequirePermission';
import { Maximize2, Minimize2 } from "lucide-react";



const InventoryValuationForm = () => {
  const MODULE_SLUG = 'inventory';
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [stockOptions, setStockOptions] = useState([]);
  const [isModalMaximized, setIsModalMaximized] = useState(false);

  const [formData, setFormData] = useState({
    valuationMethod: '',
    stockId:'',
    stockValue: '',
    stockTurnoverRatio: '',
    lowStockAlerts: false,
    excessStockAlerts: false,
    monthlyStockReport: '',
  });

  const [reportData, setReportData] = useState([]);
  
  // Create refs for each input field
  const valuationMethodRef = useRef(null);
  const stockValueRef = useRef(null);
  const stockTurnoverRatioRef = useRef(null);
  const lowStockAlertsRef = useRef(null);
  const excessStockAlertsRef = useRef(null);
  const monthlyStockReportRef = useRef(null);

  const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };


  useEffect(() => {
  const fetchStockIds = async () => {
    try {
      const data = await getStockManagement();
      setStockOptions(data.map(item => item.stock_id)); // Only stock_id list
    } catch (err) {
      console.error("Error fetching stock IDs:", err);
    }
  };
  fetchStockIds();
}, []);

//Stock Valuation Report Details
useEffect(() => {
  const fetchReports = async () => {
    try {
      const data = await getValuationReports();
      setReportData(data);
    } catch (err) {
      console.error("❌ Error fetching valuation reports:", err);
    }
  };

  fetchReports();
}, []);

 

  const handleChange = (e) => {
  const { name, type, value, checked, files } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox'
      ? checked
      : type === 'file'
        ? files[0]?.name || ''
        : value
  }));
};

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  const handleOpen = (item = null) => {
  if (item) {
    setFormData({
      valuationMethod: item.valuation_method || '',
      stockId: item.stock || '',
      stockValue: item.stock_value || '',
      stockTurnoverRatio: item.stock_turnover_ratio || '',
      lowStockAlerts: !!item.low_stock_alert,
      excessStockAlerts: !!item.excess_stock_alert,
      monthlyStockReport: item.monthly_stock_report || ''
    });
  } else {
    setFormData({
      valuationMethod: '',
      stockId: '',
      stockValue: '',
      stockTurnoverRatio: '',
      lowStockAlerts: false,
      excessStockAlerts: false,
      monthlyStockReport: ''
    });
  }
  setOpen(true);
};



  const handleSubmit = async () => {
  try {
    const payload = {
      stock: formData.stockId,
      valuation_method: formData.valuationMethod
    };

    const res = await submitValuationReport(payload);

    // ✅ Refresh report list
    const updatedReports = await getValuationReports();
    setReportData(updatedReports);

    // ✅ Reset form
    setFormData({
      valuationMethod: '',
      stockId: '',
      stockValue: '',
      stockTurnoverRatio: '',
      lowStockAlerts: false,
      excessStockAlerts: false,
      monthlyStockReport: ''
    });

    // ✅ Close dialog
    setOpen(false);

    alert("✅ Valuation report generated successfully!");

  } catch (err) {
    alert(`⚠️ Failed to submit valuation: ${err.response?.data || err.message}`);
  }
};

  const handleEdit = (index) => {
    setFormData(reportData[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (idx) => {
  const reportId = reportData[idx].id; // ID from API
  if (!window.confirm("Are you sure you want to delete this report?")) return;

  try {
    await deleteValuationReport(reportId);
    setReportData((prev) => prev.filter((_, i) => i !== idx)); // Remove from UI
    console.log(`✅ Report ${reportId} deleted`);
    alert('Report Delete Successfully!!')
  } catch (err) {
    console.error("❌ Error deleting report:", err);
    alert('Something Went Wrong!!!')
  }
};

  return (
    <>
    <ShowIfCan slug={MODULE_SLUG} action="can_create">

      <Button variant="contained" onClick={() => setOpen(true)} sx={{backgroundColor:'#7267ef',mt:4}}>
        Add Inventory Valuation
      </Button>
      </ShowIfCan>
      <Dialog
             open={open}
            
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

        <DialogTitle>Inventory Valuation & Reporting</DialogTitle>
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
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Typography variant="subtitle2">Valuation Method</Typography>
              <select
                name="valuationMethod"
                className="input"
                value={formData.valuationMethod}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, stockValueRef)}
                ref={valuationMethodRef}
              >
                <option value="">Select</option>
                <option value="FIFO">FIFO</option>
                <option value="LIFO">LIFO</option>
                <option value="Weighted Average">Weighted Average</option>
              </select>
            </Grid>
             
<Grid item>
  <Typography variant="subtitle2">Stock ID</Typography>
  <input
    list="stockIdOptions" // Link to datalist ID
    name="stockId"
    type="text"
    value={formData.stockId}
    onChange={handleChange}
    className="input"
    onKeyDown={(e) => handleKeyDown(e, stockTurnoverRatioRef)}
    ref={stockValueRef}
    placeholder="Search Stock ID"
  />
  <datalist id="stockIdOptions">
    {stockOptions.map((id, index) => (
      <option key={index} value={id} />
    ))}
  </datalist>
</Grid>



            <Grid item>
              <Typography variant="subtitle2">Stock Value</Typography>
              <input
                name="stockValue"
                type="number"
                value={formData.stockValue}
                onChange={handleChange}
                className="input"
                onKeyDown={(e) => handleKeyDown(e, stockTurnoverRatioRef)}
                ref={stockValueRef}
              />
            </Grid>

            <Grid item>
              <Typography variant="subtitle2">Stock Turnover Ratio</Typography>
              <input
                name="stockTurnoverRatio"
                type="number"
                value={formData.stockTurnoverRatio}
                onChange={handleChange}
                className="input"
                onKeyDown={(e) => handleKeyDown(e, lowStockAlertsRef)}
                ref={stockTurnoverRatioRef}
              />
            </Grid>

            <Grid item>
              <label>
                <input
                  type="checkbox"
                  name="lowStockAlerts"
                  checked={formData.lowStockAlerts}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, excessStockAlertsRef)}
                  ref={lowStockAlertsRef}
                  style={{ marginRight: '8px' }}
                />
                Low Stock Alerts
              </label>
            </Grid>

            <Grid item>
              <label>
                <input
                  type="checkbox"
                  name="excessStockAlerts"
                  checked={formData.excessStockAlerts}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, monthlyStockReportRef)}
                  ref={excessStockAlertsRef}
                  style={{ marginRight: '8px' }}
                />
                Excess Stock Alerts
              </label>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2">Monthly Stock Report</Typography>
              <input
                type="file"
                name="monthlyStockReport"
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Don't focus on submit button, just stop here
                  }
                }}
                ref={monthlyStockReportRef}
                style={{ marginTop: '5px' }}
              />
              {formData.monthlyStockReport && (
                <Typography variant="caption" style={{ marginTop: '4px', display: 'block' }}>
                  {formData.monthlyStockReport}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setEditIndex(null);
            }}
            sx={{
              outline: '2px solid #800000',
              color: '#800000',
              '&:hover': {
                outline: '2px solid #b30000',
                color: '#b30000',
              },
            }}
          >
            Cancel
          </Button>
          <DisableIfCannot slug={MODULE_SLUG} action={editIndex !== null ? 'can_update' : 'can_create'}>

          <Button
            variant="outlined"
            onClick={handleSubmit}
            sx={{
              borderColor: '#7267ef',
              color: '#7267ef',
              '&:hover': {
                borderColor: '#9e8df2',
                color: '#9e8df2',
              },
            }}
          >
            {editIndex !== null ? 'Update' : 'Submit'}
          </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>

      {/* Table Always Visible */}
      <Box mt={4} sx={{ backgroundColor: '#fff', p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Inventory Reports
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              {['Stock ID','Valuation Method', 'Stock Value', 'Turnover Ratio', 'Monthly Report', 'Actions'].map(
                (header, idx) => (
                  <TableCell key={idx} sx={{ color: '#7267ef', fontWeight: 'bold' }}>
                    {header}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
  {reportData.length > 0 ? (
    reportData.map((row, idx) => (
      <TableRow key={idx}>
        <TableCell>{row.stock}</TableCell>
        <TableCell>{row.valuation_method}</TableCell>
        <TableCell>{row.stock_value}</TableCell>
        <TableCell>{row.stock_turnover_ratio}</TableCell>
        <TableCell>{row.monthly_stock_report || '—'}</TableCell>
        <TableCell>
        <DisableIfCannot slug={MODULE_SLUG} action="can_update">

          <IconButton onClick={() => handleEdit(idx)} sx={{ color: 'warning' }}>
            <Edit sx={{ color: "orange" }}/>
          </IconButton>
          </DisableIfCannot>
          <ShowIfCan slug={MODULE_SLUG} action="can_delete">
          <IconButton onClick={() => handleDelete(idx)} sx={{ color: 'error' }}>
            <Delete sx={{ color: "red" }}/>
          </IconButton>
          </ShowIfCan>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} align="center">
        No inventory reports added yet.
      </TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </Box>
    </>
  );
};

export default InventoryValuationForm;