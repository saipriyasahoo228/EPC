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
  LinearProgress,
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Maximize2, Minimize2 } from "lucide-react";

import { getProjectsAccept } from "../../allapi/engineering";
import {
  createMilestone,
  getMilestones,
  getMilestonesByProject,
  updateMilestone,
  deleteMilestone,
  fetchConstructionProjects,
} from "../../allapi/construction";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";
import { formatDateDDMMYYYY } from '../../utils/date';

const Milestone = () => {
  const MODULE_SLUG = "construction";

  // Accepted engineering projects (kept if needed elsewhere)
  const [projects, setProjects] = useState([]);
  // Construction projects created via project-management API
  const [constructionProjects, setConstructionProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  // Human code like PRJ-2025-0001 for filtering and display
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  // Internal project-management id used for creating milestones
  const [selectedProjectPMId, setSelectedProjectPMId] = useState("");
  const [open, setOpen] = useState(false);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [errors, setErrors] = useState({});

  const [searchProjects, setSearchProjects] = useState("");
  const [searchMilestones, setSearchMilestones] = useState("");

  const [formData, setFormData] = useState({
    project: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "not started",
  });

  const toggleModalSize = () => setIsModalMaximized((v) => !v);
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setEditingMilestone(null);
    setFormData({ project: "", name: "", description: "", start_date: "", end_date: "", status: "not started" });
  };

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Optionally keep accepted projects
        const acc = await getProjectsAccept();
        setProjects(acc || []);
        // Load construction projects to get internal ids and codes
        const cons = await fetchConstructionProjects();
        setConstructionProjects(cons || []);
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Load milestones (all or by project)
  const loadMilestones = async (projectId) => {
    try {
      const data = projectId
        ? await getMilestonesByProject(projectId)
        : await getMilestones();
      setMilestones(data || []);
    } catch (error) {
      console.error("❌ Failed to load milestones:", error);
    }
  };

  useEffect(() => {
    loadMilestones("");
  }, []);

  // Filtered lists
  const filteredProjects = useMemo(() => {
    if (!searchProjects) return constructionProjects;
    const q = searchProjects.toLowerCase();
    return (constructionProjects || []).filter((p) =>
      [p.project, p.project_name, p.project_status]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q))
    );
  }, [constructionProjects, searchProjects]);

  const filteredMilestones = useMemo(() => {
    if (!searchMilestones) return milestones;
    const q = searchMilestones.toLowerCase();
    return (milestones || []).filter((m) =>
      [m.name, m.description, m.status, m.project]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q))
    );
  }, [milestones, searchMilestones]);

  // Helper to render status in Title Case
  const titleCase = (s) => {
    if (!s) return "";
    return s
      .toString()
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Map internal project-management id to PRJ code for display
  const projectIdToCode = (pid) => {
    const item = (constructionProjects || []).find((p) => String(p.id) === String(pid));
    return item?.project || pid;
  };

  const handleOpenCreate = (pmId, code) => {
    setSelectedProjectPMId(pmId);
    setSelectedProjectCode(code || "");
    // For creation, formData.project should be internal id
    setFormData({ project: pmId, name: "", description: "", start_date: "", end_date: "", status: "not started" });
    setIsEditing(false);
    setEditingMilestone(null);
    setOpen(true);
  };

  const handleEdit = (m) => {
    setIsEditing(true);
    setEditingMilestone(m);
    // m.project is expected to be internal id from backend response
    setSelectedProjectPMId(m.project);
    setFormData({
      project: m.project, // keep id in payload
      name: m.name || "",
      description: m.description || "",
      start_date: (m.start_date || "").slice(0, 10),
      end_date: (m.end_date || "").slice(0, 10),
      status: m.status || "not started",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete milestone ID: ${id}?`);
    if (!confirmDelete) return;
    try {
      await deleteMilestone(id);
      alert("✅ Milestone deleted successfully!");
      loadMilestones(selectedProjectCode);
    } catch (error) {
      console.error("❌ Error deleting milestone:", error);
      alert("❌ Failed to delete milestone.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const reqErr = {};
    const required = ['project', 'name', 'start_date', 'end_date', 'status'];
    required.forEach((field) => {
      const v = (formData[field] ?? '').toString().trim();
      if (v === '') reqErr[field] = 'This field is required';
    });
    if (Object.keys(reqErr).length) {
      setErrors(reqErr);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        project: formData.project,
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      };

      if (isEditing && editingMilestone?.id) {
        await updateMilestone(editingMilestone.id, payload);
        alert("Milestone updated successfully!");
      } else {
        await createMilestone(payload);
        alert("Milestone created successfully!");
      }

      handleClose();
      loadMilestones(selectedProjectCode);
    } catch (error) {
      console.error("❌ Error submitting milestone:", error);
      if (error.response?.data) {
        const backendMessage =
          error.response.data.message ||
          error.response.data.error ||
          Object.values(error.response.data)[0];
        alert(`Error: ${backendMessage}`);
      } else {
        alert("Error in submitting milestone details!");
      }
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Milestones
      </Typography>

      {/* Project list with Add Milestone action */}
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
                    <strong>Project ID</strong>
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
                    <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <ShowIfCan slug={MODULE_SLUG} action="can_create">
                        <IconButton onClick={() => handleOpenCreate(proj.id, proj.project)} color="primary">
                          <AddCircle sx={{ color: "#7267ef" }} />
                        </IconButton>
                      </ShowIfCan>
                      {/* Filter milestones by this project */}
                      <Button
                        variant="text"
                        onClick={() => {
                          setSelectedProjectCode(proj.project);
                          loadMilestones(proj.project);
                        }}
                      >
                        View Milestones
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Milestones table */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: "#fff", border: "1px solid #ccc" }}>
            <Typography variant="h6" gutterBottom>
              {selectedProjectCode ? `MILESTONES FOR PROJECT ${selectedProjectCode}` : "ALL MILESTONES"}
            </Typography>
            <input
              type="text"
              placeholder="Search Milestones"
              value={searchMilestones}
              onChange={(e) => setSearchMilestones(e.target.value)}
              className="input"
            />

            <TableContainer sx={{ maxHeight: 450, overflow: "auto", border: "1px solid #ddd" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#7267ef" }}><strong>ID</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Project</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Name</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Description</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Start Date</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>End Date</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Status</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Progress</strong></TableCell>
                    <TableCell sx={{ color: "#660000" }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(filteredMilestones || []).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.id}</TableCell>
                      <TableCell>{projectIdToCode(m.project)}</TableCell>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.description}</TableCell>
                      <TableCell>{formatDateDDMMYYYY(m.start_date)}</TableCell>
                      <TableCell>{formatDateDDMMYYYY(m.end_date)}</TableCell>
                      <TableCell>{titleCase(m.status)}</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: "100%" }}>
                            <LinearProgress variant="determinate" value={Number(m.progress || 0)} />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 36 }}>{Number(m.progress || 0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                          <IconButton color="warning" onClick={() => handleEdit(m)}>
                            <Edit sx={{ color: "orange" }} />
                          </IconButton>
                        </DisableIfCannot>
                        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                          <IconButton color="error" onClick={() => handleDelete(m.id)}>
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
        <DialogTitle>{isEditing ? "Edit Milestone" : "Create Milestone"}</DialogTitle>
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
                <h3 style={{ color: "#7267ef" }}>Milestone Information</h3>
                <hr style={{ borderTop: "2px solid #7267ef", width: "80%" }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <label htmlFor="project">Project <span style={{ color: 'red' }}>*</span></label>
                    <select
                      id="project"
                      name="project"
                      className="input"
                      value={formData.project}
                      onChange={handleChange}
                    >
                      <option value="">Select Project</option>
                      {(constructionProjects || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.project}
                        </option>
                      ))}
                    </select>
                    {errors.project && (
                      <div style={{ color: 'red', fontSize: 12 }}>{errors.project}</div>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="name">Name <span style={{ color: 'red' }}>*</span></label>
                    <input id="name" name="name" className="input" value={formData.name} onChange={handleChange} />
                    {errors.name && (
                      <div style={{ color: 'red', fontSize: 12 }}>{errors.name}</div>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      className="input"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="start_date">Start Date <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      className="input"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                    {errors.start_date && (
                      <div style={{ color: 'red', fontSize: 12 }}>{errors.start_date}</div>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="end_date">End Date <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      className="input"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                    {errors.end_date && (
                      <div style={{ color: 'red', fontSize: 12 }}>{errors.end_date}</div>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <label htmlFor="status">Status <span style={{ color: 'red' }}>*</span></label>
                    <select
                      id="status"
                      name="status"
                      className="input"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="not started">Not Started</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                    {errors.status && (
                      <div style={{ color: 'red', fontSize: 12 }}>{errors.status}</div>
                    )}
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
              sx={{
                borderColor: "#7267ef",
                color: "#7267ef",
                "&:hover": { borderColor: "#9e8df2", color: "#9e8df2" },
              }}
            >
              {isEditing ? "Update Milestone" : "Submit Milestone"}
            </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Milestone;

