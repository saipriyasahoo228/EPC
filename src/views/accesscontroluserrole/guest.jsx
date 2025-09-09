import React, { useState ,useEffect} from "react";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
import { createGuest ,getGuests,deleteGuest,updateGuest} from "../../allapi/account";

const GuestForm = () => {
  const [guests, setGuests] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    email: "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditMode, setIsEditMode] = useState(false);


  // 👇 Fetch guests when component loads
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const data = await getGuests();
      setGuests(data);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };

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

  // 🔹 handleSubmit Logic
const handleSubmit = async () => {
  try {
    if (isEditMode) {
      const response = await updateGuest(formData.guest_id, formData);
      alert(`Guest ${response.guest_id} updated successfully!`);
    } else {
      const response = await createGuest(formData);
      alert(`Guest created successfully! ID: ${response.guest_id}`);
    }

    await fetchGuests(); // refresh table
    setFormData({ name: "", mobile_number: "", email: "" });
    setIsEditMode(false);
    setOpen(false);
  } catch (error) {
    alert(error.response?.data?.detail || "Operation failed. Please try again.");
    console.error("Error submitting guest:", error);
  }
};


const handleEdit = (guest) => {
  setFormData({
    guest_id: guest.guest_id,
    name: guest.name,
    mobile_number: guest.mobile_number,
    email: guest.email,
  });
  setIsEditMode(true);   // flag for PATCH
  setOpen(true);         // open dialog with prefilled data
};


const handleDelete = async (guestId) => {
  if (window.confirm(`Are you sure you want to delete this guest? ${guestId} `)) {
    try {
      await deleteGuest(guestId);
      alert(`Guest deleted successfully!`);

      // refresh list
      await fetchGuests();
    } catch (error) {
      alert(
        error.response?.data?.detail || "Failed to delete guest. Please try again."
      );
      console.error("Error deleting guest:", error);
    }
  }
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
          <TableHead >
            <TableRow>
              <TableCell sx={{color:'#7267ef'}}>Guest ID</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Name</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Mobile</TableCell>
              <TableCell sx={{color:'#7267ef'}}>Email</TableCell>
              <TableCell sx={{color:'#660000'}}>Action</TableCell>
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

        {/* Actions cell */}
        <TableCell align="center">
          <IconButton
            color="warning"
            onClick={() => handleEdit(guest)}
            
          >
            <EditIcon sx={{ color: "orange" }}/>
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(guest.guest_id)}
           
          >
            <DeleteIcon  sx={{ color: "red" }}/>
          </IconButton>
        </TableCell>
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
            style={{ backgroundColor: "#7267ef", color: "white" }}
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
