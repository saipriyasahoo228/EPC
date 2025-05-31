
// export default MainRoutes;
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

 


const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const TenderDetailsEntry = lazy(() => import('../views/tenderallocation/tenderdetails'));
const ProjectCreation = lazy(()=> import('../views/tenderallocation/projectcreation'));
const DesignForm = lazy(()=>import('../views/engineeringmodule/design.jsx'));
const FeasibilityForm = lazy(()=>import('../views/engineeringmodule/feasibility.jsx'));
const VendorForm = lazy(()=> import('../views/procurementmodule/vendor.jsx'));
const MaterialForm = lazy(() => import('../views/procurementmodule/materials.jsx'));
const PurchaseOrder = lazy(() => import('../views/procurementmodule/purchaseorder.jsx'));
const LogisticForm = lazy(() => import('../views/procurementmodule/logistic.jsx'));
const ItemMaster = lazy(() => import('../views/inventrymanagment/itemmaster.jsx'));
const StockMaster = lazy(() =>import('../views/inventrymanagment/stockmaster.jsx'));
const StockReturn = lazy(() => import('../views/inventrymanagment/stockreturn.jsx'));
const InventoryValuationForm = lazy(() =>import('../views/inventrymanagment/stockvaluationandreport.jsx'));
const ProjectManagement = lazy(()=>import('../views/constructionmodule/projectmanagement.jsx'));
const SiteExecution = lazy(()=>import('../views/constructionmodule/siteexecution.jsx'));
const QualityControl = lazy(()=>import('../views/constructionmodule/qualitycontrol.jsx'));
const SafetyManagement = lazy(() =>import('../views/constructionmodule/safetymanagement.jsx'));
const InventoryManagement = lazy(()=>import('../views/constructionmodule/inventorymanagement.jsx'));
const Testing = lazy(()=>import('../views/commisioningmodule/testing.jsx'));
const HandoverProcess = lazy(()=>import('../views/commisioningmodule/handoverprocess.jsx'));
// Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
//const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));

const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));

const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

const Sample = lazy(() => import('../views/sample'));

const MainRoutes = {
  path: '/',
  children: [
    // 👇 Default redirect to login
    {
      path: '',
      element: <Navigate to="/login" replace />
    },
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: '/dashboard',
          element: <DashboardSales />
        },
        {
          path: '/tenderdetails',
          element: <TenderDetailsEntry />
        },
        {
          path: '/projectcreation',
          element: <ProjectCreation/>
        },
        {
          path: '/design',
          element: <DesignForm />
        },

        {
          path: '/feasibilitystudies',
          element:<FeasibilityForm />
        },
        {
          path: '/vendor details',
          element: <VendorForm />
        },
        {
          path: '/materialprocurement',
          element: <MaterialForm />
        },
        {
          path: '/purchaseorder',
          element: <PurchaseOrder />
        },
        {
          path: '/logistic',
          element: <LogisticForm />
        },
        {
          path: '/itemmaster',
          element:<ItemMaster/>
        },
        {
          path: '/stockmanagement',
          element:<StockMaster/>
        },
        {
          path: '/stockreturns',
          element:<StockReturn/>
        },
        {
          path: '/stock valuation and report',
          element:<InventoryValuationForm/>
        },
        {
          path: '/projectmanagement',
          element:<ProjectManagement/>
        },
        {
          path: '/site execution',
          element:<SiteExecution/>
        },
        {
          path: 'qualitycontrol',
          element:<QualityControl/>
        },
        {
          path: '/safetymanagement',
          element:<SafetyManagement/>
        },
        {
          path: '/materials & inventorymanagement',
          element:<InventoryManagement/>
        },
        {
          path:'/testing',
          element:<Testing/>
        },
        {
          path:'/handoverprocess',
          element:<HandoverProcess/>
        }
      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        }
      ]
    }
  ]
};

export default MainRoutes;
