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
  TextareaAutosize,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import CloseIcon from '@mui/icons-material/Close';
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";

const FinancialReports = () => {
  const MODULE_SLUG = 'account_ledger';
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    reportType: '',
    generatedDate: '',
    preparedBy: '',
    approvalStatus: '',
    comments: '',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = (item = null) => {
    setEditItem(item);
    setOpen(true);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({
        reportType: '',
        generatedDate: '',
        preparedBy: '',
        approvalStatus: '',
        comments: '',
      });
    }
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateReportId = () => {
    const year = new Date().getFullYear();
    const nextId = reports.length + 1;
    return `REP-${year}-${String(nextId).padStart(3, '0')}`;
  };

  const handleSubmit = () => {
    if (editItem) {
      const updated = reports.map((item) =>
        item.reportId === editItem.reportId ? { ...item, ...formData } : item
      );
      setReports(updated);
    } else {
      const newReport = {
        reportId: generateReportId(),
        ...formData,
      };
      setReports([...reports, newReport]);
    }
    handleClose();
    setEditItem(null);
  };

 const handleDelete = (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this report?");
  if (confirmDelete) {
    const updated = reports.filter((item) => item.reportId !== id);
    setReports(updated);
  }
};


  const filteredReports = reports.filter((r) =>
    Object.values(r).some((val) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const data = filteredReports.map((item) => [
      item.reportId,
      item.reportType,
      item.generatedDate,
      item.preparedBy,
      item.approvalStatus,
      item.comments,
    ]);
    doc.autoTable({
      head: [['ID', 'Type', 'Date', 'Prepared By', 'Status', 'Comments']],
      body: data,
    });
    doc.save('financial_reports.pdf');
  };

  return (
    <div>
      <ShowIfCan slug={MODULE_SLUG} action="can_create">

      <Button variant="contained" sx={{ mt: 4, mb: 2, backgroundColor: '#7267ef' }} onClick={() => handleOpen()}>
        Add Financial Report
      </Button>
      </ShowIfCan>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f3f3f3', color: '#7267ef', display: 'flex', justifyContent: 'space-between' }}>
          {editItem ? 'Edit Financial Report' : 'Add Financial Report'}
          <IconButton onClick={handleClose} sx={{ color: '#7267ef' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction="column" sx={{ mt: 1 }}>
            <Grid item xs={12}><label>Report ID (Auto)</label><input className="input" disabled value={editItem ? editItem.reportId : generateReportId()} /></Grid>
            <Grid item xs={12}><label>Report Type</label>
              <select className="input" name="reportType" value={formData.reportType} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Income Statement">Income Statement</option>
                <option value="Balance Sheet">Balance Sheet</option>
                <option value="Cash Flow">Cash Flow</option>
              </select>
            </Grid>
            <Grid item xs={12}><label>Generated Date</label><input type="date" className="input" name="generatedDate" value={formData.generatedDate} onChange={handleChange} /></Grid>
            <Grid item xs={12}><label>Prepared By</label><input className="input" name="preparedBy" value={formData.preparedBy} onChange={handleChange} /></Grid>
            <Grid item xs={12}><label>Approval Status</label>
              <select className="input" name="approvalStatus" value={formData.approvalStatus} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Grid>
            <Grid item xs={12}><label>Comments</label>
              <TextareaAutosize
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                className="input"
                minRows={3}
                placeholder="Enter comments here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <DisableIfCannot slug={MODULE_SLUG} action={editItem ? 'can_update' : 'can_create'}>

          <Button variant="outlined" onClick={handleSubmit} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>Submit</Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>

      <Paper sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6" gutterBottom sx={{ color: '#7267ef' }}>
              Financial Reports
            </Typography>
          </Grid>
          <Grid item>
            <Button onClick={handleExportPDF} sx={{ backgroundColor: '#7267ef', color: '#fff', mt: 2, mb: 2 }}>
              Export PDF
            </Button>
          </Grid>
        </Grid>
        <input
          type="text"
          placeholder="Search Reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell  sx={{color:'#7267ef'}}>ID</TableCell>
              <TableCell  sx={{color:'#7267ef'}}>Type</TableCell>
              <TableCell  sx={{color:'#7267ef'}}>Date</TableCell>
              <TableCell  sx={{color:'#7267ef'}}>Prepared By</TableCell>
              <TableCell  sx={{color:'#7267ef'}}>Status</TableCell>
              <TableCell  sx={{color:'#7267ef'}}>Comments</TableCell>
              <TableCell sx={{color:'#660000'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.reportId}</TableCell>
                <TableCell>{item.reportType}</TableCell>
                <TableCell>{item.generatedDate}</TableCell>
                <TableCell>{item.preparedBy}</TableCell>
                <TableCell>{item.approvalStatus}</TableCell>
                <TableCell>{item.comments}</TableCell>
                <TableCell>
                <DisableIfCannot slug={MODULE_SLUG} action="can_update">

                  <IconButton color="warning" onClick={() => handleOpen(item)}>
                    <Edit sx={{ color: 'orange' }} />
                  </IconButton>
                  </DisableIfCannot>
                  <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                  <IconButton color="error" onClick={() => handleDelete(item.reportId)}>
                    <Delete sx={{ color: 'red' }} />
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
          count={filteredReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>
    </div>
  );
};

export default FinancialReports;