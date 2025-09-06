import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const GuestForm = () => {
  const [guests, setGuests] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    guest_id: "",
    name: "",
    mobile_number: "",
    email: "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // 🔹 Generate guest ID like GST001, GST002
  const generateGuestId = () => {
    const num = guests.length + 1;
    return `GST${num.toString().padStart(3, "0")}`;
  };

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 🔹 Add new guest
  const handleSubmit = () => {
    const newGuest = {
      ...formData,
      guest_id: generateGuestId(),
    };
    setGuests([...guests, newGuest]);
    setFormData({ guest_id: "", name: "", mobile_number: "", email: "" });
    setOpen(false);
  };

  // 🔹 Search filter
  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.mobile_number.includes(search) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase()))
  );

  // 🔹 Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(guests);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");
    XLSX.writeFile(workbook, "guests.xlsx");
  };

  // 🔹 Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Guest Report", 14, 10);
    doc.autoTable({
      head: [["Guest ID", "Name", "Mobile", "Email"]],
      body: guests.map((g) => [g.guest_id, g.name, g.mobile_number, g.email]),
    });
    doc.save("guests.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <h2 style={{ color: "#660000" }}>Guest Management</h2>

      {/* Action buttons */}
      <div style={{ marginBottom: 15 }}>
        <Button
          variant="contained"
          style={{ backgroundColor: "#7267ef", marginRight: 10 }}
          onClick={() => setOpen(true)}
        >
          Add Guest
        </Button>
        <Button
          variant="outlined"
          style={{ borderColor: "#660000", color: "#660000", marginRight: 10 }}
          onClick={exportToExcel}
        >
          Export Excel
        </Button>
        <Button
          variant="outlined"
          style={{ borderColor: "#660000", color: "#660000" }}
          onClick={exportToPDF}
        >
          Export PDF
        </Button>
      </div>

      {/* Search bar */}
      <TextField
        label="Search..."
        variant="outlined"
        size="small"
        style={{ marginBottom: 15 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Guest table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#7267ef" }}>
            <TableRow>
              <TableCell style={{ color: "white" }}>Guest ID</TableCell>
              <TableCell style={{ color: "white" }}>Name</TableCell>
              <TableCell style={{ color: "white" }}>Mobile</TableCell>
              <TableCell style={{ color: "white" }}>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGuests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((guest, index) => (
                <TableRow key={index}>
                  <TableCell>{guest.guest_id}</TableCell>
                  <TableCell>{guest.name}</TableCell>
                  <TableCell>{guest.mobile_number}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredGuests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Add Guest Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ backgroundColor: "#7267ef", color: "white" }}>
          Add Guest
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 5 }}>
            <Grid item xs={12}>
              <TextField
                label="Guest ID"
                fullWidth
                value={generateGuestId()}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mobile Number"
                name="mobile_number"
                fullWidth
                value={formData.mobile_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#660000", color: "white" }}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GuestForm;
