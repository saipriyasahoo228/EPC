// Menu configuration for default layout
const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'DASHBOARD SECTION',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'dashboard',
          url: '/dashboard'
        }
      ]
    },
    {
      id: 'tender',
      title: 'TENDER MASTER',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'tenderallocation',
          title: 'Tender Allocation',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'assignment',
          children: [
            {
              id: 'tenderdetails',
              title: 'Tender Details Entry',
              type: 'item',
              url: '/tenderdetails'
            },
            {
              id: 'projectcreation',
              title: 'Project Creation',
              type: 'item',
              url: '/projectcreation'
            }
          ]
        }
      ]
    },
    {
      id: 'engineering',
      title: 'ENGINEERING MASTER',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'engineeringmodule',
          title: 'Engineering Module',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'engineering',
          children: [
            {
              id: 'design',
              title: 'Design & Planning',
              type: 'item',
              url: '/design'
            },
            {
              id: 'feasibility',
              title: 'Feasibility Studies',
              type: 'item',
              url: '/feasibilitystudies'
            }
          ]
        }
      ]
    },
    
    {
      id: 'procurment',
      title: 'PROCUREMENT MASTER',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'procurementmodule',
          title: 'Procurement Module',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'shopping_cart',
          children: [
            {
              id: 'vender',
              title: 'Vendor Management',
              type: 'item',
              url: '/vendor details'
            },
            {
              id: 'material',
              title: 'Material Procurement',
              type: 'item',
              url: '/materialprocurement'
            },
            {
              id: 'purchase',
              title: 'Purchase Orders',
              type: 'item',
              url: '/purchaseorder'
            },
            {
              id: 'logistic',
              title: 'Logistic Management',
              type: 'item',
              url: '/logistic'
            }
          ]
        }
      ]
    },
    {
      id: 'inventry',
      title: 'INVENTORY MASTER',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'inventrymanage',
          title: 'Inventory Management',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'storefront',
          children: [
            {
              id: 'item',
              title: 'Item Master',
              type: 'item',
              url: '/itemmaster'
            },
            {
              id: 'stock',
              title: 'Stock Management',
              type: 'item',
              url: '/stockmanagement'
            },
            {
              id: 'stockreturn',
              title: 'Stock Returns & Adjustment',
              type: 'item',
              url: '/stockreturns'
            },
            {
              id: 'valuation',
              title: 'Inventory Valuation & Reporting',
              type: 'item',
              url: '/stock valuation and report'
            }
          ]
        }
      ]
    },
    {
      id: 'construction',
      title: 'CONSTRUCTIONS',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'constructionmodule',
          title: 'Construction Module',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'construction',
          children: [
            {
              id: 'project',
              title: 'Project Management',
              type: 'item',
              url: '/projectmanagement'
            },
            {
              id: 'milestone',
              title: 'Milestones',
              type: 'item',
              url: '/milestone'
            },
            {
              id: 'siteexecution',
              title: 'Site Execution',
              type: 'item',
              url: '/site execution'
            },
            {
              id: 'qualitycontrol',
              title: 'Quality Control & Assurance',
              type: 'item',
              url: '/qualitycontrol'
            },
            {
              id: 'safety',
              title: 'Safety Management',
              type: 'item',
              url: '/safetymanagement'
            },
            {
              id: 'safetyexpense',
              title: 'Safety Expense',
              type: 'item',
              url: '/safetyexpense'
            },
            {
              id: 'otherexpense',
              title: 'Other Expense',
              type: 'item',
              url: '/otherexpense'
            },
            {
              id: 'material',
              title: 'Material & Inventory Management',
              type: 'item',
              url: '/materials & inventorymanagement'
            },
            {
              id: 'labour',
              title: 'Labour Management',
              type: 'item',
              url: '/labourmanagement'
            }
          ]
        }
      ]
    },
    {
      id: 'commission',
      title: 'COMMISSION MANAGEMENT',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'commissionmanage',
          title: 'Commission Management',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'fact_check',
          children: [
            {
              id: 'testing',
              title: 'Testing & Inspection',
              type: 'item',
              url: '/testing'
            },
            {
              id: 'handover',
              title: 'Handover Process',
              type: 'item',
              url: '/handoverprocess'
            },
            {
              id: 'compliance',
              title: 'Compliance & Certification',
              type: 'item',
              url: '/compliance'
            },
            {
              id: 'system',
              title: 'Syatem Integration',
              type: 'item',
              url: '/systemintegration'
            }
          ]
        }
      ]
    },
    {
      id: 'maintenance',
      title: 'MAINTENANCE & MANAGEMENT',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'maintenance',
          title: 'Maintenance Module',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'handyman',
          children: [
            {
              id: 'assets',
              title: 'Assets Management',
              type: 'item',
              url: '/assetsmanagement'
            },
            {
              id: 'scheduling',
              title: 'Maintenance Scheduling',
              type: 'item',
              url: '/asset scheduling'
            },
            {
              id: 'reporting',
              title: 'Maintenance Reporting & Orders',
              type: 'item',
              url: '/maintenance report'
            },
            {
              id: 'check',
              title: 'Safety Check',
              type: 'item',
              url: 'safety'
            }
          ]
        }
      ]
    },
    {
      id: 'account',
      title: 'ACCOUNT MASTER',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'accountmodule',
          title: 'Account Ledger Module',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'account_balance',
          children: [
            {
              id: 'general',
              title: 'General Ledger',
              type: 'item',
              url: '/generalledger'
            },
            {
              id: 'payable',
              title: 'Accounts Payable',
              type: 'item',
              url: '/accountpayble'
            },
            {
              id: 'recievable',
              title: 'Account Recievable',
              type: 'item',
              url: '/account recieve'
            },
            {
              id: 'financial',
              title: 'Financial Report & Auditing',
              type: 'item',
              url: '/financial report'
            }
          ]
        }
      ]
    },
    {
      id: 'accesscontrol',
      title: 'ACCESS CONTROL & USER ROLE',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'accesscontrol',
          title: 'Access Control & User',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'admin_panel_settings',
          children: [
            {
              id: 'guest',
              title: 'Guest Master',
              type: 'item',
              url: '/guest'
            },
            {
              id: 'user',
              title: 'User Master',
              type: 'item',
              url: '/user'
            },
            {
              id: 'access',
              title: 'Access Control',
              type: 'item',
              url: '/accesscontrol'
            }
          ]
        }
      ]
    },
    
  ]
};

export default menuItems;
