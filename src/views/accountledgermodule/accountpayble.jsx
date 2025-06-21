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
  Paper
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';

const dummyProjects = [
  { id: "2025-VND-001" },
  { id: "2025-VND-002" },
  { id: "2025-VND-003" },
];

const Acoountpayble = () => {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [records, setRecords] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenForm = (projectId) => {
    const currentYear = new Date().getFullYear();
    const nextId = `INV-${currentYear}-${(records.length + 1).toString().padStart(3, '0')}`;

    setSelectedProjectId(projectId);
    setFormData({
      invoiceId: nextId,
      vendorId: projectId,
      invoiceDate: '',
      dueDate: '',
      totalAmount: '',
      amountPaid: '',
      paymentStatus: 'Pending',
      paymentMethod: '',
      approvalStatus: '',
      outstandingBalance: ''
    });
    setIsEditMode(false);
    setEditId(null);
    setOpen(true);
  };

  const handleEdit = (data) => {
    setFormData(data);
    setSelectedProjectId(data.vendorId);
    setIsEditMode(true);
    setEditId(data.invoiceId);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setRecords(records.filter(item => item.invoiceId !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === 'totalAmount' || name === 'amountPaid') {
      const total = parseFloat(updated.totalAmount || 0);
      const paid = parseFloat(updated.amountPaid || 0);
      updated.outstandingBalance = (total - paid).toFixed(2);
    }

    setFormData(updated);
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "Paid") return false;
    return new Date(dueDate) < new Date();
  };

  const handleSubmit = () => {
    if (isEditMode) {
      setRecords(records.map(item =>
        item.invoiceId === editId ? formData : item
      ));
    } else {
      setRecords([...records, formData]);
    }
    setOpen(false);
    setFormData({});
    setEditId(null);
    setIsEditMode(false);
  };

  const filteredRecords = records.filter((item) =>
    Object.values(item).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Accounts Payable
      </Typography>

      <Grid container spacing={2} direction="column">
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Vendor List</Typography>
            <input
              type="text"
              placeholder="Search Vendor ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ width: '100%', margin: '10px 0', padding: '8px', borderRadius: 4 }}
            />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Vendor ID</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}>
                                      <strong>Action</strong>
                                    </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyProjects
                  .filter(v => v.id.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((vendor, index) => (
                    <TableRow key={index}>
                      <TableCell>{vendor.id}</TableCell>
                     
                       <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                              <IconButton onClick={() => handleOpenForm(vendor.id)} color="primary">
                                                <AddCircle sx={{ color: "#7267ef" }} />
                                              </IconButton>
                                            </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Payable Records</Typography>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color:'#7267ef'}}>Invoice ID</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Vendor ID</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Invoice Date</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Due Date</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Total Amount</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Amount Paid</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Outstanding</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Status</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Method</TableCell>
                    <TableCell sx={{color:'#7267ef'}}>Approval</TableCell>
                    <TableCell sx={{color:'#660000'}}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((item, i) => (
                    <TableRow
                      key={i}
                      sx={{ backgroundColor: isOverdue(item.dueDate, item.paymentStatus) ? '#ffe6e6' : 'inherit' }}
                    >
                      <TableCell  >{item.invoiceId}</TableCell>
                      <TableCell  >{item.vendorId}</TableCell>
                      <TableCell  >{item.invoiceDate}</TableCell>
                      <TableCell  >{item.dueDate}</TableCell>
                      <TableCell  >{item.totalAmount}</TableCell>
                      <TableCell  >{item.amountPaid}</TableCell>
                      <TableCell  >{item.outstandingBalance}</TableCell>
                      <TableCell  >{item.paymentStatus}</TableCell>
                      <TableCell  >{item.paymentMethod}</TableCell>
                      <TableCell  >{item.approvalStatus}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(item)} color="warning" ><Edit  sx={{ color: "orange" }}/></IconButton>
                        <IconButton onClick={() => handleDelete(item.invoiceId)} color="error" ><Delete sx={{ color: "red" }}/></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {isEditMode ? "Edit Invoice Details" : "New Invoice Entry"}
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <label>Invoice ID</label>
              <input className="input" value={formData.invoiceId || ''} disabled />
            </Grid>
            <Grid item xs={6}>
              <label>Vendor ID</label>
              <input className="input" value={formData.vendorId || ''} disabled />
            </Grid>
            <Grid item xs={6}>
              <label>Invoice Date</label>
              <input name="invoiceDate" type="date" className="input" value={formData.invoiceDate || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <label>Due Date</label>
              <input name="dueDate" type="date" className="input" value={formData.dueDate || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <label>Total Amount</label>
              <input name="totalAmount" type="number" className="input" value={formData.totalAmount || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <label>Amount Paid</label>
              <input name="amountPaid" type="number" className="input" value={formData.amountPaid || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <label>Outstanding</label>
              <input className="input" value={formData.outstandingBalance || ''} disabled />
            </Grid>
            <Grid item xs={6}>
              <label>Payment Status</label>
              <select name="paymentStatus" className="input" value={formData.paymentStatus} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </Grid>
            <Grid item xs={6}>
              <label>Payment Method</label>
              <input name="paymentMethod" className="input" value={formData.paymentMethod || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <label>Approval Status</label>
              <input name="approvalStatus" className="input" value={formData.approvalStatus || ''} onChange={handleChange} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="outlined" sx={{ color: "#7267ef", borderColor: "#7267ef" }}>
            {isEditMode ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Acoountpayble;
