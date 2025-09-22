// export default MainRoutes;
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import RequirePermission from 'components/auth/RequirePermission';
import AdminOnly from 'components/auth/AdminOnly';
import React from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { isUserAuthenticated } from '../auth';
import { Outlet } from 'react-router-dom';

// Guard: Block Admin routes for pure Site Supervisor users (role is 'site supervisor' and groups are none or only 'site supervisor').
// If the user is also in any other group (e.g., engineer), do NOT block.
const SiteSupervisorBlocker = ({ children }) => {
  const { user, loading } = usePermissions();
  if (loading) return null;

  const role = (user?.role || '').toString().toLowerCase();
  const rawGroups = Array.isArray(user?.groups) ? user.groups : [];
  const groupNames = rawGroups
    .map(g => (typeof g === 'string' ? g : (g?.name || g?.title || g?.slug || '')))
    .filter(Boolean)
    .map(s => s.toString().toLowerCase());
  console.log(groupNames);
  console.log(rawGroups);

  const hasOtherGroup = groupNames.some(n => n && n !== 'site supervisor');
  const onlySiteSupOrNone = groupNames.length === 0 || !hasOtherGroup;
  const shouldBlock = role === 'site supervisor' && onlySiteSupOrNone;

  if (shouldBlock) {
    return <Navigate to="/site-exec-sup" replace />;
  }
  return <>{children}</>;
};

// Auth-only wrapper: if not authenticated, redirect to /login. Otherwise render children.
const AuthOnly = ({ children }) => {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Access guard for Site Execution Supervisor page:
// - Must be authenticated
// - AND (role is 'site supervisor' OR groups include 'site supervisor' OR is_admin=true)
const CanAccessSiteExec = ({ children }) => {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const { user, loading } = usePermissions();
  if (loading) return null;
  const role = (user?.role || '').toString().toLowerCase();
  const isAdmin = Boolean(user?.is_admin);
  const rawGroups = Array.isArray(user?.groups) ? user.groups : [];
  const groupNames = rawGroups
    .map(g => (typeof g === 'string' ? g : (g?.name || g?.title || g?.slug || '')))
    .filter(Boolean)
    .map(s => s.toString().toLowerCase());
  const inSupervisorGroup = groupNames.includes('site supervisor');
  const isSupervisorRole = role === 'site supervisor';
  const allowed = isAdmin || isSupervisorRole || inSupervisorGroup;
  if (!allowed) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const DashboardSales = lazy(() => import('../views/dashboard/EpcDashboard'));
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
const Milestone = lazy(()=>import('../views/constructionmodule/milestone.jsx'));
const SiteExecution = lazy(()=>import('../views/constructionmodule/siteexecution.jsx'));
const SiteExecutionSupervisor = lazy(()=>import('../views/constructionmodule/siteexecutionsupervisor.jsx'));
const QualityControl = lazy(()=>import('../views/constructionmodule/qualitycontrol.jsx'));
const SafetyManagement = lazy(() =>import('../views/constructionmodule/safetymanagement.jsx'));
const SafetyExpense = lazy(() =>import('../views/constructionmodule/safetyexpense.jsx'));
const InventoryManagement = lazy(()=>import('../views/constructionmodule/inventorymanagement.jsx'));
const Testing = lazy(()=>import('../views/commisioningmodule/testing.jsx'));
const HandoverProcess = lazy(()=>import('../views/commisioningmodule/handoverprocess.jsx'));
const ComplianceForm = lazy(()=>import('../views/commisioningmodule/compliance.jsx'));
const SystemIntegration = lazy(()=>import('../views/commisioningmodule/systemintegration.jsx'));
const AssetManagement = lazy(()=>import('../views/maintenancemodule/assetmanagement.jsx'));
const AccountLedger = lazy(()=>import('../views/accountledgermodule/generalledger.jsx'));
const Acoountpayble = lazy(()=>import('../views/accountledgermodule/accountpayble.jsx'));
const AccountsReceivable = lazy(()=>import('../views/accountledgermodule/accountrecievable.jsx'));
const FinancialReports = lazy(()=>import('../views/accountledgermodule/financialreport.jsx'));
const AssetScheduling = lazy(()=>import('../views/maintenancemodule/maintenancescheduling.jsx'));
const MaintenanceReport = lazy(()=>import('../views/maintenancemodule/maintenancereport.jsx'));
const SafetyCheck  = lazy(()=>import('../views/maintenancemodule/safetycheck.jsx'));
const UserRole = lazy(()=>import('../views/accesscontroluserrole/user.jsx'));
const UserRoleAccessControl = lazy(()=>import('../views/accesscontroluserrole/access.jsx'));
const GuestForm = lazy(()=>import('../views/accesscontroluserrole/guest.jsx'));
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
    // Public/guest page for Site Execution Supervisor (no AdminLayout). Clean path + legacy redirect.
    {
      path: '/site-exec-sup',
      element: <GuestLayout />,
      children: [
        {
          path: '/site-exec-sup',
          element: (
            <CanAccessSiteExec>
              <SiteExecutionSupervisor />
            </CanAccessSiteExec>
          ),
        }
      ]
    },
    // Legacy path with spaces -> redirect to clean path
    { path: '/site execution supervisor', element: <Navigate to="/site-exec-sup" replace /> },
    {
      path: '/',
      element: (
        <SiteSupervisorBlocker>
          <AdminLayout />
        </SiteSupervisorBlocker>
      ),
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
          element: (
            <RequirePermission slug="engineering" action="can_read">
              <DesignForm />
            </RequirePermission>
          )
        },

        {
          path: '/feasibilitystudies',
          element:(
            <RequirePermission slug="engineering" action="can_read">
              <FeasibilityForm />
            </RequirePermission>
          )
        },
        {
          path: '/vendor details',
          element: (
            <RequirePermission slug="procurement" action="can_read">
              <VendorForm />
            </RequirePermission>
          )
        },
        {
          path: '/materialprocurement',
          element: (
            <RequirePermission slug="procurement" action="can_read">
              <MaterialForm />
            </RequirePermission>
          )
        },
        {
          path: '/purchaseorder',
          element: (
            <RequirePermission slug="procurement" action="can_read">
              <PurchaseOrder />
            </RequirePermission>
          )
        },
        {
          path: '/logistic',
          element: (
            <RequirePermission slug="procurement" action="can_read">
              <LogisticForm />
            </RequirePermission>
          )
        },
        {
          path: '/itemmaster',
          element:(
            <RequirePermission slug="inventory" action="can_read">
              <ItemMaster/>
            </RequirePermission>
          )
        },
        {
          path: '/stockmanagement',
          element:(
            <RequirePermission slug="inventory" action="can_read">
              <StockMaster/>
            </RequirePermission>
          )
        },
        {
          path: '/stockreturns',
          element:(
            <RequirePermission slug="inventory" action="can_read">
              <StockReturn/>
            </RequirePermission>
          )
        },
        {
          path: '/stock valuation and report',
          element:(
            <RequirePermission slug="inventory" action="can_read">
              <InventoryValuationForm/>
            </RequirePermission>
          )
        },
        {
          path: '/projectmanagement',
          element:(
            <RequirePermission slug="construction" action="can_read">
              <ProjectManagement/>
            </RequirePermission>
          )
        },
        {
          path: '/milestone',
          element:(
            <RequirePermission slug="construction" action="can_read">
              <Milestone/>
            </RequirePermission>
          )
        },
        {
          path: '/site execution',
          element:(
            <RequirePermission slug="construction" action="can_read">
              <SiteExecution/>
            </RequirePermission>
          )
        },
        {
          path: 'qualitycontrol',
          element:(
            <RequirePermission slug="construction" action="can_read">
              <QualityControl/>
            </RequirePermission>
          )
        },
        {
          path: '/safetymanagement',
          element:(
            <RequirePermission slug="construction" action="can_read">
              <SafetyManagement/>
            </RequirePermission>
          )
        },
        {
          path: '/safetyexpense',
          element:(
            <RequirePermission slug="construction" action="can_read">
              <SafetyExpense/>
            </RequirePermission>
          )
        },
        {
          path: '/materials & inventorymanagement',
          element:(
            <RequirePermission slug="construction" action="can_read">
              <InventoryManagement/>
            </RequirePermission>
          )
        },
        {
          path:'/testing',
          element:(
            <RequirePermission slug="commissioning" action="can_read">
              <Testing/>
            </RequirePermission>
          )
        },
        {
          path:'/handoverprocess',
          element:(
            <RequirePermission slug="commissioning" action="can_read">
              <HandoverProcess/>
            </RequirePermission>
          )
        },
        {
          path:'/compliance',
          element:(
            <RequirePermission slug="commissioning" action="can_read">
              <ComplianceForm/>
            </RequirePermission>
          )
        },
        {
          path: '/systemintegration',
          element:(
            <RequirePermission slug="commissioning" action="can_read">
              <SystemIntegration/>
            </RequirePermission>
          )
        },
        {
          path: '/assetsmanagement',
          element:(
            <RequirePermission slug="maintenance" action="can_read">
              <AssetManagement/>
            </RequirePermission>
          )
        },
        {
          path: '/generalledger',
          element:(
            <RequirePermission slug="account_ledger" action="can_read">
              <AccountLedger/>
            </RequirePermission>
          )
        },
        {
          path: '/accountpayble',
          element:(
            <RequirePermission slug="account_ledger" action="can_read">
              <Acoountpayble/>
            </RequirePermission>
          )
        },
        {
          path: '/account recieve',
          element: (
            <RequirePermission slug="account_ledger" action="can_read">
              <AccountsReceivable/>
            </RequirePermission>
          )
        },
        {
          path: '/financial report',
          element:(
            <RequirePermission slug="account_ledger" action="can_read">
              <FinancialReports/>
            </RequirePermission>
          )
        },
        {
          path: '/asset scheduling',
          element:(
            <RequirePermission slug="maintenance" action="can_read">
              <AssetScheduling/>
            </RequirePermission>
          )
        },
        {
          path: '/maintenance report',
          element:(
            <RequirePermission slug="maintenance" action="can_read">
              <MaintenanceReport/>
            </RequirePermission>
          )
        },
        {
          path: '/safety',
          element:(
            <RequirePermission slug="maintenance" action="can_read">
              <SafetyCheck/>
            </RequirePermission>
          )
        },
        {
          path:'/user',
          element:(
            <AdminOnly>
                <UserRole/>
            </AdminOnly>
          )
        },
        {
          path:'/accesscontrol',
          element:(
            <AdminOnly>
                <UserRoleAccessControl/>
            </AdminOnly>
          )
        },
        {
          path: '/guest',
          element: (<GuestForm />),
        }
      ]
    },
    // {
    //   path: '/guest',
    //   element: <GuestForm />,
    //   children: [
    //     {
    //       path: '/login',
    //       element: <Login />
    //     },
    //     {
    //       path: '/register',
    //       element: <Register />
    //     }
    //   ]
    // }
  ]
};

export default MainRoutes;
