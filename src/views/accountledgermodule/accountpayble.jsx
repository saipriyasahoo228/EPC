import React, { useState ,useEffect} from "react";
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
import { getVendors } from "../../allapi/procurement";
import { createPayable,getPayables,deletePayable,updatePayable } from "../../allapi/account";
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";



const Acoountpayble = () => {
  const MODULE_SLUG = 'account_ledger';
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [records, setRecords] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [editingId,setEditingId] = useState(null);
  



   useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await getVendors();
        setVendors(data); // assuming API returns array of vendor objects
      } catch (error) {
        console.error("❌ Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);



  const fetchPayables = async () => {
  try {
    const data = await getPayables();
    setRecords(data); // API returns payable objects
  } catch (error) {
    console.error("❌ Error fetching payables:", error);
  }
};
useEffect(() => {
  fetchPayables();
}, []);


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

const handleEdit = (record) => {
  setFormData({
    invoiceId: record.invoice_id,   
    vendorId: record.vendor,
    invoiceDate: record.invoice_date,
    dueDate: record.due_date,
    totalAmount: record.total_amount,
    amountPaid: record.amount_paid,
    outstandingBalance: record.outstanding_balance,
    paymentStatus: record.payment_status,
    paymentMethod: record.payment_method,
    approvalStatus: record.approval_status,
  });

  setEditingId(record.invoice_id);   
  setIsEditMode(true);               
  setOpen(true);                     
};


 const handleDelete = async (invoiceId) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete invoice ${invoiceId}?`
  );
  if (!confirmDelete) return;

  try {
    await deletePayable(invoiceId);
    alert(`✅ Invoice ${invoiceId} deleted successfully!`);
    fetchPayables(); // refresh table
  } catch (error) {
    console.error("❌ Error deleting payable:", error);
    alert("❌ Failed to delete invoice. Please try again.");
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

  // 🔹 Handle form submission (POST)
const handleSubmit = async () => {
  try {
    const payload = {
      vendor: formData.vendorId,
      invoice_date: formData.invoiceDate,
      due_date: formData.dueDate,
      total_amount: parseFloat(formData.totalAmount || 0),
      amount_paid: parseFloat(formData.amountPaid || 0),
      payment_status: formData.paymentStatus,
      payment_method: formData.paymentMethod,
      approval_status: formData.approvalStatus,
    };

    if (isEditMode && editingId) {
      // 🔄 Update case
      const res = await updatePayable(editingId, payload);
      alert(`✅ Invoice ${res.invoice_id} updated successfully!`);
    } else {
      // 🆕 Create case
      const res = await createPayable(payload);
      alert(`✅ Payable created successfully! Invoice ID: ${res.invoice_id}`);
    }

    setOpen(false);
    setIsEditMode(false);  // reset
    setEditingId(null);    // reset
    fetchPayables();
  } catch (error) {
    console.error("❌ Error saving payable:", error.response?.data || error);
    alert("❌ Failed to save payable. Please try again.");
  }
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
      {vendors
        .filter((v) =>
          v.vendor_id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((vendor, index) => (
          <TableRow key={index}>
            <TableCell>{vendor.vendor_id}</TableCell>

            <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ShowIfCan slug={MODULE_SLUG} action="can_create">

              <IconButton
                onClick={() => handleOpenForm(vendor.vendor_id)}
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
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Payable Records</Typography>
            <TableContainer>
              <Table stickyHeader>
                <TableHead >
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
      sx={{ backgroundColor: isOverdue(item.due_date, item.payment_status) ? '#ffe6e6' : 'inherit' }}
    >
      <TableCell>{item.invoice_id}</TableCell>
      <TableCell>{item.vendor}</TableCell>
      <TableCell>{item.invoice_date}</TableCell>
      <TableCell>{item.due_date}</TableCell>
      <TableCell>{item.total_amount}</TableCell>
      <TableCell>{item.amount_paid}</TableCell>
      <TableCell>{item.outstanding_balance}</TableCell>
      <TableCell>{item.payment_status}</TableCell>
      <TableCell>{item.payment_method}</TableCell>
      <TableCell>{item.approval_status}</TableCell>
      <TableCell>
      <DisableIfCannot slug={MODULE_SLUG} action="can_update">

        <IconButton onClick={() => handleEdit(item)} color="warning">
          <Edit sx={{ color: "orange" }} />
        </IconButton>
        </DisableIfCannot>
        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
        <IconButton onClick={() => handleDelete(item.invoice_id)} color="error">
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
            {/* <Grid item xs={6}>
              <label>Payment Status</label>
              <select name="paymentStatus" className="input" value={formData.paymentStatus} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </Grid> */}
            <Grid item xs={6}>
  <label>Payment Status</label>
  <select
    name="paymentStatus"
    className="input"
    value={formData.paymentStatus || "Pending"}
    onChange={handleChange}
    disabled={isEditMode}   // ✅ disable only in edit mode
  >
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
          <Button onClick={() => setOpen(false)} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <DisableIfCannot slug={MODULE_SLUG} action={isEditMode && editingId ? 'can_update' : 'can_create'}>

          <Button onClick={handleSubmit} variant="outlined" sx={{ color: "#7267ef", borderColor: "#7267ef" }}>
            {isEditMode ? "Update" : "Submit"}
          </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Acoountpayble;
