// import React, { useState, useEffect, useRef } from "react";
// import { Pencil, Trash, Download } from "lucide-react";
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, Typography, Badge, Chip } from '@mui/material';

// const TenderDetailsEntry = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [tenders, setTenders] = useState([]);
//   const [auditTrail, setAuditTrail] = useState([]);
//   const [showAuditTrail, setShowAuditTrail] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editTenderId, setEditTenderId] = useState(null);
//   const [rowsPerPage, setRowsPerPage] = useState(3);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [formData, setFormData] = useState({
//     refNo: '',
//     location: '',
//     releaseDate: '',
//     tenderValue: '',
//     emdAmount: '',
//     emdValidity: '',
//     emdConditions: '',
//     authority: '',
//     contact: '',
//     personnel: '',
//     startDate: '',
//     endDate: '',
//     description: '',
//     status: ''
//   });

//   const inputRefs = useRef([]);

//   // Styles
//   const tableHeaderStyle = {
//     padding: '10px',
//     border: '1px solid #ddd',
//     whiteSpace: 'nowrap',
//     color: '#7267ef',
//   };

//   const paginationBtnStyle = {
//     padding: '6px 12px',
//     margin: '0 4px',
//     backgroundColor: '#7267ef',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontWeight: '500',
//   };
  
//   const tableCellStyle = {
//     padding: '10px',
//     border: '1px solid #ddd',
//     verticalAlign: 'top',
//     whiteSpace: 'nowrap'
//   };

//   const actionBtnStyleBlue = {
//     backgroundColor: 'transparent',
//     border: 'none',
//     color: '#7267ef',
//     cursor: 'pointer',
//     padding: '8px',
//   };

//   const actionBtnStyleRed = {
//     backgroundColor: 'transparent',
//     border: 'none',
//     color: '#e74c3c',
//     cursor: 'pointer',
//     padding: '8px',
//   };

//   // Helper functions
//   const getActionDescription = (action, changeCount) => {
//     switch(action) {
//       case 'Added': return 'New tender created';
//       case 'Updated': return `${changeCount} field${changeCount !== 1 ? 's' : ''} updated`;
//       case 'Deleted': return 'Tender deleted';
//       default: return 'Action performed';
//     }
//   };

//   // Enhanced audit trail logging
//   const logAuditTrail = (action, tenderId, oldData = {}, newData = {}) => {
//     const timestamp = new Date().toLocaleString();
    
//     let changes = [];
//     if (action === 'Updated') {
//       changes = Object.keys(newData)
//         .filter(key => key !== 'id')
//         .map(key => ({
//           field: key,
//           oldValue: oldData[key] || 'empty',
//           newValue: newData[key] || 'empty',
//           changed: oldData[key] !== newData[key]
//         }))
//         .filter(change => change.changed);
//     }

//     const entry = { 
//       action, 
//       tenderId, 
//       timestamp,
//       changes,
//       oldData: action === 'Deleted' ? oldData : null,
//       newData: action === 'Added' ? newData : null,
//       actionDescription: getActionDescription(action, changes.length)
//     };
    
//     setAuditTrail(prev => [entry, ...prev]);
//   };

//   // Form handlers
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = () => {
//     setLoading(true);
  
//     setTimeout(() => {
//       if (isEditing) {
//         const updatedTender = { ...formData, id: editTenderId };
//         const oldTender = tenders.find(t => t.id === editTenderId);
//         const updatedList = tenders.map(t => t.id === editTenderId ? updatedTender : t);
//         setTenders(updatedList);
//         logAuditTrail('Updated', editTenderId, oldTender, updatedTender);
//       } else {
//         const currentYear = new Date().getFullYear();
//         const tenderId = `${currentYear}-TND-${tenders.length + 1}`;
//         const newTender = { ...formData, id: tenderId };
//         setTenders([...tenders, newTender]);
//         logAuditTrail('Added', tenderId, {}, newTender);
//       }
  
//       setFormData({
//         refNo: '', location: '', releaseDate: '', tenderValue: '',
//         emdAmount: '', emdValidity: '', emdConditions: '',
//         authority: '', contact: '', personnel: '',
//         startDate: '', endDate: '', description: '', status: ''
//       });
//       setIsEditing(false);
//       setEditTenderId(null);
//       setShowModal(false);
//       setLoading(false);
//     }, 1000);
//   };

//   const handleEdit = (id) => {
//     const tenderToEdit = tenders.find(t => t.id === id);
//     if (tenderToEdit) {
//       setFormData({ ...tenderToEdit });
//       setIsEditing(true);
//       setEditTenderId(id);
//       setShowModal(true);
//     }
//   };

//   const handleDelete = (id) => {
//     const deletedTender = tenders.find(t => t.id === id);
//     setTenders(tenders.filter(tender => tender.id !== id));
//     logAuditTrail('Deleted', id, deletedTender, {});
//   };

//   // PDF Export functions
//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     const columns = [
//       "Tender ID", "Ref No", "Location", "Release Date", 
//       "Value", "EMD Amount", "EMD Validity", "EMD Conditions", 
//       "Authority", "Contact", "Authorized Personnel", 
//       "Start Date", "End Date", "Description", "Status"
//     ];
  
//     const rows = currentTenders.map(tender => [
//       tender.id,
//       tender.refNo,
//       tender.location,
//       tender.releaseDate,
//       tender.tenderValue,
//       tender.emdAmount,
//       tender.emdValidity,
//       tender.emdConditions,
//       tender.authority,
//       tender.contact,
//       tender.personnel,
//       tender.startDate,
//       tender.endDate,
//       tender.description,
//       tender.status
//     ]);
  
//     doc.autoTable({
//       head: [columns],
//       body: rows,
//       margin: { top: 20 },
//       theme: 'striped',
//     });
  
//     doc.save("tender-report.pdf");
//   };

//   const exportAuditTrailToPDF = () => {
//     const doc = new jsPDF();
//     doc.text('Audit Trail Report', 10, 10);
    
//     const headers = ['Action', 'Tender ID', 'Changes', 'Timestamp'];
//     const body = auditTrail.map(entry => [
//       entry.action,
//       entry.tenderId,
//       entry.action === 'Updated' 
//         ? entry.changes.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('\n')
//         : entry.actionDescription,
//       entry.timestamp
//     ]);

//     doc.autoTable({
//       head: [headers],
//       body: body,
//       startY: 20,
//       styles: { fontSize: 8, cellPadding: 2 },
//       columnStyles: { 2: { cellWidth: 80 } }
//     });

//     doc.save('audit-trail-report.pdf');
//   };

//   // Pagination logic
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const currentTenders = tenders.slice(startIndex, startIndex + rowsPerPage);
//   const totalPages = Math.ceil(tenders.length / rowsPerPage);

//   // Render functions
//   const renderAuditTrailDialog = () => (
//     <Dialog open={showAuditTrail} onClose={() => setShowAuditTrail(false)} maxWidth="md" fullWidth>
//       <DialogTitle>
//         Audit Trail
//         <Typography variant="subtitle1" color="textSecondary">
//           Total {auditTrail.length} entries
//         </Typography>
//       </DialogTitle>
//       <DialogContent dividers style={{ maxHeight: '70vh', overflowY: 'auto' }}>
//         {auditTrail.length === 0 ? (
//           <Typography>No audit logs available.</Typography>
//         ) : (
//           <Table size="small" stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell><strong>Action</strong></TableCell>
//                 <TableCell><strong>Tender ID</strong></TableCell>
//                 <TableCell><strong>Details</strong></TableCell>
//                 <TableCell><strong>Timestamp</strong></TableCell>
//                 <TableCell><strong>User Role</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {auditTrail.map((entry, index) => (
//                 <TableRow key={index}>
//                   <TableCell>
//                     <Chip 
//                       label={entry.action} 
//                       color={
//                         entry.action === 'Added' ? 'success' : 
//                         entry.action === 'Updated' ? 'warning' : 'error'
//                       } 
//                     />
//                     <Typography variant="caption" display="block">
//                       {entry.actionDescription}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>{entry.tenderId}</TableCell>
//                   <TableCell>
//                     {entry.action === 'Updated' && entry.changes.length > 0 ? (
//                       <div style={{ maxWidth: '300px' }}>
//                         {entry.changes.map((change, i) => (
//                           <div key={i} style={{ marginBottom: '8px' }}>
//                             <Typography variant="subtitle2">
//                               <strong>{change.field}:</strong>
//                             </Typography>
//                             <div style={{ display: 'flex', alignItems: 'center' }}>
//                               <Typography 
//                                 variant="body2" 
//                                 style={{ 
//                                   color: 'red', 
//                                   textDecoration: 'line-through',
//                                   marginRight: '8px'
//                                 }}
//                               >
//                                 {change.oldValue}
//                               </Typography>
//                               <span>→</span>
//                               <Typography 
//                                 variant="body2" 
//                                 style={{ 
//                                   color: 'green',
//                                   marginLeft: '8px'
//                                 }}
//                               >
//                                 {change.newValue}
//                               </Typography>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : entry.action === 'Added' ? (
//                       <Typography variant="body2" color="textSecondary">
//                         New record with all initial values
//                       </Typography>
//                     ) : entry.action === 'Deleted' ? (
//                       <Typography variant="body2" color="textSecondary">
//                         Record permanently removed
//                       </Typography>
//                     ) : null}
//                   </TableCell>
//                   <TableCell>{entry.timestamp}</TableCell>
//                   <TableCell>{entry.userrole}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={() => setShowAuditTrail(false)} color="primary">Close</Button>
//         {auditTrail.length > 0 && (
//           <Button 
//             onClick={exportAuditTrailToPDF}
//             color="secondary"
//             startIcon={<Download size={16} />}
//           >
//             Export PDF
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );

//   return (
//     <div style={{ padding: '2rem', minHeight: '100vh' }}>
//       <button 
//         onClick={() => setShowModal(true)} 
//         style={{ 
//           backgroundColor: '#7267ef', 
//           color: '#fff', 
//           padding: '0.75rem 1.5rem', 
//           borderRadius: '0.5rem', 
//           border: 'none', 
//           cursor: 'pointer' 
//         }}
//       >
//         Add Tender Details
//       </button>

//       <Badge 
//         badgeContent={auditTrail.length} 
//         color="primary" 
//         overlap="circular"
//         style={{ marginLeft: '1rem' }}
//       >
//         <Button 
//           variant="outlined" 
//           color="primary" 
//           onClick={() => setShowAuditTrail(true)}
//           style={{ position: 'relative' }}
//         >
//           View Audit Trail
//         </Button>
//       </Badge>

//       {showModal && (
//         <div style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             zIndex: 2000,
//             width: '100%',
//             height: '100%',
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'flex-start',
//             paddingTop: '1rem',
//             overflowY: 'auto'
//           }}>
//             <div style={{
//               backgroundColor: '#fff',
//               padding: '1rem',
//               width: '95%',
//               maxWidth: '700px',
//               maxHeight: '90vh',
//               overflowY: 'auto',
//               border: '3px solid #E6E6FA',
//               position: 'relative'
//             }}>
//               <button
//                 onClick={() => setShowModal(false)}
//                 style={{
//                   position: 'absolute',
//                   top: '1rem',
//                   right: '1rem',
//                   background: 'transparent',
//                   border: 'none',
//                   fontSize: '1.25rem',
//                   fontWeight: 'bold',
//                   cursor: 'pointer'
//                 }}
//                 aria-label="Close Modal"
//               >
//                 &times;
//               </button>
          
//               <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
//                 {isEditing ? 'Edit Tender' : 'Add Tender'}
//               </h2>
          
//               {loading ? (
//                 <div>Generating Tender ID...</div>
//               ) : (
//                 <>
//                   <label>Tender Ref. No.</label>
//                   <input 
//                     ref={(el) => inputRefs.current[0] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[1]?.focus()}
//                     name="refNo" 
//                     value={formData.refNo} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>Location</label>
//                   <input 
//                     ref={(el) => inputRefs.current[1] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[2]?.focus()}
//                     name="location" 
//                     value={formData.location} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>Release Date</label>
//                   <input 
//                     type="date" 
//                     ref={(el) => inputRefs.current[2] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[3]?.focus()}
//                     name="releaseDate" 
//                     value={formData.releaseDate} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>Tender Value</label>
//                   <input 
//                     type="number" 
//                     ref={(el) => (inputRefs.current[3] = el)}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[4]?.focus()}
//                     name="tenderValue" 
//                     value={formData.tenderValue} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <h2>EMD / Bank Guarantee Details</h2>
//                   <label>Amount</label>
//                   <input 
//                     ref={(el) => inputRefs.current[5] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[6]?.focus()}
//                     type="number" 
//                     name="emdAmount" 
//                     value={formData.emdAmount} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />

//                   <label>Validity Period</label>
//                   <input 
//                     ref={(el) => inputRefs.current[6] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[7]?.focus()}
//                     type="date" 
//                     name="emdValidity" 
//                     value={formData.emdValidity} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
                  
//                   <label>Conditions</label>
//                   <textarea 
//                     ref={(el) => inputRefs.current[7] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[8]?.focus()}
//                     name="emdConditions" 
//                     value={formData.emdConditions} 
//                     onChange={handleChange} 
//                     className="input"
//                   ></textarea>
          
//                   <label>Authority</label>
//                   <input 
//                     ref={(el) => inputRefs.current[8] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[9]?.focus()}
//                     name="authority" 
//                     value={formData.authority} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>Contact</label>
//                   <textarea 
//                     ref={(el) => inputRefs.current[9] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[10]?.focus()}
//                     name="contact" 
//                     value={formData.contact} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>Authorized Personnel</label>
//                   <input
//                     ref={(el) => inputRefs.current[10] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[11]?.focus()} 
//                     name="personnel" 
//                     value={formData.personnel} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>Start Date</label>
//                   <input 
//                     ref={(el) => inputRefs.current[11] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[12]?.focus()}
//                     type="date" 
//                     name="startDate" 
//                     value={formData.startDate} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>End Date</label>
//                   <input 
//                     ref={(el) => inputRefs.current[12] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[13]?.focus()}
//                     type="date" 
//                     name="endDate" 
//                     value={formData.endDate} 
//                     onChange={handleChange} 
//                     className="input" 
//                   />
          
//                   <label>Tender Description</label>
//                   <textarea 
//                     ref={(el) => inputRefs.current[13] = el}
//                     onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[14]?.focus()}
//                     name="description" 
//                     value={formData.description} 
//                     onChange={handleChange} 
//                     className="input" 
//                     rows={4}
//                   ></textarea>
          
//                   <label>Status</label>
//                   <select 
//                     ref={(el) => inputRefs.current[14] = el}
//                     name="status" 
//                     value={formData.status} 
//                     onChange={handleChange} 
//                     className="input"
//                   >
//                     <option value="">Select status</option>
//                     <option value="Open">Open</option>
//                     <option value="Closed">Closed</option>
//                     <option value="Under Review">Under Review</option>
//                   </select>
          
//                   <button
//                     onClick={handleSubmit}
//                     style={{
//                       backgroundColor: '#7267ef',
//                       color: '#fff',
//                       padding: '0.5rem 1rem',
//                       marginTop: '1rem',
//                       borderRadius: '0.5rem',
//                       border: 'none'
//                     }}
//                   >
//                     {isEditing ? 'Update' : 'Save'}
//                   </button>

//                   <button
//                     onClick={() => setShowModal(false)}
//                     style={{
//                       marginLeft: '1rem',
//                       backgroundColor:'#dc3545',
//                       padding: '0.5rem 1rem',
//                       borderRadius: '0.5rem',
//                       border: '1px solid #aaa'
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//       )}

//       {renderAuditTrailDialog()}

//       <div style={{
//         border: '1px solid #ddd',
//         borderRadius: '0.5rem',
//         boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
//         padding: '1rem',
//         marginTop:'1rem',
//       }}>
//         <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#7267ef', margin: '0' }}>
//             TENDER REPORT
//           </h3>

//           <button
//             onClick={downloadPDF}
//             style={{
//               backgroundColor: '#dc3545',
//               color: '#fff',
//               padding: '0.75rem 1.25rem',
//               borderRadius: '0.5rem',
//               border: 'none',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//             }}
//           >
//             <Download size={20} style={{ marginRight: '0.5rem' }} />
//             Download as PDF
//           </button>
//         </div>

//         <div style={{ marginBottom: '1rem' }}>
//           <label style={{ fontWeight: '500' }}>Rows per page: </label>
//           <select
//             onChange={(e) => setRowsPerPage(Number(e.target.value))}
//             value={rowsPerPage}
//             style={{
//               padding: '0.5rem',
//               fontSize: '1rem',
//               borderRadius: '0.375rem',
//               border: '1px solid #ccc',
//               outline: 'none',
//               backgroundColor: '#fff'
//             }}
//           >
//             <option value={3}>3</option>
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={15}>15</option>
//           </select>
//         </div>

//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
//             <thead>
//               <tr style={{ backgroundColor: '#f8f9fa' }}>
//                 <th style={tableHeaderStyle}>Tender ID</th>
//                 <th style={tableHeaderStyle}>Ref No</th>
//                 <th style={tableHeaderStyle}>Location</th>
//                 <th style={tableHeaderStyle}>Release Date</th>
//                 <th style={tableHeaderStyle}>Value</th>
//                 <th style={tableHeaderStyle}>EMD Amount</th>
//                 <th style={tableHeaderStyle}>EMD Validity</th>
//                 <th style={tableHeaderStyle}>EMD Conditions</th>
//                 <th style={tableHeaderStyle}>Authority</th>
//                 <th style={tableHeaderStyle}>Contact</th>
//                 <th style={tableHeaderStyle}>Authorized Personnel</th>
//                 <th style={tableHeaderStyle}>Start Date</th>
//                 <th style={tableHeaderStyle}>End Date</th>
//                 <th style={tableHeaderStyle}>Description</th>
//                 <th style={tableHeaderStyle}>Status</th>
//                 <th style={tableHeaderStyle}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentTenders.map(t => (
//                 <tr key={t.id} style={{ backgroundColor: '#fff' }}>
//                   <td style={tableCellStyle}>{t.id}</td>
//                   <td style={tableCellStyle}>{t.refNo}</td>
//                   <td style={tableCellStyle}>{t.location}</td>
//                   <td style={tableCellStyle}>{t.releaseDate}</td>
//                   <td style={tableCellStyle}>{t.tenderValue}</td>
//                   <td style={tableCellStyle}>{t.emdAmount}</td>
//                   <td style={tableCellStyle}>{t.emdValidity}</td>
//                   <td style={tableCellStyle}>{t.emdConditions}</td>
//                   <td style={tableCellStyle}>{t.authority}</td>
//                   <td style={tableCellStyle}>{t.contact}</td>
//                   <td style={tableCellStyle}>{t.personnel}</td>
//                   <td style={tableCellStyle}>{t.startDate}</td>
//                   <td style={tableCellStyle}>{t.endDate}</td>
//                   <td style={tableCellStyle}>{t.description}</td>
//                   <td style={tableCellStyle}>{t.status}</td>
//                   <td style={tableCellStyle}>
//                     <button
//                       onClick={() => handleEdit(t.id)}
//                       style={actionBtnStyleBlue}
//                     >
//                       <Pencil size={18} color="#7267ef"/>
//                     </button>
//                     <button
//                       onClick={() => {
//                         if (window.confirm("Are you sure you want to delete this item?")) {
//                           handleDelete(t.id);
//                         }
//                       }}
//                       style={actionBtnStyleRed}
//                     >
//                       <Trash size={18} color="#800000" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <button
//             onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
//             style={paginationBtnStyle}
//             disabled={currentPage === 1}
//           >
//             Previous
//           </button>
//           <span style={{ fontSize: '1rem' }}>Page {currentPage} of {totalPages}</span>
//           <button
//             onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
//             style={paginationBtnStyle}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TenderDetailsEntry;





















import React, { useState, useRef } from "react";
import { Pencil, Trash, Download } from "lucide-react";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Button, Badge } from '@mui/material';
import AuditTrail from './tenderaudit';

const TenderDetailsEntry = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenders, setTenders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTenderId, setEditTenderId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [auditTrail, setAuditTrail] = useState([]);
  const [formData, setFormData] = useState({
    refNo: '',
    location: '',
    releaseDate: '',
    tenderValue: '',
    emdAmount: '',
    emdValidity: '',
    emdConditions: '',
    authority: '',
    contact: '',
    personnel: '',
    startDate: '',
    endDate: '',
    description: '',
    status: ''
  });

  const inputRefs = useRef([]);

  // Styles
  const tableHeaderStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    whiteSpace: 'nowrap',
    color: '#7267ef',
  };

  const paginationBtnStyle = {
    padding: '6px 12px',
    margin: '0 4px',
    backgroundColor: '#7267ef',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  };
  
  const tableCellStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    verticalAlign: 'top',
    whiteSpace: 'nowrap'
  };

  const actionBtnStyleBlue = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#7267ef',
    cursor: 'pointer',
    padding: '8px',
  };

  const actionBtnStyleRed = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#e74c3c',
    cursor: 'pointer',
    padding: '8px',
  };

  // Audit Trail Functions
  const logAuditTrail = (action, tenderId, oldData = {}, newData = {}) => {
    const timestamp = new Date().toLocaleString();
    const userrole = "Admin"; // Replace with actual user role
    
    let changes = [];
    let actionDescription = '';
    
    if (action === 'Updated') {
      changes = Object.keys(newData)
        .filter(key => oldData[key] !== newData[key])
        .map(key => ({
          field: key,
          oldValue: oldData[key] || 'N/A',
          newValue: newData[key] || 'N/A'
        }));
      
      actionDescription = `${changes.length} field${changes.length !== 1 ? 's' : ''} updated`;
    } else if (action === 'Added') {
      actionDescription = 'New tender created';
    } else if (action === 'Deleted') {
      actionDescription = 'Tender deleted';
    }

    const newEntry = {
      action,
      tenderId,
      changes,
      actionDescription,
      timestamp,
      userrole
    };

    setAuditTrail(prev => [newEntry, ...prev]);
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    setLoading(true);
  
    setTimeout(() => {
      if (isEditing) {
        const updatedTender = { ...formData, id: editTenderId };
        const oldTender = tenders.find(t => t.id === editTenderId);
        const updatedList = tenders.map(t => t.id === editTenderId ? updatedTender : t);
        setTenders(updatedList);
        logAuditTrail('Updated', editTenderId, oldTender, updatedTender);
      } else {
        const currentYear = new Date().getFullYear();
        const tenderId = `${currentYear}-TND-${tenders.length + 1}`;
        const newTender = { ...formData, id: tenderId };
        setTenders([...tenders, newTender]);
        logAuditTrail('Added', tenderId, {}, newTender);
      }
  
      setFormData({
        refNo: '', location: '', releaseDate: '', tenderValue: '',
        emdAmount: '', emdValidity: '', emdConditions: '',
        authority: '', contact: '', personnel: '',
        startDate: '', endDate: '', description: '', status: ''
      });
      setIsEditing(false);
      setEditTenderId(null);
      setShowModal(false);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (id) => {
    const tenderToEdit = tenders.find(t => t.id === id);
    if (tenderToEdit) {
      setFormData({ ...tenderToEdit });
      setIsEditing(true);
      setEditTenderId(id);
      setShowModal(true);
    }
  };

  const handleDelete = (id) => {
    const deletedTender = tenders.find(t => t.id === id);
    setTenders(tenders.filter(tender => tender.id !== id));
    logAuditTrail('Deleted', id, deletedTender, {});
  };

  // PDF Export functions
  const downloadPDF = () => {
    const doc = new jsPDF();
    const columns = [
      "Tender ID", "Ref No", "Location", "Release Date", 
      "Value", "EMD Amount", "EMD Validity", "EMD Conditions", 
      "Authority", "Contact", "Authorized Personnel", 
      "Start Date", "End Date", "Description", "Status"
    ];
  
    const rows = currentTenders.map(tender => [
      tender.id,
      tender.refNo,
      tender.location,
      tender.releaseDate,
      tender.tenderValue,
      tender.emdAmount,
      tender.emdValidity,
      tender.emdConditions,
      tender.authority,
      tender.contact,
      tender.personnel,
      tender.startDate,
      tender.endDate,
      tender.description,
      tender.status
    ]);
  
    doc.autoTable({
      head: [columns],
      body: rows,
      margin: { top: 20 },
      theme: 'striped',
    });
  
    doc.save("tender-report.pdf");
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTenders = tenders.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(tenders.length / rowsPerPage);


  const filteredTenders = tenders.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );


  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ 
            backgroundColor: '#7267ef', 
            color: '#fff', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.5rem', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Add Tender Details
        </button>

        <Badge 
          badgeContent={auditTrail.length} 
          color="primary" 
          overlap="circular"
          style={{ marginLeft: '1rem' }}
        >
          <AuditTrail auditTrail={auditTrail} />
        </Badge>
      </div>

      {showModal && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2000,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '1rem',
            overflowY: 'auto'
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '1rem',
              width: '95%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '3px solid #E6E6FA',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                aria-label="Close Modal"
              >
                &times;
              </button>
          
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {isEditing ? 'Edit Tender' : 'Add Tender'}
              </h2>
          
              {loading ? (
                <div>Generating Tender ID...</div>
              ) : (
                <>
                  <label>Tender Ref. No.</label>
                  <input 
                    ref={(el) => inputRefs.current[0] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[1]?.focus()}
                    name="refNo" 
                    value={formData.refNo} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>Location</label>
                  <input 
                    ref={(el) => inputRefs.current[1] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[2]?.focus()}
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>Release Date</label>
                  <input 
                    type="date" 
                    ref={(el) => inputRefs.current[2] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[3]?.focus()}
                    name="releaseDate" 
                    value={formData.releaseDate} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>Tender Value</label>
                  <input 
                    type="number" 
                    ref={(el) => (inputRefs.current[3] = el)}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[4]?.focus()}
                    name="tenderValue" 
                    value={formData.tenderValue} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <h2>EMD / Bank Guarantee Details</h2>
                  <label>Amount</label>
                  <input 
                    ref={(el) => inputRefs.current[5] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[6]?.focus()}
                    type="number" 
                    name="emdAmount" 
                    value={formData.emdAmount} 
                    onChange={handleChange} 
                    className="input" 
                  />

                  <label>Validity Period</label>
                  <input 
                    ref={(el) => inputRefs.current[6] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[7]?.focus()}
                    type="date" 
                    name="emdValidity" 
                    value={formData.emdValidity} 
                    onChange={handleChange} 
                    className="input" 
                  />
                  
                  <label>Conditions</label>
                  <textarea 
                    ref={(el) => inputRefs.current[7] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[8]?.focus()}
                    name="emdConditions" 
                    value={formData.emdConditions} 
                    onChange={handleChange} 
                    className="input"
                  ></textarea>
          
                  <label>Authority</label>
                  <input 
                    ref={(el) => inputRefs.current[8] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[9]?.focus()}
                    name="authority" 
                    value={formData.authority} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>Contact</label>
                  <textarea 
                    ref={(el) => inputRefs.current[9] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[10]?.focus()}
                    name="contact" 
                    value={formData.contact} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>Authorized Personnel</label>
                  <input
                    ref={(el) => inputRefs.current[10] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[11]?.focus()} 
                    name="personnel" 
                    value={formData.personnel} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>Start Date</label>
                  <input 
                    ref={(el) => inputRefs.current[11] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[12]?.focus()}
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>End Date</label>
                  <input 
                    ref={(el) => inputRefs.current[12] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[13]?.focus()}
                    type="date" 
                    name="endDate" 
                    value={formData.endDate} 
                    onChange={handleChange} 
                    className="input" 
                  />
          
                  <label>Tender Description</label>
                  <textarea 
                    ref={(el) => inputRefs.current[13] = el}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[14]?.focus()}
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="input" 
                    rows={4}
                  ></textarea>
          
                  <label>Status</label>
                  <select 
                    ref={(el) => inputRefs.current[14] = el}
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="input"
                  >
                    <option value="">Select status</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Under Review">Under Review</option>
                  </select>
          
                  <button
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: '#7267ef',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      marginTop: '1rem',
                      borderRadius: '0.5rem',
                      border: 'none'
                    }}
                  >
                    {isEditing ? 'Update' : 'Save'}
                  </button>

                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      marginLeft: '1rem',
                      backgroundColor:'#dc3545',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #aaa'
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
      )}

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        padding: '1rem',
        marginTop:'1rem',
      }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#7267ef', margin: '0' }}>
            TENDER REPORT
          </h3>

          <button
            onClick={downloadPDF}
            style={{
              backgroundColor: '#dc3545',
              color: '#fff',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Download size={20} style={{ marginRight: '0.5rem' }} />
            Download as PDF
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: '500' }}>Rows per page: </label>
          <select
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            value={rowsPerPage}
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #ccc',
              outline: 'none',
              backgroundColor: '#fff'
            }}
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
        <input
        type="text"
        placeholder="Search Vendors"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={tableHeaderStyle}>Tender ID</th>
                <th style={tableHeaderStyle}>Ref No</th>
                <th style={tableHeaderStyle}>Location</th>
                <th style={tableHeaderStyle}>Release Date</th>
                <th style={tableHeaderStyle}>Value</th>
                <th style={tableHeaderStyle}>EMD Amount</th>
                <th style={tableHeaderStyle}>EMD Validity</th>
                <th style={tableHeaderStyle}>EMD Conditions</th>
                <th style={tableHeaderStyle}>Authority</th>
                <th style={tableHeaderStyle}>Contact</th>
                <th style={tableHeaderStyle}>Authorized Personnel</th>
                <th style={tableHeaderStyle}>Start Date</th>
                <th style={tableHeaderStyle}>End Date</th>
                <th style={tableHeaderStyle}>Description</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenders.map(t => (
                <tr key={t.id} style={{ backgroundColor: '#fff' }}>
                  <td style={tableCellStyle}>{t.id}</td>
                  <td style={tableCellStyle}>{t.refNo}</td>
                  <td style={tableCellStyle}>{t.location}</td>
                  <td style={tableCellStyle}>{t.releaseDate}</td>
                  <td style={tableCellStyle}>{t.tenderValue}</td>
                  <td style={tableCellStyle}>{t.emdAmount}</td>
                  <td style={tableCellStyle}>{t.emdValidity}</td>
                  <td style={tableCellStyle}>{t.emdConditions}</td>
                  <td style={tableCellStyle}>{t.authority}</td>
                  <td style={tableCellStyle}>{t.contact}</td>
                  <td style={tableCellStyle}>{t.personnel}</td>
                  <td style={tableCellStyle}>{t.startDate}</td>
                  <td style={tableCellStyle}>{t.endDate}</td>
                  <td style={tableCellStyle}>{t.description}</td>
                  <td style={tableCellStyle}>{t.status}</td>
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => handleEdit(t.id)}
                      style={actionBtnStyleBlue}
                    >
                      <Pencil size={18} color="#7267ef"/>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this item?")) {
                          handleDelete(t.id);
                        }
                      }}
                      style={actionBtnStyleRed}
                    >
                      <Trash size={18} color="#800000" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
            style={paginationBtnStyle}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span style={{ fontSize: '1rem' }}>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
            style={paginationBtnStyle}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenderDetailsEntry;