import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Modal, Badge, ProgressBar } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateDDMMYYYY } from '../../utils/date';
// APIs
import { fetchConstructionProjects, getMilestonesByProject } from '../../allapi/construction';
import { projectCost } from '../../allapi/tenderAllocation';
import { getProjects as getTenderProjects, getTenders } from '../../allapi/tenderAllocation';
// Optional AR/AP (best-effort). If these APIs differ, we'll gracefully handle.
import { getReceivables, getPayables } from '../../allapi/account';
// Procurement
import { getVendors } from '../../allapi/procurement';

// Small helpers
const toNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const titleCase = (s) => (s ? s.toString().toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '');
const fmtDate = (s) => {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d)) return s;
  try {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (_) {
    return s;
  }
};

// Pastel palette tokens
const pastel = {
  bg: '#ffffff',
  text: '#0f172a',
  subtext: '#64748b',
  border: '#e5e7eb',
  shadow: '0 10px 30px rgba(2, 8, 23, 0.06)',
  gradientTeal: 'linear-gradient(135deg, rgba(87,183,157,0.16) 0%, rgba(114,103,239,0.10) 100%)',
  gradientPeach: 'linear-gradient(135deg, rgba(255,182,114,0.18) 0%, rgba(254,180,169,0.12) 100%)',
  teal: '#57B79D',
  lavender: '#7267ef',
  peach: '#FFB672',
  sky: '#93c5fd',
  mint: '#86efac',
};

export default function EpcDashboard() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]); // construction project-management list
  const [costs, setCosts] = useState([]); // tender project-costs list
  const [error, setError] = useState('');
  // Tender allocation projects (team allocation)
  const [tenderProjects, setTenderProjects] = useState([]);
  // AR/AP
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  // Vendors
  const [vendors, setVendors] = useState([]);
  // Tenders (for EMD info)
  const [tenders, setTenders] = useState([]);
  // Milestones
  const [selectedProjectForGantt, setSelectedProjectForGantt] = useState(''); // PRJ code
  const [ganttMilestones, setGanttMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  // Project details modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProject, setDetailProject] = useState(null); // construction project object
  // Gantt full view
  const [ganttFullOpen, setGanttFullOpen] = useState(false);

  // Compute initial Gantt range based on milestones
  const ganttRange = useMemo(() => {
    if (!ganttMilestones || ganttMilestones.length === 0) return null;
    let min = Infinity, max = -Infinity;
    for (const m of ganttMilestones) {
      const s = new Date(m.start_date).getTime();
      const e = new Date(m.end_date).getTime();
      if (!isNaN(s)) min = Math.min(min, s);
      if (!isNaN(e)) max = Math.max(max, e);
    }
    if (!isFinite(min) || !isFinite(max)) return null;
    // Add a small padding so bars are not tight against edges
    const pad = Math.round((max - min) * 0.04);
    return { min: min - pad, max: max + pad };
  }, [ganttMilestones]);

  // Fetch data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [proj, cost, tendersProjects, recv, pay, vends, tendersList] = await Promise.all([
          fetchConstructionProjects(),
          projectCost(),
          getTenderProjects().catch(() => []),
          getReceivables?.().catch(() => []),
          getPayables?.().catch(() => []),
          getVendors?.().catch(() => []),
          getTenders?.().catch(() => []),
        ]);
        if (!mounted) return;
        setProjects(Array.isArray(proj) ? proj : []);
        setCosts(Array.isArray(cost) ? cost : []);
        setTenderProjects(Array.isArray(tendersProjects) ? tendersProjects : []);
        setReceivables(Array.isArray(recv) ? recv : []);
        setPayables(Array.isArray(pay) ? pay : []);
        setVendors(Array.isArray(vends) ? vends : []);
        setTenders(Array.isArray(tendersList) ? tendersList : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data ? JSON.stringify(e.response.data) : e.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Inject Inter font for clean typography
  useEffect(() => {
    const id = 'inter-font-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    document.body.style.fontFamily = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
    // Inject micro-interaction and chip styles once
    const styleId = 'epc-dashboard-soft-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .soft-card { border: 1px solid ${pastel.border}; border-radius: 16px; transition: transform .15s ease, box-shadow .15s ease; background: ${pastel.bg}; }
        .soft-card:hover { transform: translateY(-2px); box-shadow: ${pastel.shadow}; }
        .chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 12px; line-height: 1; border: 1px solid ${pastel.border}; }
        .chip-teal { background: rgba(87,183,157,0.12); color: ${pastel.teal}; }
        .chip-mint { background: rgba(134,239,172,0.12); color: #16a34a; }
        .chip-peach { background: rgba(255,182,114,0.14); color: #d97706; }
        .chip-sky { background: rgba(147,197,253,0.16); color: #2563eb; }
        .chip-lavender { background: rgba(114,103,239,0.14); color: ${pastel.lavender}; }
        .chip-gray { background: rgba(148,163,184,0.14); color: #475569; }
        .btn, .form-select { border-radius: 10px; }
        .btn:active { transform: translateY(1px); }
        /* Subtle alert shake animation */
        .alert-shake { animation: alert-shake 2.2s ease-in-out infinite; }
        @keyframes alert-shake {
          0%   { transform: translateX(0) }
          5%   { transform: translateX(-2px) rotate(-0.2deg) }
          10%  { transform: translateX(2px) rotate(0.2deg) }
          15%  { transform: translateX(-1px) }
          20%  { transform: translateX(1px) }
          25%  { transform: translateX(0) }
          100% { transform: translateX(0) }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // When the project list loads, pick first as default for Gantt
  useEffect(() => {
    if (!selectedProjectForGantt && projects.length > 0) {
      setSelectedProjectForGantt(projects[0].project);
    }
  }, [projects, selectedProjectForGantt]);

  // Load milestones for selected project
  useEffect(() => {
    const run = async () => {
      if (!selectedProjectForGantt) { setGanttMilestones([]); return; }
      try {
        setLoadingMilestones(true);
        const data = await getMilestonesByProject(selectedProjectForGantt);
        setGanttMilestones(Array.isArray(data) ? data : []);
      } catch (e) {
        setGanttMilestones([]);
      } finally {
        setLoadingMilestones(false);
      }
    };
    run();
  }, [selectedProjectForGantt]);

  // Nudge charts to render immediately once data is loaded (ApexCharts sometimes waits for a resize)
  useEffect(() => {
    if (!loading && projects.length > 0) {
      const t = setTimeout(() => {
        try { window.dispatchEvent(new Event('resize')); } catch {}
      }, 120);
      return () => clearTimeout(t);
    }
  }, [loading, projects.length]);

  // Index costs by project code
  const costByProject = useMemo(() => {
    const map = new Map();
    for (const c of costs) {
      map.set(c.project, c);
    }
    return map;
  }, [costs]);

  // Derived metrics
  const totals = useMemo(() => {
    const totalProjects = projects.length;
    const statusCounts = projects.reduce((acc, p) => {
      const k = (p.project_status || 'unknown').toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    let totalBudget = 0;
    let totalSpent = 0;
    for (const p of projects) {
      totalBudget += toNumber(p.project_budget);
      const c = costByProject.get(p.project);
      totalSpent += toNumber(c?.total_cost);
    }

    // Upcoming deadlines: sort by end_date ascending
    const upcoming = [...projects].sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0)).slice(0, 5);

    return { totalProjects, statusCounts, totalBudget, totalSpent, upcoming };
  }, [projects, costByProject]);

  // Status distribution chart (donut)
  const statusLabels = Object.keys(totals.statusCounts);
  const statusSeries = statusLabels.map((k) => totals.statusCounts[k]);
  const statusChart = useMemo(() => ({
    type: 'donut',
    series: statusSeries,
    options: {
      labels: statusLabels.map(titleCase),
      legend: { position: 'bottom', labels: { colors: pastel.subtext } },
      dataLabels: { enabled: true, style: { fontSize: '12px' } },
      colors: [pastel.teal, pastel.peach, '#FEB4A9', pastel.lavender, '#94a3b8'],
      grid: { strokeDashArray: 4, borderColor: pastel.border },
    }
  }), [statusLabels.join(','), statusSeries.join(',')]);

  // Budget vs Spend (bar)
  const bvsCategories = projects.map((p) => p.project);
  const bvsBudget = projects.map((p) => toNumber(p.project_budget));
  const bvsSpend = projects.map((p) => toNumber(costByProject.get(p.project)?.total_cost));
  // Apply a visual floor so very small bars remain visible without altering tooltips/labels
  const bvsMax = Math.max(0, ...(bvsBudget.length ? bvsBudget : [0]), ...(bvsSpend.length ? bvsSpend : [0]));
  const bvsFloor = bvsMax > 0 ? Math.max(1, Math.round(bvsMax * 0.04)) : 0; // ~4% of max or at least 1
  const adjustBar = (v) => (v === 0 ? 0 : Math.max(v, bvsFloor));
  const bvsBudgetAdj = bvsBudget.map(adjustBar);
  const bvsSpendAdj = bvsSpend.map(adjustBar);
  const budgetVsSpendChart = useMemo(() => ({
    type: 'bar',
    series: [
      { name: 'Budget', data: bvsBudgetAdj },
      { name: 'Spent', data: bvsSpendAdj },
    ],
    options: {
      chart: { stacked: false, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 6 } },
      xaxis: { categories: bvsCategories, labels: { style: { colors: pastel.subtext } } },
      yaxis: { labels: { style: { colors: pastel.subtext } } },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: pastel.border },
      colors: [pastel.lavender, pastel.teal],
      legend: { position: 'top', labels: { colors: pastel.subtext } },
      tooltip: {
        y: {
          formatter: (val, { seriesIndex, dataPointIndex }) => {
            const raw = seriesIndex === 0 ? bvsBudget[dataPointIndex] : bvsSpend[dataPointIndex];
            try { return raw.toLocaleString('en-IN'); } catch { return String(raw); }
          }
        }
      }
    }
  }), [bvsCategories.join(','), bvsBudget.join(','), bvsSpend.join(','), bvsBudgetAdj.join(','), bvsSpendAdj.join(','), bvsFloor]);

  // Cost breakdown stacked bar per project
  const cbCategories = projects.map((p) => p.project);
  const breakdownSeries = useMemo(() => {
    const pick = (pcode, key) => toNumber((costByProject.get(pcode) || {})[key]);
    return [
      { name: 'Material', data: cbCategories.map((c) => pick(c, 'material_cost')) },
      { name: 'Labor', data: cbCategories.map((c) => pick(c, 'labor_cost')) },
      { name: 'Transport', data: cbCategories.map((c) => pick(c, 'transport_cost')) },
      { name: 'Safety', data: cbCategories.map((c) => pick(c, 'safety_cost')) },
      { name: 'Maintenance', data: cbCategories.map((c) => pick(c, 'maintenance_cost')) },
      { name: 'Other', data: cbCategories.map((c) => pick(c, 'other_cost')) },
    ];
  }, [cbCategories.join(','), costs]);
  const costBreakdownChart = useMemo(() => ({
    type: 'bar',
    series: breakdownSeries,
    options: {
      chart: { stacked: true, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 6 } },
      xaxis: { categories: cbCategories, labels: { style: { colors: pastel.subtext } } },
      yaxis: { labels: { style: { colors: pastel.subtext } } },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: pastel.border },
      legend: { position: 'top', labels: { colors: pastel.subtext } },
      colors: ['#A5B4FC', '#86EFAC', '#FDE68A', '#FCA5A5', '#93C5FD', '#D1D5DB']
    }
  }), [breakdownSeries, cbCategories.join(',')]);

  // Profitability per project (Budget - Cost)
  const profitSeries = useMemo(() => {
    const data = projects.map((p) => {
      const budget = toNumber(p.project_budget);
      const spent = toNumber(costByProject.get(p.project)?.total_cost);
      return budget - spent;
    });
    return [{ name: 'Profitability (Budget - Cost)', data }];
  }, [projects, costByProject]);
  const profitChart = useMemo(() => ({
    type: 'bar',
    series: profitSeries,
    options: {
      chart: { toolbar: { show: false } },
      xaxis: { categories: projects.map((p) => p.project), labels: { style: { colors: pastel.subtext } } },
      yaxis: { labels: { style: { colors: pastel.subtext } } },
      colors: ['#22C55E'],
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: pastel.border },
    }
  }), [profitSeries, projects.map((p)=>p.project).join(',')]);

  // AR/AP summaries (best-effort)
  const receivableTotal = useMemo(() => receivables.reduce((sum, r) => sum + toNumber(r.total_amount || r.amount || r.invoice_amount || 0), 0), [receivables]);
  const payableTotal = useMemo(() => payables.reduce((sum, p) => sum + toNumber(p.total_amount || p.amount || p.invoice_amount || 0), 0), [payables]);

  // Milestone Gantt (rangeBar)
  const ganttSeries = useMemo(() => {
    const seriesData = (ganttMilestones || []).map((m) => ({
      x: m.name,
      y: [new Date(m.start_date).getTime(), new Date(m.end_date).getTime()],
    }));
    return [{ name: 'Milestones', data: seriesData }];
  }, [ganttMilestones]);
  const ganttChart = useMemo(() => ({
    type: 'rangeBar',
    series: ganttSeries,
    options: {
      chart: { id: 'ganttChart', toolbar: { show: true, tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      xaxis: { type: 'datetime', min: ganttRange?.min, max: ganttRange?.max },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: pastel.border },
      colors: [pastel.lavender],
    }
  }), [ganttSeries, ganttRange?.min, ganttRange?.max]);

  const ganttChartFull = useMemo(() => ({
    type: 'rangeBar',
    series: ganttSeries,
    options: {
      chart: { id: 'ganttChartFull', toolbar: { show: true, tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      xaxis: { type: 'datetime', min: ganttRange?.min, max: ganttRange?.max },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: pastel.border },
      colors: [pastel.lavender],
    }
  }), [ganttSeries, ganttRange?.min, ganttRange?.max]);

  const resetGantt = () => {
    try {
      if (ganttRange) {
        ApexCharts.exec('ganttChart', 'zoomX', ganttRange.min, ganttRange.max);
      } else {
        ApexCharts.exec('ganttChart', 'resetZoom');
      }
    } catch (e) {}
  };
  const resetGanttFull = () => {
    try {
      if (ganttRange) {
        ApexCharts.exec('ganttChartFull', 'zoomX', ganttRange.min, ganttRange.max);
      } else {
        ApexCharts.exec('ganttChartFull', 'resetZoom');
      }
    } catch (e) {}
  };

  // Project progress (radial bar)
  const progressSeries = projects.map((p) => toNumber(p.overall_progress || 0));
  const progressLabels = projects.map((p) => p.project);
  const progressChart = useMemo(() => ({
    type: 'radialBar',
    series: progressSeries,
    options: {
      labels: progressLabels,
      plotOptions: { radialBar: { dataLabels: { total: { show: false } } } },
      legend: { show: true, position: 'bottom' },
      colors: ['#57B79D', '#7267ef', '#FFB672', '#FEB4A9', '#94a3b8']
    }
  }), [progressSeries.join(','), progressLabels.join(',')]);

  // KPI cards per project
  const kpiRows = useMemo(() => projects.map((p) => {
    const c = costByProject.get(p.project);
    const spent = toNumber(c?.total_cost);
    const budget = toNumber(p.project_budget);
    const utilization = budget > 0 ? Math.min(100, (spent / budget) * 100).toFixed(1) : 0;
    return { id: p.id, code: p.project, name: p.project_name, status: p.project_status, progress: toNumber(p.overall_progress || 0), budget, spent, utilization };
  }), [projects, costByProject]);

  // Helper: users allocated from tenderProjects
  const usersByProject = useMemo(() => {
    const map = new Map();
    for (const t of tenderProjects) {
      const key = t.project_id || t.project;
      if (!key) continue;
      map.set(key, Array.isArray(t.users) ? t.users : []);
    }
    return map;
  }, [tenderProjects]);

  // Helper: vendors grouped by project code
  const vendorsByProject = useMemo(() => {
    const map = new Map();
    for (const v of vendors) {
      const key = v.project; // e.g., 'PRJ-2025-0001'
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(v);
    }
    return map;
  }, [vendors]);

  // Alerts: Upcoming EMD returns (within next 10 days, not refunded) and missing security deposit amount
  const { upcomingEmdReturns, missingSecurityDeposits } = useMemo(() => {
    const result = { upcomingEmdReturns: [], missingSecurityDeposits: [] };
    try {
      const now = new Date();
      const in10 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const tendersById = new Map();
      for (const t of tenders) tendersById.set(t.tender_id, t);
      const acceptedProjects = (tenderProjects || []).filter((p) => {
        const code = p.project_id || p.project;
        return (p.status === 'Accept');
        // return (p.status === 'Accept') && code && code.startsWith('PRJ');
      });
      for (const p of acceptedProjects) {
        const code = p.project_id || p.project;
        const t = tendersById.get(p.tender);
        if (t && t.emd_details) {
          const rd = t.emd_details.refund_date ? new Date(t.emd_details.refund_date) : null;
          const refunded = t.emd_details.is_refunded === true;
          if (rd && !isNaN(rd) && rd >= now && rd <= in10 && !refunded) {
            result.upcomingEmdReturns.push({
              project: code,
              tender_ref_no: t.tender_ref_no,
              refund_date: t.emd_details.refund_date,
            });
          }
        }
        const amt = p.security_money_amount;
        if (amt === null || amt === undefined || amt === '' || Number(amt) === 0) {
          result.missingSecurityDeposits.push({ project: code });
        }
      }
    } catch (e) {}
    return result;
  }, [tenders, tenderProjects]);

  const openDetails = (p) => { setDetailProject(p); setDetailOpen(true); };
  const closeDetails = () => { setDetailOpen(false); setDetailProject(null); };

  const renderStatusChip = (status) => {
    const s = (status || '').toString().toLowerCase();
    let cls = 'chip-teal';
    let label = 'In Progress';
    if (s.includes('complete')) { cls = 'chip-mint'; label = 'Completed'; }
    else if (s.includes('delay') || s.includes('risk') || s.includes('halt')) { cls = 'chip-peach'; label = titleCase(status); }
    else { label = titleCase(status); }
    return <span className={`chip ${cls}`}>{label}</span>;
  };

  const renderUserChip = (user, idx) => {
    const palette = ['chip-sky', 'chip-lavender', 'chip-teal', 'chip-mint', 'chip-peach', 'chip-gray'];
    const cls = palette[idx % palette.length];
    return <span key={`${user}-${idx}`} className={`chip ${cls}`}>{user}</span>;
  };

  // Generate a PDF report for a project using jsPDF + autoTable
  const downloadProjectPdf = (p) => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 40;
      const marginY = 40;
      const lineGap = 18;
      let y = marginY;

      const c = costByProject.get(p.project) || {};
      const vlist = vendorsByProject.get(p.project) || [];
      const budget = toNumber(p.project_budget);
      const spent = toNumber(c.total_cost);
      const utilization = budget > 0 ? Math.min(100, (spent / budget) * 100).toFixed(1) : '0.0';

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`Project Report — ${p.project || '-'}`, marginX, y);
      y += lineGap;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${p.project_name || '-'}`, marginX, y);
      y += lineGap;
      doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y);
      y += lineGap;

      // Status (title case) and Progress bar
      const statusText = titleCase(p.project_status || '-');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Status: ${statusText}`, marginX, y);
      y += lineGap;
      const progress = toNumber(p.overall_progress || 0);
      const clamped = Math.max(0, Math.min(100, progress));
      const barW = 400;
      const barH = 10;
      const barX = marginX;
      const barY = y;
      // Outline
      doc.setDrawColor(200);
      doc.rect(barX, barY, barW, barH);
      // Fill
      doc.setFillColor(34, 197, 94); // green-ish
      doc.rect(barX, barY, (barW * clamped) / 100, barH, 'F');
      // Percent text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${clamped}%`, barX + barW + 8, barY + barH - 1);
      y += barH + 12;

      // Overview table
      autoTable(doc, {
        startY: y,
        head: [['Field', 'Value']],
        body: [
          ['Project Type', p.project_type || '-'],
          ['Client', p.client_name || '-'],
          ['Location', p.project_location || '-'],
          ['Status', titleCase(p.project_status) || '-'],
          ['Start Date', formatDateDDMMYYYY(p.start_date) || '-'],
          ['End Date', formatDateDDMMYYYY(p.end_date) || '-'],
          ['Project Manager', `${p.project_manager_name || '-'} ${p.project_manager_id ? `(${p.project_manager_id})` : ''}`],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [246, 247, 251], textColor: 20 },
        margin: { left: marginX, right: marginX },
      });
      y = doc.lastAutoTable.finalY + 14;

      // Financials KPI table
      autoTable(doc, {
        startY: y,
        head: [['Budget (Rs.)', 'Spent (Rs.)', 'Utilization %']],
        body: [[budget.toLocaleString('en-IN'), spent.toLocaleString('en-IN'), utilization]],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [246, 247, 251], textColor: 20 },
        margin: { left: marginX, right: marginX },
      });
      y = doc.lastAutoTable.finalY + 10;

      // Cost breakdown
      autoTable(doc, {
        startY: y,
        head: [['Cost Head', 'Amount (Rs.)']],
        body: [
          ['Material', toNumber(c.material_cost).toLocaleString('en-IN')],
          ['Labor', toNumber(c.labor_cost).toLocaleString('en-IN')],
          ['Transport', toNumber(c.transport_cost).toLocaleString('en-IN')],
          ['Safety', toNumber(c.safety_cost).toLocaleString('en-IN')],
          ['Maintenance', toNumber(c.maintenance_cost).toLocaleString('en-IN')],
          ['Other', toNumber(c.other_cost).toLocaleString('en-IN')],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [246, 247, 251], textColor: 20 },
        margin: { left: marginX, right: marginX },
      });
      y = doc.lastAutoTable.finalY + 10;

      // Vendors table (if any)
      if (vlist.length) {
        autoTable(doc, {
          startY: y,
          head: [['Vendor', 'Contact', 'Phone', 'Email', 'Rating', 'Compliance', 'Payment Terms', 'Contract Expiry']],
          body: vlist.map(v => [
            v.vendor_name || '-',
            v.contact_person || '-',
            v.phone_number || '-',
            v.email || '-',
            v.vendor_rating || '-',
            v.compliance_status || '-',
            v.payment_terms || '-',
            formatDateDDMMYYYY(v.contract_expiry_date) || '-',
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [246, 247, 251], textColor: 20 },
          margin: { left: marginX, right: marginX },
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      const safeName = (p.project || 'project').replace(/[^a-z0-9\-_.]+/gi, '_');
      doc.save(`${safeName}_Project_Report-${ts}.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF', e);
    }
  };

  return (
    <div>
      {/* Alerts banner: Material minimal */}
      {(upcomingEmdReturns.length > 0 || missingSecurityDeposits.length > 0) && (
        <Row>
          <Col md={12} xl={12}>
            <Card className="mb-3 soft-card alert-shake" style={{
              background: pastel.bg,
              color: pastel.text,
              border: `1px solid ${pastel.border}`,
              boxShadow: '0 10px 30px rgba(2, 8, 23, 0.06)',
              borderRadius: 12,
              position: 'relative',
            }}>
              <Card.Body>
                {/* Accent bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: pastel.peach, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }} />
                <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>Alerts</div>
                    <span style={{ fontSize: 12, color: pastel.subtext }}>Key items requiring attention</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {upcomingEmdReturns.length > 0 && (
                      <span className="chip" style={{ borderColor: pastel.lavender, color: pastel.lavender, background: 'transparent' }}>EMD: {upcomingEmdReturns.length}</span>
                    )}
                    {missingSecurityDeposits.length > 0 && (
                      <span className="chip" style={{ borderColor: pastel.peach, color: '#d97706', background: 'transparent' }}>Security: {missingSecurityDeposits.length}</span>
                    )}
                  </div>
                </div>
                {upcomingEmdReturns.length > 0 && (
                  <div className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: pastel.subtext, fontWeight: 900 }}>Upcoming EMD (≤10d, not refunded)</span>
                    {upcomingEmdReturns.slice(0, 3).map((r, idx) => (
                      <span
                        key={`emd-${idx}`}
                        title={`Tender ${r.tender_ref_no}`}
                        onClick={() => {
                          const p = projects.find(px => (px.project === r.project));
                          if (p) openDetails(p);
                        }}
                        style={{ background: 'transparent', color: pastel.text, padding: '6px 10px', borderRadius: 9999, fontSize: 12, cursor: 'pointer', border: `1px solid ${pastel.border}` }}
                      >
                        {r.project} • {fmtDate(r.refund_date)}
                      </span>
                    ))}
                    {upcomingEmdReturns.length > 3 && (
                      <span style={{ background: 'transparent', color: pastel.subtext, padding: '6px 10px', borderRadius: 9999, fontSize: 12, border: `1px solid ${pastel.border}` }}>+{upcomingEmdReturns.length - 3} more</span>
                    )}
                  </div>
                )}
                {missingSecurityDeposits.length > 0 && (
                  <div className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: pastel.subtext, fontWeight: 900 }}>Missing Security Money</span>
                    {missingSecurityDeposits.slice(0, 8).map((r, idx) => (
                      <span
                        key={`sec-${idx}`}
                        onClick={() => {
                          const p = projects.find(px => (px.project === r.project));
                          if (p) openDetails(p);
                        }}
                        style={{ background: 'transparent', color: pastel.text, padding: '6px 10px', borderRadius: 9999, fontSize: 12, cursor: 'pointer', border: `1px solid ${pastel.border}` }}
                      >
                        {r.project}
                      </span>
                    ))}
                    {missingSecurityDeposits.length > 8 && (
                      <span style={{ background: 'transparent', color: pastel.subtext, padding: '6px 10px', borderRadius: 9999, fontSize: 12, border: `1px solid ${pastel.border}` }}>+{missingSecurityDeposits.length - 8} more</span>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <Row>
        <Col md={12} xl={12}>
          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col sm={6} md={3} className="mb-3">
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Total Projects</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{totals.totalProjects}</div>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Total Budget</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>₹ {totals.totalBudget.toLocaleString('en-IN')}</div>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Total Spent</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>₹ {totals.totalSpent.toLocaleString('en-IN')}</div>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Utilization</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {totals.totalBudget > 0 ? `${((totals.totalSpent / totals.totalBudget) * 100).toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                </Col>
              </Row>
              {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Project Cards Grid */}
      <Row>
        {projects.map((p) => {
          const code = p.project;
          const name = p.project_name;
          const progress = toNumber(p.overall_progress || 0);
          const budget = toNumber(p.project_budget);
          const spent = toNumber(costByProject.get(code)?.total_cost);
          const users = usersByProject.get(code) || [];
          const vlist = vendorsByProject.get(code) || [];
          const utilization = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
          return (
            <Col md={12} xl={4} key={p.id}>
              <Card className="mb-3 soft-card" style={{ cursor: 'pointer' }} onClick={() => openDetails(p)}>
                <Card.Body>
                  <div className="d-flex align-items-start justify-content-between">
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Project</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{code}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>{name}</div>
                    </div>
                    {renderStatusChip(p.project_status)}
                  </div>
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center" style={{ fontSize: 12, color: '#64748b' }}>
                      <span>Overall Progress</span>
                      {/* <span className="chip chip-sky" style={{ fontSize: 11 }}>{progress}%</span> */}
                      <span style={{ fontSize: 11 }}>{progress}%</span>
                    </div>
                    <ProgressBar now={progress} variant={progress >= 100 ? 'success' : 'info'} style={{ height: 12, borderRadius: 10 }} />
                  </div>
                  <div className="mt-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontWeight: 'bold' }} className="chip chip-lavender">Budget: ₹ {budget.toLocaleString('en-IN')}</span>
                    <span style={{ fontWeight: 'bold' }} className="chip chip-teal">Spent: ₹ {spent.toLocaleString('en-IN')}</span>
                    <span style={{ fontWeight: 'bold' }} className="chip chip-peach">Utilization: {utilization.toFixed(1)}%</span>
                  </div>
                  <div className="mt-3">
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Users</div>
                    {(users.length === 0) ? (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {users.map((u, idx) => renderUserChip(u, idx))}
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Vendors</div>
                    {(vlist.length === 0) ? (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {vlist.slice(0, 3).map((v, idx) => (
                          <span key={`${v.vendor_id}-${idx}`} className="chip chip-gray">{v.vendor_name}</span>
                        ))}
                        {vlist.length > 3 && (
                          <span className="chip chip-sky">+{vlist.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row>
        {/* <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Project Status Distribution</h6>
            </Card.Header>
            <Card.Body>
              <Chart {...statusChart} />
            </Card.Body>
          </Card>
        </Col> */}
        <Col md={12} xl={12}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Budget vs Spent</h6>
            </Card.Header>
            {/* <Card.Body>
              <Chart {...budgetVsSpendChart} /> */}
              <Card.Body style={{ padding: '12px 16px' }}>
              <Chart {...budgetVsSpendChart} height={360} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cost breakdown stacked bar + Profitability */}
      <Row>
        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Cost Breakdown by Project</h6>
            </Card.Header>
            <Card.Body>
              <Chart {...costBreakdownChart} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Profitability (Budget - Cost)</h6>
            </Card.Header>
            <Card.Body>
              <Chart {...profitChart} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Project Overall Progress</h6>
            </Card.Header>
            <Card.Body>
              <Chart {...progressChart} height={320} key={`progress-${progressSeries.join(',')}`} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Milestone Timeline (Gantt)</h6>
                <div className="d-flex align-items-center" style={{ gap: 8 }}>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetGantt}>Reset View</button>
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => setGanttFullOpen(true)}>Full View</button>
                  <select
                    className="form-select form-select-sm"
                    value={selectedProjectForGantt}
                    onChange={(e) => setSelectedProjectForGantt(e.target.value)}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.project}>{p.project} — {p.project_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingMilestones ? (
                <div>Loading milestones…</div>
              ) : ganttMilestones.length === 0 ? (
                <div>No milestones found for {selectedProjectForGantt || 'project'}.</div>
              ) : (
                <Chart {...ganttChart} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Upcoming Deadlines</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Name</th>
                      <th>End Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.upcoming.map((p) => (
                      <tr key={p.id}>
                        <td>{p.project}</td>
                        <td>{p.project_name}</td>
                        <td>{formatDateDDMMYYYY(p.end_date)}</td>
                        <td>{titleCase(p.project_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Per-Project KPIs</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Progress</th>
                      <th>Budget</th>
                      <th>Spent</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiRows.map((r) => (
                      <tr key={r.id}>
                        <td title={r.name}>{r.code}</td>
                        <td>{r.progress}%</td>
                        <td>₹ {r.budget.toLocaleString('en-IN')}</td>
                        <td>₹ {r.spent.toLocaleString('en-IN')}</td>
                        <td>{r.utilization}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AR/AP Summary & Team Allocation */}
      {/* <Row>
        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header><h6 className="mb-0">AR / AP Summary</h6></Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6} className="mb-3">
                  <div style={{ fontSize: 12, color: '#64748b' }}>Accounts Receivable</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>₹ {receivableTotal.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Invoices: {receivables.length}</div>
                </Col>
                <Col sm={6} className="mb-3">
                  <div style={{ fontSize: 12, color: '#64748b' }}>Accounts Payable</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>₹ {payableTotal.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Invoices: {payables.length}</div>
                </Col>
              </Row>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Note: amounts derived best-effort from API fields.</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} xl={6}>
          <Card className="mb-3">
            <Card.Header><h6 className="mb-0">Team Allocation</h6></Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenderProjects.slice(0, 10).map((p) => (
                      <tr key={p.id}>
                        <td>{p.project_id || p.project}</td>
                        <td>{p.status} {p.allocation_state ? `(${p.allocation_state})` : ''}</td>
                        <td>
                          {(p.users || []).length === 0 ? (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {(p.users || []).map((u, idx) => (
                                <span key={idx} className="badge bg-light text-dark" style={{ border: '1px solid #e5e7eb' }}>{u}</span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}

      {/* Project Detail Modal */}
      <Modal show={detailOpen} onHide={closeDetails} size="lg" centered>
        <Modal.Header closeButton>
          <div className="d-flex w-100 justify-content-between align-items-center">
            <Modal.Title className="mb-0">{detailProject?.project} — {detailProject?.project_name}</Modal.Title>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              title="Download project report"
              onClick={() => { if (detailProject) downloadProjectPdf(detailProject); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5V13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10.4a.5.5 0 0 1 1 0V13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V10.4a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 1 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
              </svg>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body>
          {detailProject && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Project Type</div>
                  <div>{detailProject.project_type || '-'}</div>
                </Col>
                <Col md={6}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Client</div>
                  <div>{detailProject.client_name || '-'}</div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Location</div>
                  <div>{detailProject.project_location || '-'}</div>
                </Col>
                <Col md={6}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Start Date</div>
                  <div>{formatDateDDMMYYYY(detailProject.start_date) || '-'}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>End Date</div>
                  <div>{formatDateDDMMYYYY(detailProject.end_date) || '-'}</div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Project Manager</div>
                  <div>{detailProject.project_manager_name} ({detailProject.project_manager_id})</div>
                </Col>
                <Col md={6}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Status</div>
                  {renderStatusChip(detailProject.project_status)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Budget</div>
                  <div style={{ fontWeight: 700 }}>₹ {toNumber(detailProject.project_budget).toLocaleString('en-IN')}</div>
                </Col>
                <Col md={4}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Spent</div>
                  <div style={{ fontWeight: 700 }}>₹ {toNumber(costByProject.get(detailProject.project)?.total_cost).toLocaleString('en-IN')}</div>
                </Col>
                <Col md={4}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Progress</div>
                  <div className="d-flex align-items-center" style={{ gap: 8 }}>
                    <ProgressBar now={toNumber(detailProject.overall_progress || 0)} style={{ flex: 1, height: 8 }} />
                    <span style={{ fontSize: 12 }}>{toNumber(detailProject.overall_progress || 0)}%</span>
                  </div>
                </Col>
              </Row>
              {/* Cost Breakdown for this project */}
              <Row>
                {(() => {
                  const c = costByProject.get(detailProject.project) || {};
                  const rows = [
                    ['Material', c.material_cost],
                    ['Labor', c.labor_cost],
                    ['Transport', c.transport_cost],
                    ['Safety', c.safety_cost],
                    ['Maintenance', c.maintenance_cost],
                    ['Other', c.other_cost],
                  ];
                  return (
                    <Col md={12}>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead><tr><th>Cost Head</th><th>Amount</th></tr></thead>
                          <tbody>
                            {rows.map(([k, v]) => (
                              <tr key={k}>
                                <td>{k}</td>
                                <td>₹ {toNumber(v).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Col>
                  );
                })()}
              </Row>
              {/* Vendors */}
              <Row className="mt-2">
                <Col md={12}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Vendors</div>
                  {(() => {
                    const vlist = vendorsByProject.get(detailProject.project) || [];
                    if (vlist.length === 0) return <span style={{ color: '#94a3b8' }}>—</span>;
                    return (
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Vendor</th>
                              <th>Contact</th>
                              <th>Phone</th>
                              <th>Email</th>
                              <th>Rating</th>
                              <th>Compliance</th>
                              <th>Payment Terms</th>
                              <th>Contract Expiry</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vlist.map((v) => (
                              <tr key={v.id}>
                                <td title={v.vendor_id}>{v.vendor_name}</td>
                                <td>{v.contact_person || '-'}</td>
                                <td>{v.phone_number || '-'}</td>
                                <td>{v.email || '-'}</td>
                                <td>{v.vendor_rating || '-'}</td>
                                <td>{v.compliance_status || '-'}</td>
                                <td>{v.payment_terms || '-'}</td>
                                <td>{formatDateDDMMYYYY(v.contract_expiry_date) || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </Col>
              </Row>
              {/* Users */}
              <Row className="mt-2">
                <Col md={12}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Users</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(usersByProject.get(detailProject.project) || []).map((u, idx) => (
                      <span key={idx} className="badge bg-light text-dark" style={{ border: '1px solid #e5e7eb' }}>{u}</span>
                    ))}
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Gantt Full View Modal */}
      <Modal show={ganttFullOpen} onHide={() => setGanttFullOpen(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Milestone Timeline — {selectedProjectForGantt || ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-end mb-2">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetGanttFull}>Reset View</button>
          </div>
          {loadingMilestones ? (
            <div>Loading milestones…</div>
          ) : ganttMilestones.length === 0 ? (
            <div>No milestones found for {selectedProjectForGantt || 'project'}.</div>
          ) : (
            <Chart {...ganttChartFull} height={520} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
