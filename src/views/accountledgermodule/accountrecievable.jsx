import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Typography, IconButton, Box,
  Table, TableHead, TableRow, TableCell, TableBody, Paper
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const dummyGuests = [
  { id: "GUEST-2025-001" },
  { id: "GUEST-2025-002" },
  { id: "GUEST-2025-003" },
];

const AccountsReceivable = () => {
  const [open, setOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [formData, setFormData] = useState({});
  const [records, setRecords] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleOpenForm = (guestId) => {
    const newId = `INV-${new Date().getFullYear()}-${(records.length + 1)
      .toString()
      .padStart(3, "0")}`;
    setSelectedGuestId(guestId);
    setFormData({
      invoiceId: newId,
      guestId: guestId,
      invoiceDate: "",
      dueDate: "",
      totalAmount: "",
      amountPaid: "",
      paymentStatus: "Pending",
      paymentMethod: "",
      approvalStatus: "",
    });
    setIsEditMode(false);
    setOpen(true);
  };

  const handleClose = () => {
    setFormData({});
    setOpen(false);
    setIsEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateOutstanding = (total, paid) => {
    return parseFloat(total || 0) - parseFloat(paid || 0);
  };

  const handleSubmit = () => {
    const updatedData = {
      ...formData,
      outstandingBalance: calculateOutstanding(formData.totalAmount, formData.amountPaid),
    };

    if (isEditMode) {
      setRecords((prev) =>
        prev.map((item) =>
          item.invoiceId === editId ? updatedData : item
        )
      );
    } else {
      setRecords((prev) => [...prev, updatedData]);
    }

    handleClose();
  };

  const handleEdit = (data) => {
    setSelectedGuestId(data.guestId);
    setFormData(data);
    setIsEditMode(true);
    setEditId(data.invoiceId);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this invoice?")) {
      setRecords(records.filter((r) => r.invoiceId !== id));
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mt: 4 }}>Accounts Receivable</Typography>

      <Grid container spacing={2} sx={{ mt: 2 }} direction="column">
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Guest List</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#7267ef' }}><strong>Guest ID</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyGuests.map((guest, i) => (
                  <TableRow key={i}>
                    <TableCell>{guest.id}</TableCell>
                    <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => handleOpenForm(guest.id)} >
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
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Receivable Records</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{color:'#7267ef'}}>Invoice ID</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Guest ID</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Invoice Date</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Due Date</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Total</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Paid</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Outstanding</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Status</TableCell>
                  <TableCell sx={{color:'#660000'}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.invoiceId}</TableCell>
                    <TableCell>{r.guestId}</TableCell>
                    <TableCell>{r.invoiceDate}</TableCell>
                    <TableCell>{r.dueDate}</TableCell>
                    <TableCell>{r.totalAmount}</TableCell>
                    <TableCell>{r.amountPaid}</TableCell>
                    <TableCell>{r.outstandingBalance}</TableCell>
                    <TableCell>{r.paymentStatus}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(r)}><Edit /></IconButton>
                      <IconButton onClick={() => handleDelete(r.invoiceId)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          {isEditMode ? "Edit Receivable" : "Add Receivable"}
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <label>Guest ID</label>
              <input className="input" value={selectedGuestId} disabled />
            </Grid>
            <Grid item xs={6}>
              <label>Invoice ID</label>
              <input className="input" value={formData.invoiceId || ""} disabled />
            </Grid>
            <Grid item xs={6}>
              <label>Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                className="input"
                value={formData.invoiceDate || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                className="input"
                value={formData.dueDate || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label>Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                className="input"
                value={formData.totalAmount || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label>Amount Paid</label>
              <input
                type="number"
                name="amountPaid"
                className="input"
                value={formData.amountPaid || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label>Payment Status</label>
              <select
                name="paymentStatus"
                className="input"
                value={formData.paymentStatus || "Pending"}
                onChange={handleChange}
              >
                <option>Pending</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
            </Grid>
            <Grid item xs={6}>
              <label>Payment Method</label>
              <input
                name="paymentMethod"
                className="input"
                value={formData.paymentMethod || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <label>Approval Status</label>
              <input
                name="approvalStatus"
                className="input"
                value={formData.approvalStatus || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <Button variant="outlined" onClick={handleSubmit} sx={{ color: "#7267ef", borderColor: "#7267ef" }}>
            {isEditMode ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountsReceivable;
