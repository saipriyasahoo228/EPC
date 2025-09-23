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
  Checkbox,
  TextField,
} from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Maximize2, Minimize2 } from "lucide-react";

import {
  getLabourCategories,
  createLabourCategory,
  updateLabourCategory,
  deleteLabourCategory,
  getLabourResources,
  getLabourResourceById,
  createLabourResource,
  updateLabourResource,
  deleteLabourResource,
} from "../../allapi/construction";
import { DisableIfCannot, ShowIfCan } from "../../components/auth/RequirePermission";
import { getVendors } from "../../allapi/procurement";

const LabourManagement = () => {
  const MODULE_SLUG = "construction";
  const CATEGORY_CHOICES = [
    { value: 'skilled', label: 'Skilled' },
    { value: 'semi_skilled', label: 'Semi-Skilled' },
    { value: 'unskilled', label: 'Unskilled' },
  ];

  // Data
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Search
  const [searchCategories, setSearchCategories] = useState("");
  const [searchResources, setSearchResources] = useState("");

  // Dialog state
  const [openCat, setOpenCat] = useState(false);
  const [openRes, setOpenRes] = useState(false);
  const [isCatEditing, setIsCatEditing] = useState(false);
  const [isResEditing, setIsResEditing] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingRes, setEditingRes] = useState(null);
  const [isModalMaximized, setIsModalMaximized] = useState(false);

  // Forms
  const [catForm, setCatForm] = useState({ category: "", subcategory: "" });
  const [resForm, setResForm] = useState({ category_id: "", vendor: "", is_company: false });

  const toggleModalSize = () => setIsModalMaximized((v) => !v);

  // Load data
  const loadAll = async () => {
    try {
      const [cats, ress, vends] = await Promise.all([
        getLabourCategories(),
        getLabourResources(),
        getVendors(),
      ]);
      // Categories may come as array; ensure array
      setCategories(Array.isArray(cats) ? cats : (cats ? [cats] : []));
      setResources(Array.isArray(ress) ? ress : []);
      setVendors(Array.isArray(vends) ? vends : []);
      console.log("Check: LABOURDATA", cats, ress, vends)
    } catch (e) {
      console.error("❌ Failed to load labour data:", e);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Filters
  const filteredCategories = useMemo(() => {
    const q = (searchCategories || '').toLowerCase();
    return (categories || []).filter((c) =>
      [c.id, c.category, c.subcategory]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q))
    );
  }, [categories, searchCategories]);

  const filteredResources = useMemo(() => {
    const q = (searchResources || '').toLowerCase();
    return (resources || []).filter((r) => {
      const cat = r.category || {};
      return [r.id, r.vendor, r.is_company, cat.category, cat.subcategory]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q));
    });
  }, [resources, searchResources]);

  // Handlers: Category
  const openCreateCat = () => {
    setIsCatEditing(false);
    setEditingCat(null);
    setCatForm({ category: "", subcategory: "" });
    setOpenCat(true);
  };

  const openEditCat = (c) => {
    setIsCatEditing(true);
    setEditingCat(c);
    setCatForm({ category: c.category || "", subcategory: c.subcategory || "" });
    setOpenCat(true);
  };

  const saveCategory = async () => {
    try {
      const payload = { category: catForm.category, subcategory: catForm.subcategory };
      if (isCatEditing && editingCat?.id) {
        await updateLabourCategory(editingCat.id, payload);
        alert("Category updated");
      } else {
        await createLabourCategory(payload);
        alert("Category created");
      }
      setOpenCat(false);
      await loadAll();
    } catch (e) {
      console.error("❌ Save category failed:", e);
      alert("❌ Failed to save category");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm(`Delete category ID: ${id}?`)) return;
    try {
      await deleteLabourCategory(id);
      alert("✅ Deleted");
      await loadAll();
    } catch (e) {
      console.error("❌ Delete category failed:", e);
      alert("❌ Failed to delete category");
    }
  };

  // Handlers: Resource
  const openCreateRes = () => {
    setIsResEditing(false);
    setEditingRes(null);
    setResForm({ category_id: "", vendor: "", is_company: false });
    setOpenRes(true);
  };

  const openEditRes = async (r) => {
    try {
      const data = await getLabourResourceById(r.id);
      setIsResEditing(true);
      setEditingRes(r);
      setResForm({
        category_id: data?.category?.id || "",
        vendor: data?.vendor || "",
        is_company: Boolean(data?.is_company),
      });
      setOpenRes(true);
    } catch (e) {
      console.error("❌ Fetch resource failed:", e);
      alert("Failed to fetch resource details");
    }
  };

  const saveResource = async () => {
    try {
      const payload = {
        category_id: resForm.category_id,
        vendor: resForm.vendor,
        is_company: Boolean(resForm.is_company),
      };
      if (isResEditing && editingRes?.id) {
        await updateLabourResource(editingRes.id, payload);
        alert("Resource updated");
      } else {
        await createLabourResource(payload);
        alert("Resource created");
      }
      setOpenRes(false);
      await loadAll();
    } catch (e) {
      console.error("❌ Save resource failed:", e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
      alert(`❌ Failed to save resource.\n${msg}`);
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm(`Delete labour resource ID: ${id}?`)) return;
    try {
      await deleteLabourResource(id);
      alert("✅ Deleted");
      await loadAll();
    } catch (e) {
      console.error("❌ Delete resource failed:", e);
      alert("❌ Failed to delete resource");
    }
  };

  const categoryLabel = (cat) => {
    if (!cat) return "-";
    const toTitle = (s) => (typeof s === 'string' ? s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) : s);
    const cObj = typeof cat === 'object' && cat !== null ? cat : { category: String(cat) };
    const main = toTitle(cObj.category || "");
    const subPart = cObj.subcategory ? ` — ${toTitle(cObj.subcategory)}` : "";
    return `${main}${subPart}`;
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Labour Management
      </Typography>

      {/* Labour Categories */}
      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: "#fff", border: "1px solid #ccc" }}>
            <Typography variant="h6" gutterBottom>
              LABOUR CATEGORIES
            </Typography>

            <Box sx={{ my: 2, mx: 1 }}>
              <input
                type="text"
                placeholder="Search Categories"
                value={searchCategories}
                onChange={(e) => setSearchCategories(e.target.value)}
                className="input"
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#7267ef" }}><strong>ID</strong></TableCell>
                  <TableCell sx={{ color: "#7267ef" }}><strong>Category</strong></TableCell>
                  <TableCell sx={{ color: "#7267ef" }}><strong>Subcategory</strong></TableCell>
                  <TableCell sx={{ display: "flex", justifyContent: "flex-end", color: "#660000" }}>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredCategories || []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{(c.category || "").replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())}</TableCell>
                    <TableCell>{c.subcategory ? c.subcategory.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) : '-'}</TableCell>
                    <TableCell sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                        <IconButton onClick={() => openEditCat(c)} color="warning">
                          <Edit sx={{ color: "orange" }} />
                        </IconButton>
                      </DisableIfCannot>
                      <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                        <IconButton onClick={() => deleteCategory(c.id)} color="error">
                          <Delete sx={{ color: "red" }} />
                        </IconButton>
                      </ShowIfCan>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <ShowIfCan slug={MODULE_SLUG} action="can_create">
                <Button variant="outlined" onClick={openCreateCat} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>Add Category</Button>
              </ShowIfCan>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Labour Resources */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: "#fff", border: "1px solid #ccc" }}>
            <Typography variant="h6" gutterBottom>
              LABOUR RESOURCES
            </Typography>
            <input
              type="text"
              placeholder="Search Resources"
              value={searchResources}
              onChange={(e) => setSearchResources(e.target.value)}
              className="input"
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4, marginBottom: "16px" }}
            />

            <TableContainer sx={{ maxHeight: 450, overflow: "auto", border: "1px solid #ddd" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#7267ef" }}><strong>ID</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Category</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Vendor</strong></TableCell>
                    <TableCell sx={{ color: "#7267ef" }}><strong>Is Company</strong></TableCell>
                    <TableCell sx={{ color: "#660000" }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(filteredResources || []).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{categoryLabel(r.category)}</TableCell>
                      <TableCell>{r.vendor}</TableCell>
                      <TableCell>{r.is_company ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                          <IconButton color="warning" onClick={() => openEditRes(r)}>
                            <Edit sx={{ color: "orange" }} />
                          </IconButton>
                        </DisableIfCannot>
                        <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                          <IconButton color="error" onClick={() => deleteResource(r.id)}>
                            <Delete sx={{ color: "red" }} />
                          </IconButton>
                        </ShowIfCan>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <ShowIfCan slug={MODULE_SLUG} action="can_create">
                <Button variant="outlined" onClick={openCreateRes} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>Add Resource</Button>
              </ShowIfCan>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog: Category */}
      <Dialog
        open={openCat}
        onClose={() => setOpenCat(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: isModalMaximized ? { width: "100%", height: "100vh", margin: 0 } : { width: "60%", height: "auto" },
        }}
      >
        <DialogTitle>{isCatEditing ? "Edit Category" : "Create Category"}</DialogTitle>
        <DialogContent sx={{ position: "relative", overflowY: "auto" }}>
          <IconButton aria-label="toggle-size" onClick={toggleModalSize} sx={{ position: "absolute", right: 40, top: 8 }}>
            {isModalMaximized ? <Minimize2 /> : <Maximize2 />}
          </IconButton>
          <IconButton aria-label="close" onClick={() => setOpenCat(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  value={catForm.category}
                  onChange={(e)=> setCatForm(s=>({...s, category: e.target.value}))}
                >
                  <option value="">Select Category</option>
                  {CATEGORY_CHOICES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <label htmlFor="subcategory">Subcategory</label>
                <input id="subcategory" name="subcategory" className="input" value={catForm.subcategory} onChange={(e)=> setCatForm(s=>({...s, subcategory: e.target.value}))} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCat(false)} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <DisableIfCannot slug={MODULE_SLUG} action={isCatEditing ? 'can_update' : 'can_create'}>
            <Button variant="outlined" onClick={saveCategory} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>
              {isCatEditing ? 'Update Category' : 'Submit Category'}
            </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>

      {/* Dialog: Resource */}
      <Dialog
        open={openRes}
        onClose={() => setOpenRes(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: isModalMaximized ? { width: "100%", height: "100vh", margin: 0 } : { width: "60%", height: "auto" },
        }}
      >
        <DialogTitle>{isResEditing ? "Edit Labour Resource" : "Create Labour Resource"}</DialogTitle>
        <DialogContent sx={{ position: "relative", overflowY: "auto" }}>
          <IconButton aria-label="toggle-size" onClick={toggleModalSize} sx={{ position: "absolute", right: 40, top: 8 }}>
            {isModalMaximized ? <Minimize2 /> : <Maximize2 />}
          </IconButton>
          <IconButton aria-label="close" onClick={() => setOpenRes(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <label htmlFor="category_id">Category</label>
                <select
                  id="category_id"
                  name="category_id"
                  className="input"
                  value={resForm.category_id}
                  onChange={(e)=> setResForm(s=>({...s, category_id: e.target.value}))}
                >
                  <option value="">Select Category</option>
                  {(categories || []).map((c) => (
                    <option key={c.id} value={c.id}>{categoryLabel(c)}</option>
                  ))}
                </select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <label htmlFor="vendor">Vendor</label>
                <select
                  id="vendor"
                  name="vendor"
                  className="input"
                  value={resForm.vendor}
                  onChange={(e)=> setResForm(s=>({...s, vendor: e.target.value}))}
                >
                  <option value="">Select Vendor</option>
                  {(vendors || []).map((v) => (
                    <option key={v.vendor_id} value={v.vendor_id}>
                      {v.vendor_id} {v.vendor_name ? `— ${v.vendor_name}` : ''}
                    </option>
                  ))}
                </select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <label htmlFor="is_company" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Is Company?</label>
                <Checkbox
                  id="is_company"
                  checked={Boolean(resForm.is_company)}
                  onChange={(e)=> setResForm(s=>({...s, is_company: e.target.checked}))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRes(false)} sx={{ outline: '2px solid #800000', color: '#800000' }}>Cancel</Button>
          <DisableIfCannot slug={MODULE_SLUG} action={isResEditing ? 'can_update' : 'can_create'}>
            <Button variant="outlined" onClick={saveResource} sx={{ borderColor: '#7267ef', color: '#7267ef' }}>
              {isResEditing ? 'Update Resource' : 'Submit Resource'}
            </Button>
          </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LabourManagement;

