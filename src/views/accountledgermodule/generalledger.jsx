import React, { useState } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';

const AccountLedger = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    transactionDate: '',
    accountName: '',
    accountType: '',
    debitAmount: '',
    creditAmount: '',
    balance: 0,
    description: '',
    referenceNumber: '',
    approvalStatus: '',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const generateLedgerId = () => {
    const currentYear = new Date().getFullYear();
    const nextId = items.length + 1;
    return `LED-${currentYear}-${String(nextId).padStart(3, '0')}`;
  };

  const handleOpen = (item = null) => {
    setEditItem(item);
    setOpen(true);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({
        transactionDate: '',
        accountName: '',
        accountType: '',
        debitAmount: '',
        creditAmount: '',
        balance: 0,
        description: '',
        referenceNumber: '',
        approvalStatus: '',
      });
    }
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'creditAmount' || name === 'debitAmount') {
        const credit = parseFloat(updated.creditAmount) || 0;
        const debit = parseFloat(updated.debitAmount) || 0;
        const previousBalance = editItem ? editItem.balance : 0;
        updated.balance = previousBalance + credit - debit;
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (editItem) {
      const updatedItems = items.map((item) =>
        item.ledgerId === editItem.ledgerId ? { ...item, ...formData } : item
      );
      setItems(updatedItems);
    } else {
      const newItem = {
        ledgerId: generateLedgerId(),
        ...formData,
      };
      setItems([...items, newItem]);
    }
    setEditItem(null);
    handleClose();
  };

  const handleDelete = (id) => {
  const confirmed = window.confirm("Are you sure you want to delete this ledger entry?");
  if (confirmed) {
    setItems(items.filter((item) => item.ledgerId !== id));
  }
};


  const filteredItems = items.filter((d) =>
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
    const doc = new jsPDF();
    const tableData = filteredItems.map((item) => [
      item.ledgerId,
      item.transactionDate,
      item.accountName,
      item.accountType,
      item.debitAmount,
      item.creditAmount,
      item.balance,
      item.referenceNumber,
      item.approvalStatus,
    ]);

    doc.autoTable({
      head: [['Ledger ID', 'Date', 'Account', 'Type', 'Debit', 'Credit', 'Balance', 'Ref No', 'Status']],
      body: tableData,
    });

    doc.save('ledger_report.pdf');
  };

  return (
    <div>
      <Button variant="contained" sx={{ mt: 4, mb: 2, backgroundColor: '#7267ef' }} onClick={() => handleOpen()}>
        Add Ledger Entry
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f3f3f3', color: '#7267ef', display: 'flex', justifyContent: 'space-between' }}>
          {editItem ? 'Edit Ledger Entry' : 'Add Ledger Entry'}
          <IconButton onClick={handleClose} sx={{ color: '#7267ef' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} direction="column" sx={{ mt: 1 }}>
            <Grid item xs={12}><label>Ledger ID</label><input className="input" disabled value={editItem ? editItem.ledgerId : generateLedgerId()} /></Grid>
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
            <Grid item xs={12}><label>Balance</label><input className="input" name="balance" type="number" value={formData.balance} disabled /></Grid>
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
          <Button variant="outlined" onClick={handleSubmit} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item><Typography variant="h6" gutterBottom sx={{ color: '#7267ef' }}>Account Ledger Report</Typography></Grid>
          <Grid item><Button onClick={handleExportPDF} sx={{ backgroundColor: '#7267ef', color: '#fff', mt: 2, mb: 2 }}>Export PDF</Button></Grid>
        </Grid>
        <input type="text" placeholder="Search Ledger Entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input" />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ledger ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Debit</TableCell>
              <TableCell>Credit</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Ref No</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.ledgerId}</TableCell>
                <TableCell>{item.transactionDate}</TableCell>
                <TableCell>{item.accountName}</TableCell>
                <TableCell>{item.accountType}</TableCell>
                <TableCell>{item.debitAmount}</TableCell>
                <TableCell>{item.creditAmount}</TableCell>
                <TableCell>{item.balance}</TableCell>
                <TableCell>{item.referenceNumber}</TableCell>
                <TableCell>{item.approvalStatus}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(item)}><Edit sx={{ color: 'orange' }} /></IconButton>
                  <IconButton onClick={() => handleDelete(item.ledgerId)}><Delete sx={{ color: 'red' }} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
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
