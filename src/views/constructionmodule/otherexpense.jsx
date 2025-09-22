import React, { useEffect, useMemo, useState } from "react";
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
  Paper,
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Maximize2, Minimize2 } from "lucide-react";

import {
  fetchConstructionProjects,
  getOtherExpenses,
  getOtherExpenseById,
  createOtherExpense,
  updateOtherExpense,
  deleteOtherExpense,
} from "../../allapi/construction";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";

const OtherExpense = () => {
  const MODULE_SLUG = "construction";

  const [constructionProjects, setConstructionProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [searchProjects, setSearchProjects] = useState("");
  const [searchExpenses, setSearchExpenses] = useState("");

  const [open, setOpen] = useState(false);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // For form
  const [formData, setFormData] = useState({
    expense_type: "",
    project: "",
    amount: "",
    description: "",
    date_incurred: "",
  });

  const toggleModalSize = () => setIsModalMaximized((v) => !v);
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ expense_type: "", project: "", amount: "", description: "", date_incurred: "" });
  };

  // Load projects and expenses
  useEffect(() => {
    (async () => {
      try {
        const [cons, exp] = await Promise.all([
          fetchConstructionProjects(),
          getOtherExpenses(),
        ]);
        setConstructionProjects(cons || []);
        setExpenses(exp || []);
      } catch (e) {
        console.error("❌ Error loading other expense deps:", e);
      }
    })();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchProjects) return constructionProjects;
    const q = searchProjects.toLowerCase();
    return (constructionProjects || []).filter((p) =>
      [p.project, p.project_name, p.project_status, p.location]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q))
    );
  }, [constructionProjects, searchProjects]);

  const filteredExpenses = useMemo(() => {
    if (!searchExpenses) return expenses;
    const q = searchExpenses.toLowerCase();
    return (expenses || []).filter((e) =>
      [e.expense_type, e.project, e.amount, e.description, e.date_incurred]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q))
    );
  }, [expenses, searchExpenses]);

  const handleOpenCreate = (projectCode) => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      expense_type: "",
      project: projectCode || "",
      amount: "",
      description: "",
      date_incurred: "",
    });
    setOpen(true);
  };

  const handleEdit = async (row) => {
    try {
      const data = await getOtherExpenseById(row.id);
      setIsEditing(true);
      setEditingId(row.id);
      setFormData({
        expense_type: data.expense_type || "",
        project: data.project || "",
        amount: String(data.amount || ""),
        description: data.description || "",
        date_incurred: (data.date_incurred || "").slice(0, 10),
      });
      setOpen(true);
    } catch (e) {
      console.error("❌ Failed to fetch expense:", e);
      alert("Failed to fetch expense details");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete other expense ID: ${id}?`)) return;
    try {
      await deleteOtherExpense(id);
      alert("✅ Deleted successfully");
      const list = await getOtherExpenses();
      setExpenses(list || []);
    } catch (e) {
      console.error("❌ Delete failed:", e);
      alert("❌ Failed to delete");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        expense_type: formData.expense_type,
        project: formData.project, // PRJ- code as per API
        amount: Number(formData.amount || 0),
        description: formData.description || null,
        date_incurred: formData.date_incurred || null,
      };

      if (isEditing && editingId) {
        await updateOtherExpense(editingId, payload);
        alert("Other expense updated");
      } else {
        await createOtherExpense(payload);
        alert("Other expense created");
      }

      handleClose();
      const list = await getOtherExpenses();
      setExpenses(list || []);
    } catch (error) {
      console.error("❌ Error submitting other expense:", error);
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data || "Server error");
      alert(`❌ Failed to save Other Expense.\n\nError: ${backendMessage}`);
    }
  };

  const projectCodeToName = (code) => {
    const p = (constructionProjects || []).find((x) => x.project === code);
    return p?.project_name || code;
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Other Expenses
      </Typography>

      {/* Project list with Add action */}
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: "#fff", border: "1px solid #ccc" }}>
            <Typography variant="h6" gutterBottom>
              PROJECTS
            </Typography>

            <Box sx={{ my: 2, mx: 1 }}>
              <input
                type="text"
                placeholder="Search Projects"
                value={searchProjects}
                onChange={(e) => setSearchProjects(e.target.value)}
                className="input"
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#7267ef" }}>
                    <strong>Project</strong>
                  </TableCell>
                  <TableCell sx={{ color: "#7267ef" }}>
                    <strong>Project Name</strong>
                  </TableCell>
                  <TableCell sx={{ display: "flex", justifyContent: "flex-end", color: "#660000" }}>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredProjects || []).map((proj, i) => (
                  <TableRow key={i}>
                    <TableCell>{proj.project}</TableCell>
                    <TableCell>{proj.project_name || "-"}</TableCell>
                    <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <ShowIfCan slug={MODULE_SLUG} action="can_create">
                        <IconButton onClick={() => handleOpenCreate(proj.project)} color="primary">
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
      </Grid>

      {/* Expenses table */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: "#fff", border: "1px solid #ccc" }}>
            <Typography variant="h6" gutterBottom>
              OTHER EXPENSES
            </Typography>
            <input
              type="text"
              placeholder="Search Other Expenses"
              value={searchExpenses}
              onChange={(e) => setSearchExpenses(e.target.value)}
              className="input"
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4, marginBottom: "16px" }}
            />

            <TableContainer sx={{ maxHeight: 450, overflow: "auto", border: "1px solid #ddd" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {/* <TableCell sx={{ color: "#7267ef" }}><strong>ID</strong></TableCell> */}
                    <TableCell sx={{ color: "#7267ef" }}><strong>Project</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Project Name</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Expense Type</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Amount</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Date Incurred</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Description</strong></TableCell>
                    <TableCell sx={{ color: "#660000" }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(filteredExpenses || []).map((e) => (
                    <TableRow key={e.id}>
                      {/* <TableCell>{e.id}</TableCell> */}
                      <TableCell>{e.project}</TableCell>
                      <TableCell>{projectCodeToName(e.project)}</TableCell>
                      <TableCell>{e.expense_type}</TableCell>
                      <TableCell>₹ {Number(e.amount || 0).toLocaleString("en-IN")}</TableCell>
                      <TableCell>{(e.date_incurred || "").slice(0, 10)}</TableCell>
                      <TableCell>{e.description || "-"}</TableCell>
                      <TableCell>
                        <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                          <IconButton color="warning" onClick={() => handleEdit(e)}>
                            <Edit sx={{ color: "orange" }} />
                          </IconButton>
                        </DisableIfCannot>
                        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                          <IconButton color="error" onClick={() => handleDelete(e.id)}>
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: isModalMaximized
            ? { width: "100%", height: "100vh", margin: 0 }
            : { width: "70%", height: "90vh" },
        }}
      >
        <DialogTitle>{isEditing ? "Edit Other Expense" : "Create Other Expense"}</DialogTitle>
        <DialogContent sx={{ position: "relative", overflowY: "auto" }}>
          <IconButton
            aria-label="toggle-size"
            onClick={toggleModalSize}
            sx={{ position: "absolute", right: 40, top: 8, color: (t) => t.palette.grey[600] }}
          >
            {isModalMaximized ? <Minimize2 /> : <Maximize2 />}
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8, color: (t) => t.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>

          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3} direction="column">
              <Grid item xs={12}>
                <h3 style={{ color: "#7267ef" }}>Expense Information</h3>
                <hr style={{ borderTop: "2px solid #7267ef", width: "80%" }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="project">Project</label>
                    <select
                      id="project"
                      name="project"
                      className="input"
                      value={formData.project}
                      onChange={handleChange}
                    >
                      <option value="">Select Project</option>
                      {(constructionProjects || []).map((p) => (
                        <option key={p.project} value={p.project}>
                          {p.project} {p.project_name ? `— ${p.project_name}` : ""}
                        </option>
                      ))}
                    </select>
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="expense_type">Expense Type</label>
                    <input id="expense_type" name="expense_type" className="input" value={formData.expense_type} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="amount">Amount</label>
                    <input id="amount" name="amount" type="number" className="input" value={formData.amount} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="date_incurred">Date Incurred</label>
                    <input id="date_incurred" name="date_incurred" type="date" className="input" value={formData.date_incurred} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" className="input" rows={3} value={formData.description} onChange={handleChange} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              outline: "2px solid #800000",
              color: "#800000",
              "&:hover": { outline: "2px solid #b30000", color: "#b30000" },
            }}
          >
            Cancel
          </Button>
          <DisableIfCannot slug={MODULE_SLUG} action={isEditing ? "can_update" : "can_create"}>
            <Button
              variant="outlined"
              onClick={handleSubmit}
              sx={{ borderColor: "#7267ef", color: "#7267ef", "&:hover": { borderColor: "#9e8df2", color: "#9e8df2" } }}
            >
              {isEditing ? "Update Expense" : "Submit Expense"}
            </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OtherExpense;

