import React, { useState ,useEffect} from 'react';
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
import autoTable from "jspdf-autotable";
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import {DisableIfCannot,ShowIfCan} from "../../components/auth/RequirePermission";
import { createFinancialReport,getFinancialReports,deleteFinancialReport,updateFinancialReport } from "../../allapi/account";
import { formatDateDDMMYYYY } from '../../utils/date';

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

  const fetchFinancialReports = async () => {
  try {
    const data = await getFinancialReports();
    setReports(data);
  } catch (err) {
    console.error("Error fetching reports:", err);
  }
};

useEffect(() => {
  fetchFinancialReports();
}, []);

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


  const handleEdit = (report) => {
  setEditItem(report); // store the selected report for update

  setFormData({
    reportId: report.report_id || "",  
    reportType: report.report_type || "",       // backend uses snake_case
    generatedDate: report.generated_date || "",
    preparedBy: report.prepared_by || "",
    approvalStatus: report.approval_status || "",
    comments: report.comments || "",
  });

  setOpen(true); // open the dialog
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateReportId = () => {
    const year = new Date().getFullYear();
    const nextId = reports.length + 1;
    return `REP-${year}-${String(nextId).padStart(4, '0')}`;
  };
//HandleSubmit Logic
  const handleSubmit = async () => {
  try {
    const payload = {
      report_type: formData.reportType,
      generated_date: formData.generatedDate,
      prepared_by: formData.preparedBy,
      approval_status: formData.approvalStatus,
      comments: formData.comments,
    };

    if (editItem) {
      // 🔹 update case
      const updatedReport = await updateFinancialReport(editItem.report_id, payload);
      alert(`Report ${updatedReport.report_id} updated successfully`);
    } else {
      // 🔹 create case
      const savedReport = await createFinancialReport(payload);
      alert(`Report ${savedReport.report_id} created successfully`);
    }

    handleClose();
    fetchFinancialReports(); // refresh list after action
  } catch (err) {
    console.error("Error saving financial report:", err);
    alert("Something went wrong while saving the financial report");
  }
};




 const handleDelete = async (reportId) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete Financial Report: ${reportId}?`
  );

  if (!confirmDelete) return;

  try {
    await deleteFinancialReport(reportId);
    fetchFinancialReports(); // refresh list

    // ✅ Show success message
    alert(`Report ${reportId} deleted successfully`);
  } catch (err) {
    console.error("Error deleting report:", err);
    alert("Failed to delete report");
  }
};



  const filteredReports = reports.filter((r) =>
    Object.values(r).some((val) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4"); // landscape
    doc.setFontSize(16);
    doc.text("All Financial Reports", 14, 15);

    const tableColumn = [
      "Report ID",
      "Report Type",
      "Generated Date",
      "Prepared By",
      "Approval Status",
      "Comments",
    ];

    const tableRows = filteredReports.map((item) => [
      item.report_id,
      item.report_type,
      formatDateDDMMYYYY(item.generated_date),
      item.prepared_by,
      item.approval_status,
      item.comments,
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

    doc.save("all_financial_reports.pdf");
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
            <Grid item xs={12}>
              <label>Report ID (Auto)</label>
              <input className="input" 
              disabled 
               value={formData.reportId || generateReportId()}
              />
              </Grid>
            <Grid item xs={12}><label>Report Type</label>
              <select
  className="input"
  name="reportType"
  value={formData.reportType}
  onChange={handleChange}
>
  <option value="">Select</option>
  <option value="Balance Sheet">Balance Sheet</option>
  <option value="Income Statement">Income Statement</option>
  <option value="Cash Flow Statement">Cash Flow Statement</option>
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
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              sx={{ backgroundColor: '#7267ef', color: '#fff', mt: 2, mb: 2 }}
            >
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
                <TableCell>{item.report_id}</TableCell>
        <TableCell>{item.report_type}</TableCell>
        <TableCell>{formatDateDDMMYYYY(item.generated_date)}</TableCell>
        <TableCell>{item.prepared_by}</TableCell>
        <TableCell>{item.approval_status}</TableCell>
        <TableCell>{item.comments}</TableCell>
                <TableCell>
                <DisableIfCannot slug={MODULE_SLUG} action="can_update">

                  <IconButton color="warning" onClick={() => handleEdit(item)}>
                    <Edit sx={{ color: 'orange' }} />
                  </IconButton>
                  </DisableIfCannot>
                  <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                  <IconButton color="error" onClick={() => handleDelete(item.report_id)}>
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