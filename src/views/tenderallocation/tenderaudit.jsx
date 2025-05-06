import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Typography, 
  Chip, 
  Button,
  Tabs,
  Tab,
  Box,
  Divider,
  IconButton
} from '@mui/material';
import { Download, Eye, Maximize2, Minimize2, ChevronRight } from 'lucide-react';

const AuditTrail = ({ auditTrail }) => {
  const [open, setOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState('previous');
  const [fullScreen, setFullScreen] = useState(false);

  const exportAuditTrailToPDF = () => {
    const doc = new jsPDF();
    const columns = ["Action", "Tender ID", "Changes", "Timestamp", "User Role"];
    
    const rows = auditTrail.map(entry => [
      entry.action,
      entry.tenderId,
      getActionDescription(entry.action, entry.changes?.length || 0),
      entry.timestamp,
      entry.userrole
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      margin: { top: 20 },
      theme: 'striped',
    });

    doc.save("audit-trail-report.pdf");
  };

  const getActionDescription = (action, changeCount) => {
    switch(action) {
      case 'Added': return 'New tender created';
      case 'Updated': return `${changeCount} change${changeCount !== 1 ? 's' : ''}`;
      case 'Deleted': return 'Tender deleted';
      default: return 'Action performed';
    }
  };

  const viewChanges = (entry) => {
    setSelectedEntry(entry);
    setChangesDialogOpen(true);
  };

  const getComparisonData = () => {
    if (!selectedEntry) return [];
    
    if (viewMode === 'previous') {
      // Show only changes from this specific update
      return selectedEntry.changes || [];
    } else {
      // Show cumulative changes from all updates for this tender
      const allChangesMap = new Map();
      
      // Get all entries for this tender, sorted chronologically
      const tenderEntries = auditTrail
        .filter(e => e.tenderId === selectedEntry.tenderId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Build cumulative changes
      tenderEntries.forEach(entry => {
        (entry.changes || []).forEach(change => {
          allChangesMap.set(change.field, {
            field: change.field,
            oldValue: allChangesMap.get(change.field)?.oldValue || change.oldValue,
            newValue: change.newValue,
            timestamp: entry.timestamp
          });
        });
      });
      
      return Array.from(allChangesMap.values());
    }
  };

  return (
    <>
      {/* Main Audit Trail Button */}
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => setOpen(true)}
        startIcon={<Eye size={18} />}
        style={{ 
          marginLeft: '1rem',
          backgroundColor: '#7267ef',
          '&:hover': {
            backgroundColor: '#5d55c7'
          }
        }}
      >
        View Audit Trail
      </Button>

      {/* Main Audit Trail Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="xl"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{ 
          style: { 
            minHeight: fullScreen ? '100vh' : '80vh',
            maxHeight: '100vh'
          } 
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Audit Trail Logs
              <Typography variant="body2" color="textSecondary">
                Total {auditTrail.length} entries
              </Typography>
            </Typography>
            <Box>
              <IconButton 
                onClick={() => setFullScreen(!fullScreen)}
                size="small"
                sx={{ mr: 1 }}
              >
                {fullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </IconButton>
              <Button 
                onClick={exportAuditTrailToPDF}
                startIcon={<Download size={16} />}
                variant="outlined"
                size="small"
              >
                Export
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ overflowY: 'auto', p: 0 }}>
          <Table stickyHeader sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Tender ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Changes</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>User Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditTrail.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">No audit logs available</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                auditTrail.map((entry, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip 
                        label={entry.action} 
                        color={
                          entry.action === 'Added' ? 'success' : 
                          entry.action === 'Updated' ? 'warning' : 'error'
                        } 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{entry.tenderId}</TableCell>
                    <TableCell>
                      {getActionDescription(entry.action, entry.changes?.length || 0)}
                    </TableCell>
                    <TableCell>{entry.timestamp}</TableCell>
                    <TableCell>{entry.userrole}</TableCell>
                    <TableCell>
                      {entry.action === 'Updated' && entry.changes?.length > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Eye size={16} />}
                          onClick={() => viewChanges(entry)}
                          sx={{ textTransform: 'none' }}
                        >
                          Compare Changes
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setOpen(false)}
            variant="contained"
            sx={{ backgroundColor: '#7267ef', '&:hover': { backgroundColor: '#5d55c7' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Changes Comparison Dialog */}
      <Dialog 
        open={changesDialogOpen} 
        onClose={() => setChangesDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        fullScreen
        PaperProps={{ 
          style: { 
            height: '90vh',
            maxHeight: '90vh'
          } 
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Change Comparison: {selectedEntry?.tenderId}
              <Typography variant="body2" color="textSecondary">
                {selectedEntry?.timestamp}
              </Typography>
            </Typography>
            
            <Tabs 
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="This Update" value="previous" sx={{ minWidth: 120 }} />
              <Tab label="All Changes" value="all" sx={{ minWidth: 120 }} />
            </Tabs>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ overflowY: 'auto', p: 3 }}>
          <Box 
            display="grid"
            gridTemplateColumns="1fr 40px 1fr"
            gap={3}
            alignItems="start"
          >
            <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
              Original Value
            </Typography>
            <Box></Box>
            <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
              {viewMode === 'previous' ? 'Updated Value' : 'Current Value'}
            </Typography>

            {getComparisonData().map((change, i) => (
              <React.Fragment key={i}>
                <Box 
                  p={2}
                  borderRadius={1}
                  bgcolor="#f9f9f9"
                  sx={{ wordBreak: 'break-word' }}
                >
                  <Typography color="textSecondary" variant="caption">
                    {change.field}
                  </Typography>
                  <Typography 
                    color="error.main"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {change.oldValue || 'Empty'}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="center" alignItems="center">
                  <ChevronRight color="action" />
                </Box>

                <Box 
                  p={2}
                  borderRadius={1}
                  bgcolor="#f9f9f9"
                  sx={{ wordBreak: 'break-word' }}
                >
                  <Typography color="textSecondary" variant="caption">
                    {change.field}
                  </Typography>
                  <Typography color="success.main">
                    {change.newValue || 'Empty'}
                  </Typography>
                  {viewMode === 'all' && (
                    <Typography variant="caption" color="textSecondary" mt={1}>
                      Updated: {new Date(change.timestamp).toLocaleString()}
                    </Typography>
                  )}
                </Box>

                {i < getComparisonData().length - 1 && (
                  <>
                    <Divider sx={{ gridColumn: '1 / span 3', my: 1 }} />
                  </>
                )}
              </React.Fragment>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setChangesDialogOpen(false)}
            variant="contained"
            sx={{ backgroundColor: '#7267ef', '&:hover': { backgroundColor: '#5d55c7' } }}
          >
            Back to Audit Log
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuditTrail;