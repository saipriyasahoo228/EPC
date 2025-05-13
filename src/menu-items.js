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
          iconname: 'home',
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
          iconname: 'home',
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
          iconname: 'history_edu',
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
          iconname: 'history_edu',
          children: [
            {
              id: 'general',
              title: 'General Ledger',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'payable',
              title: 'Accounts Payable',
              type: 'item',
              url: '/icons/font-awesome-5'
            },
            {
              id: 'recievable',
              title: 'Account Recievable',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'financial',
              title: 'Financial Report & Auditing',
              type: 'item',
              url: '/icons/font-awesome-5'
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
          iconname: 'history_edu',
          children: [
            {
              id: 'vender',
              title: 'Vender Managment',
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
      title: 'INVENTRY MASTER',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'inventrymanage',
          title: 'Inventry Management',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'history_edu',
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
              url: '/icons/Feather'
            },
            {
              id: 'valuation',
              title: 'Inventry Valuation & Reporting',
              type: 'item',
              url: '/icons/font-awesome-5'
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
          iconname: 'history_edu',
          children: [
            {
              id: 'project',
              title: 'Project Management',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'siteexecution',
              title: 'Site Execution',
              type: 'item',
              url: '/icons/font-awesome-5'
            },
            {
              id: 'qualitycontrol',
              title: 'Quality Control & Assurance',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'safety',
              title: 'Safety Management',
              type: 'item',
              url: '/icons/font-awesome-5'
            },
            {
              id: 'material',
              title: 'Material & Inventry Management',
              type: 'item',
              url: '/icons/font-awesome-5'
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
          iconname: 'history_edu',
          children: [
            {
              id: 'testing',
              title: 'Testing & Inspection',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'handover',
              title: 'Handover Process',
              type: 'item',
              url: '/icons/font-awesome-5'
            },
            {
              id: 'compliance',
              title: 'Compliance & Certification',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'system',
              title: 'Syatem Integration',
              type: 'item',
              url: '/icons/font-awesome-5'
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
          iconname: 'history_edu',
          children: [
            {
              id: 'assets',
              title: 'Assets Management',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'scheduling',
              title: 'Maintenance Scheduling',
              type: 'item',
              url: '/icons/font-awesome-5'
            },
            {
              id: 'reporting',
              title: 'Maintenance Reporting & Orders',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'check',
              title: 'Safety Check',
              type: 'item',
              url: '/icons/font-awesome-5'
            }
          ]
        }
      ]
    },
    // {
    //   id: 'pages',
    //   title: 'Pages',
    //   subtitle: '15+ Redymade Pages',
    //   type: 'group',
    //   icon: 'icon-pages',
    //   children: [
    //     {
    //       id: 'login',
    //       title: 'Login',
    //       type: 'item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'verified_user',
    //       url: '/login',
    //       target: true
    //     },
    //     {
    //       id: 'register',
    //       title: 'Register',
    //       type: 'item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'person_add_alt_1',
    //       url: '/register',
    //       target: true
    //     }
    //   ]
    // },
    // {
    //   id: 'support',
    //   title: 'OTHER',
    //   subtitle: 'Extra More Things',
    //   type: 'group',
    //   icon: 'icon-support',
    //   children: [
    //     {
    //       id: 'sample-page',
    //       title: 'Sample Page',
    //       type: 'item',
    //       url: '/sample-page',
    //       classes: 'nav-item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'storefront'
    //     },
    //     {
    //       id: 'menu-level',
    //       title: 'Menu Levels',
    //       type: 'collapse',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'list_alt',
    //       children: [
    //         {
    //           id: 'menu-level-1.1',
    //           title: 'Level 1.1',
    //           type: 'item',
    //           url: '#'
    //         },
    //         {
    //           id: 'menu-level-1.2',
    //           title: 'Level 2.2',
    //           type: 'collapse',
    //           children: [
    //             {
    //               id: 'menu-level-2.1',
    //               title: 'Level 2.1',
    //               type: 'item',
    //               url: '#'
    //             },
    //             {
    //               id: 'menu-level-2.2',
    //               title: 'Level 2.2',
    //               type: 'collapse',
    //               children: [
    //                 {
    //                   id: 'menu-level-3.1',
    //                   title: 'Level 3.1',
    //                   type: 'item',
    //                   url: '#'
    //                 },
    //                 {
    //                   id: 'menu-level-3.2',
    //                   title: 'Level 3.2',
    //                   type: 'item',
    //                   url: '#'
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       id: 'disabled-menu',
    //       title: 'Disabled Menu',
    //       type: 'item',
    //       url: '#',
    //       classes: 'nav-item disabled',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'power_off'
    //     }
    //   ]
    // }
  ]
};

export default menuItems;
