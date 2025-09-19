import React, { useState, useEffect } from "react";
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
import CloseIcon from '@mui/icons-material/Close';
import { getMaterialProcurements ,createPurchaseOrder, getPurchaseOrders, deletePurchaseOrder,updatePurchaseOrder,getVendors } from '../../allapi/procurement';
import { DisableIfCannot, ShowIfCan } from '../../components/auth/RequirePermission';
import { Maximize2, Minimize2 } from "lucide-react";


const PurchaseOrder = () => {
  const MODULE_SLUG = 'procurement';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [vendors, setVendors] = useState([]);



  const [formData, setFormData] = useState({
    projectId: '',
    purchaseOrderId:'',
    vendorId:'',
    procurementId: '',
    orderDate: '',
    deliveryDate: '',
    totalOrderValue: '',
    paymentTerms: '',
    taxDetails: '',
    orderStatus: '',
    invoiceId: ''
    
  });
  
  const [procurements, setProcurements] = useState([]);
  
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0); // Default to first project

  const toggleModalSize = () => {
    setIsModalMaximized(!isModalMaximized);
  };


 //Fetch projectID,purchaseorderID and procurementID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMaterialProcurements();
        setProcurements(data);
      } catch (error) {
        console.error('Failed to fetch procurements:', error);
      }
    };

    fetchData();
  }, []);

  //Fetch Vendor_id and name

useEffect(() => {
  getVendors()
    .then((res) => {
      console.log("Full API response:", res); // First log the complete response
      
      // Handle different response structures
      const vendorsData = res.data || res; // Try res.data first, fall back to res
      console.log("Vendors data to set:", vendorsData);
      
      if (Array.isArray(vendorsData)) {
        setVendors(vendorsData);
      } else {
        console.error("Received data is not an array:", vendorsData);
        setVendors([]); // Fallback to empty array
      }
    })
    .catch((err) => console.error("Error fetching vendors:", err));
}, []);

  
  const handleOpen = (index) => {
  setSelectedIndex(index);
  setIsEditMode(false);
  setOpen(true);
};

//useEffect to open the dialog form
useEffect(() => {
  if (open && selectedIndex !== null) {
    const selected = procurements[selectedIndex];
    setFormData({
      projectId: selected.project,
      procurementId: selected.procurement_id,
      purchaseOrderId: selected.purchase_order,
    });
  }
}, [open, selectedIndex]);

//close the form
  const handleClose = () => {
  setOpen(false);
  setSelectedIndex(null);
};


  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
  
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
  
      // Auto-calculate total cost if quantity or unit price changes
      if (name === 'quantity' || name === 'unitPrice') {
        const quantity = parseFloat(updatedFormData.quantity) || 0;
        const unitPrice = parseFloat(updatedFormData.unitPrice) || 0;
        const totalCost = (quantity * unitPrice).toFixed(2); // Calculate total cost and keep it two decimal places
        updatedFormData.totalCost = totalCost; // Update total cost in the form data
      }
  
      return updatedFormData;
    });
  };
  

// fetch purchase orders
const fetchPurchaseOrders = async () => {
  try {
    const data = await getPurchaseOrders();
    setPurchaseOrders(data);
  } catch (err) {
    console.error('❌ Failed to fetch PO data:', err);
  }
};

//useEffect just calls it on component mount
useEffect(() => {
  fetchPurchaseOrders();
}, []);

  
//HandleSubmit Logic
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    vendor: formData.vendorId,
    procurement: formData.procurementId,
    po_number: formData.purchaseOrderId,
    order_date: formData.orderDate,
    delivery_date: formData.deliveryDate,
    total_order_value: formData.totalOrderValue,
    payment_terms: formData.paymentTerms,
    tax_details: formData.taxDetails,
    order_status: formData.orderStatus,
    invoice_id: formData.invoiceId || null,
  };

  try {
    if (isEditMode) {
      await updatePurchaseOrder(formData.po_id, payload);
      alert(`✅ Purchase Order Updated: ${formData.po_id}`);
    } else {
      const data = await createPurchaseOrder(payload);
      alert(`✅ Purchase Order Created: ${data.po_number}`);
    }

    setFormData({});
    setOpen(false);
    setIsEditMode(false);
    fetchPurchaseOrders();
  } catch (err) {
    const errorMessage = err.response?.data?.po_number?.[0] || 'Operation failed';
    alert(`❌ ${errorMessage}`);
  }
};


//HandleEdit Logic
const handleEdit = (purchaseOrder) => {
  setFormData({
    po_id: purchaseOrder.po_number,  // Required for PATCH
    vendorId: purchaseOrder.vendor,
    procurementId: purchaseOrder.procurement,
    purchaseOrderId: purchaseOrder.po_number,
    orderDate: purchaseOrder.order_date,
    deliveryDate: purchaseOrder.delivery_date,
    totalOrderValue: purchaseOrder.total_order_value,
    paymentTerms: purchaseOrder.payment_terms,
    taxDetails: purchaseOrder.tax_details,
    orderStatus: purchaseOrder.order_status,
    invoiceId: purchaseOrder.invoice_id || '',
  });

  setIsEditMode(true);
  setOpen(true);
};

  



//HandleDelete
const handleDelete = async (po_id) => {
  if (!window.confirm(`Are you sure you want to delete Purchase Order ${po_id}?`)) return;

  try {
    await deletePurchaseOrder(po_id); // Call your API delete function
    console.log(`✅ Purchase Order ${po_id} deleted successfully.`);
    fetchPurchaseOrders(); // Refresh the list
  } catch (error) {
    console.error(`❌ Failed to delete Purchase Order ${po_id}:`, error);
  }
};

  
   

  

  const filteredPurchase =procurements.filter((d) =>
    Object.values(d).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>Purchase Order</Typography>

      <Grid container spacing={2} direction="column" sx={{ mb: 2 }}>
        <Grid item xs={12}>
        
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
  <Typography variant="h6" gutterBottom>PURCHASE ORDERS</Typography>

  {/* Search Input */}
  <Box sx={{ my: 2, mx: 1 }}>
    <input
      type="text"
      placeholder="Search Purchase Orders"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="input"
      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
    />
  </Box>

  <Table>
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: '#7267ef' }}><strong>Project ID</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Procurement ID</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Purchase Order ID</strong></TableCell>
        <TableCell sx={{ display: 'flex', justifyContent: 'flex-end', color: '#660000' }}>
          <strong>Action</strong>
        </TableCell>
      </TableRow>
    </TableHead>
   <TableBody>
  {procurements.map((item, index) => (
    <TableRow key={item.id}>
      <TableCell>{item.project}</TableCell>
      <TableCell>{item.procurement_id}</TableCell>
      <TableCell>{item.purchase_order}</TableCell>
      <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <ShowIfCan slug={MODULE_SLUG} action="can_create">

        <IconButton onClick={() => handleOpen(index)} color="primary">
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

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <Typography variant="h6" gutterBottom>SUBMITTED PURCHASE RECORDS</Typography>
            <input
              type="text"
              placeholder="Search Purchase Order Details"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
           <TableContainer sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd' }}>
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        
        <TableCell sx={{ color: '#7267ef' }}><strong>PO Number</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Vendor</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Procurement</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Order Date</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Delivery Date</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Total Value</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Payment Terms</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Tax Details</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Order Status</strong></TableCell>
        <TableCell sx={{ color: '#7267ef' }}><strong>Invoice ID</strong></TableCell>
        <TableCell sx={{ color: '#660000' }}><strong>Actions</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {purchaseOrders.map((p, i) => (
        <TableRow key={p.id || i}>
          <TableCell>{p.po_number}</TableCell>
          <TableCell>{p.vendor}</TableCell>
          <TableCell>{p.procurement}</TableCell>
          <TableCell>{p.order_date}</TableCell>
          <TableCell>{p.delivery_date}</TableCell>
          <TableCell>{p.total_order_value}</TableCell>
          <TableCell>{p.payment_terms}</TableCell>
          <TableCell>{p.tax_details}</TableCell>
          <TableCell>{p.order_status}</TableCell>
          <TableCell>{p.invoice_id}</TableCell>
          <TableCell>
          <DisableIfCannot slug={MODULE_SLUG} action="can_update">

            <IconButton color="warning" onClick={() => handleEdit(p)}>
              <Edit sx={{ color: "orange" }} />
            </IconButton>
            </DisableIfCannot>
            <ShowIfCan slug={MODULE_SLUG} action="can_delete">
            <IconButton color="error" onClick={() => handleDelete(p.po_number)}
>
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

      <Dialog
             open={open}
             onClose={handleClose}
             fullWidth
             maxWidth="xl"
             PaperProps={{
               style: isModalMaximized
                 ? {
                     width: "100%",
                     height: "100vh", // fullscreen
                     margin: 0,
                   }
                 : {
                     width: "70%",
                     height: "97vh", // default size
                   },
             }}
           >


        <DialogTitle>Enter Purchase Order Details</DialogTitle>
        <DialogContent
                  sx={{
                    position: "relative",
                    overflowY: "auto", // ensures internal scrolling
                  }}
                >
               <IconButton
                    aria-label="toggle-size"
                    onClick={toggleModalSize}
                    sx={{
                      position: "absolute",
                      right: 40,
                      top: 8,
                      color: (theme) => theme.palette.grey[600],
                    }}
                  >
                    {isModalMaximized ? <Minimize2 /> : <Maximize2 />}
                  </IconButton>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box component="form" sx={{ mt: 2 }}>
  <Grid container spacing={3} direction="column">
    {/* Non-editable fields */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Purchase Order & Vendor info..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
      <Grid container spacing={2}>
  <Grid item xs={6}>
    <label htmlFor="purchaseOrderId">Purchase Order ID</label>
    <input
      id="purchaseOrderId"
      name="purchaseOrderId"
      className="input"
      value={formData.purchaseOrderId || ''}
      disabled // This makes it non-editable
    />
  </Grid>

 

  <Grid item xs={6}>
    <label htmlFor="projectId">Project ID</label>
    <input
      id="projectId"
      name="projectId"
      className="input"
      value={formData.projectId || ''}
      disabled // This makes it non-editable
    />
  </Grid>


<Grid item xs={6}>
  <label htmlFor="vendorId">Vendor ID</label>
 <select
  id="vendorId"
  name="vendorId"
  className="input"
  value={formData.vendorId || ""}
  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
>
  <option value="">-- Select Vendor --</option>
  {Array.isArray(vendors) &&
    vendors.map((vendor) => (
      <option key={vendor.id} value={vendor.vendor_id}>
        {vendor.vendor_id} - {vendor.vendor_name}
      </option>
    ))}
</select>
</Grid>




  <Grid item xs={6}>
    <label htmlFor="procurementId">Procurement ID</label>
    <input
      id="procurementId"
      name="procurementId"
      className="input"
      value={formData.procurementId || ''}
      disabled // This makes it non-editable
    />
  </Grid>
</Grid>

    </Grid>

    {/* Material Information */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Material Information & Payment..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
      <Grid container spacing={2}>
        
        <Grid item xs={6}>
          <label htmlFor="orderDate">Order Date </label>
          <input
            type="date"
            id="orderDate"
            name="orderDate"
            className="input"
            value={formData.orderDate || ''}
            onChange={handleChange}
          />
        </Grid>
         <Grid item xs={6}>
          <label htmlFor="deliveryDate">Dalivery Date </label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            className="input"
            value={formData.deliveryDate || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="totalOrderValue">Total Order Value</label>
          <input
            type="number"
            id="totalOrderValue"
            name="totalOrderValue"
            className="input"
            value={formData.totalOrderValue || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <label htmlFor="paymentTerms">Payment Terms</label>
          <input
            id="paymentTerms"
            name="paymentTerms"
            className="input"
            value={formData.paymentTerms || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Grid>

    {/* Total Cost & Other Info */}
    <Grid item xs={12}>
      <h3 style={{ color: '#7267ef' }}>Tax & Order Status..</h3>
      <hr style={{ borderTop: '2px solid #7267ef', width: '100%' }} />
      <Grid container spacing={2}>
      <Grid item xs={6}>
  <label htmlFor="taxDetails">Tax Details</label>
  <input
    id="taxDetails"
    name="taxDetails"
    className="input"
    value={formData.taxDetails || ''}
    onChange={handleChange}
   
  />
</Grid>
<Grid item xs={6}>
  <label htmlFor="orderStatus">Order Status</label>
  <select
    id="orderStatus"
    name="orderStatus"
    className="input"
    value={formData.orderStatus || ''}
    onChange={handleChange}
  >
    <option value="">Select Status</option> {/* Default option */}
    <option value="Issued">Issued</option>
    <option value="In Progress">In Progress</option>
    <option value="Delivered">Delivered</option>
    <option value="Canceled">Canceled</option>
  </select>
</Grid>

        <Grid item xs={6}>
          <label htmlFor="requestDate">Invoice Id</label>
          <input
            
            id="invoiceId"
            name="invoiceId"
            className="input"
            value={formData.invoiceId || ''}
            onChange={handleChange}
          />
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
                  outline: '2px solid #800000',  // Dark maroon outline
                  color: '#800000',              // Dark maroon text color
                  '&:hover': {
                    outline: '2px solid #b30000',  // Lighter maroon outline on hover
                    color: '#b30000',              // Lighter maroon text color on hover
                  }
                }}
              >
                Cancel
              </Button>
              <DisableIfCannot slug={MODULE_SLUG} action={isEditMode ? 'can_update' : 'can_create'}>

              <Button
                variant="outlined"
                onClick={handleSubmit}
                sx={{
                  borderColor: '#7267ef',  // Border color
                  color: '#7267ef',        // Text color
                  '&:hover': {
                    borderColor: '#9e8df2',  // Lighter border color on hover
                    color: '#9e8df2',         // Lighter text color on hover
                  }
                }}
              >
                {isEditMode ? 'Update' : 'Submit'}
              </Button>
              </DisableIfCannot>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PurchaseOrder;
