// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Grid,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
//   Typography,
//   Box,
//   IconButton,
// } from '@mui/material';
// import { Edit, Delete } from '@mui/icons-material';

// const InventoryValuationForm = () => {
//   const [open, setOpen] = useState(false);
//   const [editIndex, setEditIndex] = useState(null);
//   const [formData, setFormData] = useState({
//     valuationMethod: '',
//     stockValue: '',
//     stockTurnoverRatio: '',
//     lowStockAlerts: false,
//     excessStockAlerts: false,
//     monthlyStockReport: '',
//   });

//   const [reportData, setReportData] = useState([]);

//   const handleChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     const updatedValue =
//       type === 'checkbox'
//         ? checked
//         : type === 'file'
//         ? files[0]?.name
//         : value;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: updatedValue,
//     }));
//   };

//   const handleSubmit = () => {
//     if (editIndex !== null) {
//       const updated = [...reportData];
//       updated[editIndex] = formData;
//       setReportData(updated);
//       setEditIndex(null);
//     } else {
//       setReportData((prev) => [...prev, formData]);
//     }

//     setFormData({
//       valuationMethod: '',
//       stockValue: '',
//       stockTurnoverRatio: '',
//       lowStockAlerts: false,
//       excessStockAlerts: false,
//       monthlyStockReport: '',
//     });
//     setOpen(false);
//   };

//   const handleEdit = (index) => {
//     setFormData(reportData[index]);
//     setEditIndex(index);
//     setOpen(true);
//   };

//   const handleDelete = (index) => {
//     const filtered = reportData.filter((_, i) => i !== index);
//     setReportData(filtered);
//   };

//   return (
//     <>
//       <Button variant="contained" onClick={() => setOpen(true)} sx={{backgroundColor:'#7267ef',mt:4}}>
//         Add Inventory Valuation
//       </Button>

//       <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Inventory Valuation & Reporting</DialogTitle>
//         <DialogContent dividers>
//           <Grid container spacing={2} direction="column">
//             <Grid item>
//               <Typography variant="subtitle2">Valuation Method</Typography>
//               <select
//                 name="valuationMethod"
//                 className="input"
//                 value={formData.valuationMethod}
//                 onChange={handleChange}
//               >
//                 <option value="">Select</option>
//                 <option value="FIFO">FIFO</option>
//                 <option value="LIFO">LIFO</option>
//                 <option value="Weighted Average">Weighted Average</option>
//               </select>
//             </Grid>

//             <Grid item>
//               <Typography variant="subtitle2">Stock Value</Typography>
//               <input
//                 name="stockValue"
//                 type="number"
//                 value={formData.stockValue}
//                 onChange={handleChange}
//                 className="input"
//               />
//             </Grid>

//             <Grid item>
//               <Typography variant="subtitle2">Stock Turnover Ratio</Typography>
//               <input
//                 name="stockTurnoverRatio"
//                 type="number"
//                 value={formData.stockTurnoverRatio}
//                 onChange={handleChange}
//                 className="input"
//               />
//             </Grid>

//             <Grid item>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="lowStockAlerts"
//                   checked={formData.lowStockAlerts}
//                   onChange={handleChange}
//                   style={{ marginRight: '8px' }}
//                 />
//                 Low Stock Alerts
//               </label>
//             </Grid>

//             <Grid item>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="excessStockAlerts"
//                   checked={formData.excessStockAlerts}
//                   onChange={handleChange}
//                   style={{ marginRight: '8px' }}
//                 />
//                 Excess Stock Alerts
//               </label>
//             </Grid>

//             <Grid item>
//               <Typography variant="subtitle2">Monthly Stock Report</Typography>
//               <input
//                 type="file"
//                 name="monthlyStockReport"
//                 onChange={handleChange}
//                 style={{ marginTop: '5px' }}
//               />
//               {formData.monthlyStockReport && (
//                 <Typography variant="caption" style={{ marginTop: '4px', display: 'block' }}>
//                   {formData.monthlyStockReport}
//                 </Typography>
//               )}
//             </Grid>
//           </Grid>
//         </DialogContent>

//         <DialogActions>
//           <Button
//             onClick={() => {
//               setOpen(false);
//               setEditIndex(null);
//             }}
//             sx={{
//               outline: '2px solid #800000',
//               color: '#800000',
//               '&:hover': {
//                 outline: '2px solid #b30000',
//                 color: '#b30000',
//               },
//             }}
//           >
//             Cancel
//           </Button>

//           <Button
//             variant="outlined"
//             onClick={handleSubmit}
//             sx={{
//               borderColor: '#7267ef',
//               color: '#7267ef',
//               '&:hover': {
//                 borderColor: '#9e8df2',
//                 color: '#9e8df2',
//               },
//             }}
//           >
//             {editIndex !== null ? 'Update' : 'Submit'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Table Always Visible */}
//       <Box mt={4} sx={{ backgroundColor: '#fff', p: 2, borderRadius: 2, boxShadow: 1 }}>
//         <Typography variant="h6" gutterBottom>
//           Inventory Reports
//         </Typography>
//         <Table>
//           <TableHead>
//             <TableRow>
//               {['Valuation Method', 'Stock Value', 'Turnover Ratio', 'Monthly Report', 'Actions'].map(
//                 (header, idx) => (
//                   <TableCell key={idx} sx={{ color: '#7267ef', fontWeight: 'bold' }}>
//                     {header}
//                   </TableCell>
//                 )
//               )}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {reportData.length > 0 ? (
//               reportData.map((row, idx) => (
//                 <TableRow key={idx}>
//                   <TableCell>{row.valuationMethod}</TableCell>
//                   <TableCell>{row.stockValue}</TableCell>
//                   <TableCell>{row.stockTurnoverRatio}</TableCell>
//                   <TableCell>{row.monthlyStockReport}</TableCell>
//                   <TableCell>
//                     <IconButton onClick={() => handleEdit(idx)} sx={{ color: 'warning' }}>
//                       <Edit sx={{ color: "orange" }}/>
//                     </IconButton>
//                     <IconButton onClick={() => handleDelete(idx)} sx={{ color: 'error' }}>
//                       <Delete sx={{ color: "red" }}/>
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={5} align="center">
//                   No inventory reports added yet.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </Box>
//     </>
//   );
// };

// export default InventoryValuationForm;
import React, { useState, useRef } from 'react';
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

const InventoryValuationForm = () => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    valuationMethod: '',
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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const updatedValue =
      type === 'checkbox'
        ? checked
        : type === 'file'
        ? files[0]?.name
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
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

  const handleSubmit = () => {
    if (editIndex !== null) {
      const updated = [...reportData];
      updated[editIndex] = formData;
      setReportData(updated);
      setEditIndex(null);
    } else {
      setReportData((prev) => [...prev, formData]);
    }

    setFormData({
      valuationMethod: '',
      stockValue: '',
      stockTurnoverRatio: '',
      lowStockAlerts: false,
      excessStockAlerts: false,
      monthlyStockReport: '',
    });
    setOpen(false);
  };

  const handleEdit = (index) => {
    setFormData(reportData[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = (index) => {
    const filtered = reportData.filter((_, i) => i !== index);
    setReportData(filtered);
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{backgroundColor:'#7267ef',mt:4}}>
        Add Inventory Valuation
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inventory Valuation & Reporting</DialogTitle>
        <DialogContent dividers>
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
              {['Valuation Method', 'Stock Value', 'Turnover Ratio', 'Monthly Report', 'Actions'].map(
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
                  <TableCell>{row.valuationMethod}</TableCell>
                  <TableCell>{row.stockValue}</TableCell>
                  <TableCell>{row.stockTurnoverRatio}</TableCell>
                  <TableCell>{row.monthlyStockReport}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(idx)} sx={{ color: 'warning' }}>
                      <Edit sx={{ color: "orange" }}/>
                    </IconButton>
                    <IconButton onClick={() => handleDelete(idx)} sx={{ color: 'error' }}>
                      <Delete sx={{ color: "red" }}/>
                    </IconButton>
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