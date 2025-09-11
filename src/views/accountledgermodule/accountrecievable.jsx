import React, { useState ,useEffect} from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Typography, IconButton, Box,
  Table, TableHead, TableRow, TableCell, TableBody, Paper
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close"; 
import { getGuests ,createReceivable,getReceivables,deleteReceivable,updateReceivable} from "../../allapi/account";



const AccountsReceivable = () => {
  const [open, setOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState("");
  
  const [records, setRecords] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [guests, setGuests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
  invoiceId: "",
  invoiceDate: "",
  dueDate: "",
  totalAmount: "",
  amountPaid: "",
  paymentStatus: "Pending",
  paymentMethod: "",
  approvalStatus: "Pending",
});

  useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getGuests();
      setGuests(data);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };
  fetchData();
}, []);

useEffect(() => {
  fetchRecords();
}, []);

const fetchRecords = async () => {
  try {
    const data = await getReceivables();
    setRecords(data);
  } catch (error) {
    console.error("Error fetching receivables:", error);
  }
};


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
      approvalStatus: "Pending",
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

  const outstandingBalance =
  (parseFloat(formData.totalAmount) || 0) -
  (parseFloat(formData.amountPaid) || 0);


//   const handleSubmit = async () => {
//   try {
//     const payload = {
//       guest: selectedGuestId, // this is the guest_id
//       invoice_id:formData.invoiceId,
//       invoice_date: formData.invoiceDate,
//       due_date: formData.dueDate,
//       total_amount: parseFloat(formData.totalAmount),
//       amount_received: parseFloat(formData.amountPaid),
//       payment_status: formData.paymentStatus,
//       payment_method: formData.paymentMethod,
//       approval_status: formData.approvalStatus,
//     };

//     const res = await createReceivable(payload);
//     alert("Receivable added successfully ✅");

//     await fetchRecords();

//     setOpen(false);
//     setFormData({
//       invoiceId: "",
//       invoiceDate: "",
//       dueDate: "",
//       totalAmount: "",
//       amountPaid: "",
//       paymentStatus: "Pending",
//       paymentMethod: "",
//       approvalStatus: "Pending",
//     });
//   } catch (err) {
//     console.error(err);
//     alert("❌ Failed to add receivable");
//   }
// };
const handleSubmit = async () => {
  try {
    const payload = {
      guest: selectedGuestId,
      invoice_id: formData.invoiceId,
      invoice_date: formData.invoiceDate,
      due_date: formData.dueDate,
      total_amount: parseFloat(formData.totalAmount),
      amount_received: parseFloat(formData.amountPaid),
      payment_status: formData.paymentStatus,
      payment_method: formData.paymentMethod,
      approval_status: formData.approvalStatus,
    };

    let res;
    if (isEditing) {
      // Use updateReceivable for editing
      res = await updateReceivable(editingId, payload);
      alert("Receivable updated successfully ✅");
    } else {
      // Use createReceivable for new entries
      res = await createReceivable(payload);
      alert("Receivable added successfully ✅");
    }

    await fetchRecords();
    
    // Reset form and close modal
    setOpen(false);
    resetForm();
    
  } catch (err) {
    console.error(err);
    alert(`❌ Failed to ${isEditing ? 'update' : 'add'} receivable`);
  }
};

// Reset form function
const resetForm = () => {
  setIsEditing(false);
  setEditingId(null);
  setFormData({
    invoiceId: "",
    invoiceDate: "",
    dueDate: "",
    totalAmount: "",
    amountPaid: "",
    paymentStatus: "Pending",
    paymentMethod: "",
    approvalStatus: "Pending",
  });
  setSelectedGuestId(null);
};



  // const handleEdit = (data) => {
  //   setSelectedGuestId(data.guestId);
  //   setFormData(data);
  //   setIsEditMode(true);
  //   setEditId(data.invoiceId);
  //   setOpen(true);
  // };

  const handleEdit = (receivable) => {
  setIsEditing(true);
  setEditingId(receivable.invoice_id); // or receivable.invoice_id depending on your data structure
  
  setFormData({
    invoiceId: receivable.invoice_id || "",
    invoiceDate: receivable.invoice_date || "",
    dueDate: receivable.due_date || "",
    totalAmount: receivable.total_amount?.toString() || "",
    amountPaid: receivable.amount_received?.toString() || "",
    paymentStatus: receivable.payment_status || "Pending",
    paymentMethod: receivable.payment_method || "",
    approvalStatus: receivable.approval_status || "Pending",
  });
  
  setSelectedGuestId(receivable.guest || null);
  setOpen(true); // Open the modal
};

  const handleDelete = async (invoiceId) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete invoice ${invoiceId}?`
  );

  if (!confirmDelete) return;

  try {
    await deleteReceivable(invoiceId);
    setRecords((prev) => prev.filter((rec) => rec.invoice_id !== invoiceId));
    alert("Record deleted successfully!");
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete record.");
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
                   <TableCell sx={{ color: '#7267ef' }}><strong>Guest Name</strong></TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
             <TableBody>
  {guests.map((guest, i) => (
    <TableRow key={i}>
      <TableCell>{guest.guest_id}</TableCell>
      <TableCell>{guest.name}</TableCell>
      <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={() => handleOpenForm(guest.guest_id)}>
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
                  <TableCell sx={{color:'#7267ef'}}>Payment Status</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Payment Method</TableCell>
                  <TableCell sx={{color:'#7267ef'}}>Approval Status</TableCell>
                  <TableCell sx={{color:'#660000'}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.invoice_id}</TableCell>
                    <TableCell>{r.guest_id}</TableCell>
                    <TableCell>{r.invoice_date}</TableCell>
                    <TableCell>{r.due_date}</TableCell>
                    <TableCell>{r.total_amount}</TableCell>
                    <TableCell>{r.amount_received}</TableCell>
                    <TableCell>{r.outstanding_balance}</TableCell>
                    <TableCell>{r.payment_status}</TableCell>
                    <TableCell>{r.payment_method}</TableCell>
                    <TableCell>{r.approval_status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(r)}><Edit sx={{ color: "orange" }} /></IconButton>
                      <IconButton onClick={() => handleDelete(r.invoice_id)}><Delete sx={{ color: "red" }}/></IconButton>
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
  <label>Outstanding Balance</label>
  <input
    type="number"
    className="input"
    value={outstandingBalance}
    disabled
  />
</Grid>

           
            <Grid item xs={6}>
  <label>Payment Status</label>
  <select
    name="paymentStatus"
    className="input"
    value={formData.paymentStatus || "Pending"}
    onChange={handleChange}
    disabled={isEditing}
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
  <select
    name="approvalStatus"
    className="input"
    value={formData.approvalStatus || "Pending"}
    onChange={handleChange}
  >
   
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
    <option value="Rejected">Rejected</option>
  </select>
</Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <Button variant="outlined" onClick={handleSubmit} sx={{ color: "#7267ef", borderColor: "#7267ef" }}>
           {isEditing ? 'Update Receivable' : 'Add Receivable'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountsReceivable;
