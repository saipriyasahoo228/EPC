import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton, CircularProgress, Alert, Tabs, Tab, Paper, Tooltip, Chip
} from '@mui/material';
import { Eye, X, Clock, User, FileText, GitMerge, FilePlus, FileMinus, History } from 'lucide-react';
import { getTenderHistoryDiffs, getTenderHistorySnapshots } from '../../allapi/tenderAllocation';

const AuditTrail = ({ tenderId, triggerVariant = 'button' }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diffs, setDiffs] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [viewMode, setViewMode] = useState('changes'); // 'changes' or 'snapshots'
  const [compareLayout, setCompareLayout] = useState('cards'); // 'cards' | 'matrix' | 'snapshots'

  const handleOpen = () => {
    setOpen(true);
  };

  const renderCompareSnapshotsTable = () => {
    if (!diffs || diffs.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="text.secondary">No versions to compare.</Typography>
        </Box>
      );
    }

    // Build a quick lookup: history_id -> changes map
    const changesByHistory = new Map();
    diffs.forEach(d => changesByHistory.set(d.history_id, d.changes || {}));

    // Collect fields from snapshots (excluding meta) to ensure full table
    const fieldsToExclude = ['history_id', 'history_user', 'history_date', 'history_change_reason', 'history_type'];
    const fieldSet = new Set();
    snapshots.forEach(s => {
      Object.keys(s).forEach(k => {
        if (!fieldsToExclude.includes(k)) fieldSet.add(k);
      });
    });
    const fields = Array.from(fieldSet);

    // Prepare snapshots aligned with diffs order (desc)
    const snapshotsByHistory = new Map(snapshots.map(s => [s.history_id, s]));

    return (
      <Box component={Paper} variant="outlined" sx={{ mt: 2, p: 1, overflowX: 'auto' }}>
        {/* Header Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `240px repeat(${diffs.length}, minmax(200px, 1fr))`, gap: 1, p: 1, borderBottom: '1px solid #eee' }}>
          <Box></Box>
          {diffs.map(d => (
            <Box key={d.history_id} display="flex" alignItems="center" gap={1}>
              {d.history_type === '+' ? <FilePlus size={14} color="#4caf50" /> : d.history_type === '~' ? <GitMerge size={14} color="#ff9800" /> : <FileMinus size={14} color="#f44336" />}
              <Typography variant="caption" color="text.secondary">Version {d.history_id}</Typography>
            </Box>
          ))}
        </Box>

        {/* Field Rows */}
        {fields.map(field => (
          <Box key={field} sx={{ display: 'grid', gridTemplateColumns: `240px repeat(${diffs.length}, minmax(200px, 1fr))`, gap: 1, p: 1, borderBottom: '1px dashed #eee' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{field.replace(/_/g, ' ')}</Typography>
            {diffs.map(d => {
              const s = snapshotsByHistory.get(d.history_id);
              const value = s ? s[field] : undefined;
              const changed = Boolean((changesByHistory.get(d.history_id) || {})[field]);
              return (
                <Box key={d.history_id} sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: changed ? '#f4faff' : 'transparent',
                  border: changed ? '1px solid #90caf9' : '1px solid transparent'
                }}>
                  <Typography variant="body2" color={changed ? 'primary.main' : 'text.secondary'}>
                    {value === null || value === undefined || value === '' ? '—' : String(value)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  const renderCompareMatrix = () => {
    if (!diffs || diffs.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="text.secondary">No versions to compare.</Typography>
        </Box>
      );
    }

    // Prepare field set
    const fieldSet = new Set();
    diffs.forEach(d => Object.keys(d.changes || {}).forEach(k => fieldSet.add(k)));
    const fields = Array.from(fieldSet);

    return (
      <Box component={Paper} variant="outlined" sx={{ mt: 2, p: 1, overflowX: 'auto' }}>
        {/* Header Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `240px repeat(${diffs.length}, minmax(180px, 1fr))`, gap: 1, p: 1, borderBottom: '1px solid #eee' }}>
          <Box></Box>
          {diffs.map((d, i) => (
            <Box key={d.history_id} display="flex" alignItems="center" gap={1}>
              {d.history_type === '+' ? <FilePlus size={14} color="#4caf50" /> : d.history_type === '~' ? <GitMerge size={14} color="#ff9800" /> : <FileMinus size={14} color="#f44336" />}
              <Typography variant="caption" color="text.secondary">Version {d.history_id}</Typography>
            </Box>
          ))}
        </Box>

        {/* Field Rows */}
        {fields.map(field => (
          <Box key={field} sx={{ display: 'grid', gridTemplateColumns: `240px repeat(${diffs.length}, minmax(180px, 1fr))`, gap: 1, p: 1, borderBottom: '1px dashed #eee' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{field.replace(/_/g, ' ')}</Typography>
            {diffs.map((d, idx) => {
              const delta = (d.changes || {})[field];
              if (!delta) {
                return (
                  <Typography key={idx} variant="body2" color="text.secondary">—</Typography>
                );
              }
              return (
                <Box key={idx}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" sx={{ textDecoration: 'line-through' }} color="error.main">{String(delta.old)}</Typography>
                    <Typography variant="body2">→</Typography>
                    <Typography variant="body2" color="success.main">{String(delta.new)}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{new Date(d.history_date).toLocaleString()}</Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  const renderCompare = () => {
    if (!diffs || diffs.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="text.secondary">No versions to compare.</Typography>
        </Box>
      );
    }

    // diffs are already sorted by date desc in effect => index 0 is latest
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2, mt: 2 }}>
        {diffs.map((item, idx) => {
          const changeEntries = Object.entries(item.changes || {});
          return (
            <Paper key={item.history_id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1.25}>
                  {item.history_type === '+' ? <FilePlus size={16} color="#4caf50" /> : item.history_type === '~' ? <GitMerge size={16} color="#ff9800" /> : <FileMinus size={16} color="#f44336" />}
                  <Typography variant="subtitle2" fontWeight="bold">Version {item.history_id}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{new Date(item.history_date).toLocaleString()}</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                <User size={14} />
                <Typography variant="caption">{item.history_user?.full_name} ({item.history_user?.user_id})</Typography>
              </Box>

              {changeEntries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No changes in this version.</Typography>
              ) : (
                <Box sx={{ mt: 1 }}>
                  {changeEntries.map(([field, val]) => (
                    <Box key={field} sx={{ py: 0.75, borderBottom: '1px dashed #eee' }}>
                      <Typography variant="overline" sx={{ textTransform: 'capitalize' }} color="text.secondary">{field.replace(/_/g, ' ')}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ textDecoration: 'line-through' }} color="error.main">{String(val?.old)}</Typography>
                        <Typography variant="body2">→</Typography>
                        <Typography variant="body2" color="success.main">{String(val?.new)}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
    );
  };

  const handleClose = () => {
    setOpen(false);
    // Reset states
    setDiffs([]);
    setSnapshots([]);
    setSelectedHistory(null);
    setError(null);
  };

  // Fetch when dialog is open and tenderId is available
  useEffect(() => {
    const fetchHistory = async () => {
      if (!open || !tenderId) return;
      setLoading(true);
      setError(null);
      try {
        console.log('[AuditTrail] Fetching diffs & snapshots for tenderId:', tenderId);
        const [diffsData, snapshotsData] = await Promise.all([
          getTenderHistoryDiffs(tenderId),
          getTenderHistorySnapshots(tenderId)
        ]);
        console.log('[AuditTrail] Diffs:', diffsData);
        console.log('[AuditTrail] Snapshots:', snapshotsData);

        const sortedDiffs = (diffsData || []).sort((a, b) => new Date(b.history_date) - new Date(a.history_date));
        setDiffs(sortedDiffs);
        setSnapshots(snapshotsData || []);
        setSelectedHistory(sortedDiffs[0] || null);
      } catch (err) {
        console.error('[AuditTrail] Fetch error:', err);
        setError('Failed to fetch audit trail. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [open, tenderId]);

  const getHistoryIcon = (type) => {
    switch (type) {
      case '+': return <FilePlus size={18} color="#4caf50" />;
      case '~': return <GitMerge size={18} color="#ff9800" />;
      case '-': return <FileMinus size={18} color="#f44336" />;
      default: return <FileText size={18} />;
    }
  };

  const renderChanges = (changes) => {
    const changeKeys = Object.keys(changes);
    if (changeKeys.length === 0) {
      return <Typography variant="body2" color="text.secondary">No changes in this version.</Typography>;
    }
    return (
      <Box component={Paper} variant="outlined" p={2} mt={2} sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
        {changeKeys.map(key => (
          <Box key={key} mb={2}>
            <Typography variant="overline" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              <Typography variant="body2" color="error.main" sx={{ textDecoration: 'line-through', mr: 1 }}>{String(changes[key].old)}</Typography>
              <Typography variant="body2" sx={{ mx: 1 }}>→</Typography>
              <Typography variant="body2" color="success.main">{String(changes[key].new)}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderSnapshot = () => {
    if (!selectedHistory) return null;
    const snapshot = snapshots.find(s => s.history_id === selectedHistory.history_id);
    if (!snapshot) return <Typography>Snapshot not available.</Typography>;

    const fieldsToExclude = ['history_id', 'history_user', 'history_date', 'history_change_reason', 'history_type'];
    const changedKeys = new Set(Object.keys(selectedHistory?.changes || {}));

    return (
      <Box component={Paper} variant="outlined" p={2} mt={2} sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
        {Object.entries(snapshot).map(([key, value]) => {
          if (fieldsToExclude.includes(key)) return null;
          const isChanged = changedKeys.has(key);
          return (
            <Box
              key={key}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={1}
              borderBottom="1px solid #eee"
              sx={{
                backgroundColor: isChanged ? '#fff8e1' : 'transparent',
                borderLeft: isChanged ? '3px solid #ffb300' : '3px solid transparent',
                pl: 1
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Typography>
                {isChanged && (
                  <Chip label="Changed" size="small" color="warning" variant="outlined" sx={{ height: 20 }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">{String(value)}</Typography>
            </Box>
          )
        })}
      </Box>
    );
  };

  return (
    <>
      {triggerVariant === 'icon' ? (
        <Tooltip title="View Audit Trail">
          <IconButton onClick={handleOpen} size="small" sx={{ color: '#6c5ffc' }}>
            <History size={18} />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<Eye size={18} />}
          sx={{ 
            ml: '1rem',
            backgroundColor: '#6c5ffc',
            '&:hover': { backgroundColor: '#5b4fde' }
          }}
        >
          View Audit Trail
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Tender Audit Trail</Typography>
            <IconButton onClick={handleClose} size="small"><X /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
          {loading ? (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>
          ) : error ? (
            <Box flex={1} p={3}><Alert severity="error">{error}</Alert></Box>
          ) : !tenderId ? (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              <Typography color="text.secondary">Please provide a valid tenderId to view audit history.</Typography>
            </Box>
          ) : diffs.length === 0 ? (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              <Typography color="text.secondary">No audit history found for this tender.</Typography>
            </Box>
          ) : (
            <>
              {/* Left Panel: Timeline */}
              <Box sx={{ width: '350px', borderRight: '1px solid #eee', overflowY: 'auto', p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>History</Typography>
                {diffs.map(item => (
                  <Box 
                    key={item.history_id} 
                    onClick={() => setSelectedHistory(item)}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: `1px solid ${selectedHistory?.history_id === item.history_id ? '#6c5ffc' : 'transparent'}`,
                      backgroundColor: selectedHistory?.history_id === item.history_id ? '#f4f2ff' : 'transparent',
                      '&:hover': { backgroundColor: '#f9f8ff' }
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Tooltip title={item.history_type === '+' ? 'Created' : item.history_type === '~' ? 'Updated' : 'Deleted'}>
                        <Box mr={1.5}>{getHistoryIcon(item.history_type)}</Box>
                      </Tooltip>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{item.history_user.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.history_date).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Right Panel: Details */}
              <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
                {selectedHistory ? (
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h5" fontWeight="bold">Version {selectedHistory.history_id}</Typography>
                        <Box display="flex" alignItems="center" color="text.secondary" mt={1}>
                          <User size={16} />
                          <Typography variant="body2" ml={1}>{selectedHistory.history_user.full_name} ({selectedHistory.history_user.user_id})</Typography>
                          <Clock size={16} style={{ marginLeft: '16px' }} />
                          <Typography variant="body2" ml={1}>{new Date(selectedHistory.history_date).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                      <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
                        <Tab label="Changes" value="changes" />
                        <Tab label="Snapshot" value="snapshots" />
                        <Tab label="Compare" value="compare" />
                      </Tabs>
                    </Box>
                    
                    {viewMode === 'changes' ? (
                      renderChanges(selectedHistory.changes)
                    ) : viewMode === 'snapshots' ? (
                      renderSnapshot()
                    ) : (
                      <>
                        <Box display="flex" justifyContent="flex-end">
                          <Tabs value={compareLayout} onChange={(e, v) => setCompareLayout(v)} size="small">
                            <Tab label="Cards" value="cards" />
                            <Tab label="Matrix (Changes)" value="matrix" />
                            <Tab label="Snapshots Table" value="snapshots" />
                          </Tabs>
                        </Box>
                        {compareLayout === 'cards' ? renderCompare() : compareLayout === 'matrix' ? renderCompareMatrix() : renderCompareSnapshotsTable()}
                      </>
                    )}
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography color="text.secondary">Select a version from the history to view details.</Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eee', p: 2 }}>
          <Button onClick={handleClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuditTrail;
