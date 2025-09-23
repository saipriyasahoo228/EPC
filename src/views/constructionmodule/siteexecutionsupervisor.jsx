import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Fab,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  useMediaQuery,
  MenuItem,
  AppBar,
  Toolbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  Autocomplete,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';
import BuildIcon from '@mui/icons-material/Build';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DevicesIcon from '@mui/icons-material/Devices';
import PublicIcon from '@mui/icons-material/Public';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GroupIcon from '@mui/icons-material/Group';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MobileStepper from '@mui/material/MobileStepper';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { logout } from 'auth';

import { getProjectsAccept } from '../../allapi/engineering';
import { createSiteExecution, getSiteExecutions, createMaterialInventory, getMilestonesByProject, getLabourResources } from '../../allapi/construction';
import { getVendors } from '../../allapi/procurement';
import { getInventoryItems } from '../../allapi/inventory';
import { createMaterialProcurement, getMaterialProcurements } from '../../allapi/procurement';

import { DisableIfCannot, ShowIfCan } from '../../components/auth/RequirePermission';
import { wrap } from 'lodash-es';

const MODULE_SLUG = 'construction';
const DRAFT_KEY_PREFIX = 'dpr_draft_';

const statusOptions = [
  { key: 'on track', label: 'On Track', color: 'success' },
  { key: 'delayed', label: 'Delayed', color: 'warning' },
  { key: 'halted', label: 'Halted', color: 'error' },
];

const SiteExecutionSupervisor = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Projects and selection
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  // View mode & steps
  const [mode, setMode] = useState('list'); // 'list' | 'form'
  const [step, setStep] = useState(0);
  const steps = ['Details', 'Compliance', 'Location', 'Photo', 'Review'];

  // Form model
  const [form, setForm] = useState({
    site_supervisor_id: '',
    work_completed: '',
    equipment_used: '',
    weather_conditions: '',
    safety_compliance_report: '',
    material_consumption: '',
    site_issues: '',
    site_execution_status: 'on track',
    progress_percent: '',
    milestone: '',
  });

  // Labour usage (replaces manpower)
  const [labourUsage, setLabourUsage] = useState([]);
  const [labourResources, setLabourResources] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Location
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: '',
    loading: false,
    permission: 'prompt', // 'granted' | 'denied' | 'prompt'
  });

  // Photo
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoBlob, setPhotoBlob] = useState(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });
  const [restored, setRestored] = useState(false);
  const [autoRequestedGeo, setAutoRequestedGeo] = useState(false);
  // Reports
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFocus, setReportFocus] = useState(null);
  // Materials request
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingProcurements, setLoadingProcurements] = useState(false);
  const [matDetailOpen, setMatDetailOpen] = useState(false);
  const [matFocus, setMatFocus] = useState(null);
  const [matForm, setMatForm] = useState({
    item: null, // entire item object
    quantity: '',
    unit_price: '',
    requested_by: '',
  });
  // Logout confirm dialog
  const [logoutOpen, setLogoutOpen] = useState(false);
  // Material consumption (selection from inventory with quantities)
  const [consumptionOpen, setConsumptionOpen] = useState(false);
  const [consumptionItems, setConsumptionItems] = useState([]); // [{ item, quantity }]
  const [consumptionNotes, setConsumptionNotes] = useState('');
  const [savingConsumption, setSavingConsumption] = useState(false);
  // Milestones
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  const deviceId = useMemo(() => navigator.userAgent || 'unknown', []);

  // Helpers
  const formatDMY = useCallback((d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt)) return '-';
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, []);

  // Preload vendors and labour resources
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [lr, v] = await Promise.all([
          getLabourResources(),
          getVendors(),
        ]);
        if (mounted) {
          setLabourResources(Array.isArray(lr) ? lr : []);
          setVendors(Array.isArray(v) ? v : []);
        }
      } catch (e) {
        console.error('Failed to load labour resources or vendors', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatINR = useCallback((v) => {
    if (v === null || v === undefined || v === '') return '-';
    const num = Number(v);
    if (isNaN(num)) return `₹ ${v}`;
    try {
      return `₹ ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num)}`;
    } catch {
      return `₹ ${num}`;
    }
  }, []);

  // Theme: Quicksand font & pastel palette
  const theme = useMemo(() => createTheme({
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: 'Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: 15,
      body1: { fontSize: '0.98rem' },
      body2: { fontSize: '0.92rem' },
      button: { fontSize: '0.96rem' },
      h6: { fontWeight: 700 },
    },
    palette: {
      primary: { main: '#57B79D' },
      secondary: { main: '#FFB672' },
      info: { main: '#FEB4A9' },
      text: { primary: '#021A2D' },
    },
    components: {
      MuiChip: {
        defaultProps: { size: 'medium' },
        styleOverrides: {
          root: { borderRadius: 999 },
          outlinedPrimary: { backgroundColor: 'rgba(87,183,157,0.08)' },
          outlinedInfo: { backgroundColor: 'rgba(254,180,169,0.10)' },
          outlinedSecondary: { backgroundColor: 'rgba(255,182,114,0.10)' },
        }
      },
      MuiButton: {
        defaultProps: { size: 'medium' },
        styleOverrides: { root: { textTransform: 'none', borderRadius: 10, padding: '8px 16px' } }
      },
      MuiPaper: {
        styleOverrides: { root: { borderRadius: 16 } }
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: 16 } }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#57B79D' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#57B79D', borderWidth: 2 },
          },
          notchedOutline: { borderRadius: 12 },
          input: { paddingTop: 10, paddingBottom: 10 },
        }
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 18 } }
      }
    }
  }), []);

  // Inject Google Font (Quicksand) once
  useEffect(() => {
    const id = 'quicksand-font-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Helpers
  const draftKey = useMemo(() => `${DRAFT_KEY_PREFIX}${selectedProjectId || 'no_project'}`, [selectedProjectId]);

  // Label helpers for Labour Resource
  const toTitle = useCallback((s) => (typeof s === 'string' ? s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) : s), []);
  const categoryLabel = useCallback((cat) => {
    if (!cat) return '-';
    const cObj = (typeof cat === 'object' && cat !== null) ? cat : { category: String(cat) };
    const main = toTitle(cObj.category || '');
    const sub = cObj.subcategory ? ` — ${toTitle(cObj.subcategory)}` : '';
    return `${main}${sub}`;
  }, [toTitle]);
  const resourceLabel = useCallback((r) => {
    if (!r) return '-';
    const catText = r.category ? categoryLabel(r.category) : '(No Category)';
    let vendorText = '';
    if (r.vendor) {
      const v = (vendors || []).find(x => String(x.vendor_id) === String(r.vendor));
      const vendorName = v?.vendor_name ? ` (${v.vendor_name})` : '';
      vendorText = ` • ${r.vendor}${vendorName}`; // bullet + ID (Name)
    }
    return `${catText}${vendorText}`;
  }, [categoryLabel, vendors]);

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  // Labour usage helpers similar to materials selection
  const addLabourEntry = useCallback((labourObj) => {
    if (!labourObj) return;
    const todayAtNine = () => {
      const d = new Date();
      d.setHours(9, 0, 0, 0);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };
    setLabourUsage((prev) => {
      const exists = prev.some((e) => String(e.labour_resource) === String(labourObj.id));
      if (exists) return prev;
      return [...prev, { labour_resource: labourObj.id, number_of_workers: '', work_hours: '', date: todayAtNine() }];
    });
  }, []);
  const updateLabourField = useCallback((labourResourceId, field, value) => {
    setLabourUsage((prev) => prev.map((e) => String(e.labour_resource) === String(labourResourceId) ? { ...e, [field]: value } : e));
  }, []);
  const removeLabourEntry = useCallback((labourResourceId) => {
    setLabourUsage((prev) => prev.filter((e) => String(e.labour_resource) !== String(labourResourceId)));
  }, []);

  // Load projects
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getProjectsAccept();
        if (mounted) setProjects(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Restore draft for selected project
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        setForm(draft.form || {});
        setPhotoPreview(draft.photoPreview || '');
        setLabourUsage(Array.isArray(draft.labourUsage) ? draft.labourUsage : []);
        setRestored(true);
        setSnack({ open: true, severity: 'success', message: 'Draft restored' });
      } else {
        // Reset form if project changed and no draft
        setForm(f => ({ ...f }));
        setLabourUsage([]);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Fetch reports for selected project
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedProjectId) { setReports([]); return; }
      setLoadingReports(true);
      try {
        const data = await getSiteExecutions();
        const list = Array.isArray(data) ? data.filter(r => String(r.project) === String(selectedProjectId)) : [];
        // Sort latest first
        list.sort((a,b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));
        setReports(list);
      } catch (e) {
        console.error('Failed to load reports', e);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [selectedProjectId]);

  // Load milestones when project changes
  useEffect(() => {
    const run = async () => {
      if (!selectedProjectId) { setMilestones([]); return; }
      try {
        setLoadingMilestones(true);
        const data = await getMilestonesByProject(selectedProjectId);
        setMilestones(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load milestones', e);
        setMilestones([]);
      } finally {
        setLoadingMilestones(false);
      }
    };
    run();
  }, [selectedProjectId]);

  // Material consumption dialog handlers
  const openConsumption = useCallback(() => {
    if (!selectedProjectId) {
      setSnack({ open: true, severity: 'info', message: 'Select a project first' });
      return;
    }
    setConsumptionOpen(true);
  }, [selectedProjectId]);

  const closeConsumption = useCallback(() => {
    setConsumptionOpen(false);
  }, []);

  const addConsumptionItem = useCallback((item) => {
    if (!item) return;
    setConsumptionItems((prev) => {
      const exists = prev.some((ci) => ci.item?.item_id === item.item_id);
      if (exists) return prev;
      return [...prev, { item, quantity: '' }];
    });
  }, []);

  const updateConsumptionQty = useCallback((itemId, qty) => {
    setConsumptionItems((prev) => prev.map((ci) => ci.item?.item_id === itemId ? { ...ci, quantity: qty } : ci));
  }, []);

  const removeConsumptionItem = useCallback((itemId) => {
    setConsumptionItems((prev) => prev.filter((ci) => ci.item?.item_id !== itemId));
  }, []);

  const submitConsumption = useCallback(async () => {
    if (!selectedProjectId) { setSnack({ open: true, severity: 'warning', message: 'Project is required' }); return; }
    const payloads = consumptionItems
      .filter(ci => ci.item && ci.quantity && Number(ci.quantity) > 0)
      .map(ci => ({
        material: ci.item.item_id,
        project: selectedProjectId,
        material_name: ci.item.item_name,
        quantity_used: ci.quantity,
      }));
    if (payloads.length === 0) {
      setSnack({ open: true, severity: 'warning', message: 'Add at least one item with quantity' });
      return;
    }
    try {
      setSavingConsumption(true);
      // Post each consumption entry
      for (const p of payloads) {
        // eslint-disable-next-line no-await-in-loop
        await createMaterialInventory(p);
      }
      // Build plain text summary and set into form.material_consumption
      const summary = payloads
        .map(p => `${p.material} - ${p.material_name}: ${p.quantity_used}`)
        .join(', ');
      const fullText = consumptionNotes?.trim() ? `${summary}. Notes: ${consumptionNotes.trim()}` : summary;
      setForm(prev => ({ ...prev, material_consumption: fullText }));
      setSnack({ open: true, severity: 'success', message: 'Material consumption recorded' });
      setConsumptionOpen(false);
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
      setSnack({ open: true, severity: 'error', message: msg || 'Failed to save material consumption' });
    } finally {
      setSavingConsumption(false);
    }
  }, [consumptionItems, consumptionNotes, selectedProjectId]);

  // Load inventory once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingInventory(true);
        const data = await getInventoryItems();
        if (mounted) setInventory(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load inventory', e);
      } finally {
        setLoadingInventory(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load material procurements for selected project
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedProjectId) { setProcurements([]); return; }
      try {
        setLoadingProcurements(true);
        const data = await getMaterialProcurements();
        const list = (Array.isArray(data) ? data : []).filter(p => String(p.project) === String(selectedProjectId));
        if (mounted) setProcurements(list);
      } catch (e) {
        console.error('Failed to load procurements', e);
      } finally {
        setLoadingProcurements(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedProjectId]);

  // Materials dialog handlers
  const openMaterials = useCallback(() => {
    if (!selectedProjectId) {
      setSnack({ open: true, severity: 'info', message: "Select a project to request materials" });
      return;
    }
    setMatForm({ item: null, quantity: '', unit_price: '', requested_by: '' });
    setMaterialsOpen(true);
  }, [selectedProjectId]);

  const closeMaterials = useCallback(() => setMaterialsOpen(false), []);

  const submitMaterials = useCallback(async () => {
    if (!selectedProjectId) { setSnack({ open: true, severity: 'warning', message: 'Project is required' }); return; }
    if (!matForm.item) { setSnack({ open: true, severity: 'warning', message: 'Select an item' }); return; }
    if (!matForm.quantity) { setSnack({ open: true, severity: 'warning', message: 'Enter quantity' }); return; }
    try {
      const form = new FormData();
      form.append('project', selectedProjectId);
      form.append('material_name', matForm.item.item_name || '');
      form.append('material_code', matForm.item.item_id || '');
      form.append('quantity_requested', String(matForm.quantity));
      if (matForm.unit_price) form.append('unit_price', String(matForm.unit_price));
      form.append('requested_by', matForm.requested_by || '');
      form.append('request_date', new Date().toISOString().slice(0,10));
      form.append('approval_status', 'Pending');
      form.append('payment_status', 'Pending');
      // expected_delivery_date will be set later by procurement, not by supervisor

      await createMaterialProcurement(form);
      setSnack({ open: true, severity: 'success', message: 'Material request submitted' });
      setMaterialsOpen(false);
      // Refresh procurements
      try {
        const data = await getMaterialProcurements();
        const list = (Array.isArray(data) ? data : []).filter(p => String(p.project) === String(selectedProjectId));
        setProcurements(list);
      } catch {}
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
      setSnack({ open: true, severity: 'error', message: msg || 'Failed to submit' });
    }
  }, [selectedProjectId, matForm]);

  const openMaterialDetail = useCallback((p) => { setMatFocus(p); setMatDetailOpen(true); }, []);
  const closeMaterialDetail = useCallback(() => { setMatDetailOpen(false); setMatFocus(null); }, []);

  const openReport = useCallback((r) => { setReportFocus(r); setReportOpen(true); }, []);
  const closeReport = useCallback(() => { setReportOpen(false); setReportFocus(null); }, []);

  // Auto-save draft (debounced) – include labourUsage
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const data = { form, photoPreview, labourUsage };
        localStorage.setItem(draftKey, JSON.stringify(data));
      } catch (e) {
        // storage might be full
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form, photoPreview, labourUsage, draftKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setSnack({ open: true, severity: 'success', message: 'Draft cleared' });
    } catch {}
  }, [draftKey]);

  // Geolocation
  const captureLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocation(l => ({ ...l, error: 'Geolocation not supported', permission: 'denied' }));
      return;
    }
    setLocation(l => ({ ...l, loading: true, error: '' }));
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp ? new Date(pos.timestamp).toISOString() : new Date().toISOString(),
          error: '',
          loading: false,
          permission: 'granted',
        });
      },
      err => {
        setLocation(l => ({
          ...l,
          error: err.message || 'Location permission denied',
          loading: false,
          permission: 'denied',
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // Auto request on mount once
  useEffect(() => {
    if (!autoRequestedGeo) {
      setAutoRequestedGeo(true);
      captureLocation();
    }
  }, [autoRequestedGeo, captureLocation]);

  // Photo handling: trigger input
  const handleFabClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Draw overlay text on image using canvas and export to blob
  const overlayAndExport = async (file, meta) => {
    const img = new Image();
    const fileUrl = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return reject(new Error('Canvas not found'));
          const maxW = 1280; // downscale for upload size
          const scale = img.width > maxW ? maxW / img.width : 1;
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          // Overlay text
          const lines = [];
          if (meta.latitude && meta.longitude) {
            lines.push(`Lat: ${Number(meta.latitude).toFixed(6)}, Lng: ${Number(meta.longitude).toFixed(6)}`);
          }
          if (meta.timestamp) {
            const ts = new Date(meta.timestamp);
            lines.push(`Time: ${ts.toLocaleString()}`);
          }
          ctx.font = `${Math.max(14, Math.round(w * 0.018))}px sans-serif`;
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.textBaseline = 'bottom';

          // draw background rect for better visibility
          const padding = 8;
          const lineHeight = Math.max(18, Math.round(w * 0.024));
          const textWidth = lines.reduce((acc, line) => Math.max(acc, ctx.measureText(line).width), 0);
          const boxW = textWidth + padding * 2;
          const boxH = lineHeight * lines.length + padding * 2;
          const x = w - boxW - 10;
          const y = h - 10;

          ctx.fillRect(x, y - boxH, boxW, boxH);
          ctx.fillStyle = 'white';
          lines.forEach((line, idx) => {
            ctx.fillText(line, x + padding, y - padding - (lines.length - 1 - idx) * lineHeight);
          });

          canvas.toBlob(
            blob => {
              if (!blob) return reject(new Error('Failed to export image'));
              const preview = canvas.toDataURL('image/jpeg', 0.9);
              resolve({ blob, preview });
            },
            'image/jpeg',
            0.9
          );
        } catch (e) {
          reject(e);
        } finally {
          URL.revokeObjectURL(fileUrl);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(fileUrl);
        reject(new Error('Failed to load image'));
      };
      img.src = fileUrl;
    });
  };

  const onPhotoPicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { blob, preview } = await overlayAndExport(file, {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp || new Date().toISOString(),
      });
      setPhotoBlob(blob);
      setPhotoPreview(preview);
      setSnack({ open: true, severity: 'success', message: 'Photo captured' });
    } catch (err) {
      console.error(err);
      setSnack({ open: true, severity: 'error', message: 'Failed to process photo' });
    } finally {
      // allow picking same file again
      e.target.value = '';
    }
  };

  // Validation
  const validate = () => {
    const errors = [];
    if (!selectedProjectId) errors.push('Project is required');
    if (!form.site_supervisor_id?.trim()) errors.push('Supervisor ID is required');
    if (!form.work_completed?.trim()) errors.push('Work completed is required');
    if (!form.site_execution_status) errors.push('Status is required');
    if (!form.milestone) errors.push('Milestone is required');
    const pct = Number(form.progress_percent);
    if (form.progress_percent === '' || isNaN(pct) || pct < 0 || pct > 100) errors.push('Valid progress percent (0-100) is required');
    if (errors.length) {
      setSnack({ open: true, severity: 'error', message: errors[0] });
      return false;
    }
    return true;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('project', selectedProjectId);
      fd.append('site_supervisor_id', form.site_supervisor_id);
      // Let backend generate DPR id; if you want to allow manual entry later, include below:
      // fd.append('daily_progress_report_id', form.daily_progress_report_id || '');

      fd.append('work_completed', form.work_completed);
      fd.append('equipment_used', form.equipment_used || '');
      fd.append('weather_conditions', form.weather_conditions || '');
      fd.append('safety_compliance_report', form.safety_compliance_report || '');
      fd.append('material_consumption', form.material_consumption || '');
      if (form.site_issues) fd.append('site_issues', form.site_issues);
      fd.append('site_execution_status', form.site_execution_status || 'on track');
      fd.append('progress_percent', String(form.progress_percent || '0'));
      fd.append('milestone', String(form.milestone));

      // Append labour_usage_input as JSON string (multipart)
      try {
        const usage = (labourUsage || [])
          .filter(r => r && r.labour_resource && r.number_of_workers && r.work_hours && r.date)
          .map(r => {
            const d = String(r.date);
            let isoZ = d;
            if (d && !d.endsWith('Z')) {
              isoZ = d.length === 16 ? `${d}:00Z` : `${d}Z`;
            }
            return {
              labour_resource: Number(r.labour_resource),
              number_of_workers: Number(r.number_of_workers),
              work_hours: Number(r.work_hours),
              date: isoZ,
            };
          });
        const hadEntries = (labourUsage || []).length > 0;
        if (hadEntries && usage.length === 0) {
          setSnack({ open: true, severity: 'warning', message: 'Complete Labour Usage rows (resource, workers, hours, date) or remove them.' });
          setSubmitting(false);
          return;
        }
        console.log('DEBUG labour_usage_input (array):', usage);
        // Recommended: send nested data as JSON string in multipart (always include, even if empty)
        fd.append('labour_usage_input', JSON.stringify(usage || []));
      } catch {}

      if (location.latitude != null) fd.append('latitude', String(location.latitude));
      if (location.longitude != null) fd.append('longitude', String(location.longitude));
      if (location.accuracy != null) fd.append('location_accuracy', String(location.accuracy));
      if (location.timestamp) fd.append('location_timestamp', location.timestamp);

      if (deviceId) fd.append('device_id', deviceId);

      if (photoBlob) {
        fd.append('photo_evidence', photoBlob, 'evidence.jpg');
      }

      // DEBUG: Print all FormData entries before submit
      try {
        for (const [k, v] of fd.entries()) {
          console.log('DEBUG FormData entry:', k, v);
        }
      } catch (e) {
        console.warn('DEBUG could not iterate FormData entries:', e);
      }

      const res = await createSiteExecution(fd);
      setSnack({ open: true, severity: 'success', message: `Saved! Site ID: ${res?.site_id || 'generated'}` });

      // reset and clear draft
      setForm({
        site_supervisor_id: '',
        work_completed: '',
        equipment_used: '',
        weather_conditions: '',
        safety_compliance_report: '',
        material_consumption: '',
        site_issues: '',
        site_execution_status: 'on track',
        progress_percent: '',
        milestone: '',
      });
      setLabourUsage([]);
      setPhotoBlob(null);
      setPhotoPreview('');
      clearDraft();
      // Return to list and refresh
      setMode('list');
      setStep(0);
      try {
        const data = await getSiteExecutions();
        const list = Array.isArray(data) ? data.filter(r => String(r.project) === String(selectedProjectId)) : [];
        list.sort((a,b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));
        setReports(list);
      } catch {}
    } catch (err) {
      console.error('Submit failed', err);
      const backendMsg = err?.response?.data ? JSON.stringify(err.response.data) : err?.message || 'Submit failed';
      setSnack({ open: true, severity: 'error', message: backendMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to resolve userId from storage or token
  const resolveLoggedInUserId = useCallback(() => {
    try {
      let userId = '';
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const u = JSON.parse(raw);
        userId =
          u?.user_id ||
          u?.userid ||
          u?.userId ||
          u?.id ||
          u?.profile?.user_id ||
          '';
      }
      if (!userId) {
        const decoded = getLoggedInUserInfo?.();
        userId = decoded?.user_id || '';
      }
      return userId;
    } catch {
      return '';
    }
  }, []);

  // Auto-fill on mount and when userInfo updates
  useEffect(() => {
    const prefill = () => {
      const userId = resolveLoggedInUserId();
      if (userId && !form.site_supervisor_id) {
        setForm(prev => ({ ...prev, site_supervisor_id: userId }));
      }
    };
    prefill();
    window.addEventListener('userInfoUpdated', prefill);
    return () => window.removeEventListener('userInfoUpdated', prefill);
  }, [form.site_supervisor_id, resolveLoggedInUserId]);

  // After draft restore, ensure prefill if still empty
  useEffect(() => {
    if (!form.site_supervisor_id) {
      const userId = resolveLoggedInUserId();
      if (userId) setForm(prev => ({ ...prev, site_supervisor_id: userId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restored]);

  // When entering form mode, prefill if empty
  useEffect(() => {
    if (mode === 'form' && !form.site_supervisor_id) {
      const userId = resolveLoggedInUserId();
      if (userId) setForm(prev => ({ ...prev, site_supervisor_id: userId }));
    }
  }, [mode, form.site_supervisor_id, resolveLoggedInUserId]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ pb: 10 }}>
      {/* Hidden canvas for processing overlays */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Sticky Header */}
      <AppBar position="sticky" elevation={0} sx={{
        backgroundColor: 'background.paper',
        boxShadow: 'none',
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
      }}>
        <Toolbar sx={{ minHeight: 56, alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ flex: 1, color: 'text.primary', fontWeight: 600 }}>
            Site Execution Supervisor
          </Typography>
          <Tooltip title="Logout">
            <IconButton color="error" size="small" onClick={() => setLogoutOpen(true)}>
              <LogoutRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Chip
            label={statusOptions.find(s => s.key === form.site_execution_status)?.label || 'Status'}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ p: 0 }}>
        {/* preload labour resources */}
        {/* Hidden loader – resources used for Labour Usage UI (to be added). */}
        {useEffect(() => {
          let mounted = true;
          (async () => {
            try {
              const data = await getLabourResources();
              if (mounted) setLabourResources(Array.isArray(data) ? data : []);
            } catch (e) {
              console.error('Failed to load labour resources', e);
            }
          })();
          return () => { mounted = false; };
        }, [])}
        {/* Hero header */}
        {mode === 'list' && (
          <Box sx={{
            position: 'relative',
            overflow: 'hidden',
            px: 2,
            pt: 2,
            pb: 6,
            background: 'linear-gradient(135deg, rgba(87,183,157,0.12) 0%, rgba(255,182,114,0.12) 100%)',
            color: 'text.primary',
            borderBottomLeftRadius: 28,
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
          }}>
            {/* Decorative bubbles */}
            <Box sx={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, bgcolor: 'primary.main', opacity: 0.12, borderRadius: '50%' }} />
            <Box sx={{ position: 'absolute', right: 40, top: -10, width: 60, height: 60, bgcolor: 'secondary.main', opacity: 0.14, borderRadius: '50%' }} />

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ flex: 1 }}>Today</Typography>
              <Chip size="small" color="primary" variant="outlined" label={new Date().toLocaleDateString()} />
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Log your daily progress, capture a photo and location.</Typography>

            {/* Bottom wave */}
            <Box component="svg" viewBox="0 0 1440 80" preserveAspectRatio="none" sx={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 40, width: '100%' }}>
              <path fill="currentColor" fillOpacity="0.06" d="M0,64L60,53.3C120,43,240,21,360,21.3C480,21,600,43,720,58.7C840,75,960,85,1080,69.3C1200,53,1320,11,1380,-5.3L1440,-21L1440,81L1380,81C1320,81,1200,81,1080,81C960,81,840,81,720,81C600,81,480,81,360,81C240,81,120,81,60,81L0,81Z" />
            </Box>
          </Box>
        )}
        {/* Project selection and status pills */}
        <Card elevation={0} sx={{ border: 'none', borderRadius: 2, mt: 0, mx: 2, mb: 2, backgroundColor: 'background.paper', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', p: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                select
                label="Project"
                fullWidth
                size="small"
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((p, i) => (
                  <MenuItem key={i} value={p.project_id}>{p.project_id}</MenuItem>
                ))}
              </TextField>
              {!selectedProjectId && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                  Select a project to add today's report.
                </Typography>
              )}

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', flex: 1 }}>Previous Reports</Typography>
                <ShowIfCan slug="construction" action="can_create">
                  <Button size="small" variant="outlined" onClick={openMaterials} disabled={!selectedProjectId}>Request Materials</Button>
                </ShowIfCan>
              </Stack>

              {mode === 'list' && (
                <>
                  {loadingReports ? (
                    <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={18} /><Typography variant="body2">Loading…</Typography></Stack>
                  ) : reports.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No reports yet for this project.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {reports.slice(0, 6).map((r, idx) => (
                        <Stack
                          key={`${r.site_id}-${idx}`}
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          onClick={() => openReport(r)}
                          sx={{
                            p: 1.6,
                            borderRadius: 1.5,
                            backgroundColor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            position: 'relative',
                            '&:before': {
                              content: '""',
                              position: 'absolute',
                              left: -10,
                              top: 0,
                              bottom: 0,
                              width: 2,
                              background: 'linear-gradient(180deg, #57B79D, transparent)'
                            },
                            '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.06)', transform: 'translateY(-1px)', transition: 'all .15s ease' }
                          }}
                        >
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1.1 }}>{r.daily_progress_report_id || r.site_id}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(r.updated_at || r.created_at).toLocaleString()}</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {r.work_completed ? String(r.work_completed).slice(0, 64) + (String(r.work_completed).length > 64 ? '…' : '') : '-'}
                            </Typography>
                          </Box>
                          <Chip label={(r.site_execution_status||'').replace(/\b\w/g, c=>c.toUpperCase())} size="small" variant="outlined" />
                        </Stack>
                      ))}
                    </Stack>
                  )}
                  {/* Requested Materials */}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Requested Materials</Typography>
                  {loadingProcurements ? (
                    <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={18} /><Typography variant="body2">Loading…</Typography></Stack>
                  ) : procurements.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No material requests for this project.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {/* Legend */}
                      <Stack direction="row" spacing={2.5} alignItems="center" sx={{ color: 'text.secondary', fontSize: 12 }}>
                        <Box sx={{ width: 14, height: 6, bgcolor: 'warning.light', borderRadius: 1 }} /> <span>Approval</span>
                        <Box sx={{ width: 14, height: 6, bgcolor: 'info.light', borderRadius: 1 }} /> <span>Delivery</span>
                        <Box sx={{ width: 14, height: 6, bgcolor: 'success.light', borderRadius: 1 }} /> <span>Payment</span>
                      </Stack>
                      {procurements.map((p, i) => {
                        const seg1 = p.approval_status === 'Approved' ? 50 : p.approval_status === 'Rejected' ? 0 : 20;
                        // Delivery progress from request_date -> expected_delivery_date relative to today
                        let seg2 = 0;
                        if (p.expected_delivery_date && p.request_date) {
                          const start = new Date(p.request_date);
                          const end = new Date(p.expected_delivery_date);
                          const now = new Date();
                          if (!isNaN(start) && !isNaN(end) && end > start) {
                            const totalMs = end - start;
                            const elapsedMs = Math.min(Math.max(now - start, 0), totalMs);
                            const ratio = elapsedMs / totalMs; // 0..1
                            seg2 = Math.round(30 * ratio);
                          } else if (!isNaN(end) && end <= now) {
                            seg2 = 30;
                          }
                        } else if (p.expected_delivery_date) {
                          // No request_date; treat as milestone pending until date crossed
                          const end = new Date(p.expected_delivery_date);
                          seg2 = new Date() >= end ? 30 : 0;
                        }
                        const seg3 = p.payment_status === 'Completed' ? 20 : p.payment_status === 'Partially Paid' ? 10 : 0;
                        const total = Math.min(100, seg1 + seg2 + seg3);
                        return (
                          <Box key={i} onClick={()=>openMaterialDetail(p)} sx={{ p: 1.6, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { boxShadow: '0 8px 18px rgba(0,0,0,0.08)' } }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: 'wrap', p: 1 }}>
                            <Chip size="small" label={p.approval_status} variant="outlined" color={p.approval_status==='Approved'?'success':p.approval_status==='Rejected'?'error':'warning'} />
                            <Chip size="small" label={"Payment " + p.payment_status} variant="outlined" />
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                              <Typography variant="subtitle1" sx={{ flex: 1 }}>{p.material_name} ({p.material_code})</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap:'wrap',  alignItems: 'center' }}>
                              {/* <Chip size="medium" variant="outlined" color="secondary" label={`Qty: ${p.quantity_requested}`} /> */}
                              {/* <Chip size="small" variant="outlined" color="info" label={`Unit: ${p.unit_price || '-'}`} /> */}
                              {/* <Chip size="small" variant="outlined" color="success" label={`Total Cost: ${p.total_cost || '-'}`} /> */}
                              <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700 }} >Qty: {p.quantity_requested}</Typography>
                              <Typography variant="caption" >Unit Cost: {formatINR(p.unit_price)}</Typography>
                              <Typography variant="caption" >Total Cost: {formatINR(p.total_cost)}</Typography>
                              <Typography  variant="caption" sx={{ ml: 0.5, fontWeight: 700 }}>Expected: {p.expected_delivery_date ? formatDMY(p.expected_delivery_date) : '-'}</Typography>
                            </Stack>
                            <Box sx={{
                              mt: 1.2,
                              height: 12,
                              borderRadius: 999,
                              overflow: 'hidden',
                              display: 'flex',
                              border: theme => `1px solid ${theme.palette.divider}`,
                              backgroundColor: theme => theme.palette.action.hover,
                            }}>
                              <Box sx={{ width: `${seg1}%`, height: '100%', bgcolor: 'warning.main' }} />
                              <Box sx={{ width: `${seg2}%`, height: '100%', bgcolor: 'info.main' }} />
                              <Box sx={{ width: `${seg3}%`, height: '100%', bgcolor: 'success.main' }} />
                              <Box sx={{ width: `${Math.max(0, 100 - total)}%`, height: '100%', bgcolor: 'transparent' }} />
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
        {mode === 'form' && (
          <Card elevation={0} sx={{ border: 'none', borderRadius: 0, backgroundColor: 'transparent', boxShadow: 'none' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Step {step + 1} of {steps.length}: {steps[step]}</Typography>
                <Box sx={{ ml: 'auto' }}>
                  <Button size="small" onClick={() => setMode('list')}>Cancel</Button>
                </Box>
              </Stack>
              <MobileStepper
                variant="dots"
                steps={steps.length}
                position="static"
                activeStep={step}
                sx={{ background: 'transparent', mb: 1, p: 0 }}
                nextButton={<span />}
                backButton={<span />}
              />

              <Stack spacing={2}>
                {step === 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">Status*</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {statusOptions.map(opt => (
                        <Chip
                          key={opt.key}
                          label={opt.label}
                          color={form.site_execution_status === opt.key ? 'primary' : 'default'}
                          variant="outlined"
                          size="small"
                          onClick={() => setField('site_execution_status', opt.key)}
                          sx={{ borderRadius: 999 }}
                        />
                      ))}
                    </Stack>
                    <TextField
                      label="Site Supervisor ID"
                      required
                      fullWidth
                      size="small"
                      placeholder="Auto-filled from your account"
                      helperText="Prefilled with your user ID. You can change it if needed."
                      value={form.site_supervisor_id}
                      onChange={(e) => setField('site_supervisor_id', e.target.value)}
                    />
                    <TextField label="Work Completed" required fullWidth size="small" multiline minRows={3} value={form.work_completed} onChange={(e) => setField('work_completed', e.target.value)} />
                    {/* Labour Usage (search + list like Materials) */}
                    <Box sx={{ p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Labour Usage</Typography>
                      <Typography variant="caption" color="text.secondary">Add Labour</Typography>
                      <Autocomplete
                        options={labourResources}
                        getOptionLabel={(opt) => resourceLabel(opt)}
                        onChange={(e, v) => addLabourEntry(v)}
                        disablePortal
                        renderInput={(params) => <TextField {...params} placeholder="Search labour category/vendor" size="small" fullWidth sx={{ mt: 0.5, mb: 1 }} />}
                      />
                      {labourUsage.filter(e => e.labour_resource).length > 0 && (
                        <Stack spacing={1}>
                          {labourUsage.filter(e => e.labour_resource).map((e) => {
                            const lr = (labourResources || []).find((x) => String(x.id) === String(e.labour_resource));
                            const label = lr ? resourceLabel(lr) : `Resource #${e.labour_resource}`;
                            return (
                              <Stack key={e.labour_resource || Math.random()} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography sx={{ flex: 1 }}>{label}</Typography>
                                <TextField
                                  label="# Workers"
                                  type="number"
                                  size="small"
                                  value={e.number_of_workers}
                                  onChange={(ev)=> updateLabourField(e.labour_resource, 'number_of_workers', ev.target.value)}
                                  sx={{ width: { xs: '100%', sm: 140 } }}
                                />
                                <TextField
                                  label="Work Hours"
                                  type="number"
                                  size="small"
                                  value={e.work_hours}
                                  onChange={(ev)=> updateLabourField(e.labour_resource, 'work_hours', ev.target.value)}
                                  sx={{ width: { xs: '100%', sm: 140 } }}
                                />
                                <TextField
                                  label="Date/Time"
                                  type="datetime-local"
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                  value={e.date}
                                  onChange={(ev)=> updateLabourField(e.labour_resource, 'date', ev.target.value)}
                                  sx={{ width: { xs: '100%', sm: 220 } }}
                                />
                                <Button color="error" onClick={() => removeLabourEntry(e.labour_resource)}>Remove</Button>
                              </Stack>
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                    <TextField label="Equipment Used" required fullWidth size="small" multiline minRows={2} value={form.equipment_used} onChange={(e) => setField('equipment_used', e.target.value)} />
                    <TextField label="Weather Conditions" required fullWidth size="small" value={form.weather_conditions} onChange={(e) => setField('weather_conditions', e.target.value)} />
                    <Autocomplete
                      options={milestones}
                      getOptionLabel={(o) => o?.name ? `${o.name}` : ''}
                      loading={loadingMilestones}
                      value={milestones.find(m => String(m.id) === String(form.milestone)) || null}
                      onChange={(e, val) => setField('milestone', val?.id || '')}
                      isOptionEqualToValue={(opt, val) => String(opt.id) === String(val.id)}
                      disabled={!selectedProjectId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Milestone"
                          required
                          size="small"
                          helperText={!selectedProjectId ? 'Select a project to load milestones' : ''}
                        />
                      )}
                    />
                    <TextField
                      label="Progress (%)"
                      required
                      type="number"
                      inputProps={{ min: 0, max: 100 }}
                      fullWidth
                      size="small"
                      value={form.progress_percent}
                      onChange={(e) => setField('progress_percent', e.target.value)}
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                    <TextField label="Safety Compliance Report" required fullWidth size="small" multiline minRows={3} value={form.safety_compliance_report} onChange={(e) => setField('safety_compliance_report', e.target.value)} />
                    <Stack spacing={1}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <TextField
                          label="Material Consumption (summary)"
                          fullWidth
                          size="small"
                          value={form.material_consumption}
                          placeholder="Click to select materials used"
                          multiline
                          minRows={2}
                          InputProps={{ readOnly: true }}
                          onClick={openConsumption}
                        />
                        <Button variant="outlined" onClick={openConsumption}>Select Materials</Button>
                      </Stack>
                      <TextField
                        label="Material Consumption Notes (optional)"
                        fullWidth
                        size="small"
                        value={consumptionNotes}
                        onChange={(e)=> setConsumptionNotes(e.target.value)}
                        placeholder="Add any extra notes regarding material consumption"
                        multiline
                        minRows={2}
                      />
                    </Stack>
                    <TextField label="Site Issues (optional)" fullWidth size="small" multiline minRows={2} value={form.site_issues} onChange={(e) => setField('site_issues', e.target.value)} />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button variant="outlined" size="small" startIcon={<MyLocationIcon />} onClick={captureLocation} disabled={location.loading}>
                        {location.loading ? 'Fetching Location…' : 'Enable Location'}
                      </Button>
                      {location.latitude && location.longitude ? (
                        <Typography variant="body2" color="text.secondary">{`Lat: ${Number(location.latitude).toFixed(6)}, Lng: ${Number(location.longitude).toFixed(6)}${location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ''}`}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Location not available</Typography>
                      )}
                    </Stack>
                    {location.error && (<Alert severity="warning" variant="outlined">{location.error}</Alert>)}
                  </>
                )}

                {step === 3 && (
                  <>
                    {photoPreview && (
                      <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <CardMedia component="img" image={photoPreview} alt="Photo evidence" sx={{ maxHeight: 420, objectFit: 'contain', borderRadius: 2, boxShadow: 'none' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Location stamped on image when available.</Typography>
                      </Box>
                    )}
                    {!photoPreview && (
                      <Typography variant="body2" color="text.secondary">Tap the camera button to capture a photo.</Typography>
                    )}
                  </>
                )}

                {step === 4 && (
                  <>
                    <Typography variant="subtitle2">Review</Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="body2"><strong>Project:</strong> {selectedProjectId || '-'}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> {form.site_execution_status}</Typography>
                      <Typography variant="body2"><strong>Supervisor:</strong> {form.site_supervisor_id || '-'}</Typography>
                      <Typography variant="body2"><strong>Work:</strong> {form.work_completed || '-'}</Typography>
                      <Typography variant="body2"><strong>Labour Usage:</strong></Typography>
                      <Box sx={{ pl: 1 }}>
                        {labourUsage && labourUsage.length > 0 ? (
                          <Stack spacing={0.25}>
                            {labourUsage.map((e, i) => {
                              const lr = (labourResources || []).find((x) => String(x.id) === String(e.labour_resource));
                              const label = lr ? resourceLabel(lr) : (e.labour_resource ? `Resource #${e.labour_resource}` : '(No Resource)');
                              const when = e.date ? (() => { const d = new Date(e.date); return isNaN(d) ? e.date : d.toLocaleString(); })() : '-';
                              return (
                                <Typography key={i} variant="body2" color="text.secondary">
                                  • {label}: {e.number_of_workers || '-'} workers, {e.work_hours || '-'} hrs, {when}
                                </Typography>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </Box>
                      <Typography variant="body2"><strong>Equipment:</strong> {form.equipment_used || '-'}</Typography>
                      <Typography variant="body2"><strong>Weather:</strong> {form.weather_conditions || '-'}</Typography>
                      <Typography variant="body2"><strong>Safety:</strong> {form.safety_compliance_report || '-'}</Typography>
                      <Typography variant="body2"><strong>Materials:</strong> {form.material_consumption || '-'}</Typography>
                      <Typography variant="body2"><strong>Issues:</strong> {form.site_issues || '-'}</Typography>
                      <Typography variant="body2"><strong>Location:</strong> {location.latitude && location.longitude ? `${location.latitude}, ${location.longitude}` : '-'}</Typography>
                      <Typography variant="body2"><strong>Photo:</strong> {photoPreview ? 'Attached' : 'Not attached'}</Typography>
                      <Typography variant="body2"><strong>Milestone:</strong> {(() => { const m = milestones.find(x => String(x.id) === String(form.milestone)); return m ? `${m.name} (#${m.id})` : '-'; })()}</Typography>
                      <Typography variant="body2"><strong>Progress:</strong> {form.progress_percent !== '' ? `${form.progress_percent}%` : '-'}</Typography>
                    </Stack>
                  </>
                )}

                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>Back</Button>
                  {step < steps.length - 1 ? (
                    <Button variant="contained" size="small" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>Next</Button>
                  ) : (
                    <ShowIfCan slug={MODULE_SLUG} action="can_create">
                      <Button variant="contained" size="small" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Submit'}
                      </Button>
                    </ShowIfCan>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* FAB and hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={onPhotoPicked}
        style={{ display: 'none' }}
      />
      {/* FABs: add report vs camera */}
      {mode === 'list' ? (
        <ShowIfCan slug={MODULE_SLUG} action="can_create">
          <Tooltip title={selectedProjectId ? "Add today's report" : 'Select a project to add a report'} placement="left">
            <span onClick={() => { if (!selectedProjectId) setSnack({ open: true, severity: 'info', message: 'Select a project to add today\'s report' }); }}>
              <Fab
                color="primary"
                onClick={()=>{ if (!selectedProjectId) return; setMode('form'); setStep(0); }}
                aria-label="add"
                disabled={!selectedProjectId}
                sx={{
                  position: 'fixed',
                  right: 16,
                  bottom: 16,
                  boxShadow: 1,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { backgroundColor: 'primary.dark', boxShadow: 2 },
                  '&.Mui-disabled': {
                    backgroundColor: (theme) => theme.palette.action.disabledBackground,
                    color: (theme) => theme.palette.action.disabled,
                    boxShadow: 'none',
                  },
                }}
              >
                <AddIcon />
              </Fab>
            </span>
          </Tooltip>
        </ShowIfCan>
      ) : step === 3 ? (
        <ShowIfCan slug={MODULE_SLUG} action="can_create">
          <Fab
            color="primary"
            onClick={handleFabClick}
            aria-label="capture"
            sx={{ position: 'fixed', right: 16, bottom: 16, boxShadow: 4, background: 'linear-gradient(135deg, #7267ef 0%, #9a94ff 100%)' }}
          >
            <CameraAltIcon />
          </Fab>
        </ShowIfCan>
      ) : null}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Report Details Dialog */}
      <Dialog open={reportOpen} onClose={closeReport} fullWidth maxWidth="sm">
        <DialogTitle sx={{ p: 0 }}>
          {reportFocus && (
            <Box sx={{
              px: 2,
              py: 2,
              background: 'linear-gradient(135deg, rgba(87,183,157,0.08) 0%, rgba(255,182,114,0.08) 100%)',
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
            }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AssignmentIcon sx={{ fontSize: 16 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {reportFocus.daily_progress_report_id || reportFocus.site_id}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Chip size="small" label={(reportFocus.site_execution_status||'').replace(/\b\w/g, c=>c.toUpperCase())} color="primary" variant="outlined" />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">Updated {new Date(reportFocus.updated_at || reportFocus.created_at).toLocaleString()}</Typography>
                </Stack>
              </Stack>
            </Box>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {reportFocus ? (
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                {/* Overview */}
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Overview</Typography>
                  <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>Supervisor:</strong> {reportFocus.site_supervisor_id}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ConstructionIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>Project:</strong> {reportFocus.project}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BuildIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          <strong>Milestone:</strong> {(() => {
                            const m = milestones.find(x => String(x.id) === String(reportFocus.milestone));
                            return m ? `${m.name} (#${m.id})` : (reportFocus.milestone ? `#${reportFocus.milestone}` : '—');
                          })()}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2"><strong>Progress:</strong> {reportFocus.progress_percent != null ? `${reportFocus.progress_percent}%` : '—'}</Typography>
                        {reportFocus.progress_percent != null && (
                          <LinearProgress variant="determinate" value={Number(reportFocus.progress_percent) || 0} />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                {/* Work & Resources */}
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Work & Resources</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Work Completed:</strong> {reportFocus.work_completed || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BuildIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>Equipment:</strong> {reportFocus.equipment_used || '-'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <GroupIcon sx={{ fontSize: 16, mt: 0.4 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ mb: 0.25 }}><strong>Labour Usage:</strong></Typography>
                          {(() => {
                            const list = Array.isArray(reportFocus.labour_usage) ? reportFocus.labour_usage : [];
                            if (!list.length) return <Typography variant="body2" color="text.secondary">—</Typography>;
                            return (
                              <Stack spacing={0.25}>
                                {list.map((e, i) => {
                                  const lr = (labourResources || []).find((x) => String(x.id) === String(e.labour_resource));
                                  const label = lr ? resourceLabel(lr) : (e.labour_resource ? `Resource #${e.labour_resource}` : '(No Resource)');
                                  const when = e.date ? (() => { const d = new Date(e.date); return isNaN(d) ? e.date : d.toLocaleString(); })() : '—';
                                  return (
                                    <Typography key={i} variant="body2" color="text.secondary">
                                      • {label}: {e.number_of_workers ?? '—'} workers, {e.work_hours ?? '—'} hrs, {when}
                                    </Typography>
                                  );
                                })}
                              </Stack>
                            );
                          })()}
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WbSunnyIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>Weather:</strong></Typography>
                        <Chip size="small" color="info" variant="outlined" label={reportFocus.weather_conditions || '-'} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                {/* Safety & Materials */}
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Safety & Materials</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Safety:</strong> {reportFocus.safety_compliance_report || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Materials:</strong> {reportFocus.material_consumption || '-'}</Typography>
                    </Grid>
                    {!!reportFocus.site_issues && (
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <WarningAmberIcon color="warning" sx={{ fontSize: 16 }} />
                          <Typography variant="body2" color="error"><strong>Issues:</strong> {reportFocus.site_issues}</Typography>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Location & System */}
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Location & System</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PlaceIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>Location:</strong> {reportFocus.latitude && reportFocus.longitude ? `${reportFocus.latitude}, ${reportFocus.longitude}` : '—'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>Location Time:</strong> {reportFocus.location_timestamp ? new Date(reportFocus.location_timestamp).toLocaleString() : '—'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Check-in:</strong> {reportFocus.checkin_time ? new Date(reportFocus.checkin_time).toLocaleString() : '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Check-out:</strong> {reportFocus.checkout_time ? new Date(reportFocus.checkout_time).toLocaleString() : '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DevicesIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>Device:</strong> {reportFocus.device_id || '—'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PublicIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2"><strong>IP:</strong> {reportFocus.ip_address || '—'}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                {!!reportFocus.photo_evidence && (
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="overline" color="text.secondary">Photo Evidence</Typography>
                    <Divider sx={{ my: 1 }} />
                    <CardMedia component="img" src={reportFocus.photo_evidence} alt="Photo" sx={{ borderRadius: 1, maxHeight: 360, objectFit: 'contain' }} />
                  </Box>
                )}
              </Stack>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReport}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Material Consumption Dialog */}
      <Dialog open={consumptionOpen} onClose={closeConsumption} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Select Materials Used</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">Project</Typography>
            <TextField value={selectedProjectId || ''} fullWidth size="small" disabled />

            <Typography variant="caption" color="text.secondary">Add Item</Typography>
            <Autocomplete
              options={inventory}
              loading={loadingInventory}
              getOptionLabel={(opt) => opt?.item_name ? `${opt.item_id} - ${opt.item_name}` : ''}
              onChange={(e, v) => addConsumptionItem(v)}
              disablePortal
              renderInput={(params) => <TextField {...params} placeholder="Search items" size="small" fullWidth />}
            />

            {consumptionItems.length > 0 && (
              <Stack spacing={1}>
                {consumptionItems.map((ci) => (
                  <Stack key={ci.item.item_id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography sx={{ flex: 1 }}>{ci.item.item_id} - {ci.item.item_name}</Typography>
                    <TextField
                      label="Quantity Used"
                      type="number"
                      size="small"
                      value={ci.quantity}
                      onChange={(e)=> updateConsumptionQty(ci.item.item_id, e.target.value)}
                      sx={{ width: '100%' }}
                    />
                    <Button color="error" onClick={() => removeConsumptionItem(ci.item.item_id)}>Remove</Button>
                  </Stack>
                ))}
              </Stack>
            )}

            <TextField
              label="Notes (optional)"
              size="small"
              fullWidth
              value={consumptionNotes}
              onChange={(e)=> setConsumptionNotes(e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConsumption}>Cancel</Button>
          <ShowIfCan slug="construction" action="can_create">
            <Button variant="contained" onClick={submitConsumption} disabled={savingConsumption}>
              {savingConsumption ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Save Consumption'}
            </Button>
          </ShowIfCan>
        </DialogActions>
      </Dialog>

      {/* Material Details Dialog */}
      <Dialog open={matDetailOpen} onClose={closeMaterialDetail} fullWidth maxWidth="sm">
        <DialogTitle>Material Request Details</DialogTitle>
        <DialogContent dividers>
          {matFocus && (
            <Stack spacing={1.2}>
              <Typography variant="body2"><strong>Item:</strong> {matFocus.material_name} ({matFocus.material_code})</Typography>
              <Typography variant="body2"><strong>Quantity:</strong> {matFocus.quantity_requested}</Typography>
              {/* <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip size="small" variant="outlined" color="info" label={`Unit: ${matFocus.unit_price || '-'}`} />
                <Chip size="small" variant="outlined" color="success" label={`Total Cost: ${matFocus.total_cost || '-'}`} />
              </Stack> */}
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Unit Cost: {formatINR(matFocus.unit_price)}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Total Cost: {formatINR(matFocus.total_cost)}</Typography>
              <Typography variant="body2"><strong>Approval Status:</strong> {matFocus.approval_status}</Typography>
              <Typography variant="body2"><strong>Payment Status:</strong> {matFocus.payment_status}</Typography>
              <Typography variant="body2"><strong>Expected Delivery:</strong> {matFocus.expected_delivery_date ? formatDMY(matFocus.expected_delivery_date) : '-'}</Typography>
              <Typography variant="body2"><strong>Requested By:</strong> {matFocus.requested_by || '-'}</Typography>
              <Typography variant="body2"><strong>Request Date:</strong> {matFocus.request_date ? formatDMY(matFocus.request_date) : '-'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMaterialDetail}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Materials Request Dialog */}
      <Dialog open={materialsOpen} onClose={closeMaterials} fullWidth maxWidth="sm">
        <DialogTitle>Request Materials</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">Project</Typography>
            <TextField value={selectedProjectId || ''} fullWidth size="small" disabled />

            <Typography variant="caption" color="text.secondary">Item</Typography>
            <Autocomplete
              options={inventory}
              loading={loadingInventory}
              getOptionLabel={(opt) => opt?.item_name ? `${opt.item_name} (${opt.item_id})` : ''}
              value={matForm.item}
              onChange={(e, v) => setMatForm(s => ({ ...s, item: v }))}
              renderInput={(params) => <TextField {...params} placeholder="Search items" size="small" />}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                label="Quantity"
                type="number"
                size="small"
                fullWidth
                value={matForm.quantity}
                onChange={(e)=> setMatForm(s => ({ ...s, quantity: e.target.value }))}
              />
              <TextField
                label="Unit Price (optional)"
                type="number"
                size="small"
                fullWidth
                value={matForm.unit_price}
                onChange={(e)=> setMatForm(s => ({ ...s, unit_price: e.target.value }))}
              />
            </Stack>

            <TextField
              label="Requested By"
              size="small"
              fullWidth
              value={matForm.requested_by}
              onChange={(e)=> setMatForm(s => ({ ...s, requested_by: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMaterials}>Cancel</Button>
          <ShowIfCan slug="construction" action="can_create">
            <Button variant="contained" onClick={submitMaterials}>Submit Request</Button>
          </ShowIfCan>
        </DialogActions>
      </Dialog>

      {/* Logout Confirm Dialog */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={logout}>Logout</Button>
        </DialogActions>
      </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default SiteExecutionSupervisor;