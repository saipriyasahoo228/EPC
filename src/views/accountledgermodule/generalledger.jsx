import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  TablePagination,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { createLedger, getLedgers, updateLedger, deleteLedger } from '../../allapi/account';
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";
import { formatDateDDMMYYYY } from '../../utils/date';

const AccountLedger = () => {
  const MODULE_SLUG = 'account_ledger';
  const [ledgerItems, setLedgerItems] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    ledgerId: "",
    transactionDate: "",
    accountName: "",
    accountType: "",
    debitAmount: "",
    creditAmount: "",
    balance: 0,
    description: "",
    referenceNumber: "",
    approvalStatus: "",
  });

  // ✅ Fetch Ledger Data
  const fetchLedgers = async () => {
    try {
      const res = await getLedgers();
      setLedgerItems(res);
    } catch (err) {
      console.error("❌ Failed to fetch ledgers", err);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  // ✅ For Add New - FIXED: Use ledgerItems.length instead of items.length
  const handleOpen = () => {
    const currentYear = new Date().getFullYear();
    const newSystemNumber = ledgerItems.length + 1;
    const paddedNumber = newSystemNumber.toString().padStart(3, "0");

    setFormData({
      ledgerId: `LED-${currentYear}-${paddedNumber}`,
      transactionDate: "",
      accountName: "",
      accountType: "",
      debitAmount: "",
      creditAmount: "",
      balance: 0,
      description: "",
      referenceNumber: "",
      approvalStatus: "Pending",
    });

    setIsEditMode(false);
    setEditingId(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // ✅ For Edit
  const handleEdit = (record) => {
    setFormData({
      ledgerId: record.ledger_id || "",
      transactionDate: record.transaction_date || "",
      accountName: record.account_name || "",
      accountType: record.account_type || "",
      debitAmount: record.debit_amount || "",
      creditAmount: record.credit_amount || "",
      balance: record.balance || 0,
      description: record.description || "",
      referenceNumber: record.reference_number || "",
      approvalStatus: record.approval_status || "Pending",
    });

    setEditingId(record.ledger_id);
    setIsEditMode(true);
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      balance: name === "debitAmount" || name === "creditAmount"
        ? (Number(prev.debitAmount || 0) - Number(prev.creditAmount || 0)) +
          (name === "debitAmount" ? Number(value) : 0) -
          (name === "creditAmount" ? Number(value) : 0)
        : prev.balance,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        transaction_date: formData.transactionDate,
        account_name: formData.accountName,
        account_type: formData.accountType,
        debit_amount: parseFloat(formData.debitAmount) || 0,
        credit_amount: parseFloat(formData.creditAmount) || 0,
        description: formData.description,
        reference_number: formData.referenceNumber,
        approval_status: formData.approvalStatus,
      };

      if (editingId) {
        await updateLedger(editingId, payload);
        alert(`✅ Ledger ${editingId} updated successfully!`);
      } else {
        await createLedger(payload);
        alert("✅ Ledger entry created successfully!");
      }

      setFormData({
        transactionDate: "",
        accountName: "",
        accountType: "",
        debitAmount: "",
        creditAmount: "",
        balance: 0,
        description: "",
        referenceNumber: "",
        approvalStatus: "Pending",
      });
      setEditingId(null);
      handleClose();
      fetchLedgers();
    } catch (err) {
      console.error("❌ Error saving ledger:", err);
      alert("❌ Failed to save ledger entry");
    }
  };

  const handleDelete = async (ledgerId) => {
    if (!window.confirm(`Are you sure you want to delete Ledger ID: ${ledgerId}?`)) return;
    try {
      await deleteLedger(ledgerId);
      alert(`✅ Ledger ${ledgerId} deleted`);
      fetchLedgers();
    } catch (error) {
      alert(`❌ Failed to delete Ledger ${ledgerId}`);
    }
  };

  const filteredItems = ledgerItems.filter((d) =>
    Object.values(d).some(
      (val) => val && val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4"); // landscape
    doc.setFontSize(16);
    doc.text("All Account Ledger Report", 14, 15);

    const tableColumn = [
      "Ledger ID",
      "Transaction Date",
      "Account Name",
      "Account Type",
      "Debit Amount",
      "Credit Amount",
      "Balance",
      "Reference Number",
      "Approval Status",
    ];

    const tableRows = filteredItems.map((item) => [
      item.ledger_id,
      formatDateDDMMYYYY(item.transaction_date),
      item.account_name,
      item.account_type,
      item.debit_amount,
      item.credit_amount,
      item.balance,
      item.reference_number,
      item.approval_status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 6,        // shrink font a bit
        cellPadding: 2,
        cellWidth: "auto",  // auto-adjust column width
        overflow: "linebreak",
      },
      headStyles: { fillColor: [114, 103, 239] },
      tableWidth: "auto",   // fit entire table to page
    });

    doc.save("all_account_ledger_report.pdf");
  };

  return (
    <div>
      <ShowIfCan slug={MODULE_SLUG} action="can_create">

      <Button variant="contained" sx={{ mt: 4, mb: 2, backgroundColor: '#7267ef' }} onClick={handleOpen}>
        Add Ledger Entry
      </Button>
      </ShowIfCan>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f3f3f3', color: '#7267ef', display: 'flex', justifyContent: 'space-between' }}>
          {isEditMode ? 'Edit Ledger Entry' : 'Add Ledger Entry'}
          <IconButton onClick={handleClose} sx={{ color: '#7267ef' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} direction="column" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <label htmlFor="ledgerId">Ledger ID</label>
              <input
                id="ledgerId"
                name="ledgerId"
                className="input"
                value={formData.ledgerId || ""}
                readOnly
              />
            </Grid>

            <Grid item xs={12}><label>Transaction Date</label><input className="input" type="date" name="transactionDate" value={formData.transactionDate} onChange={handleChange} /></Grid>
            <Grid item xs={12}><label>Account Name</label><input className="input" name="accountName" value={formData.accountName} onChange={handleChange} placeholder="e.g., Revenue" /></Grid>
            <Grid item xs={12}><label>Account Type</label>
              <select className="input" name="accountType" value={formData.accountType} onChange={handleChange}>
                <option value="">Select Type</option>
                <option value="Assets">Assets</option>
                <option value="Liabilities">Liabilities</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expenses">Expenses</option>
              </select>
            </Grid>
            <Grid item xs={12}><label>Debit Amount</label><input className="input" name="debitAmount" type="number" value={formData.debitAmount} onChange={handleChange} /></Grid>
            <Grid item xs={12}><label>Credit Amount</label><input className="input" name="creditAmount" type="number" value={formData.creditAmount} onChange={handleChange} /></Grid>
            <Grid item xs={12}><label>Description</label><input className="input" name="description" value={formData.description} onChange={handleChange} placeholder="Transaction details..." /></Grid>
            <Grid item xs={12}><label>Reference Number</label><input className="input" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} /></Grid>
            <Grid item xs={12}><label>Approval Status</label>
              <select className="input" name="approvalStatus" value={formData.approvalStatus} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <DisableIfCannot slug={MODULE_SLUG} action={editingId ? 'can_update' : 'can_create'}>

          <Button variant="outlined" onClick={handleSubmit} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>Submit</Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>

      <Paper sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item><Typography variant="h6" gutterBottom sx={{ color: '#7267ef' }}>Account Ledger Report</Typography></Grid>
          <Grid item><Button
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{ backgroundColor: '#7267ef', color: '#fff', mt: 2, mb: 2 }}
          >
            Export PDF
          </Button></Grid>
        </Grid>
        <input type="text" placeholder="Search Ledger Entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input" />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#7267ef'}}>Ledger ID</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Date</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Account</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Type</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Debit</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Credit</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Balance</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Ref No</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Status</TableCell>
              <TableCell sx={{color:'#660000'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledgerItems
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.ledger_id}</TableCell>
                  <TableCell>{formatDateDDMMYYYY(item.transaction_date)}</TableCell>
                  <TableCell>{item.account_name}</TableCell>
                  <TableCell>{item.account_type}</TableCell>
                  <TableCell>{item.debit_amount}</TableCell>
                  <TableCell>{item.credit_amount}</TableCell>
                  <TableCell>{item.balance}</TableCell>
                  <TableCell>{item.reference_number}</TableCell>
                  <TableCell>{item.approval_status}</TableCell>
                  <TableCell>
                  <DisableIfCannot slug={MODULE_SLUG} action="can_update">

                    <IconButton onClick={() => handleEdit(item)}>
                      <Edit sx={{ color: "orange" }} />
                    </IconButton>
                    </DisableIfCannot>
                    <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                    <IconButton onClick={() => handleDelete(item.ledger_id)}>
                      <Delete sx={{ color: "red" }} />
                    </IconButton>
                    </ShowIfCan>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={ledgerItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default AccountLedger;