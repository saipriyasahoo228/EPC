
// import React, { useState, useRef, useEffect } from "react";
// import { Pencil, Trash, Download, Maximize2, Minimize2 } from "lucide-react";
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { Button, Badge } from '@mui/material';
// import AuditTrail from './tenderaudit';
// import { createTender, getTenders, updateTender, deleteTender } from '../../allapi/tenderAllocation'
// import { DisableIfCannot, ShowIfCan } from '../../components/auth/RequirePermission';

// const TenderDetailsEntry = () => {
//   const MODULE_SLUG = 'tender_allocation';
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [tenders, setTenders] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editTenderId, setEditTenderId] = useState(null);
//   const [rowsPerPage, setRowsPerPage] = useState(3);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [auditTrail, setAuditTrail] = useState([]);
//   const [isModalMaximized, setIsModalMaximized] = useState(false);
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

//   const resetForm = () => {
//     setFormData({
//       refNo: '',
//       location: '',
//       releaseDate: '',
//       tenderValue: '',
//       emdAmount: '',
//       emdValidity: '',
//       emdConditions: '',
//       authority: '',
//       contact: '',
//       personnel: '',
//       startDate: '',
//       endDate: '',
//       description: '',
//       status: ''
//     });
//     setIsEditing(false);
//     setEditTenderId(null);
//   };

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

//   // Audit Trail Functions
//   const logAuditTrail = (action, tenderId, oldData = {}, newData = {}) => {
//     const timestamp = new Date().toLocaleString();
//     const userrole = "Admin"; // Replace with actual user role
    
//     let changes = [];
//     let actionDescription = '';
    
//     if (action === 'Updated') {
//       changes = Object.keys(newData)
//         .filter(key => oldData[key] !== newData[key])
//         .map(key => ({
//           field: key,
//           oldValue: oldData[key] || 'N/A',
//           newValue: newData[key] || 'N/A'
//         }));
      
//       actionDescription = `${changes.length} field${changes.length !== 1 ? 's' : ''} updated`;
//     } else if (action === 'Added') {
//       actionDescription = 'New tender created';
//     } else if (action === 'Deleted') {
//       actionDescription = 'Tender deleted';
//     }

//     const newEntry = {
//       action,
//       tenderId,
//       changes,
//       actionDescription,
//       timestamp,
//       userrole
//     };

//     setAuditTrail(prev => [newEntry, ...prev]);
//   };

//   // Form handlers
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Fetch Tender Details
//   useEffect(() => {
//     const fetchTenders = async () => {
//       try {
//         const response = await getTenders();
//         setTenders(response);
//       } catch (error) {
//         console.error('Error fetching tenders:', error);
//       }
//     };
//     fetchTenders();
//   }, []);

//   // Form Submit Logic
//   const handleSubmit = async () => {
//     try {
//       const tenderData = {
//         tender_ref_no: formData.refNo,
//         location: formData.location,
//         release_date: formData.releaseDate,
//         tender_value: parseFloat(formData.tenderValue),
//         emd_details: {
//           amount: parseFloat(formData.emdAmount),
//           validity: formData.emdValidity,
//           conditions: formData.emdConditions
//         },
//         authority: formData.authority,
//         contact: formData.contact,
//         authorized_personnel: formData.personnel,
//         start_date: formData.startDate,
//         end_date: formData.endDate,
//         tender_description: formData.description,
//         status: formData.status
//       };

//       if (isEditing) {
//         // ✅ Update existing tender
//         await updateTender(editTenderId, tenderData);
//         const updatedTenders = await getTenders(); // Fetch updated list
//         setTenders(updatedTenders); // Refresh table
//         alert('Tender Details Updated Successfully');
//       } else {
//         // ✅ Create new tender
//         await createTender(tenderData);
//         const updatedTenders = await getTenders(); // Fetch updated list
//         setTenders(updatedTenders); // Refresh table
//         alert('Tender Details Saved Successfully');
//       }

//       // ✅ Reset form and UI
//       setFormData({
//         refNo: '', location: '', releaseDate: '', tenderValue: '',
//         emdAmount: '', emdValidity: '', emdConditions: '',
//         authority: '', contact: '', personnel: '',
//         startDate: '', endDate: '', description: '', status: ''
//       });

//       setIsEditing(false);
//       setEditTenderId(null);
//       setShowModal(false);
//     } catch (error) {
//       console.error('Error saving tender:', error);
//       alert('Failed to save tender. Please try again.');
//     }
//   };

//   // Record Update Logic
//   const handleEdit = (id) => {
//     const tenderToEdit = tenders.find(t => t.tender_id === id);
//     if (tenderToEdit) {
//       setFormData({
//         refNo: tenderToEdit.tender_ref_no || '',
//         location: tenderToEdit.location || '',
//         releaseDate: tenderToEdit.release_date || '',
//         tenderValue: tenderToEdit.tender_value || '',
//         emdAmount: tenderToEdit.emd_details?.amount || '',
//         emdValidity: tenderToEdit.emd_details?.validity || '',
//         emdConditions: tenderToEdit.emd_details?.conditions || '',
//         authority: tenderToEdit.authority || '',
//         contact: tenderToEdit.contact || '',
//         personnel: tenderToEdit.authorized_personnel || '',
//         startDate: tenderToEdit.start_date || '',
//         endDate: tenderToEdit.end_date || '',
//         description: tenderToEdit.tender_description || '',
//         status: tenderToEdit.status || ''
//       });
//       setIsEditing(true);
//       setEditTenderId(tenderToEdit.tender_id); // ✅
//       setShowModal(true);
//     }
//   };

//   const handleDelete = async (tenderId) => {
//     if (!window.confirm("Are you sure you want to delete this tender?")) {
//       return;
//     }

//     try {
//       await deleteTender(tenderId); // API call
//       const deletedTender = tenders.find(t => t.tender_id === tenderId);
//       setTenders(tenders.filter(tender => tender.tender_id !== tenderId));
//       logAuditTrail('Deleted', tenderId, deletedTender, {});
//       alert('Tender deleted successfully.');
//     } catch (error) {
//       console.error('Error deleting tender:', error);
//       alert('Failed to delete tender. Please try again.');
//     }
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
//       tender.tender_id,
//       tender.tender_ref_no,
//       tender.location,
//       tender.release_date,
//       tender.tender_value,
//       tender.emd_details?.amount,
//       tender.emd_details?.validity,
//       tender.emd_details?.conditions,
//       tender.authority,
//       tender.contact,
//       tender.authorized_personnel,
//       tender.start_date,
//       tender.end_date,
//       tender.tender_description,
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

//   const filteredTenders = tenders.filter((d) => {
//     const flatValues = [
//       d.tender_id,
//       d.tender_ref_no,
//       d.location,
//       d.release_date,
//       d.tender_value,
//       d.emd_details?.amount,
//       d.emd_details?.validity,
//       d.emd_details?.conditions,
//       d.authority,
//       d.contact,
//       d.authorized_personnel,
//       d.start_date,
//       d.end_date,
//       d.tender_description,
//       d.status
//     ];

//     return flatValues.some(val =>
//       val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   });

//   const totalPages = Math.ceil(filteredTenders.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const currentTenders = filteredTenders.slice(startIndex, startIndex + rowsPerPage);

//   const toggleModalSize = () => {
//     setIsModalMaximized(!isModalMaximized);
//   };

//   return (
//     <div style={{ padding: '2rem', minHeight: '100vh' }}>
//       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
//         <ShowIfCan slug={MODULE_SLUG} action="can_create">
//           <button 
//             onClick={() => {
//               resetForm();
//               setShowModal(true);
//             }} 
//             style={{ 
//               backgroundColor: '#7267ef', 
//               color: '#fff', 
//               padding: '0.75rem 1.5rem', 
//               borderRadius: '0.5rem', 
//               border: 'none', 
//               cursor: 'pointer' 
//             }}
//           >
//             Add Tender Details
//           </button>
//         </ShowIfCan>
//         <Badge 
//           badgeContent={auditTrail.length} 
//           color="primary" 
//           overlap="circular"
//           style={{ marginLeft: '1rem' }}
//         >
//           <AuditTrail auditTrail={auditTrail} />
//         </Badge>
//       </div>

//       {showModal && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           zIndex: 2000,
//           width: '100%',
//           height: '100%',
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'flex-start',
//           paddingTop: '1rem',
//           overflowY: 'auto'
//         }}>
//           <div style={{
//             backgroundColor: '#fff',
//             padding: '1rem',
//             width: isModalMaximized ? '95%' : '95%',
//             maxWidth: isModalMaximized ? 'none' : '700px',
//             maxHeight: isModalMaximized ? '95vh' : '90vh',
//             height: isModalMaximized ? '95vh' : 'auto',
//             overflowY: 'auto',
//             border: '3px solid #E6E6FA',
//             position: 'relative'
//           }}>
//             <div style={{
//               position: 'absolute',
//               top: '1rem',
//               right: '3rem',
//               display: 'flex',
//               gap: '0.5rem'
//             }}>
//               <button
//                 onClick={toggleModalSize}
//                 style={{
//                   background: 'transparent',
//                   border: 'none',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center'
//                 }}
//                 aria-label={isModalMaximized ? "Minimize Modal" : "Maximize Modal"}
//               >
//                 {isModalMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
//               </button>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setIsModalMaximized(false);
//                 }}
//                 style={{
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
//             </div>
        
//             <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
//               {isEditing ? 'Edit Tender' : 'Add Tender'}
//             </h2>
        
//             <label>Tender Ref. No.</label>
//             <input 
//               ref={(el) => inputRefs.current[0] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[1]?.focus()}
//               name="refNo" 
//               value={formData.refNo} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>Location</label>
//             <input 
//               ref={(el) => inputRefs.current[1] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[2]?.focus()}
//               name="location" 
//               value={formData.location} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>Release Date</label>
//             <input 
//               type="date" 
//               ref={(el) => inputRefs.current[2] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[3]?.focus()}
//               name="releaseDate" 
//               value={formData.releaseDate} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>Tender Value</label>
//             <input 
//               type="number" 
//               ref={(el) => (inputRefs.current[3] = el)}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[4]?.focus()}
//               name="tenderValue" 
//               value={formData.tenderValue} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <h2>EMD / Bank Guarantee Details</h2>
//             <label>Amount</label>
//             <input 
//               ref={(el) => inputRefs.current[5] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[6]?.focus()}
//               type="number" 
//               name="emdAmount" 
//               value={formData.emdAmount} 
//               onChange={handleChange} 
//               className="input" 
//             />

//             <label>Validity Period</label>
//             <input 
//               ref={(el) => inputRefs.current[6] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[7]?.focus()}
//               type="date" 
//               name="emdValidity" 
//               value={formData.emdValidity} 
//               onChange={handleChange} 
//               className="input" 
//             />
            
//             <label>Conditions</label>
//             <textarea 
//               ref={(el) => inputRefs.current[7] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[8]?.focus()}
//               name="emdConditions" 
//               value={formData.emdConditions} 
//               onChange={handleChange} 
//               className="input"
//             ></textarea>
        
//             <label>Authority</label>
//             <input 
//               ref={(el) => inputRefs.current[8] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[9]?.focus()}
//               name="authority" 
//               value={formData.authority} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>Contact</label>
//             <textarea 
//               ref={(el) => inputRefs.current[9] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[10]?.focus()}
//               name="contact" 
//               value={formData.contact} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>Authorized Personnel</label>
//             <input
//               ref={(el) => inputRefs.current[10] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[11]?.focus()} 
//               name="personnel" 
//               value={formData.personnel} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>Start Date</label>
//             <input 
//               ref={(el) => inputRefs.current[11] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[12]?.focus()}
//               type="date" 
//               name="startDate" 
//               value={formData.startDate} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>End Date</label>
//             <input 
//               ref={(el) => inputRefs.current[12] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[13]?.focus()}
//               type="date" 
//               name="endDate" 
//               value={formData.endDate} 
//               onChange={handleChange} 
//               className="input" 
//             />
        
//             <label>Tender Description</label>
//             <textarea 
//               ref={(el) => inputRefs.current[13] = el}
//               onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[14]?.focus()}
//               name="description" 
//               value={formData.description} 
//               onChange={handleChange} 
//               className="input" 
//               rows={4}
//             ></textarea>
        
//             <label>Status</label>
//             <select 
//               ref={(el) => inputRefs.current[14] = el}
//               name="status" 
//               value={formData.status} 
//               onChange={handleChange} 
//               className="input"
//             >
//               <option value="">Select status</option>
//               <option value="Open">Open</option>
//               <option value="Under Review">Under Review</option>
//               <option value="Closed">Closed</option>
//             </select>
            
//             <DisableIfCannot slug={MODULE_SLUG} action={isEditing ? 'can_update' : 'can_create'}>
//               <button
//                 onClick={handleSubmit}
//                 style={{
//                   backgroundColor: '#7267ef',
//                   color: '#fff',
//                   padding: '0.5rem 1rem',
//                   marginTop: '1rem',
//                   borderRadius: '0.5rem',
//                   border: 'none'
//                 }}
//               >
//                 {isEditing ? 'Update' : 'Save'}
//               </button>
//             </DisableIfCannot>
            
//             <button
//               onClick={() => {
//                 setShowModal(false);
//                 setIsModalMaximized(false);
//               }}
//               style={{
//                 marginLeft: '1rem',
//                 backgroundColor:'#dc3545',
//                 padding: '0.5rem 1rem',
//                 borderRadius: '0.5rem',
//                 border: '1px solid #aaa'
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

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
//           <input
//             type="text"
//             placeholder="Search Vendors"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="input"
//           />
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
//               {currentTenders.map(tender => (
//                 <tr key={tender.tender_id}>
//                   <td style={tableCellStyle}>{tender.tender_id}</td>
//                   <td style={tableCellStyle}>{tender.tender_ref_no}</td>
//                   <td style={tableCellStyle}>{tender.location}</td>
//                   <td style={tableCellStyle}>{tender.release_date}</td>
//                   <td style={tableCellStyle}>{tender.tender_value}</td>
//                   <td style={tableCellStyle}>{tender.emd_details?.amount}</td>
//                   <td style={tableCellStyle}>{tender.emd_details?.validity}</td>
//                   <td style={tableCellStyle}>{tender.emd_details?.conditions}</td>
//                   <td style={tableCellStyle}>{tender.authority}</td>
//                   <td style={tableCellStyle}>{tender.contact}</td>
//                   <td style={tableCellStyle}>{tender.authorized_personnel}</td>
//                   <td style={tableCellStyle}>{tender.start_date}</td>
//                   <td style={tableCellStyle}>{tender.end_date}</td>
//                   <td style={tableCellStyle}>{tender.tender_description}</td>
//                   <td style={tableCellStyle}>{tender.status}</td>
//                   <td style={tableCellStyle}>
//                     <DisableIfCannot slug={MODULE_SLUG} action="can_update">
//                       <button
//                         onClick={() => handleEdit(tender.tender_id)}
//                         style={actionBtnStyleBlue}
//                       >
//                         <Pencil size={18} color="#7267ef" />
//                       </button>
//                     </DisableIfCannot>
//                     <ShowIfCan slug={MODULE_SLUG} action="can_delete">
//                       <button
//                         onClick={() => handleDelete(tender.tender_id)}
//                         style={actionBtnStyleRed}
//                       >
//                         <Trash size={18} color="#800000" />
//                       </button>
//                     </ShowIfCan>
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



import React, { useState, useRef, useEffect } from "react";
import { Pencil, Trash, Download, Maximize2, Minimize2 } from "lucide-react";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Button, Badge } from '@mui/material';
import AuditTrail from './tenderaudit';
import { createTender, getTenders, updateTender, deleteTender } from '../../allapi/tenderAllocation'
import { DisableIfCannot, ShowIfCan } from '../../components/auth/RequirePermission';

const TenderDetailsEntry = () => {
  const MODULE_SLUG = 'tender_allocation';
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tenders, setTenders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTenderId, setEditTenderId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [auditTrail, setAuditTrail] = useState([]);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
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

  const resetForm = () => {
    setFormData({
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
    setIsEditing(false);
    setEditTenderId(null);
  };

  const inputRefs = useRef([]);
  const [errors, setErrors] = useState({});


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

  // Modal form grid style
  const modalGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const fullWidthFieldStyle = {
    gridColumn: '1 / span 2'
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

  // Fetch Tender Details
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await getTenders();
        setTenders(response);
      } catch (error) {
        console.error('Error fetching tenders:', error);
      }
    };
    fetchTenders();
  }, []);

  // Validation Function
const validateForm = () => {
  let newErrors = {};

  if (!formData.refNo) newErrors.refNo = "This field is required.";
  if (!formData.location) newErrors.location = "This field is required.";
  if (!formData.releaseDate) newErrors.releaseDate = "This field is required.";
  if (!formData.tenderValue) newErrors.tenderValue = "This field is required.";

  if (!formData.emdAmount || !formData.emdValidity || !formData.emdConditions) {
    newErrors.emdDetails = "This field is required.";
  }

  if (!formData.authority) newErrors.authority = "This field is required.";
  if (!formData.contact) newErrors.contact = "This field is required.";
  if (!formData.personnel) newErrors.personnel = "This field is required.";
  if (!formData.startDate) newErrors.startDate = "This field is required.";
  if (!formData.endDate) newErrors.endDate = "This field is required.";
  if (!formData.description) newErrors.description = "This field is required.";
  if (!formData.status) newErrors.status = "This field is required.";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0; // ✅ No errors = valid
};

// Form Submit Logic
const handleSubmit = async () => {
  try {
    // ✅ Run validation before API call
    if (!validateForm()) {
      return; // stop if validation fails
    }

    const tenderData = {
      tender_ref_no: formData.refNo,
      location: formData.location,
      release_date: formData.releaseDate,
      tender_value: parseFloat(formData.tenderValue),
      emd_details: {
        amount: parseFloat(formData.emdAmount),
        validity: formData.emdValidity,
        conditions: formData.emdConditions,
      },
      authority: formData.authority,
      contact: formData.contact,
      authorized_personnel: formData.personnel,
      start_date: formData.startDate,
      end_date: formData.endDate,
      tender_description: formData.description,
      status: formData.status,
    };

    if (isEditing) {
      await updateTender(editTenderId, tenderData);
      const updatedTenders = await getTenders();
      setTenders(updatedTenders);
      alert("Tender Details Updated Successfully");
    } else {
      await createTender(tenderData);
      const updatedTenders = await getTenders();
      setTenders(updatedTenders);
      alert("Tender Details Saved Successfully");
    }

    // ✅ Reset form and UI
    setFormData({
      refNo: "",
      location: "",
      releaseDate: "",
      tenderValue: "",
      emdAmount: "",
      emdValidity: "",
      emdConditions: "",
      authority: "",
      contact: "",
      personnel: "",
      startDate: "",
      endDate: "",
      description: "",
      status: "",
    });

    setIsEditing(false);
    setEditTenderId(null);
    setShowModal(false);
  } catch (error) {
    console.error("Error saving tender:", error);
    alert("Failed to save tender. Please try again.");
  }
};
  // Record Update Logic
  const handleEdit = (id) => {
    const tenderToEdit = tenders.find(t => t.tender_id === id);
    if (tenderToEdit) {
      setFormData({
        refNo: tenderToEdit.tender_ref_no || '',
        location: tenderToEdit.location || '',
        releaseDate: tenderToEdit.release_date || '',
        tenderValue: tenderToEdit.tender_value || '',
        emdAmount: tenderToEdit.emd_details?.amount || '',
        emdValidity: tenderToEdit.emd_details?.validity || '',
        emdConditions: tenderToEdit.emd_details?.conditions || '',
        authority: tenderToEdit.authority || '',
        contact: tenderToEdit.contact || '',
        personnel: tenderToEdit.authorized_personnel || '',
        startDate: tenderToEdit.start_date || '',
        endDate: tenderToEdit.end_date || '',
        description: tenderToEdit.tender_description || '',
        status: tenderToEdit.status || ''
      });
      setIsEditing(true);
      setEditTenderId(tenderToEdit.tender_id); // ✅
      setShowModal(true);
    }
  };

  const handleDelete = async (tenderId) => {
    if (!window.confirm("Are you sure you want to delete this tender?")) {
      return;
    }

    try {
      await deleteTender(tenderId); // API call
      const deletedTender = tenders.find(t => t.tender_id === tenderId);
      setTenders(tenders.filter(tender => tender.tender_id !== tenderId));
      logAuditTrail('Deleted', tenderId, deletedTender, {});
      alert('Tender deleted successfully.');
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert('Failed to delete tender. Please try again.');
    }
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
      tender.tender_id,
      tender.tender_ref_no,
      tender.location,
      tender.release_date,
      tender.tender_value,
      tender.emd_details?.amount,
      tender.emd_details?.validity,
      tender.emd_details?.conditions,
      tender.authority,
      tender.contact,
      tender.authorized_personnel,
      tender.start_date,
      tender.end_date,
      tender.tender_description,
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

  const filteredTenders = tenders.filter((d) => {
    const flatValues = [
      d.tender_id,
      d.tender_ref_no,
      d.location,
      d.release_date,
      d.tender_value,
      d.emd_details?.amount,
      d.emd_details?.validity,
      d.emd_details?.conditions,
      d.authority,
      d.contact,
      d.authorized_personnel,
      d.start_date,
      d.end_date,
      d.tender_description,
      d.status
    ];

    return flatValues.some(val =>
      val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredTenders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTenders = filteredTenders.slice(startIndex, startIndex + rowsPerPage);

  const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <ShowIfCan slug={MODULE_SLUG} action="can_create">
          <button 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }} 
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
        </ShowIfCan>
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
            padding: '1.5rem',
            width: isModalMaximized ? '95%' : '95%',
            maxWidth: isModalMaximized ? 'none' : '800px',
            maxHeight: isModalMaximized ? '95vh' : '90vh',
            height: isModalMaximized ? '95vh' : 'auto',
            overflowY: 'auto',
            border: '3px solid #E6E6FA',
            position: 'relative',
            borderRadius: '8px'
          }}>
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={toggleModalSize}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={isModalMaximized ? "Minimize Modal" : "Maximize Modal"}
              >
                {isModalMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsModalMaximized(false);
                }}
                style={{
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
            </div>
        
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {isEditing ? 'Edit Tender' : 'Add Tender'}
            </h2>
            
            {/* Grid layout for form fields */}
            <div style={modalGridStyle}>
              <div>
                <label>Tender Ref. No.</label>
                <input 
                  ref={(el) => inputRefs.current[0] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[1]?.focus()}
                  name="refNo" 
                  value={formData.refNo} 
                  onChange={handleChange} 
                  className="input" 
                  
                />
              </div>
              
              <div>
                <label>Location</label>
                <input 
                  ref={(el) => inputRefs.current[1] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[2]?.focus()}
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>
              
              <div>
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
              </div>
              
              <div>
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
              </div>
              
              <div style={fullWidthFieldStyle}>
                <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#7267ef' }}>EMD / Bank Guarantee Details</h3>
              </div>
              
              <div>
                <label>Amount</label>
                <input 
                  ref={(el) => inputRefs.current[4] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[5]?.focus()}
                  type="number" 
                  name="emdAmount" 
                  value={formData.emdAmount} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>

              <div>
                <label>Validity Period</label>
                <input 
                  ref={(el) => inputRefs.current[5] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[6]?.focus()}
                  type="date" 
                  name="emdValidity" 
                  value={formData.emdValidity} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>
              
              <div style={fullWidthFieldStyle}>
                <label>Conditions</label>
                <textarea 
                  ref={(el) => inputRefs.current[6] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[7]?.focus()}
                  name="emdConditions" 
                  value={formData.emdConditions} 
                  onChange={handleChange} 
                  className="input"
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label>Authority</label>
                <input 
                  ref={(el) => inputRefs.current[7] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[8]?.focus()}
                  name="authority" 
                  value={formData.authority} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>
              
              <div>
                <label>Contact</label>
                <input 
                  ref={(el) => inputRefs.current[8] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[9]?.focus()}
                  name="contact" 
                  value={formData.contact} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>
              
              <div>
                <label>Authorized Personnel</label>
                <input
                  ref={(el) => inputRefs.current[9] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[10]?.focus()} 
                  name="personnel" 
                  value={formData.personnel} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>
              
              <div>
                <label>Start Date</label>
                <input 
                  ref={(el) => inputRefs.current[10] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[11]?.focus()}
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>
              
              <div>
                <label>End Date</label>
                <input 
                  ref={(el) => inputRefs.current[11] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[12]?.focus()}
                  type="date" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleChange} 
                  className="input" 
                />
              </div>
              
              <div style={fullWidthFieldStyle}>
                <label>Tender Description</label>
                <textarea 
                  ref={(el) => inputRefs.current[12] = el}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[13]?.focus()}
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="input" 
                  rows={4}
                ></textarea>
              </div>
              
              <div>
                <label>Status</label>
                <select 
                  ref={(el) => inputRefs.current[13] = el}
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="input"
                >
                  <option value="">Select status</option>
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <DisableIfCannot slug={MODULE_SLUG} action={isEditing ? 'can_update' : 'can_create'}>
                <button
                  onClick={handleSubmit}
                  style={{
                    backgroundColor: '#7267ef',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </DisableIfCannot>
              
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsModalMaximized(false);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ccc',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
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
            style={{ marginBottom: '1rem', width: '100%', maxWidth: '300px' }}
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
              {currentTenders.map(tender => (
                <tr key={tender.tender_id}>
                  <td style={tableCellStyle}>{tender.tender_id}</td>
                  <td style={tableCellStyle}>{tender.tender_ref_no}</td>
                  <td style={tableCellStyle}>{tender.location}</td>
                  <td style={tableCellStyle}>{tender.release_date}</td>
                  <td style={tableCellStyle}>{tender.tender_value}</td>
                  <td style={tableCellStyle}>{tender.emd_details?.amount}</td>
                  <td style={tableCellStyle}>{tender.emd_details?.validity}</td>
                  <td style={tableCellStyle}>{tender.emd_details?.conditions}</td>
                  <td style={tableCellStyle}>{tender.authority}</td>
                  <td style={tableCellStyle}>{tender.contact}</td>
                  <td style={tableCellStyle}>{tender.authorized_personnel}</td>
                  <td style={tableCellStyle}>{tender.start_date}</td>
                  <td style={tableCellStyle}>{tender.end_date}</td>
                  <td style={tableCellStyle}>{tender.tender_description}</td>
                  <td style={tableCellStyle}>{tender.status}</td>
                  <td style={tableCellStyle}>
                    <DisableIfCannot slug={MODULE_SLUG} action="can_update">
                      <button
                        onClick={() => handleEdit(tender.tender_id)}
                        style={actionBtnStyleBlue}
                      >
                        <Pencil size={18} color="#7267ef" />
                      </button>
                    </DisableIfCannot>
                    <ShowIfCan slug={MODULE_SLUG} action="can_delete">
                      <button
                        onClick={() => handleDelete(tender.tender_id)}
                        style={actionBtnStyleRed}
                      >
                        <Trash size={18} color="#800000" />
                      </button>
                    </ShowIfCan>
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