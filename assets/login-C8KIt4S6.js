import{d as E,e as I,r as s,j as e,b as w,F as b,B as j,N as L,l as P,s as R,f as z}from"./main-Skim5IJC.js";import{F as a,I as i}from"./InputGroup-DZ53-33y.js";import"./ElementChildren-CcOFmZth.js";const B="/EPC/assets/epcbackground1-jUWKVTPy.jpg";function G(){const k=E(),m=I(),[d,y]=s.useState(""),[l,C]=s.useState(""),[g,h]=s.useState(""),[o,x]=s.useState(!1),[F,W]=s.useState(!0),[c,v]=s.useState(!1),[f,u]=s.useState({credential:!1,password:!1}),[n,N]=s.useState({credential:"",password:""}),p=()=>{const r={credential:"",password:""},t=d.replace(/\D/g,"");return t?/^\d{10}$/.test(t)||(r.credential="Enter a valid 10-digit mobile number."):r.credential="Mobile number is required.",l||(r.password="Password is required."),N(r),r},S=async()=>{h(""),u({credential:!0,password:!0});const r=p();if(!(r.credential||r.password)){x(!0);try{const{user:t}=await P(d,l);m(R(t)),m(z(t.isadmin)),alert("Login successful!"),k("/dashboard")}catch{h("Invalid mobile number or password.")}finally{x(!1)}}};return e.jsxs("div",{className:"auth-wrapper",style:{backgroundImage:`url(${B})`,backgroundSize:"cover",backgroundRepeat:"no-repeat",backgroundPosition:"center",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"},children:[e.jsx(w,{style:{maxWidth:"420px",width:"100%",borderRadius:"1rem",boxShadow:"0 20px 40px rgba(0, 0, 0, 0.1)",background:"rgba(255,255,255,0.92)",backdropFilter:"saturate(120%) blur(6px)"},children:e.jsxs(w.Body,{className:"p-4",children:[e.jsxs("div",{className:"text-center mb-4",children:[e.jsx("h4",{className:"mt-3",style:{background:"linear-gradient(90deg, #b388eb, #7267ef, #a174f8)",backgroundSize:"200% auto",color:"transparent",backgroundClip:"text",WebkitBackgroundClip:"text",fontWeight:700,animation:"shimmer 2.5s linear infinite"},children:"WELCOME TO EPC SYNC"}),e.jsx("p",{style:{background:"linear-gradient(90deg, #d1b3ff, #b388eb, #e0c3fc)",backgroundSize:"200% auto",color:"transparent",backgroundClip:"text",WebkitBackgroundClip:"text",fontWeight:500,fontSize:"0.95rem",animation:"shimmer 3s linear infinite"},children:"Engineering, Procurement & Construction"})]}),e.jsxs(a.Group,{className:"mb-3",children:[e.jsx(a.Label,{className:"mb-1 fw-semibold text-muted",children:"Mobile Number (10 digits)"}),e.jsxs(i,{className:"minimal-input",children:[e.jsx(i.Text,{style:{backgroundColor:"transparent",borderRight:"none",borderColor:"rgba(0,0,0,0.08)",color:"#8a8f98"},children:e.jsx(b,{icon:"phone",size:18})}),e.jsx(a.Control,{type:"tel",inputMode:"numeric",pattern:"\\d{10}",maxLength:10,placeholder:"Enter your 10-digit mobile number",value:d,onChange:r=>{const t=r.target.value.replace(/\D/g,"").slice(0,10);y(t)},onBlur:()=>{u(r=>({...r,credential:!0})),p()},isInvalid:f.credential&&!!n.credential,required:!0}),e.jsx(a.Control.Feedback,{type:"invalid",children:n.credential})]})]}),e.jsxs(a.Group,{className:"mb-2",children:[e.jsx(a.Label,{className:"mb-1 fw-semibold text-muted",children:"Password"}),e.jsxs(i,{className:"minimal-input",children:[e.jsx(i.Text,{style:{backgroundColor:"transparent",borderRight:"none",borderColor:"rgba(0,0,0,0.08)",color:"#8a8f98"},children:e.jsx(b,{icon:"lock",size:18})}),e.jsx(a.Control,{type:c?"text":"password",placeholder:"Enter your password",value:l,onChange:r=>C(r.target.value),onBlur:()=>{u(r=>({...r,password:!0})),p()},isInvalid:f.password&&!!n.password,required:!0}),e.jsx(j,{variant:"light",onClick:()=>v(r=>!r),style:{background:"transparent",borderLeft:"none",borderColor:"rgba(0,0,0,0.08)",color:"#6b7280",borderTopLeftRadius:0,borderBottomLeftRadius:0,boxShadow:"none"},title:c?"Hide password":"Show password",tabIndex:-1,children:e.jsx(b,{icon:c?"eye-off":"eye",size:18})}),e.jsx(a.Control.Feedback,{type:"invalid",children:n.password})]})]}),g&&e.jsx("p",{className:"text-danger text-center mb-2",style:{fontSize:"0.9rem"},children:g}),e.jsx(a.Group,{className:"d-flex justify-content-between align-items-center mb-3",children:e.jsx(L,{to:"#",className:"text-muted small",children:"Forgot Password?"})}),e.jsx(j,{className:"w-100 mb-3",style:{background:"#7267ef",border:"none",padding:"0.6rem",fontWeight:600,transition:"transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease",opacity:o?.8:1,cursor:o?"not-allowed":"pointer"},onClick:S,disabled:o,children:o?e.jsxs("span",{children:[e.jsx("span",{className:"spinner-border spinner-border-sm me-2",role:"status","aria-hidden":"true"}),"Signing In..."]}):"Sign In"})]})}),e.jsx("style",{children:`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .auth-wrapper .form-control,
        .auth-wrapper .input-group-text {
          transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
        }
        .auth-wrapper .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(114,103,239,0.15);
          border-color: #7267ef;
        }
        .auth-wrapper .minimal-input .input-group-text {
          background: transparent;
          border-right: none;
          color: #8a8f98;
        }
        .auth-wrapper .minimal-input .form-control {
          border-left: none;
          border-color: rgba(0,0,0,0.08);
        }
        .auth-wrapper .minimal-input .form-control:focus {
          border-left: none;
        }
        .auth-wrapper .minimal-input .btn {
          border-color: rgba(0,0,0,0.08);
        }
        .auth-wrapper .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(114,103,239,0.25);
          background-color: #5f56e6 !important;
        }
        .auth-wrapper .btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 6px 12px rgba(114,103,239,0.2);
        }
        @media (max-width: 480px) {
          .auth-wrapper .card-body { padding: 1.25rem !important; }
        }
      `})]})}export{G as default};
