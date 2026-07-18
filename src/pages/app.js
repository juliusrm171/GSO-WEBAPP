import { getCustomers, upsertCustomer, deleteCustomer, getProducts, upsertProduct, deleteProduct, getQuotations, saveQuotation, updateQuotationStatus, getProfiles, updateProfile, getSession, getVisits, addVisit, deleteVisit, getSetting, setSetting, getContacts, addContact, deleteContact, updateContact } from '../lib/supabase.js'
import { PL_CATS, PL_ITEMS } from '../lib/pricelist.js'
import { generatePDF } from '../lib/pdf.js'

const CSS = `<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',system-ui,sans-serif;background:#f0f3f8;color:#1e293b;font-size:13px;}
nav{background:#002060;display:flex;align-items:stretch;padding:0 1rem;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(0,32,96,.3);}
.nlogo{display:flex;align-items:center;gap:8px;padding:.6rem .5rem;margin-right:1.25rem;font-weight:600;font-size:12.5px;color:#fff;white-space:nowrap;letter-spacing:.01em;}
.nlogo-img{width:24px;height:24px;object-fit:contain;flex-shrink:0;background:#fff;border-radius:50%;padding:3px;}
.ntab{padding:.65rem 1rem;color:rgba(255,255,255,.6);cursor:pointer;font-size:12px;border-bottom:2px solid transparent;display:flex;align-items:center;gap:5px;user-select:none;transition:color .1s;}
.ntab:hover{color:#fff;background:rgba(255,255,255,.07);}
.ntab.on{color:#fff;border-bottom-color:#60a5fa;font-weight:500;}
.nright{margin-left:auto;display:flex;align-items:center;gap:10px;padding:.5rem 0;}
.user-info{color:rgba(255,255,255,.75);font-size:11px;}
.btn-logout{padding:4px 11px;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.8);background:none;border-radius:6px;cursor:pointer;font-size:11px;}
.btn-logout:hover{background:rgba(255,255,255,.1);}
.page{display:none;max-width:1100px;margin:0 auto;padding:1.25rem 1rem 2rem;}
.page.on{display:block;}
.ptabs{display:flex;border-bottom:1px solid #e2e8f0;margin-bottom:1rem;}
.ptab{padding:.55rem 1rem;font-size:12px;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;}
.ptab:hover{color:#1e293b;}
.ptab.on{color:#002060;border-bottom-color:#002060;font-weight:500;}
.card{background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:1rem 1.15rem;margin-bottom:.9rem;}
.chd{font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.7rem;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}
.fld{display:flex;flex-direction:column;gap:3px;}
.fld label{font-size:11px;color:#64748b;font-weight:500;}
.fld input,.fld select,.fld textarea{padding:7px 10px;border:1px solid #e2e8f0;border-radius:7px;background:#fff;color:#1e293b;font-size:12px;font-family:inherit;transition:border .15s;}
.fld input[type=number]::-webkit-inner-spin-button,.fld input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
.fld input[type=number]{-moz-appearance:textfield;}
.fld textarea{resize:vertical;min-height:52px;line-height:1.45;}
.fld input:focus,.fld select:focus,.fld textarea:focus{outline:none;border-color:#002060;box-shadow:0 0 0 3px rgba(0,32,96,.08);}
.bp{padding:8px 16px;background:#002060;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:12px;font-weight:500;display:inline-flex;align-items:center;gap:5px;}
.bp:hover{background:#001548;}
.bp:disabled{background:#94a3b8;cursor:not-allowed;}
.bs{padding:7px 13px;background:#fff;color:#1e293b;border:1px solid #e2e8f0;border-radius:7px;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:5px;}
.bs:hover{background:#f8fafc;}
.bxs{padding:3px 9px;font-size:11px;border:1px solid #93c5fd;color:#1d4ed8;border-radius:5px;background:#fff;cursor:pointer;}
.bxs:hover{background:#eff6ff;}
.bdel{background:none;border:none;cursor:pointer;color:#cbd5e1;padding:3px 5px;border-radius:4px;font-size:14px;}
.bdel:hover{color:#ef4444;background:#fef2f2;}
.abar{display:flex;gap:7px;margin-top:.9rem;flex-wrap:wrap;}
.itbl{width:100%;border-collapse:collapse;font-size:12px;}
.itbl th{background:#002060;color:#fff;padding:7px 6px;text-align:left;font-size:10px;white-space:nowrap;}
.itbl th.r{text-align:right;}
.itbl td{padding:3px 2px;border-bottom:1px solid #f1f5f9;vertical-align:top;}
.itbl td input,.itbl td textarea{width:100%;padding:4px 5px;border:1px solid transparent;border-radius:4px;background:transparent;color:#1e293b;font-size:12px;font-family:inherit;}
.itbl td input[type=number]::-webkit-inner-spin-button,.itbl td input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
.itbl td input[type=number]{-moz-appearance:textfield;}
.itbl td textarea{resize:none;min-height:30px;line-height:1.35;}
.itbl td input:focus,.itbl td textarea:focus{border-color:#93c5fd;background:#eff6ff;outline:none;}
.itbl tr.sub td{background:#f8fafc;}
.addr{display:flex;align-items:center;gap:5px;padding:5px 9px;border:1px dashed #e2e8f0;border-radius:7px;background:none;cursor:pointer;color:#64748b;font-size:12px;margin-top:5px;}
.addr:hover{background:#f8fafc;}
.srow{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#64748b;border-bottom:1px solid #f1f5f9;}
.srow:last-child{border:none;font-weight:600;font-size:15px;color:#002060;padding-top:9px;}
.prev{background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-size:10px;color:#1e293b;}
.prev-hd2{display:flex;align-items:flex-start;gap:14px;padding:16px 18px 8px;border-bottom:none;}
.prev-logo{width:130px;height:auto;flex-shrink:0;object-fit:contain;}
.prev-hd2-addr{text-align:right;flex:1;font-size:9px;color:#444;line-height:1.5;padding-top:2px;}
.prev-hd2-name{font-size:14px;font-weight:700;color:#000;margin-bottom:2px;}
.prev-bd{padding:6px 18px 18px;}
.prev-title{text-align:center;font-size:17px;font-weight:700;letter-spacing:.04em;color:#000;margin-bottom:10px;}
.prev-boxes{display:flex;align-items:flex-start;gap:14px;margin-bottom:10px;}
.prev-box-left{flex:1.4;border:1px solid #002060;}
.prev-box-right{flex:1;border:1px solid #002060;display:flex;flex-direction:column;}
.pbl-to-section{padding:6px 8px 10px;}
.pbl-to-lbl{font-size:10px;text-decoration:underline;color:#1e293b;margin-bottom:4px;}
.pbl-company{font-weight:700;font-size:11px;color:#000;margin-bottom:3px;}
.pbl-addr{font-size:9.5px;color:#333;line-height:1.5;min-height:14px;}
.pbl-row{display:flex;padding:5px 8px;font-size:10px;gap:6px;}
.pbl-lbl{color:#1e293b;flex-shrink:0;min-width:75px;text-decoration:underline;}
.pbl-val{font-weight:600;color:#000;}
.pbl-sep{border-top:1px solid #002060;}
.pbr-row{display:flex;align-items:center;padding:5px 8px;font-size:9.5px;border-bottom:1px solid #002060;flex:1;}
.pbr-gap-after{padding-bottom:14px;}
.pbr-row:last-child{border-bottom:none;}
.pbr-lbl{color:#1e293b;min-width:75px;flex-shrink:0;}
.pbr-val{font-weight:600;color:#000;}
.prev-bottom{display:flex;justify-content:space-between;gap:14px;margin-top:8px;align-items:flex-start;}
.prev-notes{font-size:9px;color:#333;line-height:1.6;flex:1;}
.prev-notes b{display:block;margin-bottom:3px;color:#000;}
.prev-tagline{text-align:center;margin-top:18px;}
.pt-name{font-weight:700;font-style:italic;color:#002060;font-size:11px;}
.pt-slogan{font-weight:700;font-style:italic;color:#dc2626;font-size:11px;}
.ptbl{width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:8px;border:1px solid #002060;}
.ptbl th{background:#002060;color:#fff;padding:5px 6px;text-align:left;border:1px solid rgba(255,255,255,.3);}
.ptbl th.r{text-align:right;}
.ptbl td{padding:5px 6px;border:1px solid #94a3b8;min-height:18px;}
.ptbl td.r{text-align:right;}
.ptbl tr.grp td{font-weight:600;background:#f0f3f8;text-align:center;}
.ptbl tr.sub td{color:#666;background:#fafafa;}
.ptot{min-width:200px;}
.ptot table{width:100%;font-size:10px;border:1px solid #002060;}
.ptot td{padding:4px 8px;border-bottom:1px solid #002060;}
.ptot tr:last-child td{border-bottom:none;}
.ptot td:last-child{text-align:right;font-weight:500;}
.ptot tr.grd{background:#f0f0f5;font-weight:700;}
.ptot tr.grd td{font-size:11px;color:#000;}
.pl-bar{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:.65rem;}
.pl-bar input[type=text]{flex:1;min-width:160px;padding:7px 10px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;}
.pl-bar input:focus{outline:none;border-color:#002060;}
.pl-bar select{padding:7px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;}
.pills{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:.65rem;}
.pill{padding:3px 10px;border:1px solid #e2e8f0;border-radius:10px;font-size:11px;cursor:pointer;color:#64748b;background:#fff;}
.pill.on{background:#002060;color:#fff;border-color:#002060;}
.pill:hover:not(.on){background:#f8fafc;}
.pltbl{width:100%;border-collapse:collapse;font-size:12px;}
.pltbl th{background:#002060;color:#fff;padding:7px 9px;text-align:left;font-size:10px;white-space:nowrap;}
.pltbl th.r{text-align:right;}
.pltbl td{padding:6px 9px;border-bottom:1px solid #f1f5f9;vertical-align:middle;}
.pltbl tr:hover td{background:#f8faff;}
.badge{display:inline-block;padding:1px 7px;border-radius:8px;font-size:10px;background:#dbeafe;color:#1e40af;}
.badge-pt{background:#dbeafe;color:#1e40af;}
.badge-eu{background:#fce7f3;color:#9d174d;}
.pc{text-align:right;font-weight:600;color:#002060;white-space:nowrap;}
.tblwrap{overflow-x:auto;max-height:420px;overflow-y:auto;border-radius:8px;border:1px solid #e2e8f0;}
.pg{display:flex;gap:5px;margin-top:.65rem;justify-content:center;align-items:center;font-size:12px;}
.pg button{padding:4px 12px;border:1px solid #e2e8f0;border-radius:5px;background:#fff;cursor:pointer;font-size:11px;}
.pg button:hover{background:#f8fafc;}
.sg{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:.9rem;}
.sc{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:.7rem .9rem;text-align:center;}
.sn{font-size:20px;font-weight:600;color:#002060;}
.sl{font-size:10px;color:#64748b;}
.sv{font-size:10px;color:#94a3b8;margin-top:1px;}
.piptbl{width:100%;border-collapse:collapse;font-size:11px;}
.piptbl th{background:#002060;color:#fff;padding:7px 8px;text-align:left;font-size:10px;white-space:nowrap;}
.piptbl td{padding:5px 8px;border-bottom:1px solid #f1f5f9;vertical-align:middle;}
.piptbl tr:hover td{background:#f8faff;}
.piptbl select{padding:3px 5px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;}
.bopen{background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:7px;font-size:10px;font-weight:500;}
.bnego{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:7px;font-size:10px;font-weight:500;}
.bhold{background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:7px;font-size:10px;font-weight:500;}
.bwon{background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:7px;font-size:10px;font-weight:500;}
.blost{background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:7px;font-size:10px;font-weight:500;}
.dbi{display:flex;align-items:center;justify-content:space-between;padding:8px 11px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;margin-bottom:5px;}
.dn{font-size:12px;font-weight:500;}
.dm{font-size:11px;color:#94a3b8;margin-top:1px;}
.ac{position:relative;}
.acdrop{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:8px;z-index:30;max-height:200px;overflow-y:auto;display:none;box-shadow:0 8px 24px rgba(0,0,0,.1);}
.acit{padding:8px 11px;cursor:pointer;font-size:12px;border-bottom:1px solid #f1f5f9;}
.acit:hover{background:#eff6ff;}
.acsub{font-size:10px;color:#94a3b8;}
.toast{position:fixed;bottom:20px;right:20px;background:#fff;border-left:4px solid #22c55e;border-radius:10px;padding:10px 16px;font-size:12px;z-index:200;box-shadow:0 4px 20px rgba(0,0,0,.12);max-width:320px;display:none;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:none;align-items:center;justify-content:center;}
.modal-overlay.on{display:flex;}
.modal{background:#fff;border-radius:14px;width:700px;max-width:95vw;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.2);}
.modal-hd{background:#002060;color:#fff;padding:.9rem 1.2rem;display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:500;}
.modal-bd{padding:1rem;overflow-y:auto;flex:1;}
.prrow{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:.65rem;}
.prrow input{width:125px;padding:7px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;}
.dtabs{display:flex;gap:0;border-bottom:1px solid #e2e8f0;margin-bottom:1rem;}
.dtab{padding:.5rem 1rem;font-size:12px;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;}
.dtab:hover{color:#1e293b;}
.dtab.on{color:#002060;border-bottom-color:#002060;font-weight:500;}
.filter-bar{display:flex;gap:7px;margin-bottom:.75rem;flex-wrap:wrap;align-items:center;}
.filter-bar input{flex:1;padding:7px 10px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;}
.filter-bar select{padding:7px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;}
.add-form{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:1rem;margin-bottom:1rem;display:none;}
.type-toggle{display:flex;gap:6px;margin-bottom:.75rem;}
.type-btn{padding:6px 14px;border:1px solid #e2e8f0;border-radius:20px;font-size:12px;cursor:pointer;background:#fff;color:#64748b;}
.type-btn.on{background:#002060;color:#fff;border-color:#002060;}
.spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.empty{text-align:center;padding:2rem;color:#94a3b8;font-size:12px;}
.my-badge{background:#fef3c7;color:#92400e;padding:1px 7px;border-radius:6px;font-size:10px;font-weight:500;margin-left:4px;}

/* DASHBOARD */
.db-greet{font-size:18px;font-weight:600;color:#1e293b;margin-bottom:1rem;}
.db-greet span{color:#002060;}
.dash-grid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem;}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.bar-label{width:90px;font-size:11px;color:#64748b;flex-shrink:0;}
.bar-track{flex:1;height:18px;background:#f1f5f9;border-radius:9px;overflow:hidden;position:relative;}
.bar-fill{height:100%;border-radius:9px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:9px;color:#fff;font-weight:600;white-space:nowrap;transition:width .4s;}
.bar-val{width:70px;text-align:right;font-size:11px;font-weight:600;color:#002060;flex-shrink:0;}
.lb-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;}
.lb-row:last-child{border:none;}
.lb-rank{width:22px;height:22px;border-radius:50%;background:#f1f5f9;color:#64748b;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.lb-rank.r1{background:#fef3c7;color:#92400e;}
.lb-rank.r2{background:#e2e8f0;color:#475569;}
.lb-rank.r3{background:#fed7aa;color:#9a3412;}
.lb-info{flex:1;min-width:0;}
.lb-name{font-size:12px;font-weight:600;color:#1e293b;}
.lb-sub{font-size:10px;color:#94a3b8;}
.lb-val{font-size:12px;font-weight:700;color:#002060;text-align:right;white-space:nowrap;}
.tc-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9;}
.tc-row:last-child{border:none;}
.tc-name{font-size:12px;font-weight:500;color:#1e293b;}
.tc-sub{font-size:10px;color:#94a3b8;}
.tc-val{font-size:12px;font-weight:600;color:#002060;}
.cb-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;}
.recent-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;}
.recent-row:last-child{border:none;}
.recent-info{flex:1;min-width:0;}
.recent-no{font-size:11px;font-weight:600;color:#1e293b;}
.recent-meta{font-size:10px;color:#94a3b8;}
.recent-val{font-size:12px;font-weight:600;color:#002060;white-space:nowrap;}

/* VISIT */
.vm-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.vm-name{width:130px;font-size:12px;font-weight:600;color:#1e293b;flex-shrink:0;}
.vm-track{flex:1;height:20px;background:#f1f5f9;border-radius:10px;overflow:hidden;position:relative;}
.vm-fill{height:100%;border-radius:10px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;font-size:10px;color:#fff;font-weight:600;transition:width .4s;}
.vm-stat{width:120px;text-align:right;font-size:11px;flex-shrink:0;}
.vm-badge{padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;}
.vm-badge.ontrack{background:#dcfce7;color:#16a34a;}
.vm-badge.behind{background:#fee2e2;color:#dc2626;}
.visit-row{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid #f1f5f9;}
.visit-row:last-child{border:none;}
.visit-date{width:75px;font-size:11px;color:#64748b;flex-shrink:0;padding-top:1px;}
.visit-info{flex:1;min-width:0;}
.visit-cust{font-size:12px;font-weight:600;color:#1e293b;}
.visit-meta{font-size:10.5px;color:#94a3b8;margin-top:1px;}
.visit-notes{font-size:11px;color:#475569;margin-top:3px;}
.v-acitem{padding:7px 10px;font-size:12px;cursor:pointer;border-bottom:1px solid #f8fafc;}
.v-acitem:hover{background:#eff6ff;}
.part-drop{position:fixed;min-width:340px;max-width:90vw;background:#fff;border:1px solid #e2e8f0;border-radius:8px;max-height:220px;overflow-y:auto;z-index:500;box-shadow:0 8px 20px rgba(0,0,0,.12);}
.part-item{padding:6px 10px;font-size:11px;cursor:pointer;border-bottom:1px solid #f8fafc;}
.part-item:hover{background:#eff6ff;}
.part-item b{display:block;font-size:11.5px;color:#002060;}
.part-item span{color:#64748b;font-size:10.5px;}
.role-badge{display:inline-block;background:rgba(255,255,255,.18);color:#fff;font-size:9.5px;font-weight:600;padding:2px 8px;border-radius:8px;margin-left:6px;letter-spacing:.3px;}

/* RESPONSIVE - MOBILE */
@media (max-width: 768px){
  body{font-size:12px;}
  nav{padding:0 .5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap;}
  nav::-webkit-scrollbar{display:none;}
  .nlogo{margin-right:.5rem;font-size:12px;padding:.5rem .3rem;}
  .nlogo-img{width:18px;height:18px;padding:2px;}
  .ntab{padding:.55rem .6rem;font-size:11px;flex-shrink:0;}
  .nright{margin-left:.5rem;flex-shrink:0;}
  .user-info{display:none;}
  .page{padding:.75rem .5rem 1.5rem;max-width:100%;}
  .ptabs{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .card{padding:.8rem .85rem;border-radius:10px;}
  .g2,.g3,.g4{grid-template-columns:1fr;gap:8px;}
  .dash-grid{grid-template-columns:1fr;}
  .db-greet{font-size:15px;}
  .bar-label{width:65px;font-size:10px;}
  .fld input,.fld select,.fld textarea{font-size:14px;padding:8px 10px;}
  .bp,.bs{font-size:13px;padding:9px 14px;width:100%;justify-content:center;}
  .abar{flex-direction:column;}
  .abar .bp,.abar .bs{width:100%;}
  .itbl{font-size:11px;}
  .itbl th,.itbl td{padding:4px 3px;}
  .tblwrap{max-height:360px;}
  .sg{grid-template-columns:repeat(2,1fr);gap:6px;}
  .sc{padding:.55rem .6rem;}
  .sn{font-size:16px;}
  .pl-bar{flex-direction:column;align-items:stretch;}
  .pl-bar input[type=text],.pl-bar select{width:100%;}
  .pills{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap;padding-bottom:4px;}
  .pill{flex-shrink:0;}
  .prrow{flex-direction:column;align-items:stretch;}
  .prrow input{width:100%;}
  .modal{width:96vw;max-height:92vh;}
  .modal-bd{padding:.75rem;}
  .dtabs{overflow-x:auto;}
  .filter-bar{flex-direction:column;align-items:stretch;}
  .filter-bar input,.filter-bar select{width:100%;}
  .type-toggle{flex-direction:column;}
  .type-btn{width:100%;text-align:center;}
  .dbi{flex-direction:column;align-items:flex-start;gap:8px;}
  .dbi > div:last-child{width:100%;display:flex;gap:6px;}
  .dbi > div:last-child .bxs{flex:1;text-align:center;}
  .piptbl{font-size:10px;}
  .piptbl th,.piptbl td{padding:4px 5px;}
  .pltbl{font-size:11px;}
  .pltbl td{padding:5px 6px;}
  .ac .acdrop{max-height:160px;}
  .prev{font-size:9px;}
  .ptbl{font-size:8.5px;}
}
@media (max-width: 480px){
  .sg{grid-template-columns:repeat(2,1fr);}
}
</style>`

const FULL_LOGO_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAlgAAADlCAYAAACPrYleAAAKMWlDQ1BJQ0MgUHJvZmlsZQAAeJydlndUU9kWh8+9N71QkhCKlNBraFICSA29SJEuKjEJEErAkAAiNkRUcERRkaYIMijggKNDkbEiioUBUbHrBBlE1HFwFBuWSWStGd+8ee/Nm98f935rn73P3Wfvfda6AJD8gwXCTFgJgAyhWBTh58WIjYtnYAcBDPAAA2wA4HCzs0IW+EYCmQJ82IxsmRP4F726DiD5+yrTP4zBAP+flLlZIjEAUJiM5/L42VwZF8k4PVecJbdPyZi2NE3OMErOIlmCMlaTc/IsW3z2mWUPOfMyhDwZy3PO4mXw5Nwn4405Er6MkWAZF+cI+LkyviZjg3RJhkDGb+SxGXxONgAoktwu5nNTZGwtY5IoMoIt43kA4EjJX/DSL1jMzxPLD8XOzFouEiSniBkmXFOGjZMTi+HPz03ni8XMMA43jSPiMdiZGVkc4XIAZs/8WRR5bRmyIjvYODk4MG0tbb4o1H9d/JuS93aWXoR/7hlEH/jD9ld+mQ0AsKZltdn6h21pFQBd6wFQu/2HzWAvAIqyvnUOfXEeunxeUsTiLGcrq9zcXEsBn2spL+jv+p8Of0NffM9Svt3v5WF485M4knQxQ143bmZ6pkTEyM7icPkM5p+H+B8H/nUeFhH8JL6IL5RFRMumTCBMlrVbyBOIBZlChkD4n5r4D8P+pNm5lona+BHQllgCpSEaQH4eACgqESAJe2Qr0O99C8ZHA/nNi9GZmJ37z4L+fVe4TP7IFiR/jmNHRDK4ElHO7Jr8WgI0IABFQAPqQBvoAxPABLbAEbgAD+ADAkEoiARxYDHgghSQAUQgFxSAtaAYlIKtYCeoBnWgETSDNnAYdIFj4DQ4By6By2AE3AFSMA6egCnwCsxAEISFyBAVUod0IEPIHLKFWJAb5AMFQxFQHJQIJUNCSAIVQOugUqgcqobqoWboW+godBq6AA1Dt6BRaBL6FXoHIzAJpsFasBFsBbNgTzgIjoQXwcnwMjgfLoK3wJVwA3wQ7oRPw5fgEVgKP4GnEYAQETqiizARFsJGQpF4JAkRIauQEqQCaUDakB6kH7mKSJGnyFsUBkVFMVBMlAvKHxWF4qKWoVahNqOqUQdQnag+1FXUKGoK9RFNRmuizdHO6AB0LDoZnYsuRlegm9Ad6LPoEfQ4+hUGg6FjjDGOGH9MHCYVswKzGbMb0445hRnGjGGmsVisOtYc64oNxXKwYmwxtgp7EHsSewU7jn2DI+J0cLY4X1w8TogrxFXgWnAncFdwE7gZvBLeEO+MD8Xz8MvxZfhGfA9+CD+OnyEoE4wJroRIQiphLaGS0EY4S7hLeEEkEvWITsRwooC4hlhJPEQ8TxwlviVRSGYkNimBJCFtIe0nnSLdIr0gk8lGZA9yPFlM3kJuJp8h3ye/UaAqWCoEKPAUVivUKHQqXFF4pohXNFT0VFysmK9YoXhEcUjxqRJeyUiJrcRRWqVUo3RU6YbStDJV2UY5VDlDebNyi/IF5UcULMWI4kPhUYoo+yhnKGNUhKpPZVO51HXURupZ6jgNQzOmBdBSaaW0b2iDtCkVioqdSrRKnkqNynEVKR2hG9ED6On0Mvph+nX6O1UtVU9Vvuom1TbVK6qv1eaoeajx1UrU2tVG1N6pM9R91NPUt6l3qd/TQGmYaYRr5Grs0Tir8XQObY7LHO6ckjmH59zWhDXNNCM0V2ju0xzQnNbS1vLTytKq0jqj9VSbru2hnaq9Q/uE9qQOVcdNR6CzQ+ekzmOGCsOTkc6oZPQxpnQ1df11Jbr1uoO6M3rGelF6hXrtevf0Cfos/ST9Hfq9+lMGOgYhBgUGrQa3DfGGLMMUw12G/YavjYyNYow2GHUZPTJWMw4wzjduNb5rQjZxN1lm0mByzRRjyjJNM91tetkMNrM3SzGrMRsyh80dzAXmu82HLdAWThZCiwaLG0wS05OZw2xljlrSLYMtCy27LJ9ZGVjFW22z6rf6aG1vnW7daH3HhmITaFNo02Pzq62ZLde2xvbaXPJc37mr53bPfW5nbse322N3055qH2K/wb7X/oODo4PIoc1h0tHAMdGx1vEGi8YKY21mnXdCO3k5rXY65vTW2cFZ7HzY+RcXpkuaS4vLo3nG8/jzGueNueq5clzrXaVuDLdEt71uUnddd457g/sDD30PnkeTx4SnqWeq50HPZ17WXiKvDq/XbGf2SvYpb8Tbz7vEe9CH4hPlU+1z31fPN9m31XfKz95vhd8pf7R/kP82/xsBWgHcgOaAqUDHwJWBfUGkoAVB1UEPgs2CRcE9IXBIYMj2kLvzDecL53eFgtCA0O2h98KMw5aFfR+OCQ8Lrwl/GGETURDRv4C6YMmClgWvIr0iyyLvRJlESaJ6oxWjE6Kbo1/HeMeUx0hjrWJXxl6K04gTxHXHY+Oj45vipxf6LNy5cDzBPqE44foi40V5iy4s1licvvj4EsUlnCVHEtGJMYktie85oZwGzvTSgKW1S6e4bO4u7hOeB28Hb5Lvyi/nTyS5JpUnPUp2Td6ePJninlKR8lTAFlQLnqf6p9alvk4LTduf9ik9Jr09A5eRmHFUSBGmCfsytTPzMoezzLOKs6TLnJftXDYlChI1ZUPZi7K7xTTZz9SAxESyXjKa45ZTk/MmNzr3SJ5ynjBvYLnZ8k3LJ/J9879egVrBXdFboFuwtmB0pefK+lXQqqWrelfrry5aPb7Gb82BtYS1aWt/KLQuLC98uS5mXU+RVtGaorH1futbixWKRcU3NrhsqNuI2ijYOLhp7qaqTR9LeCUXS61LK0rfb+ZuvviVzVeVX33akrRlsMyhbM9WzFbh1uvb3LcdKFcuzy8f2x6yvXMHY0fJjpc7l+y8UGFXUbeLsEuyS1oZXNldZVC1tep9dUr1SI1XTXutZu2m2te7ebuv7PHY01anVVda926vYO/Ner/6zgajhop9mH05+x42Rjf2f836urlJo6m06cN+4X7pgYgDfc2Ozc0tmi1lrXCrpHXyYMLBy994f9Pdxmyrb6e3lx4ChySHHn+b+O31w0GHe4+wjrR9Z/hdbQe1o6QT6lzeOdWV0iXtjusePhp4tLfHpafje8vv9x/TPVZzXOV42QnCiaITn07mn5w+lXXq6enk02O9S3rvnIk9c60vvG/wbNDZ8+d8z53p9+w/ed71/LELzheOXmRd7LrkcKlzwH6g4wf7HzoGHQY7hxyHui87Xe4Znjd84or7ldNXva+euxZw7dLI/JHh61HXb95IuCG9ybv56Fb6ree3c27P3FlzF3235J7SvYr7mvcbfjT9sV3qID0+6j068GDBgztj3LEnP2X/9H686CH5YcWEzkTzI9tHxyZ9Jy8/Xvh4/EnWk5mnxT8r/1z7zOTZd794/DIwFTs1/lz0/NOvm1+ov9j/0u5l73TY9P1XGa9mXpe8UX9z4C3rbf+7mHcTM7nvse8rP5h+6PkY9PHup4xPn34D94Tz+6TMXDkAAOt8SURBVHja7L13fFxXmT7+vO+5d0Zyl+QSx0WSYwg4ENIglBA5JIEAIbSMSeIiJeFnyi5tgaWjiGWBL213YWHBQGInJpBoaaFvKB56SSgBTEIcS3KcZltSXKWZe8/7/v44d6SRNLLuSGNbku+jz3ymaMq95z33nOe873uel5DgeICAVkLTNgZWA1kI0CajvXf2qetribUm5XuLBbKIhOYrYQER6gCqUWAOqc5SIE2ElCo8AAwCoCQEWIXmAc2B+DAUBwnaK4Rugu5j5b2qsgegR3yfux9dsrwX2baw9OEoAasNmlYD2e0KtAsATUyaIEGCBAkSHHXiT3Bs2jXDwB4CVpckU4sXb5wRVPUttWJWEvSJRDhNiU4DcEp0qyGgisgAxMNJTxHF0aOblkqYWQWqFqrIAXqAQI8B+qgS7STVB1T5fjXB/cCMB3t3bto/8rtbGU3bGNmFCeFKkCBBggQJEoJ1LNHKwDYGFirQbof8q765qsbQE1j0LBCdo9CzSakRhGVEHoFMEXESKARQjXiLKkAlvF0a03akpT9LDBBABAIDRAAYRICqQCWEAo8StEOBP6vSH5n0j2qC+3p2fPlAacK1WoA2TQhXggQJEiRICFaCCbRdKzlSlR0SXlu8eOOMXErOJJLnKsmzCXo2QPXEqajJZcCLNMCoqOBqUorYzvGwT0SEVCMipu4hEQADYhAxAI7eFUJVHiHQPUr6awr1F4F4fzyw+0s9Q7+2yYuIZuLdSpAgQYIECcFKEAcFT9VQUlVX3/wkEDUBegmA88FmGZGHAa+UWgCwUFVHYAaI1CS2QeQ9UygIkYuLicg40qUWIsE+IrpLQD8yVn+6b1f9n4aGRDORey4hWwkSJEiQICFYCYaTqqZtjGzWDpKEVq5t7DhPhV/MhMsAnEMm5TleYqFqFQrriMlUIFPjIV3KIMOOcBFU8oDSX5RxJxF9pzp38De7d7f3DXy0qcmLwoiS9KkECRIkSJAQrJMWA96XgZyq+ctbzlGDl6nipUR0JnGqQKgAaIjBMB+fJI2kAApeLs8l5XuAhhAJdxLRd0PRr+/v6vzFoNevlYHtlHi1EiRIkCBBQrBOqjbJcDGpqjmtZRkJXkrEr4Lqc4hT5EhVGJGqKEM8aU8FVKEkIDUDCfxqoZB7CPhfqLltX8cX/zH4kSZvtJ2WCRIkSJAgQUKwpjwGvCoFYkW1jddeDMK1JHo5mdQcwO2ug2oYbb3jpN2OyrdkKNnyoDafA+lPFLhpRnD4O4MhxIwBVmlCtBIkSJAgQUKwpiGxmrM0U+v7s68C5NVE5myQgUqAwfBf4qkaP9mCgMgj9qNXwvtV9WZle3Pvzlt2JUQrQYIECRIkBGuaEau5y9c1ep7/alVtYU6d6nb+BQUNqoRUVZBpwelUEJHHIA+q+cdVcZsR+dzeri1/GrQPkBCtBAkSJEiQEKwpSKxql1+7Ch79M6muJfbnqIaAij3JEtVPFNcSR2DJI05BJR8A9A228l97d23+VUK0EiRIkCBBQrCmxLk2mcJOttr69U8m9t4C0Hpir0olAFRCEEyR0GeC48S0oGpd+DDlNg8oviEsH+99oEC0ktBhggQJEiRICNYkQ8YUhwKN57+NgGuJ/OqIWNlIsjwhVieaaAECwBQRrdtDsR/ePxA6zJhE3iFBggQJEiQE68QTKwGgc5dfU+N7VW9U4E1EXo0jVmrdbsCEWE1CWABMnCKVIFDgRivykf1dWzqHk+YECRIkSJAgIVjH7bwGtKyotvHa6wh4D5lUo0oeEAlRkB9PMLnh1PCdR0uCXgV9PN2/5z8feeQ7R5L8rAQJEiRIkBCs44ZBz0bNimsvYOiHiVIXQC1UwoRYTVWapWrB7DH5EAn/BrHv7e7a8k337yZveG3IBAkSJEiQICFYFTuXVgLaZNbiq+en0ukbiOmfiDyoBMmuwOlCtKBC5BkQQzVsD0O8c/+um3YW2z9ppgQJEiRIkBCsiqDIa9WwYQ2z+ShRql4lN5A0nZh6WvEsAQDiNKuGvSq2tadzy6fd/xJvVoIECRIkSAhWBY7fSS/MX752sXDqY2y8tVAphAO9xMTTmmhZEBsiHyLBjzW0b+p98Oa/JblZCRIkSJAgIVjjxqDXqnZFyytI+T+JvWUq+SQceJKxLABC7BsVe0gV7+7pvPHTw/tIggQJEiRIkBCsMeHCQIsWrZsZVHsfY+O9znmtrI2S2BOcfLAgKniz7kBgX9+z++aHkpDhZBprWgnYTmhaRchuA7Aw0jJbFd3foG5IUgA3uPcOYA+haTWQ3a6R4KyiMlpo4xkDdeq1b6FtC2iNnhTaeFK177FYhE3VeVVP8HEleoMnEcEakF+oW7H+PKj/BTL+WWr7o1BQ4rU6yRF5s1JGJHhYoK99vGPzt5OQ4YlCK6NpGyO7UI+NJzETLaZOVuFZJWC1cUQqad+x++FqOQ5jACWkJMEUJFitXLg46hpaXqPMn2TiGSpBCCS5VgmG0CwLNoYAqMiHujtves/ghJGEDI/PtTpY7xMAFi1aNzOf4gby+XQo1UNlKYgWAJgLlZkApdwCSQkgBWlIQA6KwwD1AHgUqruV6QErev/+roZdQyfLcSr8r3xDemn/o2zMDLX2SKzxcPfuVbkTS9ZHtu/SpZnqI6aqgcCnK9AAwjIACwHMA6ga0DQAJiJWVQFgAc2D+DABjyvwGFQfZOIOIPzHvur+Tmxvzw9t33GUqlqVSS3u7fNSqTqJ276VxO7dyA+95o/DYmtVJrX0AEw5fWr042/vqxRZXry4Lx3HDsbM0Hy+mx+pqQ6H9oEE05RgRWGe+uaqOsOfJvJfrRIAEEm8VglGYVkCkNtpKMEPEB65vvvBrz6chAyP9XgyIPCL2pVrl7L1L1PQCwGcA2gDsQ+Ah/EgjTFERY4BFYiEOSJ9QMG/BOH7eDz/456eLx8og0S7Lzt3o1/bnfsBkWlUWIk3HhIp5V/au/PWvxQv+k5E+y6obz7FGu8FpPJCQJ8OoJHII5A5SvvqsNMc9lgtVEOrRA+w6O/A9L3+vv47Dz3ylX3lLVLc+2obWv6b2HuxahBGhj/OHZJyCjxMwC/J8Df37bjxj8dmseUWBrVLXr2UUsEP1ZHa8XuyFJY45ankbujpvPnmcR9vU6uHbFtYt/y6tfD4g6pBgLF31Vsi3xcJvtPbueUNycJ0/JgCnh83Ic5ZtuE0n82XifzzVXIWUE7IVYKjDK3saFZ/SJy+TP0Zv6xZvm5t766tv0pI1rHyqrQJ0G7nn9Z8rljzZrJ6BdifQ0A0cVunSaeqRfXU4yzy1M1VBJAyEaeJzCoiswrQ/0/nalfd3JYt/RR+5vDOrXuiYxk7h6ivl4CZK5m95W4qjHMoBFGpPpHtW7v82lUw9CaBXslkakFmsH01EEgg5bdvRL4IDJBh8BNhzBMBXZdOpx9Lr7ju1tDaT0WlqigGM45+XZcy+w0qMfnrsRgJiJ8M8MUqwXvqGq/7Gofhu/c+ePMDlSUOqw2AkFPhGjIzVqn0Y0LqQKQAM2DpnwDcAtwuE2k/hdQYTse0g4LYh2iwJBnXJoZJTlDcRFhXv+Ei3/N+QWzOV+kPXc+lRI09QZyRylPJWQI1sJf+cW19c4sjV5lE0b9iyBigTWpXrp1T13Dtp1X4t2y8dQDmqM1blbxVDQvhOxPJpxRuJsbNA5EHgheFEVU1FJV8qBJYIq5nTr+/WtN/rGlseXXkVdJY9iXtUw1F1YbufuwbkcqJaF/gsnRdw7X/TobuYvY3glCrMrx9icfXvlEbu4VJoX2tSmDBvIjYf4tnzB/rGprfHrWtDobbjupBykftG8Rt34rfJLBq+0OoGGJ/jXjeb2oa1r/AkatMhTZFZS3QygJZr5IXVQkndtxW1OYsmM+bv7zlbMe4Wsc9XxNxdDySH/u33XsISMKD05Rgkev42XB+Y/P1YO+HRHSKk2BI8q0SlN2djJuApIq91E01jc3/Fq1cJzRoJShM/u22dvnaVSTpn7OX+mdAWW3eAqqgwiROlSyqXpBh8QAYVSti+0OQnmo4/YXaxpab6+ubq5x9lcZYrBc84dF9nNsJaN8la5fWNS7+MXvpdwNS7QiD6iBJOibt675bRTXsDwGdx17VR+sarv3O3OXX1DjSN8b1owXJnBN5GyD1UNsfEtF8Jv+OeQ0bLnTjwETHgIwBoDXLu55J5J+lauHmqQkftxKnWBnr3e9sn4B9B6SL4vwuV7g/JQRr8kCj7cbttq5xwwfAqS8C6rkJMpFgSDDuOYOhoiqB9bjqvXWNLVuwKpOKNUkkGAWtDLTbmhUtTyUv/WMic6bY/tA5LnAcPYTOa6NqVaU/ZFO1/hDzN1HfXOXkHqbqRFFo3/XLKZX6KbH/HLF9AQCNCMPxOi8CkQdVFdsfkJd6seHU/81Zen2tC8VOoevH9RNLRClDfOusJ149f7CtJ/rV2hzxuEp5OBkaAEBmwarMrGhRmJCehGBNZEAhBdq0ruHaLxBXv8/VERQk+VYJKjG6AjAi/SGZ9Ia6I7O+M7e+eZ4jWZmEvJd9rbbpzBXrFrLi2wQ+RW3+BO/oJQLI07AvIJN+QS3hS5Ftp+LYQcB2WrAqM4vU+xaxv1IlFwLkn8BJlgDy1fYHbNLneb693VXS2D7VSKxRCQMy6SWpfOpdro+M1zukBLTb5cuvqQHh5eoIUaX6G6uKJeMvsX2zLsNA5ZIECcEa34AtqG+uqm289htsUq92Awo4ybdKUOF5wlPbH5LxLzXMP6pdumFJZfMxTgZsJwCaVvMF4lS9ajDe0lQa1Za0AMLoZt1tnLlORL7avoBN1TU1Dc0bp6Zt3W5B2zfjE8yps1RywTjJ61jtO46dbuSr9AfGVF1cU9/w3qh9pxaJJfJUAiVCy+xT19e5c9BxzDOrDQAcYu8lbNILoGKPwbyqUNvibLU60fJLCNb4yFXtyrVzapm/y5x6qUh/AJdjkZCrBMeGZEkuZPbPhW9+PGfpupUJyYo9+bu8oPqWVzCnr1AZj+eqMOkTEXlM7BvilBfdDLFviLyCnkNYPhEgTzUQJvrwgvrmUyKNLJ5K7Vuzovk5RN5Gt2ua/PG1L8ZqXxpv+4rNW2Z+V11985Nc+1YsVGihGpZ3Q1imLAJBRYhTtX6VaXIvrRnH8RcID7VMSJbhKHO0SgiQuXjuE65dkaQ0TC14k2MwabNzll5fS1a+S5x6pkp/UP6AkiDBuEiWZfZP933+UW39+hf2dN3y90TGYSy0C5paPXR1tkIl3m69YRMokWdABmLzeYXdSWp3KfRxKEICpRW6kIAGEC8j9r1x6N4RVCxxutZK/5sBvDMqDD8FPACudBALbiDDcEnTZRIUMobIg0reioQdgHaBuAeqgQIpIpoPaD2BGonTnmqAyPtiYrcvRIlTKUH+3QA2ANsrMvETeQbGlE353DlYjR3xUFWAlQTnAPi6KzE0DsdA/fVPJpILXB9FpRdoBGjInK5CmLsKwIeAbYzK5XklmL4Ey63UZi2+er7ny/eJ/fOcDENCrhIcN5JlVAJL7NcrvB/VLF33gt7dW/+akKzR4NqlprPzEvb8M1WCcjef2KiU0b0Q+R9mfH/fzs0PlJowFi/eOCOXyp0J5F+lwPXM/uzo9+JO5KwaKIiunVvf/JH9XVsex6T3iLtJe379dWcr6cUqeR1P+6oNdikH/6OW7ujZ1fGPkn155WXpBcGiJwvyrwT0tcT+fJfzGpskGJVACbhyXsM173u889auCYqvKsiQavBDhPm7lCg9dpiYAYUAOgfAK4m9RdAwJskiAEoKWgQgqsNYzqWwjZGFEIXriKv8aO7yYp9r7L6oDLUg1bU4d+PHcPemEElJnoRgxRhI7OxT19f5ae/7zP55URJnIsOQ4ASQrNAyeaeKj/+rXb72kp5dX96eKBiXgisgTIT1ACtA5YTeLLFvVPKfSven3vXII5uODB0PihON2yX6/28A/Kau4brPqdgbiVPPLoMEMFQsG38hh/nLAHw18mJNYps674RQuJa5mqI8VK+c9hUbbg3y4ZsPPnxL9+jte7tgB+X2An8C8KeaU1s2UTr8HHPqRU4OJ1b7Oi+hqaomsa8E8MkJeleEyBjV8Jbuzpu/XO6HFyzb8EkL+SWzWahxPFnRf4l0PHMOIZsN6+ubqw4CV5GGQFkhaKL4/IhYNVBib1Xd3iPP7QZ+koxNCcEac5VWsyIzl9V8lxJyleDEw6iGlslbrCb9w/mN6y/e13HLP5KBbPiU1G7rTr9utubtRaohAWpiLsQjz1X+Yz0dm/81Ggc8Nxm3jVbjLpJsAXd3tt23aNG654fV+AkZ7xkqYVwSoACpMF3hCNZCndztm7VAxhDoBVCLqGJFfM+V5G/u6dzcPHb70pD27X247UEgc0Vt48xvM/svVMnH8xQSARAl8IsdwVotKC/OVoJm6Rw0tXro7PTQ0BDPi/xQj9m749MP1DVuuA1U/UaIDZ0w7bGCI+qHDS5m8le4/hjX00iqqkeItDq+N5YsyHgwZgOAnyRDUUKwjkaudPHijTNymv8Wcer8hFwlmDwkK7DE/lIV//s1K9Zf1Lvzll0JySrA7WyTQJ9myCzW+PkulsgzKvnfOHI1UDh4rMlTo5I3AjR5jz229fD8xvXrVegPAM3AQP2co34FQy0BeBZWviGNHZ/ORaKLk7B9Wwlok/mNVaep0pNUQ8RrXxUij0Vy9/cER1476K0qp31dH8/Rupa00j1EZmHM/DpWtUSgc2Y9ceP8Q/9o2+fad834WSaRRbYtBJqAri3xCFZTK7AjYwDa5Th1GfYdF+VeqABUBS1kuIxvUSEyLGrfCqW3M5vT3HU0ZjsbJwFBV8xaee2CQztu2oskTDjpcbx3I5C78DOcS+dvY043JeQqwSRzIhiVICQ2Kxjed2Y/qbCFO9m5g6Y9zu1h5TyQByjFJJ1u+7sC7x98rdw8nWwItHr7Om75B8R+kdhXqOYxKD0wyo1E1YakWFwbPL7CfdeaSWpLF8KzirPJ+B6iXYBxPCIgJqh+ELvb+1yYrtwFQbsFWr3DO7fuISv/SeRT9Ptjj+kqSmTmefngjEq0ryrY5frBc/dj3TIGnZ0e0G4VWODywjXWDzlpLxx0/XtVTFbmBGBrV756qRK9MNK+iuG9UgF5LGIf6e2s/wKAO6OpL2Y7qyVO1VSF8vJBL1qChGANjtAGaLd19TO+xCZ9eZlJgQkSHC+S5ankQyL/qX6/+ebSpZnqwQVCAhDOiN8UzruiEmzvWd7xU0RhxnESEAVATHwTACZTlS6SHjjKzffYn5VW0FnlTaTHG47AMplC+2q89mUjEjxKae8bGAgzjgdtAoDU97eq5I5EY/PYx6BqQQZG7aqKtC/rIUeos/3R/Ri3douuLf01KzJzCfxK1VBd0eoxXWXR6dF95R3gNvfdQXAlc3pmtPty7HNWEiIPRHQ70CYM+qrzUmp8oqQCAaIQ8LbEqz7JcRzJjdt9VNuw4cNkqpoTKYYEk59k5UL2qi7oA24B2q6MwijjFGecBshG+TWEFYC4gjhjt6OADIPCO5HNhmhq9Vz4ZzxwxGxv56G/1jZUf4TYLFRVCx0rmVmFRFLEutedx/bJbr+VZfRTAXlMmv959303HpxgOFuAVu7Z0ba7trHlLmbvQrdrcwzvTNT8xMZ5CLPbACwcj++KoAIFP7+2vtljQgpxCmtbUjE6B0rNRGalU6KIldtkVAIrAbmksWzc5HxX2Jm4c4PLk4u52iAYlbyQ0BYA2Ne5/Je19Z1/ZuM/TTVWTqFRDZXInD+3vvms/V30pyR9ISFYA+SqpmHDa9hUvTMJCyaYMiQr7A/JVL2yrmHDf3R33vyWk1u+wXk4CDjFhVdi5TJRlBPzu8HJd6Jotz2deNcEPj9JNYQcgVXFKeQ4fAyviAtzCfS3AAhNe2hiOebbXJFh1bsBujDmYoIAQFSXuqfj3UhArBqCyVsPj9fH/hhHoRi1kcxXzLxA9o1I/he9u7f81X1LnLB1JAJbv/OZIP9sdZIQHPf31OZ/s69ryx9x7kYfd7cFys23gMzTnLRELFhi3/PUrgfwp4LXM8FJS7AyBmgPa5dteD6x99miLdZJx0gwBTiW82SRqXpz3fLmHd27tnzmJCVZBEAXLVo3I1TMBsWdD5yGj1rdWUwijo7hkgLDsYewaiGvzJ9S1hiyY8ej4SRe7VOBwIIwLzaBJSJAwEo7ACiyFdklqeWHzRQEnV+JhlANBEpa/jErxyQ7A0nlxNoWzVMEtJdBBbnZ1b/O2/jzKAFw3iv09TrDMt0ukm8j0Mx4mzYGCkCvWXTmuvc/ds/Ww0iS3U9WguW0ruavuPoJqt6triMUFsEJ4g8chaUqqRaeF11OIypoafH4W/xQo6KsFG91nKAAJ0bqmU/VLl9/X8+uW350srrmea6tRt5UazwPiwJMIjbPLD3xfyWGJ2E7sGM6NvC5Gz1052bFJ7BgFQuRcG9lRx19DHG9aJGplTDTPV6l4y+e7OjL+NcA8U6OyGex/e/v6bzlp27B1B7G+4F2O7e+eR4pXq4SW/tK3eaZ/OM5j77u+m97CGRM7wObH6xraP4/MumXRfpj3pj2VrFkUkuDQ8ELAHwjkoxIRJFPMoJFALBgVWaW7Uu1M3NdeVohJyuZUoWSRKSJCGRABAIRkSsdViggRtCBIYWKWBUVPSskDAkAUYFAoapQV+xVSQEm5ei3KFkGjdaXhQBDZPxb5y5fd/7+XVs7JqhaPQV5PiHMpTwwefEW2wPISV6OxFyQSW39hmvJpFdD8iG0AqVHCBac8qDhnd0dN21FU5NBdnJOSPX7cuYQI1Vm34QaPjRIbiYC5wFTpsMu/SmmpIUCUEQ5tW3qPEKT9nImhVUl42HlZWns+EEu3rXsiIxHeAmZ1MIyBG8tse+J5L/t5BUGFmdRJEc3Q+XlUOUyfA8K0RYAX6+I9liCqUawmgzQFtojzZvYVD0t2TE46rAkUFXn6idD5BExMxXokQSWVB9nYA8JOgzpAVLtMUQPG9hHSTkgUiFSMW45y6xMxNaI8AIhLAOhjhSzQqUGBRYLaI41qbSFhwCEQBUhBKoiUAgTiJ27PSFcRatqVbHE/gKj5rZVq1ov2L59e2H30EnQTDcQABUxDBIux/9JIAXbGER0e2FZcQmbqmsKkvETv8oEZKphwwMEYCsOnU6TdUKy9giBZnC5/mUKUVFvKlE53zfgQ+eicW1yL5hUxTNV76+zi1f3r1iXObyzbU90/Efpp1GOHKiZyjpHZaiASLe48aKQN+VyAavDujuP+D1dzF69ahhH4JVVQgLxJXPrmxv2d7V1nlyLvZOeYA3sGHwTm/TVSVJ7CVLlrnNDZAzYOJ4lwWFI0EFEfyS1f/GYtxsbdqRS2L1kx+4j2Qm6gRWg60+/YtYDh9OLrOZXWsZpgfJZIXBWQOa0PPk1efa5D0BeBAq1DAVDOfFuAQCM2nzIpurpjx7u/BTQ/tqTJx/rBgXaYDyyFrCu0ofG7XdGfT/+9U84pLY/VA1DqFZi3Ahh+z0AfZO9lXdXnSK19mBYHr8iGNZUJY9DBL7huEdBBVe6HfSqTXqw2L6AuOrCtNXvVZ1+3UXd9y07DLSNsmAqeFfXP5kIF0aFnWOEB1WIfBYN7uupPvLzSDlfgGzURhu93bv/o6+2seU2kPevkFBiSEwQICFzVTVJ/1UAPlKoi5gM0dOeYEVJ7fXNzyQyHyuzeOjJQarYN+7SC/pVgz+rBj8n0M985Xse7bxxV6kLfMdA2w7uGmlqKnpDYUFe6jUAWSxUQrvFfXccBHAQRSksBOBVjS9ZtA+pp+RCPDfP3oV9ZM7pp/Tcw/DQp4pQrTCg5mT3bBF5anMhe+nX1Das+1VP59abT458LNftcjaVN9yXpwGZprHTsAioAnuzyrhaGEweRFGRcieqcGHNKdDMZz8a4q6ZubLGFiIKwHPd0+0TJDeF8UXmghjxk80JAKLjbiVgeyXGzIl11rHf5qvtD9irPlfzfZ8G2lpGvZYHCjubtcQpP77TgATETIovYHt7fuT/NzmmRviiavBGEKVjXlgMtQBhHZpaP45sWyLVMP0JlhJwg9as2DiXJH8LEfmqVk7epHYVKAREniNVBJWgWyX8mZJ+2/OQ3XP/lp0jP9cU2WWhRiVFosFm6IWfLRXlyMYZeFopg+20B3sITUA2mw2/2vHtxwA8BuDHALDhCS9e0htUPecwm8sPKD/vMKeXHICPwyJQ1dCQMIP4pCRapEY1EJD/33X1zb/r7tpy78niot+f8o7UWhyJ8vzGmggIUCH2DIJwIYDtEycAE5p1c5N5sHCXeLtFQ/PBMoZMIfKMb3TxUII0MRjipeURHQLABypD8ia6CUc12hQUR2zUU9tvibzmBSuav7B355ZfliBZwwo725jeKzfHqgSAoqWusfmVGMX16/JiBRS7CDSxaiDE3hnzu3Y9Zx+QTTSxpj3BusEAbSFpy6fJpFeevHlXKgApkWfAHqvkAhX7I1X9qs/pHzy283N7hly8Ta3GiR8WyNQxCzlFV26bto8kZJRBhvc07aFsdpu9+X56CMDtAG5/x4pL5u7E7KbH1XvV42RetJ9nzOtVDzm1YpwMsTm5iBYRVIXJn62c3wy0XlBQGcf0zcdy57fj0zk0tOyPTwAioVHYVa63xSAABHHXUKXaspDRqPsndxNHE6SiJ7b3SKFRStEqVDA0p0RnlFvNj6CPVWj4DJQQjm9hrkrgaiKPYmpiuWuWjFqx/wzglyXswkC7HAA9z7B3mmog5e10VBD7TxlUjh/lMCQss8u7a0thW5BkuU93gtXkAW1hzYr11zD560/SvCsLKBH77LxV4Q5o/ssq9raers1/HzqQ7iGXNNkm41e2ruwE2o526y5TAtDKmWgl+v92tu8HcAeAO1532vOXPSb9mV74a7u56px9SOOQWBioPcmIllHNh2Sqzq9r2NnW3dn+numfj9VKbgGgD4LorHK0ipTkuQA+G0uEUnUmkc+KQAFYKDRSjedxkYgonMmquwEAsxZP0m4a1XokfjC294iiXYTQC9z7J7SjLCqzkzEQ+0yXG6o8dj3tSOyUdJebClbRONXynRhnmH8/2dzNIXlp9qgsjwzlRCTt1bPqJ4i88+MljatRDQmqz6tduXZOz44vHyixWFJitETEV1Bmmbmxtb2UxiFPYVRDgPBSV2h70z4kmljTkmAxsM3WnHbtMhb6tMKKc2ycLJFBV86BOGUAhYr9JVQ+7/XZrz/22NbD0eQUiSe2y6AbdzIvOtqkSHaPMsgwAPzPA+0PAvikAv/RsuKKF+1R8/q9VPWiR2mmOXDSES0yavMW7L+zZnnz93p3lQwvTB8U8lCA+wFGtPt1rGvDqIYg0MVz65vn7e/asn/0SWBVtHGQf6WSOxdAI7GfdnOZhaqNnVg/7BjY7cjl+93zbZO8W+HeAXo19hDKTo/JnB/tKOsaf7g6w8DtUrf02nNA/KTYKuXkwloMFLXvwnGfPEH27Hvwqw9PoAV3L1i2Ya14dA/A1WMLeJLbaUq8kPLeEwDcXbSYIIBs7dINS6B4YZTcPo6c4rHakcbXWCqWOFXjB/mXAfhiook1LQlWhgASss2fIZOqdYJpxNO/+aJQYIFYqf2RwP5nb8eW7w5OSk2eq+E2pfNznHcruqib0GQI2RA77/gugO9urL/8WY9x/5sfQTrzMM8y+8WKD8FJkKNFgBCRz2zkC0uXvuXc3bt356ftKjJbcKvIPeTK38SpRegmAZNeYGxuA4BPARv9QnLvcFIPAN0dmz8L4HN1Ddc9ATY4S0mfpcDTSekpIMwq03ugALNIcATW/4c7j4WT1DbuuFj1r+qGFo5ZiihkTlVD+l8H4B3AdzxgHDvKzq1h3E1W/ZY3MHscCV/GIROsEigr/7US7atEviM2a3xgVZlkoQ1AhvY+ePMDtQ3N97Hxz3b6i0c9DyoUJbckC9xLhTyy1QZACI+vZJOapZIPcVxr+MaBgFSbHcFKNLGmGcFyK/bahg0b2KRfMjk7YOUJB6CWyPNABqrhLwTy4d6dm783eMG6uL0TNJxWHV4LchEZZEw7VummrrZfA/j1W+ov+48u5N75IM146S6qwhERm3KyWtN41yGx2jAkk37yEb/7BqD9HdM3VBgN3uL9XikInWhwLMuyaihE5r21Szd8rWf3podGJ1lAwQPT3XnjfQDuA3AbANSuXDuHrPcBotSbVOPuTlZ1+Thyb89DX3zIXZuVqkW4nVBRN3175MHr/5OV9EEiMxuQOH4st+mCzT/XrFh3S+/OrX89evuWwKpMCndvytfVb7gIZK5RyUvM9hUij0XCXXtz6ciD1S6IPN7j9GEpQAqcq4U2KbMdC9Q+H988bogyZvg5u8LOQOeGQqBikl2URiVUIn7WvMYNZz7e0XZP5b3oeyrcz0+eEOYEvUytDNwuCxuvX0TEH3fxbkx3z5UFiIirPFV5QG24oXvnjc915ErJdW5o1MGndUdyXq02aUUrZ5Ax/9H1g998veMbL3um7X3hM6X3tytYjCVDgcJO62AxwajkLcH7l7oV153nyFVmGkqTuFp5PbsO3QeV+4gMFcLjY7aQWhCbBeSZr89Zmql1k38ro6nJc23VOligADcokDE4d6O/cuUb0oVdtRrwGSDzKkWo8ccZkihv5qfuemyqoF1WKQoa5pW5CdDKezq++hiA3xMbjemJIqiAiWeQ+v87r+Ga+ohcjdK+Su55xkRtS9jenp/XuOFMNd6tBOX4QxcJyCiAX+KRTUcGx79KYNZ42pAAyNz65nkAPVE1djmbUZwH0Nr6zmcQm6iw86SUHLLEKeOB1hcRogpiYaX7eeLBir+CIwmx4WPMVQvKcClPUa+VK3mgEuZU858QOvTR3o72/YMeK7IATrptsm1RaKcVrdwG4NNdbT9Q4M7XN17+mlNQ1foPM3fhXhFJQ6ZrOR5yO4U8T23wGaDpOdN3IGkyrm5b8x0gcwZiL6qIVfJCJvUMn2b/vLax5c09HW13lhZHJLeQuRt2BwCsfEO6Vla8npT+H4GqVK2WscPMQEOo4OtFk0WFsP0YrOwH1Oy/AfDzogR/xGpfDYXJP51Q9fPaxua39HRs+Rqy2dHaV4uJRO2KmetI6ZMEqo2pJl7c9wmEr1W+rx0aT/vqKSuvXZAP9ZPEXk2M8GCcHrSByCfVXBnRGRfjnah3KuZvMTSEKtZg8cZWR3QrnqZAlenfJ1cS/gQazbkh61a0PA/wfgwNpzO5sk4gNAWR/E+thG/d33XLH4vbAQkGewYyppCz9fHTnrvsHq398D9o1tr7tAoi1qYIZpoKRlnitFHp/+fuji2fmZ59o0jRmr0/AwNK63GLAguRx66UmvwUim+p4PfK/FCY8g6b/kM29NifQek5YRiuZOILFXIlm/QTXIKxlEOurAtfBX/q6Tzy9Cg0ODjIr8qkao/M+Cuz94RySIWq7gDhMGmFvPUEJ2Whcn13x+bfA6AF9c2LhOheMM2JEvvLaF/DAEM1/A0U3yTIrwNJPWhT9pDJ50KbSnucs3N8nxpU+DkgeQVz6mluE4Etg1ypgDyC2Ae9vnBVtKEnmkCj+aGhuZ1M+sr4i28CoA8psJdUzXjaUpUWM3sLY8o0DFiVyCPR/KU9Hbf8yOXOZsO59c3zDNF9zLxQY7eNgsibYNldhUpQTsHPwg7Ml3d3bfnWQLJ7U6uHbFtYV3/t68jzPxszhUej3Mn9StQxLjuUtA1ZsOepBL/q6djympNh7vTGPSQAWLUqk3rsiP4X8XSmpBoSpzxV2wfJvbenY/Mno5W85+LzCbkajgK5akKT97YHsg8CWPfWFZd+Z4HO+eRfzNzF+0RtFZR1+m0zpUgj5wPzl6/9+r5dWx8FbphmAqRtAmRMT9ctf6+rb/4Geek15eVdOk8LQMTsXwTQRcohVKUvlc8dgklZo/BFwrnG+B7IgDRENEFzedpIChATET7hrtPKDOjM3kqAKqk6BSIPNjzi1NhXZfy927c8WtOw4SZD1W9WLUdPkNgRAQti/5kAPxNqYRDkTIiDYN8aqx4MzyaYFBkPUIso56o8qQCFEHueRfjfjlxVIvdQAeIlDF4y7vYlQZlaVQoQqVhL8J1Ext6FDAAe8+XE/sJo41bsnD9Rey8k/COITNlbXxVCwHwQX1rGzKoAVBktAL45QU8tRXaYy2TOqmw/9yEIe06WuXCcBCvDQLt99HDzG9ireorafus60rQiVgqQMFd5osFvrehrHu/c/GfX+VoJaEu2wo6BLLJhK8DbkaFP7Gz/6n8tecYv6lK5z/yFa6+4TzxNwco022nI0bbpWlX5N4BePZFk38mLVYWVdatqeAXAfsxk7AES4PwfQSFP0RCoGszVg++JJkkJJdpNV+74YolTRm3ud931Dbeho5WBypQTiXJNKwkBlInYjSkLVgkAyin9v2rJrweZmvI8S4X2DSMNMTVEnI7KsAx6SDQUiC20b5n9VMWFxHMPeDOO/E/k2azMYlOtKuwECUJZQqBK5EHUPtBT5+1EJwjbo92Lqs1lEiS3vVbk9d1dN/90/KeQMXUNM3cSm+UxvatGJQSBLp3XcE394523RnIdE+vpzgtYMVgoGUD7cJKAx9d522XRinULifm9rmTIdJNkUAGYiH0jNv/fNfxw0+OdN/0ZTa2eu4CSquWx/R2AtKPdNqHJe9NDv9u9ueM7L11tH/vX8+mQEHkcYNolwBuVvID9lroV688b9JxMK6sKkOHuri33QsL3MacMomzictsqWuS58iFqo5towZXhahGWP/k7j4TkSeW1lRfyJa7sDdG9ukshu12BDB/p2vIoIG9yIVUaz6YZE7Vf1L5S1L46gfaFAiQAQQmv27u9/VCUO1Yp5X2aYJuWO6S4UCfL13H3pgCrMj7QJnUN150OojILO3ssmr+3e2bfL51HL2PKvq28LA20WyV8FeQBGnOjA9QSp2cY+K8C4HTrJmiIyvd1YihOAgmncROsDAPQUPm9xKm6aDCcTnOkJfIYREfEBi3dnTe9YceOH+SAVp4kiutT2puVQcZ8ovOHH1uNvc9frT0PzWFjckrhdGPoRGxU6CNFHp9pBkccuztv/ri1fV8hr9oHNJjAF1I0sRYSm8c5pqgArMQ+q+Rft6/rlj+6iWuqLYqi9u3Y8mUN+/6LTJUPaLm1VIa1LyrRvtFmn7QnNv/uno7Nd07tXBoVgFlt/gDYfgYAobrGtTHJWuJUCgobs73EESK6Fdvb82gq2LHM247zAzeIYKtKPowfHVJXABpYBzR5yGaT9JWpRbBaGWh3zB5mo0pueskyqIbEvlHVDqis7uncvGVgG3PitaqYN6u1qcl7386f/uSF+uhzLpE9v15i4B3BtCJZRiWwbNIX16xofrHrO03TUBuuXYBW7qlLN6v0f41NtQ8nK2BP2PVLhomMkbDvLT1dt9zo2n2qTv7tAmRMd9ctbxbb93ly7QucuJ3KFsREnPbU5v69p+vmD0/t9i3sDE+xQN7es+PLu5G5nXH3pgAr35BW1auhYST4Gsur56nN5cLQfsWtKlePc85oE6CVe3du/otCfkXsUzybuwLQYO+p8xrqnw1AVz7UM103nk1HguXcwIrwBlfCAtPIe6UhmSpPJfitBuFzuzs2/96FBLMTWTUmKDV8ZLPh7ciYV3f+uqst+OPFl8pjt51uxDusHE6rcKEqSPFvboW/WjD9kvpdcfK7NwXdOzdfaW3/R4kME/sm0sc6DlpwqlCEAJRM2lPFPtFwTU/XLf/p2n1KC77qAInt2PJaDfreBXB4fNsX6jw4qsQpo6DDsP2v6e7c/N4p3L7q6i4BZKp9sf2f7O3csgnIGLS3AwDVBPufx8ZfWcbuUiH2odCfHNi9dcf4yxUVUAjv0ZZCznk8kBAZEKg5mWmmFMFybuD59evPJvYy8ZV+pwRC4ipPJPiWdyS8uGf3zQ8BGZOEBI8d1qDdtqKVl+/e3fffHd+76nn2kf86y+S9IzCWpgehNaqhZU6fPb9+RibyYk3H1WS0yFLq6dj8Dgnzl6qEvyZORUSL3OrbkaBCMUEd/29FxEI1dDIBhsikPIBUbH5rKIef3tOxuT122IrIfZcidPcn4hb9dmndJEdi0crdXVs+oggvULV3EvtMnDJRuaKoPWCj9qlQ+0YeK5MyRIZEgm8izD1jX4GMxGrf6Lsmy60gFG3SBuBQ7JF393RueWshOlNoByJeC3AIUD6+/QCFbh5KkMYLF94LA/NNtfl9IFKoBmOfn6pKEBJwec2KjXN37Ph03tlBJTrGE28DopMmdFl22EKZ30fkGdX8dGmkkDjtqeRu7unYfC0iNeWK7YhJMLonC23SCnAbMvTxjvY3v7fhkl7fLLrhLqmy1bDTQMZBCSqqhPfi3I1fw92bpithj0yVMT27bvkRgB/V1V/3MiV9NQhNzKlZ7l3i8nUdB4gSpSMfSSlO4HKVI+Vxl59FZGggL1wtVO1DgvAOtvrF7l2b/1C8GIx55LXkVXkuvYlOWPO5XWyHUkf1FCJjejpu/h2A59c2XPd8IvtqqD6fjD93sCB2cfsiKjkDLbkRrmT7MrkNm+zspcE+1eC7Qvhib8dNvyi7faFzyVR5kTDUJOiqApHwCCT8AUJ8uOfBm+8a9Da5cX/OaetWspq1RAxwKsZxK4g8T+zhHm/GrO8VE6SJXVNN3oHdX+qpa2z5DnuzWlRyiJsKZrhqYRAevB7AJx2/omoyVR7kRNpBPeIUNDw0LyFYI71XMn95yzkKvmLaeK8UIXlpT23uC90dmzdG21o5ybc6niQLArRTE5q8D3b+qO2GhouPsFn00d9KtZ0x5UkWsWpoyaTPqNkXXNkLfGV6i+sNak11d934TQDfnNdwXT1J8FyFPheqZ4N4GUEXRhtJzKATnQbvtNg5plEUUKBic4A+oio7Afm9CmcF8uv9XVsed+8vbEuPuThasEe0s+F/rPQvhNgTme6g4JCYtNM9HW1TRHtUF69Nezpv/D8A/1e37LpTLcILGHguIOeAqB7AIiLP7R4cntM+avsqIDaviseUgg5SvRuKn/k+//LRHTftLb993TmI6tc17O+EBhbQE5lmqQTsB3t/tRa/2b/rxp2Dc9vQ8/Es6kD0eRseCeOFB0mY1KjKb/Zu/+yhiYcHC1gtQJaE8Em1fX2QUOK1IYmoMkiPDL5k/2DD/s+dWDuQQKyB6vaj9/Ppg5gDSqTK29h8G3F6zbQoiaMu50ok/4Wejps2FkgkknyrE9YXW9Fk2pANP9Bw0dt/YhZ/9HdSHc5EaKT8bdeTCU5NXIN7epZ3nucSX08GAp8xbgAdeq5z65vneWQWWZKFDF0IwWwwzSJFFQCjJEzKIqQhkx5RwWEi7lUN91jx986WQ4/s3t3eF+e3Tsb2rV25dg6Lv8iGupBIFwI0lxgzoVQ9on1BfapyiJQOKPCo8bx9OHDg0b172w9N//YdIIuVPqeTqhRMggkTLLdiqq1f/6Si0hhTO3QzQK5yt/R0bN6QkKtJNOyhyXMk6+L33WkWf+BuSYUzYT2Z0l1OhSjFKv0v6+685VuVUbyeShNZIR8lW6Gk7FZGE9jpRU30us0YNO0hZE9wMzUB0bb6Ms9FCVjDrsBvpdpXCU2rDbILK9S+qwjZbSe+fbE60hgbkywSmppMWX2iqfDdx8I7Xejv28o8HhQt5sbxHcfEDseynaYkwXLeq9rG5s8xp1+jkiujbMOknOxcQrvNfbens/4KtzPy9koU5kxQoT5Z8GS1Nl78n9/nJW/6q5hwJmQqkyxL7BuR/M96OrY0wcXFTtYwdFQJISpqjD2EptWjvHUb3CRXKPuxKspFShZClWlfwE24SfsmSHAiCBYDkBnL1y6u5tS9YMwur/DoZJ3ogrvMocMX7d3bfjgqe5PkXE0mCgzQajSZnyEbvqvxkq/cwcuu6rAIZ5B6U9hQAmISi+f0dt3466RIeIIECRJMb4zhiWpiICtV5F1Hxp9TXlHXSTdtC1HKiIaPKOMVe/eiDysvS2HJtihxdNsx+dUmAMBqZE8it2gFWL+6cEcr/7v5csth6y3/hlny7F5r82ko61Tk94SQ4HnE+dcB+DUyANoTWydIkCDBNJ7Ljv6/pUszVUe8GX9l9laUIbo26diVCwHSPiK5YN/OzfefwPZO3O8xkUHGtKPd/mLZ2adu9pb+7rtmyZK8Chg0BRtR3U54sRCbW9XTdcvfK7fbKEGCBAkSTDYcxRvVZIBseCQ184VM/gqVwI6jov0kopLMKuEBAr2ttrGlmpwo34RdIRRVriQMbjhnyOBzgvWQ8kT6v9fZeettyaQaH+1otxlkzAUPtj/8mcaZL7pXZq++W1K5GSpTtKoOKdgvuobaEiMnSJAgwTTFUQiGIwK1Dc3fY5O6TCWY8tpXTjjOr5gPiaEDCjMGCoqecxHpIig8YoS2/4Ag/cSOjqV7o4k1IVkxEfl+Es9fggQJEiSY6gTLkav5jeufqPDuATQ1NiGbInO1VqZQqiNPAgINEC1HrBQEisiWwoAAiPVNOh1K7vM7Om59bZLgXD5a0crbmrZxdsqfyWog23Y8asglSJAgQYJJR7Camjxks2Ftw7XvZ5Nqc9IM8JLmGgQP81YBQz1Xxf8nQBkkBKhVnHd/59Y/V4pktaKVt2EbL8RCbU+0vBJMiwVeiYVRggQJEkwxeCUHvWzW4tyNPnXnXgW1cNL6lLTWAJEaLD5BRa8VhwWp6DkDRBB47Huw+U8AuCSTQVS4ffyTUytaqc3lcw2EGwuJ4YmVEkwetDKwnZzg5PaILLWX4cWLPo890eW2Wo6/XlNrBfP+KnbskebVCfntcbZJpfJPp4s9Ko3jrmNWwXMu59hbp0QebomGcZ6VeY0tzzVkfoapu3PwmDVYIbG9OAdreN4VD3nfAOmyHvsmCPMv/3vXV765alUmdcb28YUsCyTqWSvWPGUm7FNVvCM5T371ix3te5OcpQSTglQ1beOjqpOvyqQW7EUqP2OGJ4EYnRUSHfKUOKVeVX84O/DyXV0N+dEn5UyUE5p4bhMkGDJNNTUZZLfZREB70hEsV8ajrrHlU8TpN6jtD10l9ATDvVODBGtoaJBHf594ZMiK3P/X+iecgWzbuMulrFy5dk5jmP+sT/aqFHuGoBCRvf0qH/xh5zc+1YpWbkt2KyY4EcRqmKdiXsM19R6ln6qqZwD6RBAtVUUdgNkEnaFAmog8qDKIFAqrhDygfaQ4rMDjBDwG8P0KvY/V3lNl++8dWpPw2Ja7mlvf3JDyPA/IAUhP7LtoxoM7dnw6N8GhSGtWbJzrkbcAOBDzmNJAePjQ3q4tj2KCkjFLl2aqc+k5S8r5TKj5fO/OW3ZVwh7zGq6p9021Xwl7zAjD3V1dW/onbo/MXI8WlGGPCs9PgciRoP/AoUe+sm+4w+QYTYd6ysprF1itnjvxc04jH2j3/l3/0zt238yYBSurG6D+pA6rhbA5b2SjZcP6+uaqg5CXQEOAMF28Vzo6qYzbo4pDfzrw2vC8q9LvAxhg0VB9Nk88c9d9d1LjVQ+yqscgRZG0w9D7wucFxj0nEIXG9p85w/hPsxJCbBCChDzwghqT+q8XNr78SFtH2xeTcGGC47v+yDDQZgGg5rRXn0FqX0mqL1LgqWAzg2Ciy1BB6u4VxbKxke+VCosZAohANBiQJyhUAvTxzI66xpafQ/Qb3f6c72OAsFRSBsVNTjVL1z2Fme8SsSmXVWHHO4aExCmvNzzwDgAfHXdNyqZWg2xbyJpfq0SfUWtCkPXG/u3QE6avAri6IMMz3jbp92Y9A0rbVIMYEQ4VIp9ZzD0AnjZ+chftbK9f/2SQ/wcRm66EPQ6yfQ+ADxVyj8drDyMzXqXGfj6mPSoPA5sy6Z66hpb7wHwHhbmt+3Z9+ZGiOa+yi4+mVi/o6vwRce5MVc8CdrwqA5YoMIZzPwZwSVRdpcSxKgGkCxvnzA9t+CeCzIIrLTPJiJYKkccketewTpBhoN0egj6LyW/QaREeVDfYkuHoqcLlLJXVGagoHEglPFfFEg2jebsAgEEEDTVN/momKhFOLO0hM9F+xML7oILA9ltDZIjUcxTMWtE8VUHbLl98+a3tj7T3IRE3TXBcvFZtArTb2vrmZxKbt0PkcjKpFNQCYqESCDQQEBUtcgo6dFTEsXRgLtBCv9UozKGqEdsyRKYRZBrBuqHOHv4bGq7/dHfnji8BbWHlVu0u54t8s444lVbJWUxIqkY5SpdsBpo+GRVnrpQ3oRLvmeS/vY0BCJFZS+xXVc4eugHnbvwYspvC49gmx4RiEfECYrMA4AvU4F9rGls+3Nux+ZPFXqcKLTykrrPjuWRSZ6qGOjE7wKgGIPJW15y24YzeB9r+FuMaphPc1rHsz6UGFBC/xNVzpikeYnIrJyKfofI4VLpBTMS+GSBeMVuLRnipRia7l054H+rFcqSLyGpgreRDEXdvJQit5MNQgug2+JoUvRZK3loJQquBGCJDA8QNMCAjKuQBpwa+/yQA2nrCky4TnBTkqr65qq6h5ZNk+JfE3isASWnYHzr9PFWAOEo18KLB2LjFG5W6jChyZRX+797vPm8c1wpFJR+q5IWIziBjPle3YsUv6xpbnu4G5iZv4oNk1i5dmqkm0KugISbuBSBSCYTYW1VX33DB4GQ18YGuQu+ZzL9NQNbW1zdXKfTqCtmDVQJh8k+v681deJztcWxsoaIqgXWpPZhvTPoTtY0tt+LcjX6UjE4V+y2mZhArUBHpo4DYN2R53RAuMnYbT0bngZYiWORWVBt9JbzQdWCdwt4rFWKfVcM/C8JXpvzUE4RSp4HC56kE3ydOMVSDqHMc9UZQS9H98Nfc88Ljoa9h1M+oLcwicISNGEqDs4oQQ0mhhKIbufdAITRyRhqacJ8gwfEiVwvqm0+pI/4Rm6q3QJVU8i6xncgrIlCVXiSyI2vEjmzlQiLzDJDJ1q1Yf40Lf02EZGUYAPq86kuJvMibDzPBcyGABGQgTM1IPMtl2+MA6HnM/ooK2cM5EYihgpZpYI9B3WsiD2pVbX9gTNXVdT25Lzovc4Yn/hvtdtbijfMBXKEaECoiQK7GpSTpq5YuzVRH4esp7xwoGoBaCWiTufW5M4j4dFWrUzc8GJEra3+Hgz2X9HTfcbDonz8F8NPahpZbjT/zapXgqHbkEurso+tdjR7mG23HIRd9BgMjxtF+sxAitLASWiIX+2S3fLE+MQWqj/gLFtyLXaC2krHsBAkqQq70lJXXLggs7iT2nyK2LwCRj+Ne8YEYAKuEFkTVhPSXaxs2eD2dN988wXChgqgFxAolASqSj2pUQzD0illP3Dj/0D827UMSxo9tD2YcE3sQ0eUzV6xbeHjn1j3R906DDUJEAHwJ+wIyVRtqG9b/pKfzli0TuyZc7p6fzr2cOF2jNm9Blbje3UKJ2W/s82deAuA7hZSlaUKwXHybiS4h8kk1P5XFRUlVRBG8saf7joNYlUlhe3sQTQwGaAut5P+JQg4Am45CoVR6hJUBn58MvKbQgVHRJadbFMJ07jENI1oUfbqYJBWHGQEZElosfKYwgpiB5YMQEawv+pSZJn2mlRxIESop+WDjs4/DYXDDd+7edCRJck9w7FbK2wlo4rzV25jTT1HpL5CrEwkDFVEoiL0v1axofqB355ZfjmNCYaDd1pzWsgyCF6hUapUetZ2KJU7X+kH+ZQC+OP6E85MGDLTb2qUblqjihTgm9kjNqwr1FYeBzwFNDGRlGl2tRjVUAn9wwYLXf23v3s8eHj+pXy1AFgRtdpH/ih6oAMxQbQHwbWDVlF90eMMbjgmXRu0+Rd1zLoNfNPxHT2fuLgCM7e35wf+3hQBo/65bewE0T1XDPfv062ZTsP9zafBVvjEeQSEq+x4Pgw/e0fnNL7QC3JaQqwTHBG5lWdvY8m5jqi4S2xcA4yJXGuVnibsrqLcpXDK7UvledGIAlsAeid60YMHrz9m7d8GRsiaUpiZGNits5VVkqmccm0oWClJtdgQrm8ipxLAHDGXYpGZFIejKeklVAcYGAJ+v4OaDycKwGBpaMumlOqPvJQC+Mr4dky4lYG5981lE5pmqgVbYDkYlgBK/oOa0lmW9D7Q9WNldwSeOYBHQJnOWZmpV9TyXNjSV5RkIAA5Gq1YqPbBPSsNRJmaMvP2+Gw8CWHvJisxHZkh4OhT5vYzf/Lrzm3sAUFtSTDrBMcHAINsA0LvF5gQoWydvYCcvkU8g5qH8hwAIVC2gViKxxHIGcqMShOxVPcHOPPwv2PvZD5TlxcpmLZAxSrSOjk0lC1YJlIievbDx+jP3dHzpnqk+kRxTZLMWaGVQ53q3N0mpwvYwqoGC+Pz5y1vO3rdr8x+Ooz2KgyNlH3cZU4s674O+GMBXkF04Du+Qi3IZonXEvjkGGpkE1ZBNeqaVXAbAJwu/OeKNBBvVFS5XpmEcOaEqZQq2FjqpeMUrUs+rPo/Zr42nbTJpyRUpLAh02qmnrq97+OH+x52rsfhiyRigzdY1rD1dtYqB/Kjflip6PFJGLT/k/8PfP/prOaSQhhPJAxisfsqnrnxVR3vXllzRhXfUE21FK7XtbPsLgL8MnFkSFkxwTLGdAIhHeCtxamb53h3nqiJOGZW8ioR/AfQeEB6C0iFHuqRWlU8j6JnE/jIQQSVf3phEMBGJeeOsxVd/NhJfjOHFirSvVlQ9i+A97RhJ1RAiDaZQcusBvH20iSSBs0dtfef5xOZsJwlwTOYmS+R7yv3rAfzhuNmDmIjMuLxALn849rsZEAL0dNf/2qX8Ppu1ixatmxlC10CDY6ORSSCoBUM3AJn/KrUoUgkJhuYS+yg3yukWbeWdOpHH5XU5NUQeVMLZbmBs2kPIAkp8AcjAlceZsh4sgqolTtXk/P43Au2tQMagqdUDtgHZ1QDawtrGlgzIu400BGCoeOQbrRQOMFyqwRsiKDp8N58ZRS/LIAWCgOAXcq0kJczLcfgLXcDGmCRJ29Cmw4s9J+QqwTFcbBNAtnbl2jkaIgMXIuByhjcQEwAVzX/OiG7a27XlT6O9u67uutl2bnAhW34TmdSl0YQSc8VKhVynunSVvuoQ8JlYuU4ZAO0Aq9lA7EHVljEWFuKcMb1YakGKNYsXb2x95JFN5YUxTxp+5ewBomaXG1wOoS/XHiEAyixYkHnf3r3th46xPSyRZ1SD31oJPwlmb+yZ3wltsrKn0Ocz8Xp1uo4UuzmAuViV8aO0mTLOz107wUzvBUz+MpXAAhSXGJYj8h15E72n1Zw28/zeB/CrQe+z+/gM4PGDShlB4AMS8/iJIRIy+K3E3jNiOpEskWdEwy+oBD9SIp8oniSFUUsK7XYd1dULAyueFZH2qb49klXyAuO9t7axZW9Px+b/RrbwryzqTmt5KZS/EHnyBk53uGDoaHUGRxcZHVsvq5ToD4PYSiBppuufveKVm9p3tt8V1xM1vNhzggTHDmtcflPgnUPGW1Smd0cBBpQOE8ma7p2bvzfES9G0ioBtAFYXLlPp7m47iG58F8B3axuufSMx/0fRHBRzjBJVxVUAPjN2rpMS2snOWZqpherLnYpLGWEYMlTG6pih1pJJLc+l+l8A4JvTYddUxQl9O9m59c3zALwisgcfO3uIJZNaYmfxZdiL/z3Gmw8UxIBgZ2/nzbeP4/Nb6xpaLJlUS1k5aUS0Mn8K7Sj751yONkRbYMqtb1gguXE/RpbI80jCZgC/Gk7UorJG/zueRq+rb34FiJ8xIF58dAsp2EDU/uzx8dkIXoHFzq1vnqfQp+HY5Bwcfy+W82SB2f90bWNLC1R/S0ShAmeSmtVOJ9oOrHBKkSsUvYZRvFSlldtLfab054tK7ojHxkuLfHxwlkmQYDJhQPzvSc7TbcvKS4jyNv5tX8fN33M7e1eFBQX44gXQ0OvY5ST2dN70qfkNzX1gf5NqGHdCYZWQQHTevIZr6h/vvLXr6Lk1qw2A0DMzriCTnl/GxOXGEZFdgC4ubzclAU4T6xvTYddUZRHZg/lyYn/h+OyBU0CUKssRpbbFTeARqTi2JDIViZsWNqDHwEEPOD+Adm6BSssxyEkbhqK8S+JLol21HM8OTKqyhwgpgObFLG3jlN0VL5+7/Jp3RhvShnnbyhaEde1LJbN4jn6Fqs50v3fQA2aH8cfKheoVVk2G+HRiWuBKydA0Uf9WqOSFyT8XzOcWCI9KEFXhoGGhwaMpsg96qTCMHPFRyFPx45G1CYd4wzwrga1mv6mp8cpMe0d7e5JPlWBSoWk1kM0ChNkob0nqBk0JAKVv4dyNPu6Gxkgi1sGNKhv9fZ2bvlDX0Px8MukrVeLKyKhl9qsgeAaArqPn1kQTKlFzUc2euI4BWA03MvjjRN5TYoYg2I1FdKkjgG1dSbL7SHuo2haCVw5DApGBleC1xPwhJnNWfHuECjYXz11+7Yr9u9p2Hnt7UNTHM4jvvWxVoE3Jaz6oEqKsnDRVTaVqyyTy7prxDK4iSlWXkXdp2aQ8kf5PQnUxm6o3ie23MT7rwvsmvcCArgCwZaQ3sdx5sdC+zeNYxKhE1SEI+EFZv+sV8q+IcQ6RD5WcBU1Z/atStmLVQCJhugK3McUkmgoXJYaG9oZ6rwbfV6oUTjEpG5rHNfjdRyu5E/0GkVqtgn743MWXf3fVI6v6McE8gAwyZlVTUdmB7GppSwbwBONBdptzRYEOmOJLJx4ssTEq8jLcvekjQ1aiTXtocFfT7RJ9rQ4lWr0CgFS4FRS81O1cHPOyiK4dAiDnwWXzjHalGKDN1izbcAYRXRDle5lY50WeEc3f29t5yw9r66+9iMg8BRJIjCRgAjRkTs8gK1cB+H9o2sbIHsuQPxGaWj10dnpoWF3+xx/qMVjSStrRZY7tNihHbOrqm58EogvLs4dvRPL393bd/P2ahpbngM1ZZdmD0lUw/VcD+Hc04fjYI2rXWB/p7PTQhX4VOpXYh8uHitM2bnf99u1tQXnXbtaVnhKsA5cV4TJi81YYt5LFEuXwTeVFxxSANjuCdTy8iZXHIJESPRdmunqoiUdzaY4WuivkXQFDVdQJR8/VGukJKyZkR/uMggG2am0Vp06bm5I3t6HtQ01o8rLj1GVpRSu1oc0O7ZdZtKKVE5KVoHw4EqSE7eNIJWCVUIn5Q7UNLctZ7Rf2dd3y56HhwWLO1srRyjnCKgGaTM+um7bXNrT8jI1/cbydhVpY45wxxEs1Am4RwsasJU55ZazSXS6N8i1uoKHbVPJvBcVNAFaOZHHWAq2fQPYGeyzDPQrNIdsWAgjRNa6vCLEDoPrreo9tX3NeE2GsNZz2y7YHaCsAUpLbVfL/Gl9OQBkaghRrce7Gj0ZtdexmpmJ7xE+MChcv3jgjj/zb4jtaSaINJvc55hJXtiQq7FzfcAGxd0YZCgOW2Gexwc97H9j8ILDx0bqG3N+J/SfH/I5oFzBfUFu//sk9XW1/n4reXa+Q4A7Spzi5B5xUxYGHl6UBjp53NTzMV4qQDU2ALxUuLPU7AzcWCWQG0TuetzSz5Se72x8a77m1oU0z9Zc/a56hK6tE5uaJ9u0H3drW0XZPQrISlA+3tTt9JPxDWK27ic0St8su1oAbuaUUbFKvU8m/tq6h5W8K/RPA9yv0PijvYkFXTfrh7h072nIYEsrLovCcLG+ABKeE5HYQEXkCKp0PRsSqYkmMHImuilH6fDZcujRT3Uf26sE6rGMOhQqQJ5Lvs6K3AtB9XTf+qbax+VfMqQvjeRach53Yf+r8ho5n7+ukn02wvM/oBFdDkOqzaxuaP+NspuNYURMBKkJ2CWnh+TFxl9qVK9+Q7gkPlGMPAGREgv7Q6pcB6OMdN99T29D8Czapi+LbIxRi/8l1+/ov6AZ+eiztAdD5ZduDiPLIXUjkr3JinzHIfDT9EOn3ihcUsXk5U3OUd1nGrloiAJvd402BUvOXicwHy1ApsMQpH6prAbx3KkqZeAB07vJralRxmqsYM+UT3MsgV2PnXY1GlIYSrdGT2o+Wd0UjPGQuTKgQqTL+HEvhh5+6/Jo3Vc0w3H/Ejtmx5kb3MySgI+zrCnPwzbMJ708zgYhRRUC1yFuvb3zhW9o62v7bqb0nOxATlDHQImMee2zr4dqG5k3E/gdgbYgyJV0KycrE3lOI+CkDr2sIJTnUaxftqW1o7iSiLijuU6IHiKjTKD24p9b0dN+96WEAD1futNwqvc+feQmx16ASe5Xuap5K7s79XVs6o5JceYC2AHRhGSORgAxbhM0AfnaMbMdQAbNZCfJXTvzrpKDDdAwmC2eP7mD/84xJnVau10Rt7icHHrz5AZfrtykAdDNAF5VnD2Ywt8DVrj1m9gDzaUz+68u/EkPEbxcVsMciuYeV+r6NSNMq3hRZKOycvyL+rlpVkDFic/usBHcMGMfyVwj59wJUFS/Z3XkTFXp1fX3zB6Pdg1NKysQDgLTxllnwfLellU4KdjVamK+Ud6rofQOquwShSIK6BKEqWjKMsouQgVH/z4AJJNAq0PoVfOSF6Icyjx6qHJGIzwqC0gzi+aQWuRAhkYIV6hO8Gjafvn7FS/7YtvPbv0wS6ROU78VqZUo/+J+Sz13DnHqSSzgvS9HZAFDVQIflRjIRzSIys4h5RaFXEwQqIULYg7U94cNobH6YQJ1QuU+J/5Ay9KdHd9y0d+Dbz93o4+5eGbkrbzTv1Sp1zjVtAVij2qRxJi5Xzod0MwBCdY0CQJCz30qlcx8DmVrE0ykqFBx+6Zyl17/9wO4v9RyriUTVKsRO/HonqmQ9wNKNy+MptK0Eos3FbW4l/DaQ20ds5sezhxrnXcJLZq28dsEh17eOzcSuVnU89iBw/OR2UiafQwnbejva98f3yEWFnavyLyNO1cYv7ExOtJXkG24HYMYAq3T/rradtQ0tP2aTepEL78fzJjL7Kw4guBjA96aalIkHACHxSiavjGS56UOuRiE4Q7xP0f+EQGzYMwyAVKAaqHtfsdTDYOI6l3heynM2NMl+0JNFEE0zzR/+faUS6QvHOShuShANhUHMpJ6bvQALDWcCpkrDNwL4ZUHHL0GC+F4sUPd9Nx6sWXpdRn35CbG/QG0QRHkuFP8ypBLbvVVVQ410aooFCg2BZxPx6SA+fYB8aYhA5LG6hut+Lgjbe5XuwN2b+ou2ro81KTLQJjWntixTohdAYxcSFpDHavMP+n3yfwAUd28KgYw5+PAt3XUNzd8k9q5TzcfeNcWcqvP8/MsA3HjsNJiIJvkmJgbabd2y605VlRdqWfZgI5J/mFLmB8X22L/r1t7axpavE3kb49mjIFKbqqkKcy8/BGyawvawRL6xtm9rb+eWTYNevTjYZt01ps0De0XiDRFGNYRa3VL0XRxNclsAfXF8aQmXO8YWLQC+O9WkTNjxTX1iFAKe9josw4lUqbypkd4nFcMeK7TfSv6ngeTvEAnuZjJkyBCgOpoYKTBc0qFUrtaoifAkqioj/rToXtUWvWZV1UaPGcQjSaOSQOGrbQSAv6E90d5JUCbaBGjl3t03/tUiuERFt7NX5SOqJTa+3J4hxIujSdWLbqaIfIlKYFXyodr+MCqdsoiMd6Ux6dvq2NxV19C8vlB7zSXGHm2R3uT+n9Y1zKmZiBJjYkwiQuRBCbc99tjWw2hq8orJnIVu0bJrug7smsJJWwA6socaybBJzY5tD1Uh8kGC9u77bjwIDLWHkt4c2SO+A0EFChTsMVW9/KywCuIn1S1f9zxHruJoSGUMQDqvYd3TiMyznJxI7F2cBA3+3LvryG8QhRmj9lNTffj7KvmHiAzHrFljVAJSostql25YUhh7phTBAtHK8qoKTG2CNZL0lPY+FZaWHvtsrb1Tlc76e8dXnvf3jq+89C+dXz1PLL1QVHcbYoLLxLSAWgIsORXG6LFEr4sl6IjHgzcZ9lwtQ8VAhaFCRfeFxwyJ7kfeAJVSSfauZ/NBd4atCV9IME6SlTGPd9x8T2j7LhCb/zRAOTJVHtyiQ6LJsVD8Sytz+RaRLyIv8jaoSt6qBJaIziCTvrmuseXrc5dfUxOFBUcfkKPCzgRdF+3mizkIklHJixV8GWjlaGMiuRV2Kz9e3/grlfBvRF7cicQVgAY/p2ZFy1MBTKmJpGIoFHaGRoWdY9qDyKgECiNb3edXD7FH787O36qE9xB5FHti11BB/MwF9c1nxSLrk3XKUwtm7zx46TvnNzRvjHS3xiBL0a5aMuuIfRMVVo63SiADKH3ZpRNsLPJqb/T3bm8/BOB/4bR4Jd7xa8icmoUUZYq8YVOHYCnQEI1/05phFcsmlMpjAoqTz9V5rsgjkeDP983IX35f55fvyyBjXOds5Xu6tv6gX/QKVYQpTnkeG+OzZ3z2jBfd+2yMz/7AzWM/+l/hNc+k2Dep6LXC41T02B94rxc9L/6MP+Iz7n/R/4mZVC0NTnBCCusTc8h8+1TrrAkmG9ot0Mr7d93a291x0xvV4hyV4FNQ3U3sM5kqj9g3jmRQIYfFRsSrkuSrEEYyzsOVC4nTLzcm9eM5S6+vjb6fS6/SoTXLZzyTyI8KO8dcpbNPCvnF/q4tf3IkLhu632kToE2QbQuV6Ea3wYsk5jlYYt+QYt3JeW06e9Q27Ho6sTnHeSfL8ZrIr7p33nJXZIOh9nD2+VJkj7j9zRL7bAnr3dPtU3R+JHI5TwKY1OdrG9dnCtfu6H0xGy5atG4mKV4FDQHSmMrt5InkDpGEW93zTUHBNRs9hoXeqFpGLUOCm8IUG1wfyU6hHKxVmRQd0cXOq3+sJfdPOJUfQai45G6+QliNlIk4p/xv2N6eX4VMqh3t+eIB4e9dX/3jWctf1UTEi0SsGNWBBjRD7sMhI4UZMMDI10zRYsEMuwdsccxk2P+i7GEokQpXM/611qt6RiA5QBWGiKpNKrUvzH/vt3X1N7pdhNkkwT3B+NYqzpOlBc2qnl03bQfwprn1za0+wgtEzWoQzgVQD+giIjODyBjHdaIxVwXqOJYjXwPfr4UcrTIHJKd5p5LLM1ed7Xl9mwFcAbQS0DZsPgfQDpDBBiJDqtaijJCegr41Z+n1tdaHz7n8QH6Oisc0LxQTYJtKrj/+rqmoADT0VUuXZm7Yvbu9D5VPrtYJhnCHt3UF+RWihFDZQFRFqv3xNk8oXIIp9I6j2qMPP7OSO0KgGfF3sVkQsGbRonXvf+yxrYcnpz3i2IEYKqKwSmq+UHNay296H7hhN6IcxKHvbTJA1gYz/eczvGVlkCEh9oza/M+sN/PIrFOuXUAcDny3akjAbEhgd7MX/onZPze2JpaGSvDOrqmvekZvF359jKQzKk+wZuVnzQVkgWJ67yDkEnpXfJQ6geyuLmMlEBKzHQBtx6qw1Ar+T7vafjUZz/mylWvvJHn8hirQSy1wig/sPmjtbb+pq/+3u+/eFNw9xba8Jpg0GL47b2B3LQDs79ryOIDvRDegqcmb13XaEha7GGxPU8UKED2BoKcBdCoUi8EmTWS8gS6pAoVEujtU8CyVMz6l1PaHbNIvqWvYcEV3Z9sdQwflqJDw8mtqoHh5tGssbn6OUQlAind7nn2Hp0pIFc8RAvQzBBCCekW15GMMU9YS+fV9XtXzAdxR+eRqoihMhvEtpnWAY0Q5TZXqUoR2sjUrMnMheKWTBIjt4TAqeYDoXz3PvnU0e1iCQNUv2pM0JilRV5B7aTAjfxmAr08eexTbIW7RdWKoDclUzSWbezdAryvU+hyKhdGuWmkBQ6Gx5wijEoJAF0Dy/0hVKQ1dr6QA5OCuZ5rl+k9skm6JjUdqNgD49ZTxYKWCcL6SmUvTOL99ZLmbkTIMPOJ/zhPFAAVCk8pVn4lZ6LJ9x5cPAPiXZy7NvGdROj//W+nUY9jenkfHwGkm5CpBeViVSdXZ2Wk2VSq2v+SMoDZHNvAYANikdeYDvfndu2/sAtAF4DfF7128eOOMvnS4wJOgXlROI5KVAJ6kRCsIaCDy5oEMO82lMuukRrF+Bb3akZXiRfpqgyxCw6kr2KQWlFFIuGi64rqx58Fx5KoTQ0EtAL5VwRIhGuWr7VeVXe5caZzXvwqIZgPUULkhxBV25nDG5eSnF43HHiCuG7N3jCsiTYCiBcDXKm8PPaAadJVvDyW44sVziPx6R1bifJyMal6J8KpZi69+36FHvrIv8hZHH25loM2e0nBdfQC5VCUsU45DAaI5RDTn6G/Tcu3gpEygr5hb3/yuaBE36ecwj9QsBg9UG592HqxyytqUUFu3HvtGTP9zAPxt5crfpnbsQL6wfGhCk8miLTynIfP/+ew3QMOQhtXl4WhhP/w1Bg/8DwC8Ud6HouceEVvVnvaO2/8j5hZ0uh0ZXuNCDQ8CwO3ImDVOkTshVwnKofUGaLfz+mY9n4g3S+7wqOE0ggevkMioee7zZ/XPXX7thft3HXITSdMqQXa7Aqv0kUfajkTEqwvDRDZPWXntgryVp0Hsy0C4lsjMiKkrVRjFWTUkIjpn8eKNMx55ZNORgUE5W5gotXncIRoVLfYkjMLwyh1THZkkfn7NivXLe3e27apQiRBL7HsiuR/0dDRcA/zWB2aPxxNjgFVhXf2DTWT4J2WIgI5FsJw9GC2T0B4KoovnLl/XuH9XW0cl7aG2/87uzsY1wHYPQJkuwT20dOlC/4g36/9jpv9UpwIwdr1FVUvs1XhpebZbeKzhwd92aukB5CridDmFnYeyJ6epWcIOhdfKjpYVCkAv9CS4HMDWYyedUUGCJUzzDXEZbsapSq5GvjZcbX1wB+GApAJBQ/XIvG/Zsqu+s2PHV4vVozWLbHhuw6teOsN4mwwBpH5RCFKjmIYpyCMU6Vhx9JiKfpOH/P7Q9w0SRI89ZFZc8Uj7TnwlqlN4tA6ma1xIhFoBaht8niBBua4rdQNG+BAM14HjltpTsKkC6+FXAO0fB5oI2fZw6GXaSsB2KhSedyGKdhuJh/4IwI/qGlu2QPX7IKqN5GTihHgIqlBoTc701wA44gb3Gxhok9rla1cR8XPLKCRcYoihIe6yygxbapnTM9T2vwrAxypbAJqixO9MOL4cllYF2oTougqOI1Fh54brTgfphSrhZLNHyJyuhshVAD58bOzRGo6HtO3ejRDAp2obNlzBJn1xLC1LhQJGmeipAO5A0yoadMpFhZ0HdtWOq7LLGHaYiG0UqrbFEazJXwCaiezCqDjmtPNolFZRR4nyN6OWzGFVC594aZ1PP3nKiqtevHjxxhmA0sqVmQXnrbjqzSnGV1VCG4a5IJR8aCUfhpIPJbovvGYlCEMJoteK793jYODePS7c5yUf5iVwj22QDyVnZ6l+6NIz181cjdUSs7dqVBIn8VolGCfanIv7yOz7RcOH3UgnFip61BvUiuSFif950aJ1M92gOGT3UjTBtFtks6FbkbpFgbtlDFZelu7u2Px7VW0nSlEZW8YHBzquKpq83O48Ym8tcWocnoNjDaVIMmId0OQhu81WfGjEzrGGwVFu26LPaQWjHdFuSZJriFMpQCebPVyyO9Hac8/d6A/U762oPbaNzx7nbvTd9cS/d5nDcbx/Wpgea4e+7nZxzm9Y/hyw95TKeScrhkIB6Avr6pufNBU0sTwFzZ+O00Exf+ZRidagt6lYjHOoRhaRaiAeead7wHdOrdrftaTxqsMc0sKUMfPhckPARIaPWh6nWFB0ZG3CoSrtWlIFngiwKnYWpxoWHXj8bW1oa0tK3SQ4XrMM0Mp797Ydqp3Z/Cdic6rG0ykyUGuJU/VBlX4CaHstBqROjtpvo4nidkFqTfRYlwDlFKRXJWKCoMcPsH/w9WxYX99cdRAos5DwcRu9ogLQ3pk1K1Y8s3cn/aLCu6YUmFV2EozDwnF+7mjIhitXXpbuCfUamtz2OGPHvtxzAGyrnD008uACwOoyT/oGRd8N5BY/G/zyO0Fp8mTBGwwZaFmFnY8bLHHat+hfC+B9k70AtMegmulIrqiE3hWPonc1opbfCFJE7MrOKHwy9a4suUIksAxlAhGVzOkqzqnSER6y0lpcOkZtQ3AoeZlB9LbMistvun1n+4M3oJXbJp4TkCDB0TEQGqH/A+hFZUy0RiVv2fNfU9fYsqe7Y/P73cut7L5zYfQ9q3RAa6hpD7nXyWI78nUN618K8l7kCjHHDR+RgowC9l6Xf9XKwGoGYPczX+KxaSyjsPPxHsUEZJhs2AzgF9O3UxUKOy+6yBh/5ST0mgyxh0e22RGsSn0t2Sg0OI7xuw3Yjkg2iJugNqpROF6iR/bUU9fX5QgvK3NX7fFc5zE0BCmuxso3fBA7Pp3HJE529xSomW6Z7aX0rmiY3lUpbxZQOuk9IkTMLj9QHNkhYqgZHlqkmCRurPdh9CLRJICdyWZWYMMPEbDudmxPxEITHHtEieFWwjuI6CMApWPqO0UkKxDi9PvqGq47GyQf6O5o+/2ouSxRasXsJ62vS+X96wB8ABBTxpbxyFPDBMWPBwniagGySirNgF9GYedocT+RcmIurzdmwnCh4DC9bM7S699xLAtAT4ZZkxgtrlxbWYWdIy2P42EPt4sNpC+dtfjq+W733UTtoYDqzLpl150qVgwbju0RUw0Jaon89EwlfQuROW9iedRuF2d/ml/GnK4tbxen6njC9sNsEVOGZaAA9Gk1sv95vcAPJnMBaI+gs6bTNTu8oPKgt+joSe8AhoXvSpEi50FiJy078PnhhA0AeFiYr5jEMUbkeh0lyD6ybiJDvbwEMov5mled9qLPrnmg/VdJqDDBsYcrj7N/19aOuobm75FJv0IlX8YuI2KVnJBJXa6il9c1NP9cCD8h0N/U6sMG1CdGPBWqJdaVAD+bcnQRsXfKOGQaFCCjNpcLRNsHSVub1K5cuxSWyikk7BY85JvYyf2jfIdKPv7sr2LZpOZ7nLsCwOapsGuq/OG63c5fvnaxKF7ktK/KsgeDDR8fe0S72Dhd41fRywB8cYL28KLdopepZ+8nD2VyFIouO0kz+yaqFVhWWzDpIQDAoUcI2Ba61LqosHNZ5MgQsT+hgtXODnF/lwTETEItAL4/mTu4B2CGO6+pr+Je7AXiUXYK8hjvG0mOtESYb1Tv0ph5Vxzz82Mfm2qKwDWiHwf0OcCaZP5PcPxcDuCPQsNXFK3i49bw48JOJzKp5xrwcwGJSpArCNGcGS3EVUNEq2kuc2u3EKeM2v4vH3jw5gdcKGqP+07rrzGcnqk2Z0FxJnQVIp9Fwx+QBD+NFFbK8JxQVP+OFoPwlvK9HGhxBGuaFYBuamJksyLsZdikZ8f3mjh7qAR3AsGPxmsPAi0C4a3lmUNBqs2OYFXEHobAMyZGEoPyNMOIKOpX/wAA9PUSQDqvccOZBO/Z8Qs7qxB5LBruhNjPD9XTKs99pdC3EpsFMWVYjEoAKF5Yt+y6U7sfvPHhCklnVJ5gKah6OoQIS6mxF3uXgNH1ruLtLNQR3qahOV1Hy5vSEsdYOlRJw3K1RtfsgglsaOeY1LOub3zx2i91fG9rK5q8tum1wk0w6eAKxfZ03vTbuoYNm8lUt6jELGlSNEACUJVAoKpuwB9cfSusRqEiihKey3QbqYIMqeb3i6EbMFD0t12AViZ0ui3oFHdRSaQqAktv7d61eftEWq+2oeX5zN4ZMXONBgtAL9twRu+DN/9tGhWApsHCzp3ryxNkdfawpG97vOPmeyZoj0uZvafGrENpVAMlMs9a0LDuaXs7t/4ZMUWfx+yvEyRp5XoOxebzxqqrQFJdo27xzmuJfRNf+4oE5LHa8LM9XVs+MZETqGlsXszkv0k1Z2P8NkHVsknPBnJXAvjUZE1296BKIIRl5iKceEdVCSY/PExXirhgGNnRIu8UishQ8XeOWFGO+LyO+P/QxzrEw6bDSBNGOTYadjwjzoFIIKHMgH7g3MWXf337I9W5JjR5C7HwhMR8M8duUq/AsWUwddAOmnTSAUOOT4FWzlftfJufy69m8hvKKt46eB2b0k6pYsJV9vJPAbJEnic2/6bezs0PuklwOwBIzfKuZxF5Z5WRr2KJPaMS/LpnV8O9WJVJYcGq8gfyzk4PXQ154s6tIPNhuAmdY7RRSJzyyPStA/AuN5Gsngb8yuXN1DbufjqROaesQtvkGdXgd4939P0NqzIpVNcoZi3WcdkDXbeA+GNl5PZZYs+zYtcB+DOwh4BVx2hOOyawzrOb+/Hegmf37k3B4sUbZ+Q1d1UZu2oLhZ2PwEg7mlo97N3OZV8bD/UYLKm1pqPzFkX+DbHJIgFwbssNQOt/A22TNAeLUEec8pysyVTxZQ29FoaG/4oFPUs9LvZE6QiphOE1C2nYa0d739DQnoJBYMgICQgucTxH/65Rf9MoBAs53fisqv4P/Tfa33xiacHkJi0JKgYBwAfvvaV7/mnNV6rwT4i8OaphuZ6sSo8LCpBlU+XZ8Mgnejpv3uJEE9vDgqeBjG4g8kjF2vg7rhiidDPQJljQJMOEUmOiVYA2CcN1txmTfz+BquMXHA5BwFWob25D15Z+HDrdn/I9qCBuqXYDcZpVc2HsBb5Lhr8ZaLdYMEK4tix7SL7lNkrn28ouAK1Ys3jxxtZHHtl0ZArZQwFSVQtV+TcAwCoYbIfkU7nnE6eWq+bjLjyE2GO1wf/1dtyyCztb2V1nZSPEDtA+4A91jc2/J/LPVw3jhDyNSqhE5pzahl1P7+nEbydjAWhPgVtF+laoiGhFxeOOifOKGDS3eGAkADLg2ZER+rEFb5ECsBAXm4BzD4wsn4OB7zEDQ+voOlUo6gVU9JmhpKlwLwPHxZHKO4a8R4Yk3xsMTb4nyIjvjMKWekTyJOCaD6143mc9pUUhFICQGUJAh57LaL89UotrsFzP0c6v+PhKt5uUbL/BLGNBccbxSPIpIzYtlLJdcTubwc+rr7rfmX3y9nEBaZqVc0J7lnT+/d0FNcfJuQXFJbzve2DL3fMaWy43ar5GnF4QhRf4uG+1Vw3B7BH5noR9n+zpvPltRQMuAe2Fws6vUA0QL/cKCmKjku8N+unrADB+kUknirh/V1tHbUPzj8ikL49yjryx2IRqKMTphjoNLu0GvlO/L2e6gGDqsqtWQrYtrF25dg6svLKM5HYFkVGb32+o/2uVsEfvw20P1jU0/5BM6mVl2cOkludS/S8A8M0pYg8FNGRT5UvY96Herlt+DWQMtsNGK5MWImh5uzhBBLsZg0Kp4wzRRZsFhLfA4/PL9SaqzW0A8NtJ6cHq6djy78mCfHrgQ43P+2f1ZrwubwMU12fXqFRPcTi0ODwJDM/90hI7GIu9eAoCRZ40LdP7NqQU0QCRJJiSXjoMPDYjvI+lPJGDJYeGHlt6iriFZhDhEQn2AHgPosxomrTbfF0+1uMdm38+f8XVz1Gt+iJz1YWqIVStHcaHj8Wc4bbpE3lkqjzVYD9s7u3dnVu+UJT0qs6LlQ0Ney9hk16gNh8zuR2WyPNUc98+9OjmvchkDNonskKONL6UNkP1JfHbhQREBNEWAN/umnlkaie7n/uIwd0QDfzLjeefUkaStiXyPUHuu3s6vvpYhexBFrrZU315fIFTUoAUTC0AvjHJ7aFQtSDy2FT7Yvtu6u7c8p7B3LF2W7Ni/XIoXRq/RJEKkWdU8l3dueo73WsTUbd3nzXc93Vr5cNgnhuzHBZHel2vrFmx8d29OzftxySTMvEqk6Q3dZGZJufwN+yh93T85L/bGp53FbP3zLy1lgiGS9RaHK3+4vDkfSqhcG+GSVoUEyoz6FUb5sHSEl6nArk6eqi2VIj26ISOBmo/Fstb9EOmghaJBCBmYC+mTPV1R7L27fzK/QBW1zVe9zoAbyVOrXA7nEIAageT2Qu5CLEL7xZU3N2kppGRAUPkMdhjlXwgEn415PwHDnRu3TFyR5HT7yLFOrgROeZkoAq1CtHN7lQn3FYCAD394Q/rqvVBkDkVsMHY3r7CTjG6uG7Zdad2b7/x4Yh3FZzxNkZbuveQVrCGHizileCSaNXm2v3uXgEAJl0HRQiFjdfRVd3mBHJek8rYQ2eFfXce8biT2CyDxrKHRva4qHbJq5f2bP/i7ug0y7HH8eBWDDJExvdUgn5rcx90DpXC9dFkAMCouRKcqlKbz4NiJLcrQrDx1Qa34ZFNRwoLmIl51zJmT8dXH6tt2PAdJv8qlXwY61hE8sz+AkjfZQBuiyGdIUU2QrxrZvxlBD2c5NpJ7dPkHDLIGAUwj/PvOAjzc0sEhpqCZhdFcdXB3DAMIzBD/1/4zKCHiUrsoKQSIUsaoTs2+L5iAkRF5IqGHMPg+4qPrfQ5DP7m0GPkgd8peO0mP1VRQIiYVUVp+A6JSU+y3KDd3XHjZ+vqrrtF5oQZIr1KgWcx+7OcFSTSJJQo3UWLyNPIGXyQhBGIDBXnvqsEUNXtiuAODe3W3gdv+lu03DBDE17d8/nLm8+Fl74UAMikvDjWIPKNDQ/d39NV9QtEYcYJm7ipyUN262E0NLezN+NfVPpNvIiMgLhqbqgHNwK4ITrCNHPKQK0ZOyKrhjgFhPlZlfEdWp+9KgMlM/a1pYbIh9pwbqG/zK1vPotM6oUAgYzvxfiOyB6HO3pmHMkO9ruJ22N3tr2vtr75NjYz3hHbHipgUz071AOvi7zNEKK0iW2P4zCaqEDUPgyb/65Q8Knejq1/dRdQW1TuKGuXLs1U9ynexGQYxk/HsQNABipQy1uLFzCVYO0g3Uwwa2F8E3P9ZYhTsJJ/K9Da7gaZox0LzSJOGUDH/n51363SP+4AiIcE04QottvbkTFrdrb/8sMNz/tqtUldnZO8JZAZWWcxGrBQWrOLStZmHB6KK1wRpYpojxRHLSWJgWF5WkfTGCuaWkdIZ5QuOYQRYdCpgOiS7596PbDgMcqY7u4bD6IbNwK4sWbFxuUi4dOB4HxSPEUJjVCtI9BcMKVcYUEaJpegBb8NoqLRBwTaS4pHQNiuij+xxa/27dp5z+BqtSBfMHw30SoFAElxH4m8TjQfQmPoaZEqk/XU8D3ApiAikBPvSNltFiDSUD8p3PcPUWuhGu94VI0x9ODAayH/n6DPnZOMcU6kymo9okj7aNyT4u1RMchwu0jutaKBHbM9iZRJjEL3FV4ykJyqvF40CMqyB/Nfsb09XzHdRmcPsKb/S2xfR1n2sGoMY/cgB9Yfi41pj2M8jDDTIYF2gdJ/7XGhMwxLAicAejhVk4LkPijhkZjfTMoEIyK9vbtv/svQa3+iizSgp7Y6W9t9uFnB1Yir3WFDIqX8ypW/9Xfs+EEOJcOErt8q4ZNij3xLNBx7HHA29owUSiOVf81Mtyo5JzVaXU1C/WLDRcv3Ef/VgmYohFzGcekQ4dHypkqHEOPteiSMFiYc+hmD0cOXjNJCsVyC7I0eQhyqKzbJYWcym4PW/mJp573P1UmdfzXWuJJhR25GDL40+0nra6utNzcf2lkkOpMNzxAhzyiMhSgxh6KS8wwdVmsOweJgN9sedG0pQTybPDfwJbU4EyQojYwZ5VpMcHwWzAmmC25HxqxBu/2PxqYblKta+yQIGeqNRUKK1eoZcXK1xn4f3J5mjX6bh+ddjYeQjefYpo74iNrZbMyhUH54atffL3OF9DDFB8VWBrZTtC1/okTIEbemPeRqChZCHTE/29RkylqANiGqv3hMJqYKHE8rowmM7LYTcT5UyOGJj4U6xIMyLexRfE5KaLrBxLbHMUVBC7E9Ro5ckze+7z9W6UXH8ngyxo0fcQ9lNZC9wY5PoT4hWNMOCtANaKWzT79z5o586i9C3nLVUAnEwxPGh+7SK52MfjRCdnSipNYDm1TkyM+rVYaqS04otRtQSyjkjyRk5RwbTyFyFVkvnMOet1/C9iUd965RwExuwdGJLOpao/vtRzHRqqJBrSwylSBBggQnHEkO1vSbvfR2bOeX3ferg//T+Nz35Mnf2qeQ4YWsh+tVDS/hA4wsVF0qn2q04tSz2TP9Njhggd2kSKWJVqaIqU+tGOeZGZFjNfTYRq/tiFE8XyhxHFOKXqkjnao4AADbmpoI2ex066JaRJgSJEiQYNqCkyaYfliDdptBxry24+e3Wsn/qoo8hkoOQMhASNDoJiFBQ4aGKHpt5GP3vuGPET0uvA+qoQcKUkQqEvzbnDBYdWnHXU+5pFNX+bAXhmp/M5OZARUeRpSA0fKmSuWEla7dOPzzU/aiJHQD06MgSoIECRKcrEg8WFMH1ArQDW77TKzVPwH6ec6/XeD9MmX8dEHHarioZ8yyPKMIfQ4lO9VEOBzm3/S8zrs+NXgkdwfowM/vWnzuxf1V8rMZzOf2ixUThS1LFdseWXx76G5FYGSoslSx7Cll4MiwAt0DANuySadPkCBBgik7aSdNMPlRSFwvfv43tGvbGAnQhV1omxqfc70hb4VVCTkqFTOY1D5YCqdYVoGHvV54bfBx4eYqKxioMqlRpd7nd/z+E7cjYzJo10KS9l+xKvUUbM//uvGsSw15P8ypqIHyaGKioyffH11stFimYapBoXYuG3NAZP2pHX/f+lM0eRdNTMAvQYIECRIkBCvBUWykCtDWlc9YUgcceNGO3x0AgFY0eWcM7BYpjb817aG27HGfpEfokGjU1+5f+YzZe8Jgp8dUJ6rKAI2m9D6WJEOpJH2awp1aAZlJzIdULl3a8fcfKTKGTnIh4AQJEiRICFaCitvG1RAk/fcVz3tzoHy9QhsNqDcFuXMBB63XPfDzByfjgbcCPNy7VvCm/XXVqln7j6R3+kwLQlU1UBrphSrt0eISZXpK6XZNXX7lapdb2LOXdfzjnukh05AgQYIEJyeSHKxJila0EoGkrf7izwlXvyaUAKIKIZ2Z4qprH7a46D/rm94lJH2kTIOCNBYGBoXd/QUDm4H/DcKMcj+0Y7jPjPycq89qot8xBPWVOdDg4KW7/vSjKEQog/liTUaRtb87mH5S2qfaQFV4YDdh6Xyq4QrvwHB1+WlDrqAAfCKEood8Ch4renkaL+wUwA1FZiuWbBgh0TCd2+M4tXnc9r6h4HBO2jvBMehrxf1toK9Ny/6WeLAmIQo5Vx9vWP2Cw2bGD/olCAA1plCFVFV8ZpMmBkGOqrzOMbxCpXbpjVRrH/27UfSaDyCwuZeu7vzjHa0An4EMAW5nIwD8tuGs71QZ78VHJLQGMKOLmx5dI6vU+6YyFJAqIs6J7Fhcv+jJlM2GU1jJffhygYFtkYkmJFAYCY2uImS3a1T+Qsd/PAsnedvGEYks2ZsIWBMJsi7U8X8P4FTA95Brq0qogY+37SdyDnHPsxzsoQpWEIgqH5zofjOukWt4X7MTs8GeiJNUom3LtSlQafHUhGBNxumoqclry2bDGxov/h/i9Gv6bWANwRuWnyQE1YkQktIq6iNzm45WpqaYdKlCU0TsQQ/7pK991s67bysIZf5myVOXkm8+XGXMusMiYqA8llL7NCyFczSCZWczm0PW/vTUznufN/XJVWEizdpSg33tyrVzTODNyInOZA8zDTitokaVmDi0bExo89ovTIerfT5Mh/3Djzyy6Ui5v3NyeQ2azGgT06JF62ZiJmb2WzODRWeyr9UqnlFRQ0yWmKxAchLS4bThwzalR7rvu/Fgyd9pajJRDb/Ew5X0tdH7WujPImNnMVCllj3PUwpDUmKyViXnsxzR0D8kvne4d+emAyWu36P+TuLBSjA+3o2MaUe7fW/jxbf6nLoqL6FlqFeiJIyO5pEai1CZqNLlaGQmDqEqRc4AqE9E1QTkrP2bB9lJRCkA589iM++QFIRG49cmjFP3cOpDw7nseftteNOpnfdeN4V3EEar8cGV4IKVG05TMc8QxdOg8lQQlgBYAGAeKaVA8AasSOS2dAAARKAUAugHaS+UHgOhSxX3MNPdBum7H9v5uT1DV6xHXYESAJ3fuP6JUO8sYQ1jFfY97i1IatSYkO1veh/Y/CBKFq8dvb3nL9+4WI09T8meQ6JnKngZQRcptIaAKtfeTCPbWxWqoRLlCXhcgT1Q3U3MfxXBn0Tld/u7tnQOa++Y3hIlgHRe44YzPTZPEo3b9gYg0XRf6gcRwaaKE+lVmVTd4RkvUmYPEI1jHxbyhGxnT8fNv5vAMREAXbRo3cxgpvcCqPCESSuRks93RuS40m018tqubz5Fmc+zIucx40wFLSPFwsG+Rj5Arp9hsJtFh2UVmgdoPxR7ADzERH9T0j8yhb/b+8DWHePoa4NtWsXPB3scrxgGE0Fz3dWHf+iKiVcGSQ7WJMSqqFZSFfQBgIhUlIiG6TyJMDE7QkIlysQAHF1fg0RpUF5BVI+qxs4YLvQ5urjnsHwoEhXtU2g18xk+mTMIQKAWhyW0DDJUVAqnlMwCMDwXqzS5mo4rBAH9fQovDSKC025rl7x6KVXJVRB9hVg9h9hLMzEAcfN4dD+Y6qOFwVcHzUoMR85TRGYOmOoBfgaBMlCLUHPdtY3X/YJIbvcOh9967LGthwe9WiVWvE1NBtlsKOCM8Wd8kCU3dOCfTP5MkwKHfesBbB0+qQ313rUJ0G5rVmTmksx8GRGtUQTPJvbmETzAKEijeUll8PtLtjcIxD4BPohmMngJmM4G+CXGCFiCI3WN196lSv9r1Lbv7dryaExiC1ejDyEpbySe+U9s+wCOERVTBXEV8tWHXg/gf5xHo1ILjyYPyIZ1h2deyX71l1UCgLxY9iE/DQoOfR3AK0e3z5i/b4BsGFR7VxqesVklV0gCGWe3ERCnEeYOvRbA59HUapBtq1BbDfa1utOvm42cfRnYrBHV5xCbGsMp1y4aRe2H9zVVLeHYMQSuBlE1EZ8CojMBfiFBIIJ8XeO1d0Pp6xrwV3se+uLueH2tlYA27UvxKb4xXyfyMDSDeDRaxpCwv2/241XLDgLdlSKnCcGajMhmBQBqbf6mfeB/8djMEJGASIkUAKlJk8ekQQ+rhq57QIvJjsFw0c5h4TWihW5ZqSCAjlYKhzFayZyRkgoRaSKGUk5FAsVAsWcGGR6jFA5KeMhoyAww9H3TyOtOoZvr7gOA1ZM+P6g0uVq0Yt3CEKl3AvY6Qmou2ELFQiWwUCgI5LwZoGH0mEp41bUwxqmGCiUdIAUEBnEdk3kp4L00nMn/qGlo+WRv5+YvuIlg9IGYlHIqgVUJw0k6BlqADKkGR2/vNgtkUrWNs/6JQG8k4zUACpUQKnmBQkAFBqnD3AhHb2+oqMICSuramwigGcTehQS+UERb61ZcuykMcx/bv+vW3lgkyy0M+wfanuKwGRWIGhV688qVb7hxx45P5aPzqMD1sc0CN7BSx1tVAlEJLCgWwwkB9hQ4MsGBXqJGaVHJi6oNodaM++tUBSDDoGYAm1xx9Upd220WaPJqGxtfizzeQia9AlCohlAJBBqM1ddo5CoCA8RfYd31PTBGIEVsngWYZ4Hz761bcf2X+pH7f4d3bt0Tp68RiajSEWiQjlxmdHTGzATgIHGqouNuQrAmIdoAaUUrv35X285P1F+4LjBVN7HnzSVVEAFGFSr5L5ztH3y3119tQzoYu1PMCFLmiJ+3j9GMtxhOvf+QBJZdUeGItJT2KlEJclOK9AwlZDQsz6oUadISJFBL1hScLqVwSvgrlAFzWK1ltfe7V9unEMFyA15t/YaXh+p9io2/VCQPtf2hc66Si0oTSszpY8zHRUPmiIeqqhqIe8k80Zj05+Y3XncVcsFr9j18yz9GH4iVomWtxlvenhCY0UNo7rzm1jef5RnzeWL/GXCkyg5ensSRY7ucNj96e0PVTaYKsKkj9t9lDL2qtmHD63o6b/6/eCSLymx7MqrWskk/sTs49AqAvlLwPE28z5KtWdHyQkbqHHUEwY9/ycJMbI3nPEK1K69dRRYXqIaFPULjH9qIjGqoIPOMufXrz9rf1fbHUb25ZV7bNcs2nMGet4mM/2xIUOm+NviciulioNBAwDyX2fuXKquZqvrmN3Z3bflmrL6mMKCBvkZj2JOOxZo9IViTlmS1SSta+a1dbd/47PIL/pz3Uuv7hJelYfvSCL/z+s6f/3Ai3//T+voPP4wl69LEjaJWCMRUMgyoRcSp9P9H7uYbjSCVkmQoLc0AjFYKB9Mo72pgeFGfiPKiD2t+TtfQFd5kR5MHtId19c3vJON/GFBI2B+CyMTzUEy06dwkrRoKNBTi9GpN0y/mN6zP7Ou8JRvXszLVyOz8Fc0vFjVfJTKz1PaH0URnjkt7EzkPV9hvmb0VSv4P6uo3/FN3183/UxnyU9qRRSRvBTK3V8aeTiaAVN8GJgx4R48btjEAoVDWkUl7KvkKeVPVEvseq10P4I9o2sbj92RFC6fGlkuJ+HYiM+/49jVy2S+qKmG/JfaWwfjfqGtofkd355aPHrO+VkEkxZ6nAMl6/a5f7Hzzzp+0vavzR6/+l86fvuH1nT//obpI97huP0WTd1FXV39K5V1VRKTRkr44zFdKh6rYk0QYuxZgqUT44eSruBTP0TSwhh/bdIICmiKCAvcveeTuI5HA6BQgWBkDZMO6hg3vIK/qw6rWqoYSEavjbCZigDyVXEiEBcr+d2obrj3fTcat02ScG5zwFOabTJjlPAnkTSx5Z5wTIJHniK1V8qo+W9PQvNFNeJlKT75GNRBm/9wF9TMudZdMkzexdmyTmuXNz2HyLlLJy3H2ZBKQtfX1zVUArlK1FZyLiVVDMJBZsCozC66KB423r81r2HAhkbmDgHmOBJ7YvqZqLZmq/1fTsOFtx6ivJQTr5CNZ4NamJq9wux0ZEyWyjOt2EbLh7ciYNZ2/uT2UMDuTPQOIpVG8T6X0rspJhKdheVfDvVwYpXB0EfGyBA0BCSnelpApxrBUPRCY8IfIKzQFrstBTwqZ1Efc4Ct8Agbf4WOxp2otgWYR4X8XrVi30L0+1UlWKwPtMnf5ukYC3UaApyr2OHgSYhBbhUpgmb3P1ixvfo4jtZWe+EhABEt4u3uenXB+ERl9m+uudJwlAJzm1X7mS8ikGqHWVnAuZqi1ZFJLbd+MF2BA6qD8vla37LpTmb3bCKiK+pp34vuasEo+NCb1sZr65suOTV+rHJIQ4ZQgWZBC4nvl0A4FUIXg7YHSb9hlKCpFMyQP2c03yMZHS4QfnhRfnAhfvINxONEa7vlC0WN1xyGziE2K3PtDKA6J20pN0yVSSEQWCqt0FwBsmwJHDLTrnKXX14raTQTViFyVaw+FKwVUOkdiILl6SOQ4nsdDwpBM1dJA7H8BbVe7QXg1gOzw39fyznv8NHr8791DhZCWR+ZzxH6N2lw4jhCsa+/Bdh3+30KCcZntTQyoJZAxBl9avHjjOY88srgflZUJ8FQCITYX1dSvf1Zv1y2/Hl/41233r1nR8lRSulwl0OM/D65SAGpUW47hEKZQtAD4mtORypa/7DPhZ5iqTlHJheMjVypF5JUqc20TAcKqrEy8ae7ya562f9et+3Es5DsSD1aC8WINYG9HxlzRcdfvScIts9ljjbxYpaQShr4+0vs0/DPDSRhKvEYlSFyR50oNgNnM3K/y28et/cx+sZ8+bO3Pq4nIi0Kb08F/xYA5aK0F5E8AsBrZSS6ql2EA4pngHczpU6GhlOm5UridckScMsQpj9g3Q28pQ6bKI/YLG2LLm0iJPJWcJfKvmt+w4UKg3a58qMeUIEzl3CZISsf3WytXnmmANqlraLmCvNTzVXJ2HOTKAiBif6BdR9xMOmpvIijKFW41KkEIrjo9n879U7STs9LzixJ5xERvKyIq47vmRN9C7Hs47h7xQnL72qUKXKYSHIt5mFVCEPElc5eva3S2iOvBdeHT2saWS5lTLxsMQZdLrGCJPHbX9vDru/jaHuhr5XmyJLRkUss8Tr3VLdIyk5LLJB6skxh/Q7sqQD8Oc+87QOaVPvEcVRnYYztUP0tHeKiOVhNwbBX5Yq+YDvd8qQGQgoaB1dcv6dz+heLjfqzx9Cs9mBuJaGbg9LymrCdLAa0ion5gx5LamTvROVDIa7KCnRzDaxeGmtuomtfyyJUqwETsG5X84yL5n0H1LlXcT6Q9xByKlTQZnALFk0D8bAKeHb2/XCIHIoaA3gngZ3Pn5qakGvSOJbUWO1oZ1PXOIvGwsiY84rRRCfIiwS9J9TcKvVcVe9lwTkU8VdQx0+kKfjqgz2WTmq2Sj+wV0zNJYNVAFXhz3enXfe4YiF0albyCzEtqlm04o/fBtu3l7ZJz751b39ygxK+C814d3/BSlHTO1l8Dk57pvEMVn4cJ0JA4VWVErwbwoUJSfUzvGqD6TjBp+ZZTAXlMxFAJOqFhVsF/BvCgSniEiTwlnk+qK5X4fAKeTSZVpZKP1stx+xoZ1UBBeN2sJ179n4f+8ZV9mITzQEKwpgkUoHZk+G/YQzdgtVCMQacNkDOQMWt2tz/0rRVP/1CaUh85olZ5wHc7evmcUqG/UnpZxaQMY5TCKcrV0tnMfMjKe5Z3/v0LGtWo2tYErM5mQR33/e/DDU+aMZPMlgAik1QtMuZIqJIiwzmxd9HddweKjKHJvOutqYmRzUogR65mUz1PJWfjT1KqRIZUNacSfIRs8PnuXV9+ZKxPzT+t5Ry1wbvIpK5UCaSMFT+rBErEl9TVNz/p7rs33Qu0ci71j5v8kH5AhqyqHbvvqEfEKiyoF5FvEbE/traOKsiQiuyD6kvg84FYvxXNHSKBgUnvAloZ2bawtr75mSDzTHf+sfOu1ImleKwSbBE2H+t94It/G+tD8xquq2cJ/gngfwHBQG1MkkUMFcsmfarmc1cA+HJlhUEHyKLPpu8tAF4NbC+DcG8nAOIR3kCcmqHSHx73vKLsNgusMQJZz85xQ+WcexkLDIJaEOlaNLV+FNm2GGOKI6DzV1z9BFV6buRdK4OAqhL7rGq7xAbvN4f7vr53b/uho32iruG600XzbyLi10WaWHEJPUHFEqdr0zmsOQR8Nso1m1SLqIRgTQPcPjApu4m5zcXbKZoBjroGWYN2UYCw8/cf+279+XcABIN88Qg95Aor9dwbOarDIBjyvHhUKFwBqWHPB18j9ItiWdff770dMEC7EKDIuhlDAYPOe295uOFJ76tiXtmvKjRFw906oJpIP3ev7JncZDGbjQZqutINhmV4rshAFfss9BWPd2z++cCg3rSNXaHYYuwhNK0GspB9D7T9AUCmprH5rYb8j6taGzk5Y6zkERL7viD/cgAfBrbxoX9k9wHYV+6p15zWcpDKLWVCCHq8OX/Ejk/nxsloPQDCRFeCfKhKXIKpAAkRkZVwY2/H5i8OtjcY2W0YUXC5aQ8hu1oe72zrAvCvNfUbfsrs3Q4yM+OTLGdrFaxxBGtc+T9HJXH6/7f35fF1HdX933Nm7nvaZcnxvkiyZVtSQhJwCDty2AKUUgLIQEiww5LSBQr9taUUqKIu7BQKBUogECeExWJfCqGALZaGJc4eeVO02ZK8SbJkbe/dO+f8/rj3yc+KbD/ZcmLZ93zyIvnpLjNnzsx856ySViXz+nmVb/7Xo51f7s5NixVeU7jqhoWqdFOovXqiAwSi3FurNz+D1Vw5Q7AMIstRxGFu2j4NhNirK+3sfO4QkEPKku1RkY+8ZxB7XpTrKtfDkxBZEgl2U8AvGNh3R+9knycLQT9+bvd3Nu0G8JfzKzb9DMbcBXBetGXlKGuiSmgA8Lkw8GFDrMGKafaoEeCNaHa/WbeueN/EJc9VpsIiuK5XdtzzR4rA1+me0QzgUdRpU1fTeVWmRQHaOMVHIqyc1gCgGUS4L4+4OjVzH6DzSINFZlicI4ffRAjmPDZjhZtU2erNKyBYHyVHzJHvpABcIK5hqGvLr1HXkEDrVh8gOWmenpaWrPeCBzuaPlFe+aZL2OT94wwW/8wZ4yURwHIhUGicCZBlAMJuX4HO/IBMJRNjhcNo9EMNykz8hpo0LGLdyEKdL2J1CF32cmq6EFujLvX3g513fAm42QOWOKDpFPzO/K+RUddqB1vv+El5xZvexMb7tp4+WWNm1rKqIxCeXbry+rKh7qZBzK7phgAJmPMKIam/AvAPwPYcNBfbGUCQFL6ZTbLsSdFeZTog+iawAdTNRBsLkeAeInpm7vwkATFbxmbkEjtTvyGcc6JrwkQxUWbrGXRNRd49sO/23nB+N/tAs5sWX58wt/tMf9et3ytfdeONTIlva8iXXF7MKgGB8PT5K968tH/fl3uB1vMqojAGWHMaXDVyE5pkS+WzX9eWth8jyyssgKNK+FrVc+6eZ/y3vrytef9c7R8ddwCZsik1KwHaqyiP6q/MSRuhApJPxBMqe5es2rUb+yYVfucptYYplwO5im0yX8XPFeQExAnrgvRnh7q2bMf6mz3suDWd+77bFEUaNpiB+Xn/PH8g/UoiU6u5AWtWdSDoFcVLb5x/rJeiOmMzyW7dCKBJiDeLngH8JRNI9L4Z+iNlfIY6K6Co0chPPYcbHZFnVPzf9Xfe8fFQC3ZrkPu7mwStSGP9zd7Ajlu/W175pq+zybs+N1BLBHXKbC9h8OUhYpt1B2Sj6isBbymqvuljI21fOYLTFsRuceXVbywhx2+HBoonXuNNUfb9eVC8OqxwpiaHORCWcRF3mEk2C3g7kV0SahRPe7OJKqm9smjtzZeM7Ln1SC4yqIx8mvFSxqwaOI+9+4BGRmsrcsPkTQJAIln7TnnV5juZEzeqS/lhUfLTyqxjtgWwqacB6MX6MsaO8yeVTwyw5ihtRYPZiCa3pfJZ16pJfMNXhZPAhX5TxEn2ru13+utvVj3zdwAZG1XfJMi0vlOZvFRm8sguJ/zNRPNyalytiZ4XPns6vyyZVAFkO8Jz1v3ZaSDC96sWgDAKaaSOXXsU6z1gR+THsd4SdvgHK+oWg/QZY2HKhjmqvVLJI8PjItupBcH5739VR2gBlPmpAOd6wlWAjIo/LtD/AJSw45Yz6aMChwg7mn2p3PQpw+bWSAOQC5uVyJRZT9YCuOfMi/M+0RSabBhUx2yTYVmgHDW1BCjkoyfyb4a0Y1AAJcGbP0oSbESu5iKFAxsrcFcCaEF93Syff2jS/ybhj7811EyeKqt36AdGzruBOLks9Bt8os2DYRsM6SvZ5C2IovNyaYMjslbg7u7vuHPP/MpNPyU2N4Vm8tPu3xGfEmVeOnUdgC/m4hNHqkdCk/5MSlqpI/ZMoMG7gKb3Asg6QGXMhEBolq7TUDubJZORrEHe9CGFfwOx9TQnU6EykQdBcDWAH2F88Lw6a8cAa47So1GtujRxkwHgNAgMyFJUFGrUpZ3HppLJVkagK3Ioz/wujwM8J0bznZg89OTX8UmvC3/yNN9lO8Lz4yIOFYoSYqREl3dUVLyYunZMZK36vgJ0gOXzhWyKj4k4On/ryZ2SBOBAFVC6GwC2n/f+V60aAeGa495jp+8msTUq6V8PdW3pBCrPojZa6M9jFT90kjpG4OIcCrmGrCZriII1IcA6NKcUngRaF6aaohxMSipExoj4Byhhfx4N3BmCyWYHEB3txIPllZseYONdFfkN5XqgWTcpN7MOskCqgRLRXy5Y0PCZw4ebR0+inSGgxVVXvyM5EAz/DYXaqydj8kQyT5simc2VQr8rki0hsuQtqu6mGR0qVUHQTSHAOoVPXDS/leh+UqEZmKNDbZkEymT/cX7lTetF5csUeL8Z6PnS/pOaCQEKDzuHCDgE4BYz0HXnrvKqTT8A+GpAfOhp1/ZAxE9AqQwAkF92XlkAYoA1B6kR4CZA/qf66uX7HV3mi6gBmRMypxMZVSfjqpoNaI5rqHRKNN/0Wdqnfjc1AvBU904tccMnvWdqewij6qTImOeCCn61v3LdvyFNv/W9pMvn9FUHgfcWMr/gmIjMVXAVlsdhPiZuEGn5DQBsOOON8Imi5miT0JWTCtGcuspQ0e0AKHSwPtNInyYBlA530YHyyk0PkrHPjaIKzenbAACmMlQmbMjyATmPqR5AC0CsVZO9OC3HSUEW0NQfwjQJZ1nst77ehOVWqAUwV0EDObGw77QKJgIURAj5HfqdzTbAijKWJ5dLIb0Rh/GF6bVYocbmqD/yarbJtTNz3J61FTvMfVXxlloieX7uua9UQsf2oHWgPL8FHY10pHP7b8urKh9k8q7IUaMZmlPJPnNB5U1XHO5sevDkMhHOb5M/eo+MFfQQm6WhP1TukYuqvpJJvNgAL1byh8urNj0G0F5AO0C6m5ztNKpdxvcO9PXdOnaiJjmckwMdY68prSgoDllQQKAxNV4gZJLTgifxhzgvVRZGVe1Ycl6toTHAmss0Pg5KJLKSdGKaIsrhsswIgRYwfd3AKUlECYASlAhkQqBEJwAgjr47DrQI01+HrO8z1+GE+2nyd430WQCIzDERKWJ+uoK/P550g0mkxSOab4kwLCI8hxPlEtTlE9uA8KulfXuORPUH5bxuMqCob7Ta1TmfSBEl/s/hPkGUC0czp+Qzpw0GQADgYYCeG2UfP+0JPmr+kjklJMcjrxYjZzgb5skioQdDfHE2xX4n9zwQ9MFM1odctSaqiMoUNSlGbj4HWkMlqFMlvAt1DV8JnaqnarEmgwT+H88o6nU2KSrsTMENxDMq7CwIIwfvwo5b/YqKTXldXS0TpFVfBfMVuWk0gUwBaOdSNwJ48BQyoUCDOdzaPDK/ctOnwd5H4FwwI20ZiCLfTICohMk+FcRPnRwW4xCIS7lk+sj8qs3dquhSwl5SaWOgM0DQVRT4h/Z3bTl6IWzRcSb3OUhNgDQC/PKeh/cb6CNJZppaSxAQ5xFzIXu2mI0pYs8WsrWFbGwxW1vExhaytUVsbTGb6KeN/mZN9J0BVB9fmxCPK2szNQX1dIlHpyscTVM0aVOEk0dVZExFLHGZJZqfUpUREcdzXHY1KhVPoB+EmSPr50R/yva1FoJQOAOXHqPiq6WgJ0ubcRZanQ0ZuenK2WecJv0H54V7buscqQCQ4ZWW5hy6HvVVWbtmpw0LoxdLN8IoxlwiCSlKqFIUpZk4R/wmVnXC7NWUjeW/KgIIWfOowQDQslXd1zIn1qs+CYlFIxMlKjblKfB6TEaC5rJEsFFJT3jOfh0Auio7AwAQdltF0mORD1cuvGVoAIJuXHT5DYVRqpWTjGOzAI3cr/i0BBN/JE56gPoz7LMJP6qqvqikA3WpQCXtVAMh4iSYlxHbZ7FJvN5w8gNs8rYo2xYDb/e4Ldw1v2rzPeWVm+8sr9z8N/NX3XjVCcW96xttFFk8m5UWYg1WTMfpUjQQ0Ixi9f/Zh7kbZG2gzlF4hDWl7JmU+B1Ogt8K1IQG9RDEZBeHMllO6Jn6g9EKJAzM84heIVDlaGGdCrSmmgMJJ8/wjtNcR9OvTgwAvmpmh+G5XoBQATVEZliCkcB3d4fRkud7eZxQC5RAMhmAEnp8Nz8tjlTIRFowPDtane3RFk5HCIIcA0gJUCihYFZA3hN3lIqyaqMgd4yiDBVAdGCKFuysQJ6vPGTDXFiMXI2VQN6iRSuSBw8iOMeyqQT6OwDNJ45t+DuJ/D0MAKUnYdzDgIoygxcyvFUzCFQQYs+Im/jFwe6vdGQSzgINZrD9zu75lZvuJuO9KtIW2RyAqCOTWOEP+dcC+A7q621o+j3JRO/aMqGrN79Gxf8lcbI6yjhvZpjU+XhREMr6CqpQyeR00xOAGXESxCuJaCWBnwnQDappzK9c9ZBS9VakJ7YMtDRFkfFnaf6OAVZMJ6ONaHaNaOSGzqaffb3yGa+35H0sybzCghCog0rw00XGve2atj+cVZqGX1Wu/0WR4ReMS+AYZHiKWfFkfleU43V8CnA1daZeKGNHUFdI1gyLa1m5f2+PopHpPF8ogFsIgLpADVjtTJQSpOQb4fQsqwUmZnyPqjf3sDgAIjtTHZCCxmezIQaSgrIDcU5jH0aAkfGL1eDgLKH7kzRNxRdm7+nllW9+8UBn088wmfuvyZWt3PxsZrMhKrNkzvAdZ00s2AzDMwR5CpC5Pfy9laYsh1sAXDczR3RSsG4C8B20nCoBbFi7cPCxpn3ly9+0QT1sYZP3QogPFRecYQH26ZZzMx1YhgaqGT6FLgCW2F5OZC7XZOL/za9683/1+8c+hP1N4+c7yIoB1hymJjRJIxr5DZ1N39y2oO7Hx4qLn+dAZUVwe/6k44/3ArklGp3+4PqoaWht9f9o/b9zYv9AIJ5aZzDbJPl4n67paxhmmxCzf7+YKIq/I4JuBUDbc64T9qQCLAWaogEjnbusn2NY/IzbrPSks1CBkzkmz5ANpylIQRoa3N3fA/hZqLkKAQkb/X+hG+npUnrQOSgB2shAkytf9sblSvRSzMy53Yj4fTB+FmCc/MlcUPALGRvdR2xX5JwPTnwi8ItLKzZVDnU1dZ4anIQga2B/Uw+AF5VXbnoHkfl7MskVgEAlAAAXpWqhyB9zloqiZ2nJKAO7fIH4AuYyMt4H5lPxtbziTdcf3tf02PkMsmKAdQGArK1oMNccbh7BYfzkxFUHOOO8Sq1wigZzdVvz/b+petqXS9ncfEx8h8jp/fHG7+kKPuu0flc85e8XGbhSD2yGXDCgefgxAD3/owezFoxEIvCdunA/ym1DUkLC5ZvkrCIPRcFM13Il+HNSZlR94hns/wSQ4fxZ1cCoyVfOfb8gEJQQJIatO6vpQkyq7j4ANQQ+mak0LATO5oXllTc9Y6Cz6fcAqGzVmy+D6ivDQsKn9L3yVeV3RPS8WR24jDN5wjQwJ4pyj2AkARkmcV/ub7trWtP64VaMlFfe9CUi05RjRvioAHQy31LqdQA+cvoC0CHIAppkoHPLZ0qWv+Uuz/PfAKXXgehqYi+JjNOJSqi1VEH0D4lw0iyBL4ripFQ1mAjIJK8Wi5+XrbqxfrC9aV/U//MOZMUA6wKgjWh2mWLPC+oP0YaWsNjz2YKXW9CsjQDnObplHEFDgrhUorp/jzf5PV4rNX10oz4u2vFiIoK6QjZ2MJAfL9+1q/+8Ty465SiZRjoFtalw7dQckmGpEijPS1Pp7GxaG4CWFojSAgbNJNkpoBiNTg9zROwaCWhSIhqdAYoUgJlFLwn5VUdnVwow5JUC84gsZpLsVIGJvr7B1Jm/Wx2zZzXQ7wukl4z3J6GpbzqQQkJkLZD6OwANABTi3k0madWlgygr+FRyxB6L+PcQ0TeJE8+b1TQOUWFngG6c4d5vIL4qufbS1ZvWG+cskRXAB+BBNWBnTADnOlUwE8d9gjpA9Aag8RPAtAWgo9xU2b5sDQZ1MMOttw0A+CyAz86v2FQj5D8LIlcBtA6EZQQsAqiM2DJCe2h0pBSoTrpbueNzVvkMgBeByFOX8snkVZJzt6Ox8UWhcr3pvJvXNqeVqb7ebJ/Dm9qGFmB7PbC9ZYM0nfe+Lme8/enxhG6zk+OnCZBtqLdXdbf0/a7y8g8WcuJjx8RPMcGEyevwODMhpvGtmho1mLnu+P9z6SAxXQBRrwridJhcdMtcbP9AW3q0vNIbocmwhdOiMkdsjerESgD3nzW4iZzciaLcUDmVx8u419Dg7ICOJ4oyxXdxNMqOoLmuBgKqmp02hElZiVCZe7JTUhADEhwL8xwpoegWPYPJEq0YmGDwxwF6xan2MpW0gvjPSle+tcol3Ag7vEHFV9DJAQgRE7F+EoLCqFuzZCeMCjtX3Hg1k33qDAs7U+R6dJtVAjhzWzJqcwJWEdkoZtRco+oLsb3sksru5xzpxK+mKQCt01Y5aD2x/Ex/15ZdAHYB+Ep0GOCFVfsXpFUWc5BepUyrSKkawBqQLodiGREXEXtm0vKtgrB4tbpIy5X7+k7kqaQCNslr5t/e+cp+bPlepjD6nAJYBOhJog3mFkXAI5OkM9Z75UbXoMUpGnmvveszQ45uXmwTa8bVwWJqdvfj4MlMm0D08clNc3bNBDCugnGd2ybFsPYg84i41oMLCn+l3aC5ob3KNF8JIEfYdATEa3Ny2FVVgCHETwXwg+MlM854Ikch5nQ51AGUg5NvlLoApH0RcJkbHM8kGgX6ZnK+BwRE+tRo3ZPZaIOSPnXmc48i9/aNDNSdmdCpApDSI51bWsorN+1h9tacQovmyCQ9g4m/8AKMks3LFzdxEo1UmMRT3MT+/o7KH8yv6nr7udgWCLwJNPPCzsen3Cnt8DMfEiUBG1a4TVNO4gRAF1RsWuzYrmQO3MnHRAhqSGEIhlglGB1sb3r4UAcOAjgI4METblh/s7fgSGq+kK5AkFotBmugVAdgHQG1xIk81QBhfcUZl5VVEG4E8L1MSpE5AbAyRXa7l69Zlu+ZV/mibi5GyAuAJIkcMUWJj7oFDzV1/rSlAQ2mee5sbOfBxgpa29aWur/iij8fp2DzmAQBU3gayy65kw2kAEz5Xk5wcuecFieoQg0ppRzwtHymp6VDXfOc1GSpquYxIQW6/aodO/xtp6yfdj7SRgbgFOgk0LNzOj4ThRu+4oUAbgnNJme6jDQy0KSlFZsqlPCUMKfQDNI0iLaHoGPh3HB2b8nsiWifAcfC0irA08Pi1k0DOBtn+ZYwUaei8xoKzTynB7QaZu8nko7jWrC6M583RDZUNumnQPy5SIs2vRbLpQDgrwWq5FKnMJ+RgiwDwWeBJlHZlKDZW1WOF3Ymum4GhZ1nB0Sd+mlRAWj9s1A+7oyKn4cZ7x3Ty5nNbSqBAHwSjnD0KBcm81GMla3eXDP4WEVP+MeoNFJLa1h3cEeTfxg4gPDzx+wnLVjxptXOpF5OxP9AZJerBjMAWcpQRwo8JSog70f5seaOBouLzISfwkcWeonCCdU5ubMpGNWUwjU8MtFd8cpnN3c13x+DrJnMySZRgKjrwW0Atj3R79+5bl3xgjT/QedeFNgJZ1GPmIecG047uSvUo7TMLU3qpGmNdmbgbw5roVHxlYifUb7yprqBbto5jVkiZ/AAILCkryXOy49y8+TiR8qqgbLRvXNLajJAMNgddjOnkPzJQsiel/pTALfjjIF8gwGapWxV97MJti7HaDVMWjMFO0O52XB26w+FdiRldxdc6j0guxInbYuCQPmTWsuTaj2YxaUOJyb4tuNoYdYmigFaAkv4UzKJhTMo7PzELOcijkyyPJlMveoYcFvY3kjWjLYijBDMLapCnWPOK3Au9Tqg6eMhwHlc7cHoWbcQsJ1DrehCBZrd4X13PAbgM6Urb/iRNd5vQWYxwoz7lJNkhG0sKx8azR8A/PPNv9KeWnvQYGhXc//+ypqPjav88zFxaWho/p1jCAFGVV7Og3lH2TZ3rLrh2d9q/+qh2Fw4IxaqAry9/swzjue6zG4HsGFkhACgf2goX9Lcks+mZlDcHC6Po1LExhx1wbcr9u3unTvO7dnajKjYs9KO0DyX81gIseeppt4P4HqsL2PsmOmG1sgAZP66Nxcjpe8MT7o5hbwryJCKOwQre8LvmufInA8LulOQeFRMMErEhbkVt1ZSdUpE/4D1N9+FHYNyBlosigC1sur7iJn0tKkOskC1BlDQ/ZNyczbFnkNHbgy03TU8v3LTZ4nNR1WdO/n4T5rVTvZOFznEf/HAgdsPT+7VszdRJFLkbaKwKefXlhkBYFFsAnBbWAA6gvITdo9nXT+I5wOSC6AmVV+Z6F2lFZu+NNR1yxDQOo1f16QPoWSBrxB4Vb8zMdT2mY7yyk3bmZNvUM21lJBmnuJ7x+i8XEttDhOcGHT7qMg/MDjfkc7JpI+OCKSBa+DB1ceEv/u+ik0vvKVrSxoxyJrJvBS0nHutSzQbmQDXV1X7zRI2Vw66IODQVDBXucejIgLBfwFAM5rnYB9CYMI8fp+T5DCIS3Lb8GFUUsLsvaGs4k0/HNxx69eBmz1gicshf01kvmgSAIL0ps+QSa6YScg7kWHA7QhD3s//7M8nQAuA+vd9uXd+1eaHic0zQ9PN6fpNUSHkRG1Zf+ojg2j+2+M5lJrl9Bt+gwl95ZqC+VWb/5LYe2kOiTonDxJElkWDXjM29sjxdzbOggankdPp9i8nkul/APH8U/js0CmXFyIjkh5BoJ+bfXnIFHa+sZaIn/8klec5PQAOtcrPnlf1psuPdjQ9FMpHIw/vbxoor9z8ALN9gYqfSxwLhxrTxDID//MAvQGAi7Sm7vSytsGgbYMPNDKh6/LjpYRysvwLgY1Ceg8e/OpY+N35VaWBT7ehKhp4aefOLgc0FzNT6PE/J8EBfLDxZDy4no8++/3U+1UCyaVoIL34sgWcv3oegLaj3hDgeqpq/nsem+uOytwGVwp1JcyUVveLZd277lOANwJubg5PIx/q+MZBEO4htoqcDydECidsvC+XVbzpDcCt/vGNrcGgvtGivt4C9Tb8vdFmasmF5q16nl+1+T+JE5tmGEoflevJ5IjbPsc0oPUGAET07rC8W87aEKOSdoYT755ftflfQo1Cc7ThTeV3fTa/EZp4WoKyys1/DuLPqAQud78YEpBRKFoOH24eOT6GZ08VFZ2JY7139qviS0QeAWeitVBH5BFUvjqw/46e6uqBWc7uH8oXMV8f1vGDw/m4vygcccIw+Ibwi0OE+qjtpD/BaWys08kas339/Mo3f2nJkpsLIpN0lqw1Tidr0dxukvKq7g8Se5fmbIaeBMusqnggfFb9ebdHnLZB0UmbrPInR8XdwCCeq44wDGACxpa6keCNhl/jV774Sxs7m9+6NfI1wBz28blQlGTbUW+uQUvQW1nz7/PY/vmgBAGB5ni+NqJolf1EBCgIc1KDNbmBiAq+QUzXzuiMowIAeWy8r5VXbX4Zkft0f/ud9z7OZ6Pl+D+WLLm5IJ2ceBHIvJfYe+YZgCsjkh5TQ9+LTsyCuZGjAdntTTj3rYD9958q5cC0G5+mhTjxgfKqm54DpY8M2MIWtH0mdSK/J/8HoJHLKvY9g0n+lox9bZSxeyZlZAhQEqKvzzYnugrHBACpwedEUn9NoBxNpic0z6j4aYL9FABqSxyYzTWfgJYA1e9IajD8BgqdyWdQykZnQZOWIzghZWgAqL5uyZKbb+nru3UcLWGhbOP87zrwvwGUnAF/jYrvyCTeks73ry5b9eYPEqf+Z6DtruGTy9rN3iWVE89Ssu8i5uuiVBYzOAApAyAS/cn5OntPu3FtBJyikamz6cGeipofl1rzyiFxjs4fp70Zg6xRMnaxGw5usPQWrXzJxMbO5r/eigbTgGahGGQ9aZoroN4QWoLeytr3lxrzT0MSBAqyc1u9qK6QDI8494dlnbv/txFgmtPBFVHW+WPBd6QUH6TQKTXHyE4KleKqYE7cqJK+sbxq0/1Q7CBQG4EGhTQgIE8VC4hwaQrp9UyJVeH2M+MkkELsGXWp7w0+tmVfeGpummO8D7NpH9zf9Mj8qk0/J05eq5Krj0q44aqkhTnxAqi8oDwY3ouqzfdCdSexHlHlFCk8sJZBaC3QeRWIn0KcgEpKZpgI0hEZFknvPmoO/iy8bxb93RbUCdDAg4/dvq+8atNdxIk/DwMdcj6AOeKEEZn47kDnHbuBBoMFh2bRPFhvgBZ3iX/shTDe6pkkZUUYLHnW2lVVl6uDOKs6xyaxMp1IvQTA98NozwZzqPtr7WWVm35kTPK1M5O1UJNFZJ5iiL+uQWLf/KpNf4TgYTAOK2icFJ6SXgJFDSh9lZKtITKITNAz6b+ALKlL7TPjY3dH4NYBG+aGk/uJNJnN98MTon9KM89VcV6RiUDWcjcU3GDor7jyRdjY2fzXCnAknTHIesLBVQMTmjPg6l+HxQUy58FVKEhMIFJ8mADZBtg57vOnQIMZGLhreH7ppk8QeR9XnXC5L45RDvgILDF5TwXzUzM+2DypCgj/Teqi7OGh9mGmYqUSBMr0YcxpN4Bw/XWgfzfqrp15X4hVfAcoMds1ILMmw+/jKzkBJpP8MdDcfa6m8JwMwQUfRsdPU2cRLXp6TZHY/1T4NwHkzUDDRiqBEPgTk9fPqjJzoQJQYWzmnJOyhrCIyJJI8M8guUeFPNAMtFlKTKw+QE9n8j44g1QHCpAqsBnA97Kc3ckIfUjJfzWO18TKVeaMahCGJbBZQZRcAaZX44Rk05lEow6qTlXlTGRNiKwVch8NTdGTkbJzD2BRWIqFqWvXPfsra35aaszLhuewFmtSkwVjV8jR4Aajf5WofHGSOn/+NoKiEY18oWZ8Pw93a87IWN+qmn8vJvNPIbiCuQAc41whGx4Sd39b5aIfatcuJmDuJ+0NnZa5SDo/O6ITm4m9y1SDmWqXDMIyewolyUr5EK6+4b9pxhmej+9ZAdk8T4PxTw52bHn4HG72TwS/HdBgjnbc/uv5FZvuIJv3JnUTAWbml2gAQrj5Oc0qMZTNb0QmLcaMHbPVESesuvRvB64euxNd54rfIS8Gum7bOb9q0/eIkxtz1LI4Ys+IpO8e6Njyx0wh5tnz24kKO6950zL4eJmGhZ1zCQpQCqNcewbmJz8c5nI64zb8cn5l19uJ7cocfZmMik9gevG8yusrjnY2dYX9aOAj3bffV175ps+zLfgrdeN+BGRzBvSRSIiqnANZgyP2rEjqgXJz4IsDk2N5fuKM3E8NAAyoKR3Wo5vz+18GZC2VoeCNZvCt/77qBVt1eUN+poByDH/OLW0NQZQQIAer6j5fSvafjh0HV3NevqI8AsRC/3JNS0sQ+l5dKLgY6OraMgGiN6tKOgJDMz2UZMCTjcCCjRbbzL/NGYEraEAm4YmbeCA/KH9flJtnjh+YmhVoZN/Zd6tLP0bGs4CeAViPNrTp+W3PjN9wRMaoBMNE7s1obnZPRDSXQj8RAomctEQUKmLk49lawVmjyEEcPr+WTbIoqgGTyzscyANIv4Udt/qoa0iEh4EZfqpfmgSaRAnfDC2mJLnNPw2YEwUEb2P41XbOHKBMQdE/ajDxCHHCO39kTYWIWcWNO9Gb2tp+mspek+YswCLAbQXMks6dvx8T+UEJG5Y5GlE4lQFjMPYSGQ6up8GGT9nDdz+j6k8XbUSza6yvj4thnyPahnq7EXC/mb+u+FBV7XdKDL/9qASBAvYCAVeuiNkMS/C7W7t2/kDnvO/VVGoSoMH0d9z+R5L0JoJhEDOe7OhIVZ84YVXcPueCV+/f/8nx83kBngEJAAzvv21A2H+VihwhPlOQNasMD0BsVOGLuNcf6bhzT+Trdg4BbbMDwAMdd/wB6n5O7J1O7hxRglWD3w103PmLyWSYs0kt213Yb3lTlCMu153VqKSFmO4IcR/c8YjPGXzaioNQSOSrM/RVJKiAgRvQ0GCyUyscbv3cCAfBdSJBL3HCQtV/kueAAxlWEFT8G4a6tjxw7mXtidNgRSXKQcr6z+MivgnDn+e8vxIDGIexRW4keJ0ZeN7bcPTX11e8/MqmlpagMVQhx2kcZnNJrq+316Al6FpRvXpdCW8rZHPdgAtm4qx63hNFO6Ilfn/kc3UBylBorjnS9dVvOOe/AaDxsJirBrMTETXDxRcqbPI8leBRovEXDnV/tWOO5b3KCdQOtn/1kUDci1W0nThpI3DxBANbFQBB+H46SuSuG+y64yehye2JOEjUR5WZ6eNhuT6l0+pqwB8Pt7BZTtVRBwOQllcUPJ3YPm0Gua8ckSVR94cjj91+H6ISO2c+Fxv5aMcdD6nK/xF7lKNMGFVfwPbyS+4tfHa005uMrB3e/9U2kokXirhdbPK8J0/WNCD2jCpGVVMNA113fueJk7UnCGAR4JrRwCvbdz+cAm4vZcO4ALRYGUakyViSlHsVD6x5LQ/+6m9XXfuGJrQECqDxPKtxNEe1OqwAU0tL0FO57toiz/tNgnn9UXchpGLI7qe6YjZmzMmPF7fv/IVGSVMvzFENQdZg15ZvBIF7nmrwB+KkjSKiosVY9dyIU+iRDUCJPUPssUh6S+BSzzvS/vW95/vp9mz4PdS15QFyE89Vl/5W1HcTlu5EBtyeA56rZIAskWXihBUJtqtLP/tI+5Yfh/x+omprtgRAIw903P4LOP/3YV6s6eaYCpFhdanWgQ77A2RSKZybU9WborKJLmcZDp3ht0Sg8SzdUiLgKNgys8T9JERGVWXTiTeFstbf9fVdfsp/rnOprxLZSNag4dw7Z7KmJ8pa0qq4/3My8dyBjq9+G3OkjuuMQUMDmlUBEj/RNOzckBfmxbogou7CGcomLU420GDxdTT4tQ+tesEnaP3NtglN0ojYZHimtA31NuNvdaiq9n1JNj9R0OJj4hzRhQSuoAyicXGBkPuni2N0o02/e8uO/vb256j4fy2Q3eHGnzAgk1ntXQgAwoUz+mj0t5N8MtdFYC0EVGGVZ7JMJs+CmETcL51LvbS/4yubh7q/NnhOzECTQzzjzznh95Huu/r6O29v0CB9nUrwWyJLZBIZcEtT+JXF81Py+0SeH79fiQwTJwyxx6ryiEj6LQMdX75moOvOGdSXpExy2lx5J9E9JwMUoqwfD30Ap73fgQwJ8SfD5LanBDFn1q7WZr+8+o0lUWFnjfIznV6uiVhdaiht3Hci0HiW8hre7xfI91RSAyCm0493uGSp+lDQK0srNs2LxpGyNWPHeu/sH+i8/Ubn0i+HBNuJDJHJO5eyRqGsJVhVdmoQ/EV/x7HnD3V97YGcgXxY/uhJnaszBlgECNDAK/c/2ONUP1zMhvWJNwecU5AFEI8p6aVy1DXQ0N9+aWDXtreuuPbSSJvFsTZrxlorcw1agvbK2orDVXU/LjLm39KqSKkKz+FI1JP02JWy4ZTiCys69jwU1hy8GEoxhQsx0BL0d3zlswPpkaeKBA0i/jdVXS+IwwXTJC2xZ4g8JrIMMhRuBPT4DzGBDBNZDk/OCUMmz4YnaHKq8qiq/0l17lkDHV9+4WDnnXdHNQvpnGiu1BERkkRMRMzRz5N9mMINLnnu+A0CGrm/a8v3+ju+8txAtF40/VlRtzvU6h3nF5E1Eb/5NPwOgSt5TOxF9ycMiElFukX8O1X0lf0d3tMGOm7/ctiW3MGsqtqQN+Sdhn8UXcOqak+uxVIayB//gbr0o8QJS0TZ9xNxwlNJdybGgq9jMlfStAuVmWm7oOpN3u1sA5u8xYASkeHTP4OZOckgfH+0/auHZinjvQIN5tiuO/uh9F3mJBM4h7YYhoKMzV9gYV7/eG1ak2RkbbDrjp8c6fjKNS5wz1HxP6XqWhHlm8vICvEsyJpKj4j/DVH/Nf0iT+vv+vJ/H19jcpE1IUBnNFcVmPW5Smc4igSA9i1fnjS2+IF85jXjKkpzthDvyY8zeXCBctLeI4UjD2rhP32g8xefAYBG1NumnGotXbRE26Ks7ABwoKr2BgP6RD7TwiFxAS6AHFfTzAtJEiEQPeIS7tJb9+wZAICLrNYlAQ0nLILl1W8sUZ8vZbZPCxMM6moFlpCiRAkFBCRVkQCBocogEqg6EKUATUExSqBBAPuU5DGCfUg4eGDwsaqdWUDqce+dbaqo2JQ3YuQyaG4ZRBRCRih9uGvs4XPrKzKlEsX6m715AxO1rOZKkDwFoGqoLgNQBkIBQEmoJkFkjvMbQqRpBU1AdRyEIVLqBeExKFpBuM+OBa0HD351dMp7Xe5yAS1bvXkFArecjedD5TR+U6zifI882TfQdtd+TG/3mnwuBbqMjAkmnxvm0rQOODDUtaXzVPcvrHrLokCCqhPuP0W71DlrlQ8d6v5KOwAsWvnWKp/8RTndn/UMP1/2Htt150CWdnRW9vSS5W8psyZYO9P2OOVDQ2GfTmJjnFr1pMGUrc6vYbFXKoLLSXk1gBUKLQOhMEoa7EWRg5SBo0TwVTUFYBTAUQL1gdAOop3q5H7KM4/27/7ysZO/9zRU/dLkfFnwlJnMVRb1j3R1Pzybpkc6i83EEOD2VdS+vNjyj8dEZpoHZ65smmCoSwKml4vwey342X0o/LvPtv/kYQDYigaz8YKKDpsVnpmMz1HnyrVVhcZ+OI9p44QqUiruwtNaZQC5ujK2pl+Ct63s2PWlbQid+S9WgB0Cnklty+PXwOp3JA/7w/kJIC+w5KljVnVEZJRtyqWRSCWQTg207R87+aJXb8MEj/EcPKGW4LTUaMtWtRamkUwmWRMSJI1KmokTQkbEE5NOSZAaKhwbQ2tz+jTvmGulxQjxYXiWZe0QnWpelq1aV5jAWNI37KnLM+JSDABsydlA/bT6qaEif/QClLWzB1jhRtpgCM1uf1XN1jK2DYMSXMCbJzQPToST5j4tGNupeR/73sjCj7ccbh5RgJrRwBc70DqeNBRyL9Z7K1eN/SWDPpBHPH9IAqdhHD9doH13xcxmyLnfLO/cVQ80EMWb/olgq/5QlD17gwBNM/V5iJ5RR2jZjjDrdNM58nHKBcTkSnX6JDjaE9BIwHZG/QagBWfI78awAHALEIHYWdjolICNM7R0bD2FH9YkeOST57bKaQyyDgRnMrZn0q9zCh7OoD+58vpUstZ6JnJyjmTtyZ+rZwmwwAC0f82apRLYhwEq9aFEF+4mCgN1HmCGuAD3aXL3Y8hrek/7tq8DQCPAl6KBLjagtRUwDeEKIwCwv2rdnyZhGguY14+owL+AtVaRXKgBxABuAu7poe8VmC4u0+BZrD8K4JZp1oxbNGspibUPMb9jimVtLjLhbDaXUIvVW1lzc6mxXxiSCyuf0XQkgCZUxLAx+6kAOyVve7t6H/qnzm0/i6Qlo9GSC1h4SEOfl0lgdXDVpc8xkH+0xK9QBUbVuYwH84UsD6oalBlr+8X/lxUduxszcyJeY2OKKaaYLnqUeVan90yhXre/svZnpca8eFiCOV2nMMd+A4AkICD2uEPz0K6Ju/dp4pN/17n97sx1YWqHFrlQHJ0bAd6Aes72LRpYVffctOq7DdGr84gwLCKRcF3w0ZYKuEJmMybuwRETPOOBtragIQphiZeXmGKKKaYYYJ3tJsMAtHvlmqp8a+8DqNjXC9dUOBVoMdRZKBEnuEsT6FbvV/sp8YVfpRd9t3l/83iGR81ooAY0z7nNNwOim9GMjZHzugLmYGXtK0D4C0N0bT4RhkQA6AUPrrP4ogYQC0ia5NlL23ffuxUwGy/YpKIxxRRTTDE9oQAr3Gwih/eKdW8us95tF4OpcDqgZaBs2KNDSKBb7e5D4t3Vi8TW93Ru2525disazAIcou3nsWarEeBb0EBAM7KzkPdW1lYYoIEYNySJryAAxy4yYHV8zDUoZ2sPu/Q/r+zc868XedRgTDHFFFNM5wJgAcA2wF4DBJNRhS5wTBfbpgsQ1HlQGDJmjBLoEE4dJe9/h5D8+l5LP2va03Ik63raXl9vDrcs1EfRrE3nLPvzadt9PNKrpcVla9k6Kq6Yl2/dBhJ5vUJfVsymJK2KMQ2RFV2A6TlyAFeuhK0ZkeBXizt2XRNHDcYUU0wxxXTOAFZj5HPztqU1ZV6Sd1hCxYSqXAy+ONMBLQBiVcQQWWIPR2HRJ3x4iGzLiNgfHRT+1Tu7f93xeKAaluQ5jIXagOZJwHW2psWssA0CGmg7DhHqgWtaHq912bv60hX5AZ7DBq8g1WsKmJcaAKPi4FQDDdNUX5QZ7QXQJEFVMSwuWL+4e297HDUYU0wxxRTTOQNY4SYemgq7K2vqC5h/GaiqCzcfuhgZPFnsCSoGCktsQBbHYHBQaPwY+IEJMb8aM+bXI2QfevNjv953smdtBcwC1B/nY33WH1tO8R2ADWjRUxUc7qioW+wzP8WIPs+yPt8CTy1iLjEAxlWQUol8x+iiHcusSRMUMdsh579ueeeerdmJVWOKKaaYYorpnAAs4LipcF9lzXvmG/vhQQkCuoj8sXIFWwwylg0CWAyD0C8YmVDqSBM/4Kt5OMVoFUftD3plPa1txaPNZ2mCagT4xeueXVjgDy5OOlvNpGsYeoVHuMJCVxcwz8tDWJF3QgQO6kKVWQyqJsdQNSg31h6W4NMrO3b9jaLeUux3FVNMF+qabaKNMj5AxXR+ACxk1aHbX1n77XJjXj1wEfpjnQ5sAVCCCiuUCcQgw8QgYqTBGAdwVDQIQEMCHEwrd4D0GCsNBEQ9Aj0A5YBJhIjFwIFUWZXYshojWJggLAO5+SxUbKGVDF3MQGmJ4UQCgIHCV4WvggAqUAiISC9irePJSMJCzmbEyW8WVyy8prlloc7FqNCYYorpjPbKeJ7HdF4ArMmC0O2rVhUXaeL/kmzqRkSEL1K/nVwBFwBlVYlyXBABxhCBwDBEUBDC7KU0OdszTlqU9WEA4dWYvDJQhYNCVCFQB0BVASViRGXO45E4GbiC5BGxU/QZ33/6Jfv39lzMflcZf75bADpdJKweF8tZ8SWcazyasuDqk/H++BAwY74QAO2prHkJCwdLult/qeEaqXNdBjN0C0CXAtRQX0/bW4DzIap9anvnutzSOWYWEyB7V9ReOs/DbxVUklYFxxv5jEBXBJ6UoDopcFNWiRPu08dLqE7itfDqGEzNaBzUAmJBMqT+i1Z17v3VxZqtfTpQOdONZy5uVDFdVDJuCHA9VTX/Wmbs+0WBwcC9b0XXzg9uRYO5kEuhxf6kcwhgAcf9sTpX1ryixJofplWci81PMc2tSRIUs7ED4t66smPnbRdjvqsMKOqouGJektJ3GEJhksgcg3xsRfuuH08HODNngF3r1hXNS/MWAcryQYkU5ENLOnb96EJNyhrV5pQDVWueniTvIxOifiFzYkSCDy3r3H33uQTnmXHqXl5Xbj35SoJ4Xkq1dzCfNl3W2pqOwS3QW1nz5STz6pTqeGCDt6zcu7dnGr5QT2Xt/iTTQgZoXKRjWeeuNZgjpsIMEOypqLmuyJh3jarzAeLIaBEespUCAo450h5P6Y+pIPjlyv17e56U9aWhwVBzs+utqnttAeEdCmAU7vbl7bu/MpdB7Tl3PL8GCBT1lrpbfrSvsvZvyo35zygJqUEMsmI6/6GFP4+td9j5H17Zufs2ra+31HLxObVTqBg11PXg0Z6q2vsXWvvPY6KwIpWH1637FXY3jz5+k4pKaKXw3gXWXhdAMeBc5zilfx0t8heoebUBhGbdr/Y9ZcZuOIIAxcwYFrIA7kaYeuWckrAkAbx0njGJg35wuHB0NHbNOC7N9fOMWXXEOUhgCrOUDZoNTkD6tWI2f6cAUk6/FgLYUKbP9x4uwKEQRDGqSox5vhOFBcFkuZZkILlGE5HZDvZV1nxucedTGm9Bs94S5jh8YsDkobC9TmV1qfWerwDGA3dPdl9iDdYpT1ZhtNX+ytr/mG/Muwcl8AHy4ske0/mrtQkztQ8697WlnTvfuA2wGwB3sWoAFKBbwg/6qmr/4BFdmUdshpz78PLOne/N1sxkTIm9K+vqPIsdgar1iCiles2yjp2/zjZFZOpbbjghxchCxWkCCBQNZjsO0QYs1FNteqe6TgGzPUp9sgFhgl0FCPX1Bi2nTm1yEh4xAbK/qmatB35IocapKgiUIDYpJ89Z1rXrd80An0x7l2nTmfQrAq68b/kVi62XfiCfqWxMtIvHvMt3HSxLFWOE1mOHO5nv4AkJhyPa3gJsQIucyt9QAd6Oep7Kx+2oNyeO6+OfowCjvp5nMvYna+vJ3pHdxnWVh3YUGLp0THR8QuWqrs7Fjy3AYb4UrY4AlzkoKMCHqtZdFwjJsq5d383WEE737BP6ELZDceq6pLQN9Sbi2aSsPZ4fp33O4yijZe+pqvnrUjafGhbnoKQgHQNACgBKDEJRITEHUKRVsdBYHPCDO5Z37dykaGRC0wl8nKzwMUU+TuW/dTLZABp4Ow7RNWgJdP16b/uOIl1TcfCdJZY/qgBGxH1wT8fif4kUQUHm3uw+zibvMu2cIq+nvP/U68dCpSdycc6caHuqar9ezub1/S4ImOL0DTGdn+BqHls77IJf9Bfwyy9tbQiAJr3YzSsZENVVteZ5heS1+KpqidJ+gPVLu1tbM2a/jBZgf9W6uwvJvsQQMOTc7Ss6d92UeUYGDJwKxDzRvm5nG7iQ2dj2V9V+spzNuwYlCJLENqXiStmao87/+vLO3defq35lAMD/LX9mfqU3tK+Qef6ISPuyjp2rcx3bk/09Y/rMZQ6cyvyb4XEm+OEUYI9PApQm95JTjSNOooHpq6p9oJD5ilGRMZBXtaT9oUNnyu8QcACnkplcTeE58CNn8+4kwKpc945iYz/tFBgT95NEUt96LJXyPGudH3gmoUEZk7mCiN6eJH7muLj0PGMTw37wiiXdx03/uczVXPvZCPBUMKaqRES6v6L27fMsf14BDEvwvmUduz+YO744M96d7t4ZjuEJMvuEgZsQ2TWLAvxoPm3icVdebuxL4hxZMZ13IEI1KDHGjojbkeT0ay5rbU83oombYsdshIttg6GO5l/vr1x3W4mxb3WqeSnWTwF4SQMasK3+kL2mpTnoq1rXUMD2JeMiAsWAR/Yfw2oPzZK14Lnu5WuW5XvehhT0KQwUQPWYJX5gYCLYRn3NR/R4YEYmWFb3VFcnC3x7XYJNYVrc6IFLCr991Y4d/tQFVSsq8npN3qs9tflplWPLOnd+O1tL0beq5k88NYsnSB1z+sfU1nb4oZVPKVtt9XUDEsiKzl23TrchnGzj2IAWt2vJ2ktYceOICghkUyKfB+GmURHjEb+qb+XaKupu7jxJwAD3Va27zsLOCyApLS/4zrIdO8ambhDb6uttTffh6wyoxKdgfKmb+A51dU0QoL2ral+ewLG1KdWkrwoCSnoqa94mQKqIjDfm/F3Luvf8Nvv94e/Nbue6dcVlKXONkq4n0DyBpCxo17gLtld0722fulllft+/ct2z84ytFQhShF+taN+5t3Vpzfz5CbzCJ7rSQMmC9w4Tfkjtrd3bjueP08Ora9ZD6YWitMxBUkS4r/8Y/4gOt45Mx6Pw3c3usVWrSvORfA4rrhTRhUokSaJ2P9BttG/no1NloWdF3XMLLK8d16DcV4WqWiV/c29lbV+CkEgLepd27fzJpPZ1dc36JHi9APB9/GZpd2trtixkrmsC0Le85jLrcX1adbUlZQUdMkS/+6/21l9tBILsDTrTniPV1SXpwL7KEnm+6ACFWjLtXbXuqoTySwRY7KBDKvzbpV2tP81oR87kkBdqUmh0we5dvVP+1AXggXvXr//assHRXyaZnxNAVQ3eBODHJ/I8nKt5nvdsB72MQPMcJJ0kbp0g+vnyxx7dN0U2Qm3u6nXPzhNbKxBNQ3+zvGPXnq2oSzx/FV4rqlVLOnZ+8OCqpyw8WFlzrQ88Pz0ZpUXP6K2svVEUnjGkyukfLW1rOwwAh9etK05N4DUJZuML+qlr5/cA6OFV666iLN6xmt8s6nz07pPxLku+9FBVzVpDfM2E6FpWNWzQR0L3LOzc+euN4ZqRPV+IAN23suZP8o1Z7JO6MeWfUMcjBzsqKuaVmcLXjYpLPuG2zaiR+khdXeH8cf1ZMZtnDcUgK6bzSHNVxMamRHYdcfqCuu5dfReqM/bZntr7qqvnm8B7GIQFecw85uR1Szp3blU0mP7q+wvTgX3YEK8oYKJhX966rHvnbYoGkzH/7KmuTpaId4tR3OwRlyeJYIgQqCINRaDa50T/Y1Hnzo9PDa2PnLi7Fxuv8IDzRxImWHZJW9twlnmHCNADVZctchrsW+J53oHAH+ydGFp+VV/f2OQmWlH7wJKEvWJUBIMT42thvWX5hm+bb7xVvX76l8s6d70w18iqbfX19pqWlqC3oubdJdb8x7iqpkX39s0vuGxp/9gv85iekyCmoxJ8dHnHrvdMMalStC4m5o1J91LrLTroAoxweuWaxx7bl9nYJ4HhossLUZDuXmS88j7nBwZ2+eKORw4CQG9V7c4l1qvpC3xRgA2AUmPgVFFoLA74qeYlHbs2an29RUuLy5zee6pq3pok/icGVeURwRLBRaajlMgoVO/o5vR7r2pvHzrO57APPRU1dyxNeDcChN50+tXKdKyI6EsecYWhMEUMAKRVj46JvGt5564tvdXVC6x4n2LQ64qYjeL4dSnRvSkK3rysfc9vsvsOAJ0VV5Tmc/qvmPDWBHFlITFshJrHVTEuLhDonTqWeMfigw+N7cB6exV2+D2Vtd9amki8ps9PqSLMTVPCBiCggBl96fTDSzt3Xf5IXV3istbWdE9l7X8s9ey7AaDPD/5+aefOj2c0Qxn52VmxrnKh4Y+J4pVJ5kSCCAxCWhUTKlDVBydI37eifdePM+tI5t6eirU1SWN3zjcWvX56b1rHL8+nwv8yjDcXsyGJ0uoogLRoS1p109LOnV25gKypGixRYETku1/s3PnapYDpBdwt0bWdFfWJqq6Wie5VddfPI7orpYq06CNLO3dekdE09qxevTzhvPcq8cYCpvkFxGACfAUmVJASHfahH13asfPfM3u81tcbamkJeqpq7lhqvRuhhJ7Afx0Dv08AzUXWPH0gcEeWdu5c0FNV+7yl1v7qqBOMaYinC4iRz6HPWIIIR5w8d1H7o78FgEOratd4oD3z2KLX+Tv7JgquWpYc+0+P6S1FOfIuMw73VVcvWOG8jyrhdQVk8pNEIABpKEZFoKr3jpH7x8r2Pb+YOoa9lbX3L/HslaMiGA/82jSbBXmgr5Qas/qQC+57wh0fMwN2WWvriO/TK0YkuL+UjVVonA07pieVBOoK2di0SseoyMtCcNUQg6spFJ7gG2hpW9thH/qefGZOiQqgHzu68illhGY37uwHio1Z6RFoyLlfL+3e+eWtIbhSAHSwrq6oOLA/nsfmH4monAgYdEH6iAv6B13gIo/jJaXWfKyvsuau7fX1pjmT3g2AslGAjg6JcwAdVWOmV/8TK0CDQ+Kcgo4unHIdEQ2PiLhhcUet573UY/5BIZlVp84gNP3StqGlxe2prk4K6V+MqWo+ESnJrVft2OGD8AVLRCPilBSbu1Y+pSyjyZv6IKawXwoMJpmn1ZwJe6rH+z8Y9nPylPDYURccBiAMwAFuIAgODju3f9y5A1DqOeF1oc/Yf5az/SKAKkvAoDg97PyBQecmVAEmKiwy9i8qNO+Xj1VdtoiOm+Gi3vPoiIg7GKR9hb7MqP64hE3FUedS/UEwklLFsAgcMM8S3X6gcu2fibM/XGAS1zPIHAmCkUHnJpwCwyLOI1rjwfzoYPWlq2+J/KGao407wenPL7LevxWzqZwQwSHnd/UF/oOHAn9fSgWOYC8x3k1SkL6NAF2/PqOZpp4x5w4QkGKENUWPOnd4yLn9Qy44CMKUurA0dkyci2QnNVXr0VGx5soFxvw2QfxaJkoECvQHwcgR5w+OioMlAhNdUQzzo+7Kde8ITeeYTLatzJJWGR1yzgE0ZDn/9kUJ7y0AqD8IhgclcE6BY+L8YsP1IP1+z5L1BScopWZoRWoCpCzUuglFn8quFl8BSkAPpiKAS9ASLFmfBwC9S9bnk3h3L/C8vyg2PP+Yc/7BwN/b5wcPHQ6Cw1F+xZKFxv7b/sravydAtqIhC1vw6KiIO+J8n6BVCv3xPGufHsmQKEBBIOP9gesdExlmhII1Jm5kwLneARccGHDBgSBw49m8GxdNHZXAATq8ODl2x+JE4q16St4tKcgcZjJj2FexrnKlJH5VwGZzkjh/VASHXdB3KPC7BwOXShAhwXxVCezP9lXW3phxf8ji6rERETfs3FCazEtY8cNCw6s1MoU8KZElEcjilftbB47I+MvHVB4qYRuDrJieVHBVRMaknXQPq760qmt3pwIXdM6b2TAVLu/cteWYc9ssgUuMXTlugr/pW7m2Kg/0rlEREdW0wryDAG1AM4BGECD+mN5aZu0LjzrnnOrghJN/CFivCvzgClW+akzcvyl0Ysg5v9za69d2H/zgRsBtP8GRWA2F0cjmNOuNIZAh1cddJ6Q2LIdCSSX+SDGb4kFx9/Q71wjVj06Kx2k1nw1MgOY786fFxq5xqjTs5AhSdLsCFPil3z7m3GNMQKkxCxPGvz48SdebaUzUYb/0dP0KryMc75cCTOPe60bFPQ/QY/nMINUeQ6kr8jh9WdqnOkkVvA8AIidct69i7bsWGO+dQ875TiGj4v7TgZ/hfHd52tH6MSd/6VR7jomTAuan5an7utaHbdueiVZTZQaZQKGFxr6NiUb6gvQ72WG9tebKCefeaBUHVSEOUEfme+Vsn9Hnp+8Zd+7VnuGnwtH6MQn+3gP8MXHpYjKlzrl/CPnUQA0ZzYOTz/QHwZGjzt3hiJ63dCxx6e6ORVeN2OCylOpbLWj8sPODJPHrDq2seRrt2OErwJTOf286MLWi6MhnBgETanFtwviXIoU6k89vBIBLFyyQiL8c8pdM6M4FFK8fIQC6f2nN/Hy23zWgpROqcKIPjTt3vQ34qcLmChG5ZkLcNwFgQiUoMfbTvRVrX7oRcDvWrzdZguNNqBgivbKc7esOptPfDsi9wEjwVBW+akL100lirz9wqXJjr4A3en2oOayfxaoo9dQMsDgtTWSiDImCvYVDDgCW9e0YI9X/HHJy5GjgPkSMpy0p4MuWdC5cP0HmKRMqHzVEOuACIch7BlatKt2IZrdjZIQyfGSQCcEbva/M2EsPBcGeQRd8FKzvAkCppHtYE65GVD5SyIwCZoDk80MJqdEULrNurHZp964Hsw8kSvAmVA0U68uMec2Bk/DucBCky4y9Anml4ZyrrzcZNwNH1JxHVDOmgnGRbYHKtQXOXqqpoVoSetq4k8+lRcVXUJLwpcMVl9VsRLPLOO0DygoYECWI8OESY0r7g+AP/eIahbTJPnkLNGQrYC7r6jrQUVF3LcjdXWrM5UPiYnNhTE84uCpmY9KqXcdIX7K6Y9eebYAlIAb8p6BmNIfnU0PvcIIdYyqeQP8GhhuEyBQT0YC4/1zR+eiDigbTDGAjmmR/Ve2LipjfcNQ5Z4DhMZKXVHTsvjfr0T0AHuitWPtbj+33Bp1zFvT/+lbUblnS0vLo7JuFAVX1Soyxw8598gudO/8u2+cqF5+XW6LUC6T0TqeqRcw07OSO5b27+vdUVyfXtv1ufH9l7RcKiD86rqoO+KtH6uq+iNYWH7MYzd0M0MaDD432rF3bDz8TLEayaGVHP7Ucl+fQVNLsulasW2qJ/+WoC8QymbTITUs7d90xZSxa96yo/lmp9baPqFsyz5hr9nfVvmEFdt65p7rHQ1v4XIXCEBkfOuQLvXB51+4Hsp7z2P7KWlfC9I20E7+IjR12wW9SOv6Sqq6uiazrWnsra1FkzMeOqSiUNkxxtMby7t3/99iquvWr23d2n9D5NgwDuG1/Zc2zio15CwAdYX4OgPt2rF9vrtqxYwzAWG9lbZBheMDu6CV72oZz5e/6oSEmQPcn8Q8lbCpHRUSgfxiy/rVr2054zj4A23srax7LZ/4npwoh/g+tq/sldrwiAHZMXugALWZjh5370pLOnW+b8sq/6amsXVjI/PoJUQXjpQC+BLSciR8WbUO9HUeP2YZlWTK3QTaiRfYRXk4EGIUGir61bW2pjEltaefuL+xdfen/rOncue+Eh3bgIID39FbWvjCPab3AzB8P9DIAvy0ZGuKpGrQSw8XDEvzPOKevX93ePjQpj099akDNzal9lbWjlKVBrN29+9iUucrImo8CSLE5Oe96q2oXFrF5vS8q0JB3e3t6zFog2O+bN8yz5qqUKnzRHy3pXHhdpq5sqOHqawXwVz2VtVrA9FeWODEswbsAvH1B3WFG6+PXjyEJPv3bzl1/m7F6PKm5UTIq06qu1gPDnHrxiMh989ha0ViTFdMTQwoNStiYtMhj44QXZcDVNTG4ymn+KhrMksd2PppS+UQRMwNU6hHXWYCGRDpGEvqvGjm2Nxxn+k0EaD6zGVf5UEX77nv3VFcnFeCM+l7r6hJLu/b8NCX6xXxmU8DMzsMN5wRgK5DHbEdE7lvSufNvbwFU16/3tp5GM5a16JsmQA6srnlWkvm5E6o0JhKQBl+6d/16z/N9unf9ei8h+tVjToadKhWxqS0bC15GgG6bVW1ECJ78CT4hBc6+x5Z7k7wFKKM5s5ZeXWi4OEHME6LfW9q5645M3zPX70F1cu2+tsdSIu9JgI2vKgzdDABrSksla7NDIbNJiX51eVfrA1ljahQNhhLuF8fEHbVEVqGUAv6tqqtrYk91dbIR4G2AVTSYhLXfGBE3GlX8KO9Z+vC87L4pwKvbW7un9nsb6q0CZAgPAKFagSBlU+6lbEBrAmOj701ORuG2Nr97+fJ8Vrx+TEUV6sbE/8u1bW3DWleXyPB3G+rtVsAs7dz1/nHRhxVAPnPt/lH3nBNTH5BaIhoTGQ2s36QA3Yv1ngL0CMLnAXJ7mKtKCUTLctWqTgE3UNX0NWgJXo621DVoCTIfoAkHK2s25RPdOOJcuoCYlPDLUENZP8mXNY89um862Y+0SY9aIngEZcvzAGDNlEMME9kxkf4RSt+0ur196JGQX6HsHzpEClC2llmgJpsf04m6JeIxkTE/CG6ZjneBuC0CRQAwES0GgDVtbQEAMPFrAYgvmgqCxNspK3l0dmBFIKMfmFCdcAoF0XO2AubS1tYge/1IMptj4h5c2rHrbzYC7t5oDtnzYZHeCpjq9vZDD61c+SJQ4Q/KjX1uHF0Y0xMBrkrZ2nGRR44pXrHqsdau6LQcg6vcdSaiAD84nvigKfCvSxLVpER8j9mo4t21u3cfi3gqCLUQ3AtcLgoaF+fnEX1fAUZbm5+1qKm2tjoFuI/0W2nVv04QKQvWZ95aCmBs9uQACSJMiLsdAHZgvc2OSMxBaxRqIhy9s8CEtoJjIl9Z3rV3J7oAAD66ugCgr6dq3aeK2f6zU0DB7wTw/Q1omdWEqwRoB7Fm78HOGKWssluKhRktwNXh/giCarMCvH1HkWb5HaqiLd0IcGk+3X0s5Y4WkJkHoto91dUltGPH8FRtIKncqwBvb1vm1qItcsxv1j1SfaxQuT/JPG9U3VhCdY8ChLY2vwmQWwAlNGvfscsHNR8DlqgwTcI2mcrsA5lQeu1dVfsyC/yJKNY4RRkBDBxCL2qEFIvHRNw8Y05IZp3RRGaH0SlRhi85pWAhQPoSRatVaKkF0YjKzsqutgcUYGptTR+/siWIgghUSb+fJH6KAAqiqwFsy3qgJkEYgexb3tbWE7YhlD1Fa0CA7IM9MKpOitgwRGe8JzIIo+oETFf3VNV8nkIQqARihZb0Kl2aZLrMV/ULjPGGxR0JAvlvABTlP9P/QXXy6VVeQwC8SIEKVRQRQH0A+qCiwKoxEcljZiePB0MCRSEzHxP3w+r29kNRwub0VLndlzUGjHBstqFo+rFR1QQxRlU6f7d/74GVgCp2BOF4hrzrNtSTUkU+EVTVi97jtL7e9nYfrAkAdkDKehOv711VOwoHksn3h356DM0XRcqRJghaun7VqiLK1r5BkSSitGILANyL9V5m/TgvAEwGZF3e3T34wKJFL0VB2dZyti8fiEFWTOcOXvllbL1RkXv6MH7d5Z0dBy/W+oJnu5lvQ7255mDLaG9F7WeSlj5HzN6o6H3LO3d+vzEK/8+YGjorKhJJaGnonEFDAjOUlRPphAEiQHrVHUoriRduBqWZPw6LIzsbep/QgRvjYS7QhwDQeuyQGd0OyIE1a1YhwKtGRDRBRKxqeirXvVMVHoMEDFIlR9B546IIoJJgvqZ31bqr0L57R7SeP4GylzFpYp4C5KBgQl84Fi2P2yCbANk8Pj6apPzDTJgHRVEibQsBnAiwwoFMEyDbplhI1ixb5vq6DgoRYIT8wAsCArRxythP5A25BOVPMwaNeGRBc9ElxXp7AfFr8olhiZBSmUSOBGBCFCPignMVIi9KZSYMsgQTHTidNrEH6Ms0zxDKp51HSv5J8zRxICwkdIYWJwJCeSOuyifz9ql/c1AECsxj9sbVdU8E7o0V+/b0Rqk0XN/KtVWeMVvz2FyVzwTSMMIu+g9EwKgIJlTd6XjO4B06iybxKDlXKnMgmPpgGxgnJiMdx2nXgQP5xUpFviqYULLAJD5OGVT1+DHEsAg8AiaAEi+dZ6YC2AlVkJgHpq4f5w14mQx9PHhwdCsOvvJ5VbVfLmf7psEwmiauXRjTbJlPAGhQbqw3HLgfHx6l119+uGMkDMWPwdVZ8JUOQMYVDAJgoKNR5vcTqPLqq/2+ex8Zi8ahUMXPzzLbnFALrhFgR7bECzEQQDR+svcP+/60m08qSBvPgE+mmyBAiYC0qEKDYUzWRs+NQmfXlkAC8+dlbPIGJfAnRCmf+c0JevySFYQJHwMiaCEZ76joOwjYtK2+ntDSMlWzxqTTJ4MeDMa5XGHOIlU0RSh2jKJNQsCloUmqIUsvd3x8+z0vMRGgJGLOxDx4E2cjLzNvcJP0Fta89xL2XtPvAjcG6XQqnybQg0Q87kSMYXYOekMB81+7c5W1jnVUhCQ0B2ppRjN48nZzaVQXSqEYeZIOQghUMaInLnEOEAMMMKhtXPUHhybcF2v69hxRgG9BiyiAPmP+u9iYq446J8cEv4PIF0W0ja1Nkwj7RGqAf803/CI5BSecAqo6RIBua5ndtWem99QYk+qBhNGkqulDQdCpUDfdkwhEqmodsRLRET+RfwITM+uH42AEgDafAL7Or9OwNALcAMiSjp2bhpz7cAmzyYRzxttYTGd18gSUAVfG1h4N3Jc+17nzlZcdT2YYg6uz1GSJTolmywIqBOhWhAVdVWUvAVrAJl8YzyFAUVdnMwulArS3uto2AQKSFxaEEV8K1Z2Z5xUl8p1Gp2+BlpRyYXHkM0VAaOZTgC3RYo+oJIhio07V/kwFkZks7BvQ4rpWPqUMSpuPiSgTe+XG2iTRJFLL/lgCyoy1ltgbFqcWeE3PqrqV17S0BArQRH6+EkhCjRIVmHSiRAFzS9T27aGvEM8vcJcQaMHJ+kUq2d+pcceVC4oGs2P9eg41TvQIkDnB6rUECOoeNdlj8SjqPAJ0JM1X5TEvinQXnaXdDx/V+von4JBeONluBf7smDiH0HfmhmWduz+9tHNXy5KO1j8s79p1z5KO1j+Q0l5LlMtgavLE8TytH5YClA7G21XRH6iqAS7bv3r1iuhv9riuDbyjZSTMFab6El8BVZAqPfzEr3uKJLERoMXX4JkucM8LnDxHFc/kAJcD5rKFHa3PKu9o/VAGXCFK6bC/unoZoM8/JiIK9E3I2J8s6dp9+7J9e36zpKP1D4u7dv1uRefO3wv0sM1lAtGMkqRqlhxyrj6ROWmdW1vTRNThESkTBb4ELxss4CvTMv60vo7CK5Z2LLq8r6PwisF8vrK3vODyZZ271lySj8t2dyx8/ur2HUM6DXbSSOQasta98878FtniwzwVnTvf21tR25009BkFTErFRWHZMcU000VGPCJOgs1RFzQu7dz1L5naehSD99k5SZ5mT8sUbRXSb1rCK8ZExCjfsmvt2ruptfXICWCnrS3VteLS1UnIu8ZEJEnEovrNzAKJ9h0jE5W1w46wqIRN4aCfftFG4PbMgnxV5MfSy3hnkthMyOyrM7aj3lyDlqDHuDeWMC8cVRUR2TdA8tGsE+zjM0cLBUr6jgRzTT5R4ZBzNwN4P+rrzVUtLX5PVc0gQFrIzCMavJyA1ky/MsEXPYR3FBtOjohkkpSeQPOEU2OsogooNH8iL0+OZ8RvdrojlHkW+s44yS0KUIKwuXt53RZqbf3DicCzNb2nujqZF/CHFJAkEadA3yJAOzo7Lc5xQMi4hGBxb/X9tjCw+QoygcoE+dirAHVWVCRHCwulubU1aAKESF4UqMHUNNqTyVFJXegrBi8daQi3A5zh7akkZW91dWJtW9vR/ZU1dyfJ3MBAoUjiIwRcn82HJkCasEN6Vq57Y5Jpg1OVcZXD+aZw25lmYz8LQAELIhI5uKJr7+9PBhy3o95E9fRkstRQYAqVyDMgnlDpr+rqOqqAebSuzlwKgFpD2TABXT0hqgmis7I0McPXyYoNlE+APoLDTMfH5uz3//p6RkuLgPA/DNQniQqU7Tsua219d3hBFxSgqwDNRAp2VKyrpNbWzhn353w9DUe+HXZp187Pj4r7EygOF7Exca6smGa+wGhQSIatYnQUwRtDcBUmi6O4/M0TRtegxSlAB8uLvznk3B/ymJmZquf55uf7V9W+8IFFlxcCYRmMAxW1r8q3+nMF5pew4XHR767o2r09MmFRqHHUPxaEEVhBPvGHuyvqXrpv+fK8bai3XSvXrOqprPlcKZvNIyJiZt/BgDagxd27fr2nKn85rqqFxAzSTy/v2PXZzGdpx67PZX+Wdez6r6VdO/8brP+eR8QjIgqiNx+pri5BS0uUfwm/yyemEZHAEH/gQEXNdb1L1udvBcz+1Zeu6K2o+UixsX87IqJmyn7WEJ36S/e3HlWgT6CSJF5UFNhNGVk/VFn7ut4lS/IBYGl3a2ug+EKZMSxAIuHhfw5U1d4wsGpVabixVOTtq6h5Zpnz7rbMVxsQDznXnuTUFxSg/ksuOeea33weVwBY29aWIqCHoZLHXOAl6f37li/Pq+rqmristTX9jurqor6q2qYk8SsnxPnTjDlHJ4E2UmiSybLqzRngeqCi9lXda9Ys45aWk+4x6UQi1KoQ/nVc3FigKkmiNxyoqv16b3Vd3b2ABwB9qy5f2FdZ+/eeMbcFqn4xMxNTU3n7jqEd69fbJ34NBEDkbQXMViAR/TSZqEcC9Bq0BFnroQKAr3kHSTEYqLokUd2Bypq33QLoZa2taWptTe9ffemKEme3FBiu9lXcGcOrsKgy1NEup0oTImJA1x2pfsryy9Ca7q1YU7uvovZls2FpuKWlRRSgooTeNizuAELN8rsOVNb+V1/FusrsfeHQqto1fVXrbi8x5t6uVXXPzUSxzmmAlRngsCRBvV3ZufvuYXXPSzvdUcbWAhpovDHGlMOikinaHKi0jcJds6x999dC581mF4Or2We5qgaABkrTLoQKgK7ascMPxL0hpdqVH5bHucIqfr4gP/1Ab1XN79JpfsgY+i4IlcXG8DGR+zXhbo40MJrJvwXWT02oKkA2ICxMsP7E2uIH1lYd/KM19oGlicRfHBXXQqo9HhAoTadpIQfVgMI26wxkiwnQZYOjLylgXheoumMSDMC4OxT19pG6uoTW19upn3ux3tP6eovxou8Ni3Qy4AqZF6fSXkPG2d8CnxsRN5Egsg4oMoa/g+ToQ8+prPkjiXtwSTLxDyMiv4PqY4nwZO+f2LQGJkAY8sUSNhyoOCX6fG9lza96K2t+X2rNN5BX+jcAoPX1dmlQ+ncDQfCLUjaWCPM9ojvHJfFIT2XN75Ocfz8z/R8T1VsQRGUAohvLwygqWr9jlUTaS8mM/SktRQQH1QCkp9soXbTOn3Cdsv53PjOnVcUQvcuzRQ/2Vtb+sLey9gcTzj60wNh/TomkFUhFGiUBgPVFRRr6lgGAfNEQKKUqBvR3fZW1f+ipqmkptua7JjAfkkzqAUR9Ug2YwuCyw60LBAAt79i1Zxyy2VCmlAu/XgO9b0ll7Y6eyto/iviP5DF/VEmT84zxBsTdurR95+e3Amb9jh0OABJEGvJLA9CpgAMpEYKQbzQjgMFZ40JEQeQM7jZGHzpJ8e5MGaSqrgePCuTOcmNMAFUivvXPq2ru662q/X5vVc1PjXMPXGK81404N0ogh2nm0SQfoYGeRDYysu/T2G/GxD2Sz8wKrE674A+9lbU/Y7a/TjCaD66uq45WGiJC5pkn5wmR0iSPw+uiShRcumtXvzi5AcB4ghl5hv9Kme7vqapp6amq+Z+eqtp7fNH78tluKjd2vifyQZyQoR5QOr5+YBoNPp/vKzahJdiGeruqc/funnFbPyzujlK2lgESaGzaielkG6AQIGXG2lHnfjhEqees7Njzx0yNrphDs08MJEuMtaVsLRTzTrGQckX33vYR5zaMi/zMAChixiXWVi8w3jPmG1OZT6Gz/KiTb/Qn5cXL9uw5kln4NwKuEeCl7bvvnRC5KUEYL2VD+cwot2btYuNdeYmxxQfS/rdIsQmEBSXGhu5P7sRAJ4XOKzHWFrNNGJGZaBb03vXrPVH8aykbXmw9q8BdYTHaheEJv6UlmPq5Cjv87S1hdmxAvrjAeraQmIi1se/yywsB0MKOXXsmJLiegaF5bNgjQrm1qxdZ76kLjFd2KO3/r0v7DQCK54X9Kj/R56pZGgH+defuzx1ywR3z2NoSZl5gvecttN7TCQArrVeA0NKitP934x3ByJ8Oi/w3qwYJIsy3dvlC610939iaeWzIgOCr3jPky4al3bt2PK4Is6IoM/Z6omvT1IlZVmqsZXAZi0y7//Q5RwSUlXLUt8hEqGgwy9p3f+1IEPx7PrNJEqPM2jWLrX3FEs/702U2UXEoCP5Pif4yn7koycYKtOC47IVpQpZ17r57UIKmImZTyIz51j59kfWe74UcvGxvdXVheL0WFhtrS4y1TjU/W4a3AqaiY3fzqLiXE7DbEjDPmOQCa5+y0Nqryq1ZYAkwSscGAveBpR07/1wj/+LMc3znTJJMUcSzspPOK+dsIZm8UIZ13kzmpFPNnxwX0ZKZzegwBQulit5/OAi+VcrWK2DCJcZesdjaVy6xiWsXWK/8oB9sIeAjSzwvWUzGKpCYMuZFxaeXDQVAVV1dExb2hpTovlI2NI/NkkXWvnieMfM9orzA6aUAwEFgC8nkhTJycp4ELrAlbL3SUDEzb6osLO/e84vhIHixU32IAJQZO2+x8Z6/xHgvW2zsM+dbW5RWdUcC/+vOD64HmgXZgFTD9aOErcfu8RkP5kQKhMnimgcfGgWwqa+q7o8e6ON5zMmxOPN7TFNIoC6fjAEUw0Fwy+LOXU0AsBUwMbiafcrkcRLFQ4POfVFUlKB7AeCW0Fl2WpBFXbs7AVx7oKrmxU75T4bVXQogH0QjCdCDQsEPFnXs+S0QOg1nb+hNmWd07trStaL23sDK5gDytAmCx0r7BfSdJZ07v9W9fHm+scWf7xdXCNX+pX1LfaBv0gTCwJ39zq3x4QIJcCjbPHIK8E4ESO/Q0HxV+/sDgf/7JDHIySdDLVuznoZfTgE6QP6XDvq8NFC1TGRSRycWEtCxDfV2ZVfLd7tWVD/kG/tmB1w9wchjcB+p/mBR5867AOj+qtrb+wNXpkojJumPZWsfJqdCx85N+ytqfpJkapiAu0RBR1TxvcWdO79GmT0YINq/fxzAX/SsrPmiwF0niqcpUELglMfYIyr/s7Bj148R1QU8PhZRXxU/HXRuXBRg1kez5WKyPS0tolW1t/Y7t1hVRwMXHMuWkcx1iUWLAvSPfn7QuUtUaWTI88ayNnyizl3v71lV99M86BtGRWsBMBN6PND/Lulc+NUDqwbLU+p/YTjwjRH6DQA0RyaoSdnr2H1L18o1vym03qYxcSsVMsJEP7MjfNuaw22jkWxsH3KuMABglO/N7lOmJt3Kzua7u5cvf2q+V/JqhbxYgJWqapXQb4jumQj8b1fsa3tMs3w9M4MzwYlBEvdf/YokFPtOAjogDodHSD7nA54KdcxkTqpix6BzX0SYJPM+AHg0R809ZYwAfTvGADQcqKi5zhpcNyKoIJCzhDYl+tGyrp0/6KusfcaQcyt8FQVpGwBg2TKHtjaA8NMh58YDhariBNmYui40Aryo89EHd65Y98xLPPylU3k2gcgoHp1Q3La8a+f9AOB70p8O5HNOYQnUPZVnmZ95TEeGJPjvNAyzon3adah7z28fqat7+pKUXJd2uNYBlaJqQRgk0IMA/WhJx84/YJqXULh+rE2pcz4mU3ZkB/fMKa0ENQO8EXAdq2ueVST8xULmSwfFiQLEcSqHi11rpQqVMrZmTF237+jPl3a1/jQMOc6ohmM6X6gxHJdTJnicdLY9yTWZ6vYXoCzzqYIvcnWUnsl1yCHg43TtOh9480Q9I1f5C1PAzF0ZPZ0MzbbT/qnG5lwECOQiC6dbh06h1Z87lDEPbANs1WO77nnMpJ99zLkvFTFzkogEGofaX7TgSp0lonlszahz3xpWc3UIruotRdXjYy6d+4U4DKVvMLmEVDdF/h8KmKjMyWSpnEypkZP5iGQokz9vyv1GsyreZ9o0XQTS1uja6O90Bn0+4/uz+ZXd3uzT9XT9moyGy3r3qdbMTN+nPmPqddnvzC6Vk92/U2x8nAsfcmnz6a7LmOgUDaZxkjcNGRmiE/k6/R4X9XWyvVm8ppn0KZI/Cu/Nbg/Mtvpw7E4BruhUsnmm8+rkMnbGiUp1yjyixizeRLJIJ+NVrrIxZWzoRNkP25+9FswW7zLvy1x3kjGcdh063foxZzU+2SeHvsrajZbxqQIyS45K4AAimmPgMaaz01qVsjETKkMO9J7F7a1fyEzAOHloTDHFFFNMT5JSaG6fmMOImWa3Z1n18pJE4hMFTBvTqkiJBESxb9aFTAJ1HrEpIsYxcT8LVN65vHP37jNV58YUU0wxxRRTDLBOBFqTNu6einXXW+aPFLNZPihOEar24uSkFxBlsvrPY8NjIkcc6QcWt+/876myEFNMMcUUU0wxwDr7TXfSSbNt1aqFJZpoIuK3J4gwIi42G14YY6yqKoVsDAFIQ77mg967rL21O1cn3ZhiiimmmGKKAdaZbcKTGoy+inUbDPMHC5ifNRGZDUFk4sLRcw9YQdV5zLaIGaMiDwUq71vSsetHABDntooppphiiikGWE/MhkyIojcU4L6K2psN45+K2awYVgcnGgOtuTKWqo6JTAkbjIjrh+KjYzr26aquromoCK7GEYIxxRRTTDHFAOsJpOxIw/1La+Yn8/jdCv3rQjKlw+IQpnUgjoHW+QiS1RHIlDBjXGVCBV9KG/7o8sce3ReB6NjXKqaYYoopphhgPbmb9fFw/a4Vl67Os/L3ADYXsUkOi4NTdUQx0HryxwkKVQGRKWWDERFl0q856IeXtO96JDOWQLPEEYIxxRRTTDHFAOv82LxpO+onS6V0L6+5LN+jvxXoG4vYJo6FQCs2HT55wMoxkS1mgzERAeHbKdFPrOjc+fvoGoPTJJ2MKaaYYoopphhgPUkUleegjHnpwKp1TyHldxDwhiI2RSMq8EUcKI46fAKAlaiqehzmshoRlwbhWyL49JLjwIojQY39rGKKKaaYYooB1hzY3BlZQOvg6rpqFXkbgW8sYl6SVsWYikRVAGLz4ezxXQEVgCifiJPMGHVuAIqvC8sXFrfvfhgI/ecaovIdMddiiimmmGKKAdacBFoNlPHR6q2uXmCCxOuV9M1J4iu9MI8WHDTIAlox2Jo5nwWqwkS2iBkCYEJkJ0jvMKngq5f0tO2PrjOIgVVMMcUUU0wxwLowgZYCdKjy0peA9CaB/EkJ2yIfijERaOirxbEJMTdQBSJTQExJIhwTN6GKn4P1y4vy+MfU2poOr20wQHMMrGKKKaaYYooB1gUKCk5whgeA3sraCst4FRQbBfSsEmaaUMW4ikLVgShjbrzY+anZkYB5RJRHjDEViOJ+AM1E+q2F7Tv3Zm7Yhnq7AS0udl6PKaaYYoopBlgXD9h6nLnq8Oqa9YHDq4nolUy4rIgM0iHYgkIDBYhAhItEu5XxqQoBEtl8YiSIMK6CtEgbiH5kyH37c+17/i+TEDSjLYzTLcQUU0wxxRQDrIuYGgHeUF/PG1qOa1q2Aba2ouYqR3gFgGuJ6MoSNhZQTKgipaqk6pQuLMA16aSuUCJij4jziMAgDIlTAh4i6M9E8eOUjv++qqtrInPvtvp6u6GlRWIzYEwxxRRTTDHAimkqwODtqOepte96Ky6tFcgGIryIgas9puUFxHBQpFSRVoVCHRQapYDIOMufz2MgCAssK0KgaBJESBDBgjCuipS4gwrsgOJ/LZltCzsffShbK6VoMM1oRkOcwyqmmGKKKaYYYMWUA9AihP5ajwNbfYsuL6S89OVE9Fwheo6qPJWIVhYxw4DgQ+Fr+JHIEZwI0FDTNQm6zrVPlx4HPApACaqqQMaB34vAlAeCABgVhwDotdAHVOkeX+U3AfIeqOp68Gj2c7eh3h5Gi8agKqaYYoopphhgxXS2YIW3o54Po0U3TqmR1718eT7Z/LUG5kohPI2AKxm0SoFlhcyUAEEBOCicAj4ULgRfGRAkUwdLcxy7E7VJk98RAGYAJtJGWQJMqKaCr1G0JNAnig6GPkjA/SK4z4zz7kWHW0em6/sGtEgI1GJQFVNMMcUUUwywYpp9sEXNAC9APW3A9D5HfYsuL7T5qeUBU7U6rAXRaiVdzcBiARYTaB6AvCQRPKITABKQCdfLfKePG9ZJVRg9frD9jMlSkVLoEIEOAjigpO2q9JgF9qhB25im9q9ubx+aFkyGPmmKWEsVU0wxxRRTTDHAerIAFwBCfX3o6H4KR28FuKempkzTVM6KxQRZJMILQLoAhPkElBFQDEURgKQSEqRkFcoggJREoY6AtAIpEEahGCaiQRUZUKbDUDqiyoeIgl62bmB327LBqWbOE9peX28AoLklNvvFFFNMMcUUUy70/wGmnnv+BLyx2wAAAABJRU5ErkJggg=='

let rows = [], ctr = 0, plF = PL_ITEMS.slice(), plPg = 1, plCat = ''
let mF = PL_ITEMS.slice(), mPg = 1
let customers = [], products = [], pipeline = [], profiles = [], visits = [], contacts = []
let visitTarget = 10
let currentUser = null, onLogout = null
let myRole = 'sales', myProfile = null
let dbTab = 'customer', custType = 'all', pipFilter = 'all'
const PER = 40

// ── ROLE HELPERS ──
const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', sales: 'Sales', engineer: 'Engineer' }
const isAdmin = () => myRole === 'admin' || myRole === 'super_admin'
const isSuper = () => myRole === 'super_admin'
const canSeeVal = () => myRole !== 'engineer'
const canQuote = () => myRole !== 'engineer'
function guardAdmin() { if (!isAdmin()) { toast('Hanya admin yang bisa melakukan ini', false); return false } return true }

function fmt(n) { if (!canSeeVal()) return 'Rp •••'; return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID') }
function fmtPL(n) { return canSeeVal() ? 'Rp ' + Math.round(n || 0).toLocaleString('id-ID') : 'Rp •••' }
function fmtD(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-' }
function gv(id) { return document.getElementById(id)?.value || '' }
function calcR(r) { return r.qty * (r.price || 0) * (1 - (r.disc || 0) / 100) }

// Nomor quotation: Q + inisial + YYYYMM + urutan (reset tiap bulan)
function genQuoNo() {
  const init = (myProfile?.initials || (myProfile?.name || currentUser?.email || 'XXX').replace(/[^A-Za-z]/g, '').slice(0, 3)).toUpperCase()
  const now = new Date()
  const prefix = 'Q' + init + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0')
  let maxSeq = 0
  pipeline.forEach(h => {
    const n = h.qo_number || ''
    if (n.startsWith(prefix)) {
      const s = parseInt(n.slice(prefix.length), 10)
      if (!isNaN(s) && s > maxSeq) maxSeq = s
    }
  })
  return prefix + String(maxSeq + 1).padStart(2, '0')
}

// Grupping bundle: item setelah baris grup (sampai grup berikutnya) di-sum ke grup itu
function computeGroups(rws) {
  let cur = null; const sums = {}; const inGroup = new Set()
  rws.forEach(r => {
    if (r.t === 'g') { cur = r.id; sums[cur] = 0 }
    else if (r.t === 'i' && cur !== null) { sums[cur] += calcR(r); inGroup.add(r.id) }
  })
  return { sums, inGroup }
}

function toast(msg, ok = true) {
  const t = document.getElementById('gso-toast')
  if (!t) return
  t.textContent = msg; t.style.display = 'block'
  t.style.borderLeftColor = ok ? '#22c55e' : '#ef4444'
  t.style.color = ok ? '#166534' : '#991b1b'
  clearTimeout(t._t); t._t = setTimeout(() => t.style.display = 'none', 2600)
}

export async function renderApp(container, user, logout) {
  currentUser = user
  onLogout = logout

  container.innerHTML = CSS + `
  <nav>
    <div class="nlogo"><img src="data:image/png;base64,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" alt="GSO" class="nlogo-img"> GLOBAL SAHABAT OTOMASI</div>
    <div class="ntab on" onclick="nav('dashboard')">📈 Dashboard</div>
    <div class="ntab" onclick="nav('quotation')">📄 Quotation</div>
    <div class="ntab" onclick="nav('pricelist')">💰 Pricelist</div>
    <div class="ntab" onclick="nav('pipeline')">📊 Pipeline</div>
    <div class="ntab" onclick="nav('visit')">📍 Visit</div>
    <div class="ntab" onclick="nav('database')">🗄 Database</div>
    <div class="nright">
      <span class="user-info" id="user-label" onclick="openProfile()" style="cursor:pointer;" title="Lihat profil">...</span>
      <button class="btn-logout" onclick="doLogout()">Keluar</button>
    </div>
  </nav>

  <!-- DASHBOARD -->
  <div id="p-dashboard" class="page on">
    <div class="db-greet" id="db-greet"></div>
    <div class="sg" id="dash-stats"></div>
    <div class="dash-grid">
      <div class="card">
        <div class="chd">Pipeline Status</div>
        <div id="dash-pipeline-chart"></div>
      </div>
      <div class="card">
        <div class="chd">Leaderboard Sales</div>
        <div id="dash-leaderboard"></div>
      </div>
    </div>
    <div class="dash-grid">
      <div class="card">
        <div class="chd">Top Customer (by Total Value)</div>
        <div id="dash-top-customer"></div>
      </div>
      <div class="card">
        <div class="chd">Customer Database</div>
        <div id="dash-cust-breakdown"></div>
      </div>
    </div>
    <div class="card">
      <div class="chd">Visit Bulan Ini per Sales</div>
      <div id="dash-visits"></div>
    </div>
    <div class="card">
      <div class="chd">Penawaran Terbaru</div>
      <div id="dash-recent"></div>
    </div>
  </div>

  <!-- QUOTATION -->
  <div id="p-quotation" class="page">
    <div class="ptabs">
      <div class="ptab on" id="qt-info" onclick="qt('info')">Info</div>
      <div class="ptab" id="qt-items" onclick="qt('items')">Item & Harga</div>
      <div class="ptab" id="qt-prev" onclick="qt('prev')">Preview</div>
    </div>
    <div id="qp-info">
      <div class="card"><div class="chd">Info Quotation</div>
        <div class="fld" style="margin-bottom:9px;">
          <label>Judul Quotation (untuk tracking project — kosongkan jika hanya pembelian barang/jasa)</label>
          <input id="f-title" placeholder="Contoh: Vision Inspection System Line 2 - PT ABC">
        </div>
        <div class="g3" style="margin-bottom:9px;">
          <div class="fld"><label>Quotation No.</label>
            <div style="display:flex;gap:4px;">
              <input id="f-no" style="flex:1;">
              <button class="bxs" title="Generate ulang nomor" onclick="document.getElementById('f-no').value=genQuoNo()" style="flex-shrink:0;">⟳</button>
            </div>
          </div>
          <div class="fld"><label>Date</label><input id="f-date" type="date"></div>
          <div class="fld"><label>Price Valid Until</label><input id="f-valid" type="date"></div>
        </div>
        <div class="g4">
          <div class="fld"><label>Sales Name</label><input id="f-sales"></div>
          <div class="fld"><label>Mobile</label><input id="f-mobile" value="081212457537"></div>
          <div class="fld"><label>Payment Terms</label><input id="f-pay" value="50% DP 50% AFTER INVOICE"></div>
          <div class="fld"><label>Delivery Terms</label><input id="f-del" value="3 week DDP"></div>
        </div>
      </div>
      <div class="card"><div class="chd">Customer</div>
        <div class="g2" style="margin-bottom:9px;">
          <div class="fld ac">
            <label>Nama Perusahaan / Customer</label>
            <input id="f-co" placeholder="Ketik untuk cari dari database..." oninput="acSrch(this.value)" autocomplete="off">
            <div class="acdrop" id="acdrop"></div>
          </div>
          <div class="fld"><label>Alamat</label><textarea id="f-addr" placeholder="Jl. alamat lengkap..."></textarea></div>
        </div>
        <div class="g3">
          <div class="fld" style="position:relative;"><label>Up (Kontak)</label><input id="f-ct" autocomplete="off" placeholder="Klik untuk pilih kontak..." onfocus="showCtDrop()" onblur="hideCtDrop()"><div id="f-ct-drop" style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:8px;max-height:180px;overflow-y:auto;z-index:50;box-shadow:0 8px 20px rgba(0,0,0,.08);"></div></div>
          <div class="fld"><label>Telp / Mobile</label><input id="f-tel"></div>
          <div class="fld"><label>Fax / Email</label><input id="f-em"></div>
        </div>
      </div>
      <div class="card"><div class="chd">Setting & Notes</div>
        <div class="g4" style="margin-bottom:9px;">
          <div class="fld"><label>VAT (%)</label><input id="f-vat" type="number" value="12" oninput="recalc()"></div>
          <div class="fld"><label>Diskon Global (%)</label><input id="f-disc" type="number" value="0" oninput="recalc()"></div>
          <div class="fld"><label>Engineer</label><input id="f-eng"></div>
          <div class="fld"><label>PO To</label><input id="f-po" value="order@gso.co.id"></div>
        </div>
        <div class="fld"><label>Notes / T&C</label>
          <textarea id="f-notes">PO to: order@gso.co.id\nDelivery Terms: 3 week DDP Cikarang, Bekasi\nTerms of Payment: 50% DP 50% AFTER INVOICE\nPembayaran: Rek Mandiri 1200010055494 an PT.Global Sahabat Otomasi</textarea>
        </div>
      </div>
      <div class="abar"><button class="bp" onclick="qt('items')">Lanjut ke Item →</button></div>
    </div>
    <div id="qp-items" style="display:none;">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.65rem;">
          <div class="chd" style="margin:0;">Daftar Item</div>
          <button class="bxs" onclick="openModal()">💰 Cari dari Pricelist</button>
        </div>
        <div style="overflow-x:auto;">
          <table class="itbl">
            <thead><tr>
              <th style="width:24px;">#</th><th style="width:78px;">Part No.</th>
              <th>Description</th><th style="width:37px;">Qty</th>
              <th style="width:42px;">Unit</th><th style="width:100px;" class="r">Unit Price (Rp)</th>
              <th style="width:46px;" class="r">Disc%</th><th style="width:100px;" class="r">Price (Rp)</th>
              <th style="width:22px;"></th>
            </tr></thead>
            <tbody id="ibd"></tbody>
          </table>
        </div>
        <div style="display:flex;gap:6px;margin-top:5px;">
          <button class="addr" onclick="aGrp()">📁 Grup</button>
          <button class="addr" onclick="aItem()">+ Item</button>
          <button class="addr" onclick="aNote()">📝 Notes</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;">
        <div></div>
        <div class="card" style="min-width:218px;margin-bottom:0;">
          <div class="srow"><span>TOTAL</span><span id="s-tot">Rp 0</span></div>
          <div class="srow"><span>DISKON (<span id="s-dp">0</span>%)</span><span id="s-disc">Rp 0</span></div>
          <div class="srow"><span>SUB TOTAL</span><span id="s-sub">Rp 0</span></div>
          <div class="srow"><span>VAT (<span id="s-vp">12</span>%)</span><span id="s-vat">Rp 0</span></div>
          <div class="srow"><span>GRAND TOTAL</span><span id="s-grand">Rp 0</span></div>
        </div>
      </div>
      <div class="abar">
        <button class="bs" onclick="qt('info')">← Kembali</button>
        <button class="bp" onclick="qt('prev')">👁 Preview</button>
      </div>
    </div>
    <div id="qp-prev" style="display:none;">
      <div class="prev">
        <div class="prev-hd2">
          <img src="data:image/png;base64,${FULL_LOGO_B64}" alt="GSO" class="prev-logo">
          <div class="prev-hd2-addr">
            <div class="prev-hd2-name">PT. GLOBAL SAHABAT OTOMASI</div>
            <div>Jl. Industri Sel. IV Blok GG.5.O Kawasan Industri Jababeka</div>
            <div>Pasirsari, Cikarang Selatan, Bekasi Regency 17550</div>
            <div>www.gso.co.id</div>
          </div>
        </div>
        <div class="prev-bd">
          <div class="prev-title">QUOTATION</div>
          <div class="prev-boxes">
            <div class="prev-box-left">
              <div class="pbl-to-section">
                <div class="pbl-to-lbl">To :</div>
                <div class="pbl-company" id="pv-to"></div>
                <div class="pbl-addr" id="pv-addr"></div>
              </div>
              <div class="pbl-sep"></div>
              <div class="pbl-row"><span class="pbl-lbl">Up :</span><span class="pbl-val" id="pv-up"></span></div>
              <div class="pbl-sep"></div>
              <div class="pbl-row"><span class="pbl-lbl">Telp / Mobile:</span><span class="pbl-val" id="pv-tel"></span></div>
              <div class="pbl-sep"></div>
              <div class="pbl-row"><span class="pbl-lbl">Fax / Email :</span><span class="pbl-val" id="pv-email"></span></div>
            </div>
            <div class="prev-box-right">
              <div class="pbr-row"><span class="pbr-lbl">Quotation No.</span><span class="pbr-val" id="pv-no"></span></div>
              <div class="pbr-row"><span class="pbr-lbl">Date</span><span class="pbr-val" id="pv-date"></span></div>
              <div class="pbr-row"><span class="pbr-lbl">Sales Name</span><span class="pbr-val" id="pv-sales"></span></div>
              <div class="pbr-row pbr-gap-after"><span class="pbr-lbl">Mobile</span><span class="pbr-val" id="pv-mobile"></span></div>
              <div class="pbr-row"><span class="pbr-lbl">Payment</span><span class="pbr-val" id="pv-payment"></span></div>
              <div class="pbr-row"><span class="pbr-lbl">Create by</span><span class="pbr-val" id="pv-createby"></span></div>
              <div class="pbr-row"><span class="pbr-lbl">Engineer</span><span class="pbr-val" id="pv-engineer"></span></div>
            </div>
          </div>
          <table class="ptbl"><thead><tr>
            <th style="width:28px;">No.</th><th style="width:75px;">Part Number</th><th>Description</th>
            <th style="width:26px;" class="r">Qty</th>
            <th style="width:82px;" class="r">Unit Price</th><th style="width:34px;" class="r">Disc</th>
            <th style="width:82px;" class="r">Price</th>
          </tr></thead><tbody id="pv-body"></tbody></table>
          <div class="prev-bottom">
            <div class="prev-notes" id="pv-ft"></div>
            <div class="ptot" id="pv-tot"></div>
          </div>
          <div class="prev-tagline">
            <div class="pt-name">PT Global Sahabat Otomasi</div>
            <div class="pt-slogan">"Your Automation Partner"</div>
          </div>
        </div>
      </div>
      <div class="abar">
        <button class="bs" onclick="qt('items')">← Edit</button>
        <button class="bp" onclick="doPDF()">⬇ Download PDF</button>
        <button class="bs" id="btn-save-quo" onclick="doSaveQuo()">💾 Simpan ke Pipeline</button>
        <button class="bs" onclick="doSaveCust()">👤 Simpan Customer</button>
      </div>
    </div>
  </div>

  <!-- PRICELIST -->
  <div id="p-pricelist" class="page">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.65rem;">
        <div><div style="font-size:15px;font-weight:600;">Pricelist Hikrobot 2026 Q1</div>
          <div style="font-size:11px;color:#64748b;">Kurs Rp 18.000/USD · <b>${PL_ITEMS.length.toLocaleString()}</b> produk</div>
        </div>
      </div>
      <div class="pl-bar">
        <input type="text" id="pl-q" placeholder="Cari model, spec (MV-ID2013, SC3016, IDH3000, 5MP, lighting, lens...)" oninput="plSearch()">
        <select id="pl-sort" onchange="plSearch()">
          <option value="">Relevansi</option>
          <option value="asc">Harga ↑</option>
          <option value="desc">Harga ↓</option>
          <option value="az">A–Z</option>
        </select>
      </div>
      <div class="pills" id="pl-pills"></div>
      <div class="prrow">
        <span style="font-size:11px;color:#64748b;">Harga:</span>
        <input type="number" id="pl-min" placeholder="Min (Rp)" oninput="plSearch()">
        <span style="color:#94a3b8;">–</span>
        <input type="number" id="pl-max" placeholder="Max (Rp)" oninput="plSearch()">
        <span style="font-size:11px;color:#64748b;margin-left:4px;" id="pl-rc"></span>
      </div>
      <div class="tblwrap">
        <table class="pltbl">
          <thead><tr>
            <th style="width:26px;">#</th><th style="min-width:220px;">Model / Part Number</th>
            <th style="width:130px;">Kategori</th>
            <th style="width:135px;" class="r">Harga (Rp)</th>
            <th style="width:105px;"></th>
          </tr></thead>
          <tbody id="pl-body"></tbody>
        </table>
      </div>
      <div class="pg" id="pl-pg"></div>
    </div>
  </div>

  <!-- PIPELINE -->
  <div id="p-pipeline" class="page">
    <div class="sg" id="sg"></div>
    <div class="card">
      <div style="display:flex;gap:7px;margin-bottom:.7rem;flex-wrap:wrap;">
        <input id="pip-q" placeholder="Cari QO number, customer, deskripsi..." style="flex:1;padding:7px 10px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;" oninput="renderPip()">
        <select id="pip-f" style="padding:7px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;" onchange="renderPip()">
          <option value="">Semua status</option>
          <option>Open</option><option>Nego</option><option>On Hold</option>
          <option>Closed - Won</option><option>Closed - Lost</option>
        </select>
        <select id="pip-sales" style="padding:7px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;" onchange="renderPip()">
          <option value="all">Semua Sales</option>
        </select>
        <button class="bs" id="btn-exp-csv" style="padding:7px 11px;font-size:11px;" onclick="expCSV()">⬇ CSV</button>
        <button class="bs" style="padding:7px 11px;font-size:11px;" onclick="loadPipeline()">↻ Refresh</button>
      </div>
      <div class="tblwrap"><table class="piptbl">
        <thead><tr>
          <th>QO No.</th><th>Tanggal</th><th>Sales</th>
          <th style="min-width:130px;">Customer</th>
          <th style="min-width:130px;">Deskripsi</th>
          <th style="width:110px;">Grand Total</th>
          <th style="width:115px;">Status</th>
        </tr></thead>
        <tbody id="pip-bd"></tbody>
      </table></div>
      <div style="font-size:11px;color:#94a3b8;margin-top:5px;" id="pip-ct"></div>
    </div>
  </div>

  <!-- VISIT -->
  <div id="p-visit" class="page">
    <div class="sg" id="visit-stats"></div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <div class="chd" style="margin-bottom:0;">Rekap Visit Bulan Ini</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#64748b;">
          Target/bulan:
          <input type="number" id="visit-target" style="width:55px;padding:4px 6px;border:1px solid #e2e8f0;border-radius:6px;font-size:11px;" onchange="saveVisitTarget(this.value)">
        </div>
      </div>
      <div id="visit-monthly"></div>
    </div>
    <div class="card">
      <div class="chd">Catat Visit Baru</div>
      <div class="g3" style="margin-bottom:8px;">
        <div class="fld"><label>Tanggal</label><input type="date" id="v-date"></div>
        <div class="fld" style="position:relative;">
          <label>Customer (cari dari database)</label>
          <input id="v-cust" placeholder="Ketik nama customer..." autocomplete="off" oninput="vCustSearch(this.value)" onfocus="vCustSearch(this.value)">
          <div id="v-cust-drop" class="acdrop" style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:8px;max-height:180px;overflow-y:auto;z-index:50;box-shadow:0 8px 20px rgba(0,0,0,.08);"></div>
        </div>
        <div class="fld" style="position:relative;"><label>Kontak Person</label><input id="v-contact" autocomplete="off" placeholder="Klik untuk pilih kontak..." onfocus="showVCtDrop()" onblur="hideVCtDrop()"><div id="v-ct-drop" style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:8px;max-height:180px;overflow-y:auto;z-index:50;box-shadow:0 8px 20px rgba(0,0,0,.08);"></div></div>
      </div>
      <div class="g2" style="margin-bottom:8px;">
        <div class="fld"><label>Tujuan Visit</label>
          <select id="v-purpose">
            <option>Follow Up Penawaran</option>
            <option>Presentasi Produk</option>
            <option>Kunjungan Rutin</option>
            <option>Demo / Trial</option>
            <option>Penagihan</option>
            <option>After Sales / Support</option>
            <option>Lainnya</option>
          </select>
        </div>
        <div class="fld"><label>Catatan Hasil Visit</label><input id="v-notes" placeholder="Hasil pembicaraan, next step..."></div>
      </div>
      <button class="bp" style="padding:8px 16px;font-size:12px;" id="btn-save-visit" onclick="saveVisit()">💾 Simpan Visit</button>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;flex-wrap:wrap;gap:8px;">
        <div class="chd" style="margin-bottom:0;">Riwayat Visit</div>
        <select id="v-filter-sales" style="padding:6px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;" onchange="renderVisitList()">
          <option value="all">Semua Sales</option>
        </select>
      </div>
      <div id="visit-list"></div>
    </div>
  </div>

  <!-- DATABASE -->
  <div id="p-database" class="page">
    <div class="dtabs">
      <div class="dtab on" id="dt-customer" onclick="switchDbTab('customer')">👥 Customer</div>
      <div class="dtab" id="dt-product" onclick="switchDbTab('product')">📦 Produk Tersimpan</div>
    </div>

    <!-- Customer tab -->
    <div id="db-customer-panel">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
          <div style="font-size:14px;font-weight:500;">Daftar Customer (<span id="cc">0</span>)</div>
          <button class="bxs" id="btn-add-cust" onclick="toggleAddCust()">+ Tambah Customer</button>
        </div>

        <!-- Add customer form -->
        <div class="add-form" id="add-cust-form">
          <div style="font-size:12px;font-weight:500;margin-bottom:.65rem;color:#002060;">Tambah Customer Baru</div>
          <div style="margin-bottom:.65rem;">
            <div style="font-size:11px;color:#64748b;margin-bottom:5px;font-weight:500;">Tipe Customer</div>
            <div class="type-toggle">
              <button class="type-btn on" id="type-pt" onclick="setNewCustType('PT')">🏭 PT / Perusahaan</button>
              <button class="type-btn" id="type-eu" onclick="setNewCustType('End User')">👤 End User</button>
            </div>
          </div>
          <div class="g2" style="margin-bottom:8px;">
            <div class="fld"><label>Nama Perusahaan / Nama</label><input id="nc-name" placeholder="PT. Nama Perusahaan / Pak Budi"></div>
            <div class="fld"><label>Kontak Person</label><input id="nc-contact" placeholder="Pak Budi"></div>
          </div>
          <div class="g3" style="margin-bottom:8px;">
            <div class="fld"><label>Telp / Mobile</label><input id="nc-tel" placeholder="+62 812..."></div>
            <div class="fld"><label>Email</label><input id="nc-email" placeholder="email@perusahaan.com"></div>
            <div class="fld"><label>Industri / Keterangan</label><input id="nc-industry" placeholder="Farmasi, Food & Bev, dll"></div>
          </div>
          <div class="fld" style="margin-bottom:8px;">
            <label>Alamat</label>
            <textarea id="nc-addr" placeholder="Jl. alamat lengkap..." style="min-height:44px;"></textarea>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="bp" style="padding:6px 12px;font-size:11px;" id="btn-save-cust" onclick="saveNewCust()">Simpan</button>
            <button class="bs" style="padding:6px 12px;font-size:11px;" onclick="toggleAddCust()">Batal</button>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="filter-bar">
          <input placeholder="Cari nama, kontak, industri..." oninput="renderCustList(this.value)">
          <select onchange="setCustTypeFilter(this.value)">
            <option value="all">Semua Tipe</option>
            <option value="PT">PT / Perusahaan</option>
            <option value="End User">End User</option>
          </select>
          <button class="bs" style="padding:6px 10px;font-size:11px;" onclick="loadCustomers()">↻ Refresh</button>
        </div>
        <div id="db-cust-list"></div>
      </div>
    </div>

    <!-- Product tab -->
    <div id="db-product-panel" style="display:none;">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
          <div style="font-size:14px;font-weight:500;">Produk Tersimpan (<span id="pc">0</span>)</div>
          <button class="bxs" id="btn-add-prod" onclick="toggleAP()">+ Tambah Manual</button>
        </div>
        <div id="ap" style="display:none;padding:9px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;">
          <div class="g2" style="margin-bottom:7px;">
            <div class="fld"><label>Nama</label><input id="np-n"></div>
            <div class="fld"><label>Part No.</label><input id="np-p"></div>
          </div>
          <div class="g3" style="margin-bottom:7px;">
            <div class="fld"><label>Harga (Rp)</label><input id="np-pr" type="number"></div>
            <div class="fld"><label>Unit</label><input id="np-u" value="unit"></div>
            <div class="fld"><label>Kategori</label><input id="np-c" value="Product"></div>
          </div>
          <div style="display:flex;gap:5px;">
            <button class="bp" style="padding:5px 10px;font-size:11px;" onclick="saveProd()">Simpan</button>
            <button class="bs" style="padding:5px 10px;font-size:11px;" onclick="toggleAP()">Batal</button>
          </div>
        </div>
        <input placeholder="Cari produk..." style="width:100%;padding:6px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;margin-bottom:8px;" oninput="renderProdList(this.value)">
        <div id="db-prod-list" style="max-height:400px;overflow-y:auto;"></div>
      </div>
    </div>
  </div>

  <!-- MODAL PRICELIST -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <div class="modal-hd">
        <span>💰 Pilih dari Pricelist (${PL_ITEMS.length.toLocaleString()} produk)</span>
        <button onclick="closeModal()" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">✕</button>
      </div>
      <div class="modal-bd">
        <div style="display:flex;gap:7px;margin-bottom:.65rem;">
          <input type="text" id="m-q" placeholder="Cari model, spec..." style="flex:1;padding:7px 10px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;" oninput="mSearch()">
          <select id="m-cat" style="padding:7px 9px;border:1px solid #e2e8f0;border-radius:7px;font-size:12px;" onchange="mSearch()">
            <option value="">Semua kategori</option>
            ${PL_CATS.map((c, i) => `<option value="${i}">${c}</option>`).join('')}
          </select>
        </div>
        <div style="overflow:auto;max-height:360px;">
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead><tr>
              <th style="background:#002060;color:#fff;padding:6px 8px;text-align:left;min-width:190px;position:sticky;top:0;">Model</th>
              <th style="background:#002060;color:#fff;padding:6px 8px;width:120px;position:sticky;top:0;">Kategori</th>
              <th style="background:#002060;color:#fff;padding:6px 8px;text-align:right;width:110px;position:sticky;top:0;">Harga</th>
              <th style="background:#002060;color:#fff;padding:6px 8px;width:58px;position:sticky;top:0;"></th>
            </tr></thead>
            <tbody id="m-bd"></tbody>
          </table>
        </div>
        <div class="pg" id="m-pg"></div>
      </div>
    </div>
  </div>

  <!-- MODAL PROFILE -->
  <div class="modal-overlay" id="profile-overlay">
    <div class="modal" style="width:520px;">
      <div class="modal-hd">
        <span>👤 Profil Saya</span>
        <button onclick="closeProfile()" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">✕</button>
      </div>
      <div class="modal-bd">
        <div class="g2" style="margin-bottom:8px;">
          <div class="fld"><label>Nama</label><input id="pf-name"></div>
          <div class="fld"><label>Inisial (untuk nomor quotation)</label><input id="pf-init" maxlength="4" style="text-transform:uppercase;" placeholder="JRM"></div>
        </div>
        <div class="g2" style="margin-bottom:10px;">
          <div class="fld"><label>Email</label><input id="pf-email" disabled style="background:#f8fafc;color:#94a3b8;"></div>
          <div class="fld"><label>Role</label><input id="pf-role" disabled style="background:#f8fafc;color:#94a3b8;"></div>
        </div>
        <button class="bp" style="padding:7px 14px;font-size:12px;" onclick="saveMyProfile()">Simpan Profil</button>
        <div id="pf-users" style="display:none;margin-top:14px;border-top:1px solid #e2e8f0;padding-top:10px;">
          <div style="font-size:12px;font-weight:600;color:#002060;margin-bottom:6px;">⚙️ Manajemen User (Super Admin)</div>
          <div id="pf-user-list"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" id="gso-toast"></div>`

  // Init
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0]
  const vd = new Date(); vd.setDate(vd.getDate() + 30)
  document.getElementById('f-valid').value = vd.toISOString().split('T')[0]
  document.getElementById('f-sales').value = user.email.split('@')[0]
  document.getElementById('user-label').textContent = user.email

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal()
  })
  document.addEventListener('click', e => {
    if (!e.target.closest('.ac')) document.getElementById('acdrop').style.display = 'none'
  })

  initPills()
  plSearch()
  renderRows()

  await Promise.all([loadCustomers(), loadProducts(), loadPipeline(), loadProfiles(), loadVisits(), loadContacts()])
  applyRoleUI()
  renderDashboard()
  if (!gv('f-no')) document.getElementById('f-no').value = genQuoNo()

  document.getElementById('profile-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('profile-overlay')) closeProfile()
  })

  // Expose globals
  Object.assign(window, {
    nav, qt, acSrch, selC, recalc, aGrp, aItem, aNote, delR, delS, uf, us,
    openModal, closeModal, mSearch, mGo, mAdd, plSearch, plSetCat, plGo, addFromPL, saveStarPL,
    renderPip, updS, expCSV, loadPipeline, loadCustomers, renderDashboard,
    renderVisits, renderVisitList, vCustSearch, vCustPick, saveVisit, delVisit, saveVisitTarget,
    toggleContacts, saveNewContact, delContactDB, startEditContact, cancelEditContact, saveEditContact,
    showCtDrop, hideCtDrop, pickCt, showVCtDrop, hideVCtDrop, pickVCt,
    partSearch, hidePartDrop, pickPart,
    renderCustList, setCustTypeFilter, toggleAddCust, setNewCustType, saveNewCust, delCustDB,
    startEditCust, setEditCustType, cancelEditCust, saveEditCust,
    startEditProd, cancelEditProd, saveEditProd,
    doSaveCust, renderProdList, delProd, toggleAP, saveProd,
    doPDF, doSaveQuo, doLogout: onLogout,
    switchDbTab,
    openProfile, closeProfile, saveMyProfile, chgUserRole, genQuoNo
  })
}

// ── ROLE UI ──
function applyRoleUI() {
  myProfile = profiles.find(p => p.id === currentUser?.id) || null
  // Fallback: kalau kolom role belum ada (migration belum dijalankan), jangan kunci siapa pun
  myRole = myProfile ? (myProfile.role === undefined ? 'admin' : (myProfile.role || 'sales')) : 'sales'

  const lbl = document.getElementById('user-label')
  if (lbl) lbl.innerHTML = `${myProfile?.name || currentUser?.email || ''} <span class="role-badge">${ROLE_LABELS[myRole] || myRole}</span>`

  // Engineer: sembunyikan tab Quotation (tidak boleh membuat penawaran)
  if (!canQuote()) document.querySelectorAll('nav .ntab').forEach(t => {
    if (t.textContent.includes('Quotation')) t.style.display = 'none'
  })

  // Non-admin: sembunyikan tombol tulis database, export, dan kunci target visit
  if (!isAdmin()) {
    ;['btn-add-cust', 'btn-add-prod', 'btn-exp-csv'].forEach(id => {
      const el = document.getElementById(id); if (el) el.style.display = 'none'
    })
    const vt = document.getElementById('visit-target'); if (vt) vt.disabled = true
  }
}

// ── PROFILE ──
function openProfile() {
  document.getElementById('pf-name').value = myProfile?.name || ''
  document.getElementById('pf-init').value = myProfile?.initials || ''
  document.getElementById('pf-email').value = currentUser?.email || ''
  document.getElementById('pf-role').value = ROLE_LABELS[myRole] || myRole
  const uw = document.getElementById('pf-users')
  if (isSuper()) {
    uw.style.display = 'block'
    document.getElementById('pf-user-list').innerHTML = profiles.map(p => `
      <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f1f5f9;">
        <div style="flex:1;font-size:12px;">${p.name || '-'}<div style="font-size:10px;color:#94a3b8;">${p.initials ? 'Inisial: ' + p.initials : ''}</div></div>
        <select style="padding:4px 7px;border:1px solid #e2e8f0;border-radius:6px;font-size:11px;" onchange="chgUserRole('${p.id}',this.value)">
          ${Object.entries(ROLE_LABELS).map(([v, l]) => `<option value="${v}"${(p.role || 'sales') === v ? ' selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>`).join('')
  } else uw.style.display = 'none'
  document.getElementById('profile-overlay').classList.add('on')
}

function closeProfile() { document.getElementById('profile-overlay').classList.remove('on') }

async function saveMyProfile() {
  const name = document.getElementById('pf-name').value.trim()
  const initials = document.getElementById('pf-init').value.trim().toUpperCase()
  if (!name) { toast('Nama wajib diisi', false); return }
  try {
    const p = await updateProfile(currentUser.id, { name, initials })
    const i = profiles.findIndex(x => x.id === p.id); if (i >= 0) profiles[i] = p
    applyRoleUI()
    // Refresh nomor quotation kalau masih nomor auto-generate (belum diedit manual)
    const noEl = document.getElementById('f-no')
    if (noEl && /^Q[A-Z]{1,4}\d{6}\d{2}$/.test(noEl.value)) noEl.value = genQuoNo()
    toast('Profil tersimpan!')
    closeProfile()
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

async function chgUserRole(id, role) {
  if (!isSuper()) { toast('Hanya super admin', false); return }
  try {
    const p = await updateProfile(id, { role })
    const i = profiles.findIndex(x => x.id === p.id); if (i >= 0) profiles[i] = p
    if (id === currentUser.id) applyRoleUI()
    toast('Role ' + (p.name || '') + ' → ' + (ROLE_LABELS[role] || role))
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

// NAV
function nav(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'))
  document.querySelectorAll('nav .ntab').forEach(b => b.classList.remove('on'))
  document.getElementById('p-' + name).classList.add('on')
  const idx = ['dashboard', 'quotation', 'pricelist', 'pipeline', 'visit', 'database'].indexOf(name)
  document.querySelectorAll('nav .ntab')[idx].classList.add('on')
  if (name === 'pipeline') renderPip()
  if (name === 'dashboard') renderDashboard()
  if (name === 'visit') renderVisits()
  if (name === 'database') { renderCustList(''); renderProdList('') }
}

function qt(tab) {
  ['info', 'items', 'prev'].forEach(t => {
    document.getElementById('qp-' + t).style.display = t === tab ? '' : 'none'
    document.getElementById('qt-' + t).classList.toggle('on', t === tab)
  })
  if (tab === 'prev') renderPrev()
}

function switchDbTab(tab) {
  dbTab = tab
  document.getElementById('db-customer-panel').style.display = tab === 'customer' ? '' : 'none'
  document.getElementById('db-product-panel').style.display = tab === 'product' ? '' : 'none'
  document.getElementById('dt-customer').classList.toggle('on', tab === 'customer')
  document.getElementById('dt-product').classList.toggle('on', tab === 'product')
}

// AUTOCOMPLETE
function acSrch(q) {
  const drop = document.getElementById('acdrop')
  if (!q || q.length < 2) { drop.style.display = 'none'; return }
  const m = customers.filter(c => (c.company || '').toLowerCase().includes(q.toLowerCase())).slice(0, 8)
  if (!m.length) { drop.style.display = 'none'; return }
  drop.innerHTML = m.map(c => `<div class="acit" onclick="selC('${c.id}')">
    <div style="display:flex;align-items:center;gap:6px;">
      <span class="badge ${c.customer_type === 'End User' ? 'badge-eu' : 'badge-pt'}">${c.customer_type || 'PT'}</span>
      <span>${c.company}</span>
    </div>
    ${c.contact ? `<div class="acsub">${c.contact}</div>` : ''}
  </div>`).join('')
  drop.style.display = 'block'
}

let qSelectedCustId = null

function selC(id) {
  const c = customers.find(x => x.id === id); if (!c) return
  qSelectedCustId = c.id
  document.getElementById('f-co').value = c.company || ''
  document.getElementById('f-tel').value = c.tel || ''
  document.getElementById('f-em').value = c.email || ''
  document.getElementById('f-addr').value = c.address || ''
  document.getElementById('acdrop').style.display = 'none'
  // Kosongkan kontak — user pilih sendiri dengan klik field kontak
  document.getElementById('f-ct').value = ''
}

function showCtDrop() {
  const drop = document.getElementById('f-ct-drop'); if (!drop) return
  if (!qSelectedCustId) { drop.style.display = 'none'; return }
  const kList = contactsOf(qSelectedCustId)
  if (!kList.length) { drop.style.display = 'none'; return }
  drop.innerHTML = kList.map(k =>
    `<div class="v-acitem" onmousedown="pickCt('${k.id}')"><b>${k.name}</b>${k.role ? ' <span style="font-size:10px;background:#e0e7ff;color:#3730a3;padding:1px 6px;border-radius:5px;">' + k.role + '</span>' : ''}${k.tel ? '<div style="font-size:10px;color:#94a3b8;">' + k.tel + '</div>' : ''}</div>`
  ).join('')
  drop.style.display = 'block'
}

function hideCtDrop() {
  setTimeout(() => { const d = document.getElementById('f-ct-drop'); if (d) d.style.display = 'none' }, 150)
}

function pickCt(id) {
  const k = contacts.find(x => x.id === id); if (!k) return
  document.getElementById('f-ct').value = k.name || ''
  if (k.tel) document.getElementById('f-tel').value = k.tel
  if (k.email) document.getElementById('f-em').value = k.email
  document.getElementById('f-ct-drop').style.display = 'none'
}

// ITEMS
function aGrp() { rows.push({ id: ++ctr, t: 'g', label: 'ENGINEERING SERVICE' }); renderRows() }
function aItem(name = '', part = '', qty = 1, unit = 'unit', price = 0, disc = 0) { rows.push({ id: ++ctr, t: 'i', name, part, qty, unit, price, disc, subs: [] }); renderRows(); recalc() }
function aNote() { rows.push({ id: ++ctr, t: 'n', text: '' }); renderRows() }
function delR(id) { rows = rows.filter(r => r.id !== id); rows.forEach(r => { if (r.subs) r.subs = r.subs.filter(s => s.id !== id) }); renderRows(); recalc() }
function delS(pid, sid) { const p = rows.find(r => r.id === pid); if (p) p.subs = p.subs.filter(s => s.id !== sid); renderRows() }
function uf(id, f, v) { const r = rows.find(x => x.id === id); if (r) { r[f] = ['qty', 'price', 'disc'].includes(f) ? +v : v; recalc() } }

// PART NUMBER SEARCH (from pricelist)
function getPartDrop() {
  let d = document.getElementById('part-drop-global')
  if (!d) {
    d = document.createElement('div')
    d.id = 'part-drop-global'
    d.className = 'part-drop'
    d.style.display = 'none'
    document.body.appendChild(d)
  }
  return d
}

function partSearch(rowId, el) {
  const val = el.value
  uf(rowId, 'part', val)
  const drop = getPartDrop()
  const q = (val || '').toLowerCase().trim()
  if (q.length < 2) { drop.style.display = 'none'; return }
  const matches = PL_ITEMS.filter(p => p[1].toLowerCase().includes(q) || p[0].toLowerCase().includes(q)).slice(0, 10)
  if (!matches.length) { drop.style.display = 'none'; return }
  drop.innerHTML = matches.map(p =>
    `<div class="part-item" onmousedown="pickPart(${rowId},'${p[1].replace(/'/g, "\\'")}')"><b>${p[1]}</b><span>${p[0].includes('—') ? p[0].split('—')[1].trim() : p[0]} · ${fmtPL(p[2])}</span></div>`
  ).join('')
  const rect = el.getBoundingClientRect()
  drop.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 356)) + 'px'
  drop.style.top = (rect.bottom + 2) + 'px'
  drop.style.display = 'block'
}

function hidePartDrop() {
  setTimeout(() => { const d = document.getElementById('part-drop-global'); if (d) d.style.display = 'none' }, 150)
}

function pickPart(rowId, partNo) {
  const p = PL_ITEMS.find(x => x[1] === partNo); if (!p) return
  const r = rows.find(x => x.id === rowId); if (!r) return
  r.part = p[1]
  // Nama: pakai bagian deskripsi setelah "—" kalau ada, kalau tidak pakai full name
  r.name = p[0].includes('—') ? p[0].split('—')[1].trim() : p[0]
  r.price = p[2]
  recalc(); renderRows()
}
function us(pid, sid, v) { const p = rows.find(r => r.id === pid); if (p) { const s = p.subs.find(x => x.id === sid); if (s) s.text = v } }

function renderRows() {
  let nc = 0
  const gInfo = computeGroups(rows)
  document.getElementById('ibd').innerHTML = rows.map(r => {
    if (r.t === 'g') return `<tr style="background:#f1f5f9;"><td colspan="2"></td><td colspan="5"><input value="${r.label || ''}" oninput="uf(${r.id},'label',this.value)" placeholder="Nama grup / bundle..." style="width:100%;font-weight:600;padding:4px 5px;border:1px solid transparent;border-radius:4px;background:transparent;font-size:12px;font-family:inherit;"></td><td style="text-align:right;font-weight:700;color:#002060;font-size:11px;padding-right:5px;" id="gt${r.id}">${fmt(gInfo.sums[r.id] || 0)}</td><td><button class="bdel" onclick="delR(${r.id})">✕</button></td></tr>`
    if (r.t === 'n') return `<tr><td colspan="8"><textarea placeholder="Catatan..." oninput="uf(${r.id},'text',this.value)" style="width:100%;padding:3px 5px;border:1px solid transparent;border-radius:3px;background:transparent;color:#64748b;font-size:11px;font-family:inherit;resize:none;min-height:26px;">${r.text || ''}</textarea></td><td><button class="bdel" onclick="delR(${r.id})">✕</button></td></tr>`
    nc++
    const subs = (r.subs || []).map((s, si) => `<tr class="sub"><td style="text-align:right;color:#94a3b8;font-size:10px;">${nc}.${si + 1}</td><td></td><td colspan="6"><textarea oninput="us(${r.id},${s.id},this.value)" placeholder="Sub-item..." style="width:100%;padding:3px 4px;border:1px solid transparent;border-radius:3px;background:transparent;color:#64748b;font-size:11px;font-family:inherit;resize:none;min-height:24px;">${s.text || ''}</textarea></td><td><button class="bdel" onclick="delS(${r.id},${s.id})">✕</button></td></tr>`).join('')
    return `<tr>
      <td style="text-align:center;color:#94a3b8;">${nc}</td>
      <td><input value="${r.part || ''}" placeholder="Part no. (ketik utk cari)" autocomplete="off" oninput="partSearch(${r.id},this)" onblur="hidePartDrop()"></td>
      <td><textarea oninput="uf(${r.id},'name',this.value)" style="width:100%;min-height:32px;padding:4px 5px;border:1px solid transparent;border-radius:4px;background:transparent;font-weight:500;font-size:12px;font-family:inherit;resize:none;">${r.name || ''}</textarea>
        <button onclick="rows.find(x=>x.id===${r.id}).subs.push({id:++ctr,text:''});renderRows();" style="font-size:10px;color:#94a3b8;background:none;border:none;cursor:pointer;">+ sub</button></td>
      <td><input type="number" value="${r.qty}" min="1" oninput="uf(${r.id},'qty',this.value)" style="text-align:right;"></td>
      <td><input value="${r.unit || ''}" oninput="uf(${r.id},'unit',this.value)"></td>
      <td><input type="number" value="${r.price || 0}" step="100000" oninput="uf(${r.id},'price',this.value)" style="text-align:right;"></td>
      <td><input type="number" value="${r.disc || 0}" min="0" max="100" oninput="uf(${r.id},'disc',this.value)" style="text-align:right;"></td>
      <td style="text-align:right;font-weight:600;padding-right:5px;color:#002060;font-size:11px;" id="rt${r.id}">${fmt(calcR(r))}</td>
      <td><button class="bdel" onclick="delR(${r.id})">✕</button></td>
    </tr>${subs}`
  }).join('') || `<tr><td colspan="9" class="empty">Belum ada item.</td></tr>`
}

function recalc() {
  const tot = rows.filter(r => r.t === 'i').reduce((s, r) => s + calcR(r), 0)
  const dp = +(gv('f-disc') || 0), vp = +(gv('f-vat') || 12)
  const da = tot * dp / 100, sub = tot - da, vat = sub * vp / 100, grand = sub + vat
  document.getElementById('s-tot').textContent = fmt(tot)
  document.getElementById('s-dp').textContent = dp
  document.getElementById('s-disc').textContent = fmt(da)
  document.getElementById('s-sub').textContent = fmt(sub)
  document.getElementById('s-vp').textContent = vp
  document.getElementById('s-vat').textContent = fmt(vat)
  document.getElementById('s-grand').textContent = fmt(grand)
  rows.filter(r => r.t === 'i').forEach(r => { const el = document.getElementById('rt' + r.id); if (el) el.textContent = fmt(calcR(r)) })
  const gInfo = computeGroups(rows)
  Object.entries(gInfo.sums).forEach(([gid, s]) => { const el = document.getElementById('gt' + gid); if (el) el.textContent = fmt(s) })
}

function renderPrev() {
  const tot = rows.filter(r => r.t === 'i').reduce((s, r) => s + calcR(r), 0)
  const dp = +(gv('f-disc') || 0), vp = +(gv('f-vat') || 12)
  const da = tot * dp / 100, sub = tot - da, vat = sub * vp / 100, grand = sub + vat

  document.getElementById('pv-to').textContent = gv('f-co') || '-'
  document.getElementById('pv-addr').textContent = gv('f-addr') || ''
  document.getElementById('pv-up').textContent = gv('f-ct') || '-'
  document.getElementById('pv-tel').textContent = gv('f-tel') || '-'
  document.getElementById('pv-email').textContent = gv('f-em') || '-'

  document.getElementById('pv-no').textContent = gv('f-no') || ''
  document.getElementById('pv-date').textContent = fmtD(gv('f-date'))
  document.getElementById('pv-sales').textContent = gv('f-sales') || ''
  document.getElementById('pv-mobile').textContent = gv('f-mobile') || '-'
  document.getElementById('pv-payment').textContent = gv('f-pay') || '-'
  document.getElementById('pv-createby').textContent = gv('f-sales') || '-'
  document.getElementById('pv-engineer').textContent = gv('f-eng') || '-'

  let nc = 0
  const gInfo = computeGroups(rows)
  document.getElementById('pv-body').innerHTML = rows.map(r => {
    if (r.t === 'g') return `<tr class="grp"><td colspan="6">${r.label || ''}</td><td class="r" style="font-weight:700;">${fmt(gInfo.sums[r.id] || 0)}</td></tr>`
    if (r.t === 'n') return `<tr><td colspan="7" style="color:#888;font-size:9px;">${(r.text || '').replace(/\n/g, '<br>')}</td></tr>`
    nc++
    const subs = (r.subs || []).map((s, si) => `<tr class="sub"><td style="text-align:right;color:#aaa;">${nc}.${si + 1}</td><td></td><td colspan="5">${s.text || ''}</td></tr>`).join('')
    if (gInfo.inGroup.has(r.id)) return `<tr><td>${nc}</td><td style="font-size:9px;">${r.part || ''}</td><td style="font-weight:500;">${r.name || ''}</td><td class="r">${r.qty}</td><td class="r"></td><td class="r"></td><td class="r"></td></tr>${subs}`
    return `<tr><td>${nc}</td><td style="font-size:9px;">${r.part || ''}</td><td style="font-weight:500;">${r.name || ''}</td><td class="r">${r.qty}</td><td class="r">${fmt(r.price || 0)}</td><td class="r">${r.disc ? r.disc + '%' : '-'}</td><td class="r">${fmt(calcR(r))}</td></tr>${subs}`
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:8px;">Belum ada item</td></tr>'

  document.getElementById('pv-tot').innerHTML = `<table><tr><td>TOTAL</td><td>${fmt(tot)}</td></tr>${dp > 0 ? `<tr><td>DISKON (${dp}%)</td><td>- ${fmt(da)}</td></tr>` : ''}<tr><td>SUB TOTAL</td><td>${fmt(sub)}</td></tr><tr><td>VAT ${vp}%</td><td>${fmt(vat)}</td></tr><tr class="grd"><td>GRAND TOTAL</td><td>${fmt(grand)}</td></tr></table>`
  const n = gv('f-notes')
  document.getElementById('pv-ft').innerHTML = n ? '<b>Notes:</b>' + n.split('\n').filter(Boolean).map(l => `<div>${l}</div>`).join('') : ''
}

function doPDF() {
  if (!canQuote()) { toast('Engineer tidak bisa membuat quotation', false); return }
  const dp = +(gv('f-disc') || 0), vp = +(gv('f-vat') || 12)
  generatePDF({
    info: { qo_number: gv('f-no'), title: gv('f-title'), date: gv('f-date'), valid_until: gv('f-valid'), sales_name: gv('f-sales'), sales_mobile: gv('f-mobile'), payment_terms: gv('f-pay'), delivery_terms: gv('f-del'), notes: gv('f-notes'), vat_pct: vp, discount_pct: dp, engineer: gv('f-eng') },
    customer: { company: gv('f-co'), contact: gv('f-ct'), tel: gv('f-tel'), email: gv('f-em'), address: gv('f-addr') },
    items: rows
  })
  toast('PDF berhasil didownload!')
}

async function doSaveQuo() {
  if (!canQuote()) { toast('Engineer tidak bisa membuat quotation', false); return }
  const btn = document.getElementById('btn-save-quo')
  const tot = rows.filter(r => r.t === 'i').reduce((s, r) => s + calcR(r), 0)
  const dp = +(gv('f-disc') || 0), vp = +(gv('f-vat') || 12)
  const da = tot * dp / 100, sub = tot - da, vat = sub * vp / 100
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>'
  try {
    await saveQuotation({
      qo_number: gv('f-no'), title: gv('f-title') || null, date: gv('f-date') || null, valid_until: gv('f-valid') || null,
      customer_snapshot: { company: gv('f-co'), contact: gv('f-ct'), tel: gv('f-tel'), email: gv('f-em'), address: gv('f-addr') },
      items: rows, vat_pct: vp, discount_pct: dp, grand_total: sub + vat,
      payment_terms: gv('f-pay'), delivery_terms: gv('f-del'), notes: gv('f-notes'),
      sales_name: gv('f-sales'), sales_mobile: gv('f-mobile'), engineer: gv('f-eng'), status: 'Open'
    })
    toast('Quotation tersimpan ke Pipeline!')
    await loadPipeline()
  } catch (e) { toast('Gagal simpan: ' + e.message, false) }
  btn.disabled = false; btn.textContent = '💾 Simpan ke Pipeline'
}

async function doSaveCust() {
  if (!guardAdmin()) return
  const co = gv('f-co'); if (!co) { toast('Isi nama perusahaan dulu', false); return }
  try {
    const c = await upsertCustomer({ company: co, contact: gv('f-ct'), tel: gv('f-tel'), email: gv('f-em'), address: gv('f-addr'), customer_type: 'PT' })
    if (!customers.find(x => x.id === c.id)) customers.unshift(c)
    toast('Customer tersimpan!')
    renderCustList('')
    document.getElementById('cc').textContent = customers.length
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

// LOAD DATA
async function loadCustomers() {
  try {
    customers = await getCustomers()
    renderCustList('')
    document.getElementById('cc').textContent = customers.length
  } catch (e) { console.error(e) }
}

async function loadProducts() {
  try {
    products = await getProducts()
    renderProdList('')
    document.getElementById('pc').textContent = products.length
  } catch (e) { console.error(e) }
}

async function loadPipeline() {
  try { pipeline = await getQuotations(); renderPip() }
  catch (e) { console.error(e) }
}

async function loadProfiles() {
  try { profiles = await getProfiles() } catch (e) { console.error(e) }
}

// VISITS
async function loadVisits() {
  try {
    visits = await getVisits()
    const t = await getSetting('visit_target_monthly')
    if (t) visitTarget = parseInt(t) || 10
  } catch (e) { console.error(e) }
}

// CUSTOMER CONTACTS
async function loadContacts() {
  try { contacts = await getContacts() } catch (e) { console.error(e) }
}

function contactsOf(customerId) {
  return contacts.filter(c => c.customer_id === customerId)
}

let expandedContactCustId = null

function toggleContacts(custId) {
  expandedContactCustId = expandedContactCustId === custId ? null : custId
  renderCustList(document.querySelector('.filter-bar input')?.value || '')
}

let editingContactId = null

function renderContactPanel(c) {
  const list = contactsOf(c.id)
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:.8rem .9rem;margin-bottom:5px;">
      <div style="font-size:11.5px;font-weight:600;color:#002060;margin-bottom:.5rem;">👥 Kontak di ${c.company}</div>
      ${list.length ? list.map(k => {
        if (editingContactId === k.id) return `
        <div style="background:#fff;border:1px solid #fbbf24;border-radius:8px;padding:.6rem;margin:5px 0;">
          <div class="g4" style="margin-bottom:6px;">
            <div class="fld"><label>Nama</label><input id="ec-name-${k.id}" value="${(k.name || '').replace(/"/g, '&quot;')}"></div>
            <div class="fld"><label>Jabatan/Divisi</label><input id="ec-role-${k.id}" value="${(k.role || '').replace(/"/g, '&quot;')}"></div>
            <div class="fld"><label>Telp</label><input id="ec-tel-${k.id}" value="${(k.tel || '').replace(/"/g, '&quot;')}"></div>
            <div class="fld"><label>Email</label><input id="ec-email-${k.id}" value="${(k.email || '').replace(/"/g, '&quot;')}"></div>
          </div>
          <div style="display:flex;gap:5px;">
            <button class="bp" style="padding:4px 11px;font-size:11px;" onclick="saveEditContact('${k.id}')">Simpan</button>
            <button class="bs" style="padding:4px 11px;font-size:11px;" onclick="cancelEditContact()">Batal</button>
          </div>
        </div>`
        return `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #eef2f7;">
          <div style="flex:1;">
            <span style="font-size:12px;font-weight:600;">${k.name}</span>
            ${k.role ? `<span style="font-size:10px;background:#e0e7ff;color:#3730a3;padding:1px 7px;border-radius:6px;margin-left:6px;">${k.role}</span>` : ''}
            <div style="font-size:10.5px;color:#94a3b8;">${[k.tel, k.email].filter(Boolean).join(' · ') || '—'}</div>
          </div>
          ${isAdmin() ? `<button class="bxs" style="border-color:#fbbf24;color:#92400e;" onclick="startEditContact('${k.id}')">✏️</button>
          <button class="bdel" onclick="delContactDB('${k.id}')">🗑</button>` : ''}
        </div>`
      }).join('') : '<div style="font-size:11px;color:#94a3b8;padding:4px 0;">Belum ada kontak.</div>'}
      ${isAdmin() ? `<div class="g4" style="margin-top:.6rem;margin-bottom:6px;">
        <div class="fld"><label>Nama</label><input id="nc-name-${c.id}" placeholder="Pak/Bu..."></div>
        <div class="fld"><label>Jabatan/Divisi</label><input id="nc-role-${c.id}" placeholder="Engineer, Purchasing, QC..."></div>
        <div class="fld"><label>Telp</label><input id="nc-tel-${c.id}" placeholder="+62..."></div>
        <div class="fld"><label>Email</label><input id="nc-email-${c.id}" placeholder="email@..."></div>
      </div>
      <button class="bp" style="padding:5px 12px;font-size:11px;" onclick="saveNewContact('${c.id}')">+ Tambah Kontak</button>` : ''}
    </div>`
}

function startEditContact(id) {
  editingContactId = id
  renderCustList(document.querySelector('.filter-bar input')?.value || '')
}

function cancelEditContact() {
  editingContactId = null
  renderCustList(document.querySelector('.filter-bar input')?.value || '')
}

async function saveEditContact(id) {
  if (!guardAdmin()) return
  const name = document.getElementById('ec-name-' + id)?.value.trim()
  if (!name) { toast('Nama kontak wajib diisi', false); return }
  try {
    const updated = await updateContact(id, {
      name,
      role: document.getElementById('ec-role-' + id)?.value || '',
      tel: document.getElementById('ec-tel-' + id)?.value || '',
      email: document.getElementById('ec-email-' + id)?.value || ''
    })
    const idx = contacts.findIndex(k => k.id === id)
    if (idx >= 0) contacts[idx] = updated
    editingContactId = null
    toast('Kontak diupdate!')
    renderCustList(document.querySelector('.filter-bar input')?.value || '')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

async function saveNewContact(custId) {
  if (!guardAdmin()) return
  const name = document.getElementById('nc-name-' + custId)?.value.trim()
  if (!name) { toast('Nama kontak wajib diisi', false); return }
  try {
    const k = await addContact({
      customer_id: custId,
      name,
      role: document.getElementById('nc-role-' + custId)?.value || '',
      tel: document.getElementById('nc-tel-' + custId)?.value || '',
      email: document.getElementById('nc-email-' + custId)?.value || ''
    })
    contacts.push(k)
    toast('Kontak ditambahkan!')
    renderCustList(document.querySelector('.filter-bar input')?.value || '')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

async function delContactDB(id) {
  if (!guardAdmin()) return
  if (!confirm('Hapus kontak ini?')) return
  try {
    await deleteContact(id)
    contacts = contacts.filter(k => k.id !== id)
    renderCustList(document.querySelector('.filter-bar input')?.value || '')
    toast('Kontak dihapus')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

function renderVisits() {
  // Set default date to today
  const dateEl = document.getElementById('v-date')
  if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10)

  const targetEl = document.getElementById('visit-target')
  if (targetEl) targetEl.value = visitTarget

  renderVisitStats()
  renderVisitMonthly()
  renderVisitList()
}

function currentMonthVisits() {
  const now = new Date()
  const ym = now.toISOString().slice(0, 7) // YYYY-MM
  return visits.filter(v => (v.visit_date || '').startsWith(ym))
}

function renderVisitStats() {
  const el = document.getElementById('visit-stats'); if (!el) return
  const mv = currentMonthVisits()
  const total = mv.length
  const salesCount = new Set(mv.map(v => v.profiles?.name || v.sales_name).filter(Boolean)).size
  const custCount = new Set(mv.map(v => v.customer_name)).size
  const myName = profiles.find(p => p.id === currentUser?.id)?.name || (currentUser?.email || '').split('@')[0]
  const myVisits = mv.filter(v => v.created_by === currentUser?.id).length
  el.innerHTML = `
    <div class="sc"><div class="sn">${total}</div><div class="sl">Total Visit Bulan Ini</div></div>
    <div class="sc"><div class="sn">${myVisits}</div><div class="sl">Visit Saya Bulan Ini</div></div>
    <div class="sc"><div class="sn">${custCount}</div><div class="sl">Customer Dikunjungi</div></div>
    <div class="sc"><div class="sn">${visitTarget}</div><div class="sl">Target per Sales</div></div>
  `
}

function renderVisitMonthly() {
  const el = document.getElementById('visit-monthly'); if (!el) return
  const mv = currentMonthVisits()

  // All known sales names (from profiles + visits + pipeline)
  const allSales = [...new Set([
    ...profiles.map(p => p.name),
    ...visits.map(v => v.profiles?.name || v.sales_name),
  ].filter(Boolean))].sort()

  const now = new Date()
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const expectedByNow = visitTarget * (dayOfMonth / daysInMonth)

  if (!allSales.length) { el.innerHTML = '<div class="empty">Belum ada data sales.</div>'; return }

  el.innerHTML = allSales.map(name => {
    const count = mv.filter(v => (v.profiles?.name || v.sales_name) === name).length
    const pct = Math.min((count / visitTarget) * 100, 100)
    const onTrack = count >= expectedByNow
    const color = count >= visitTarget ? '#16a34a' : onTrack ? '#3b82f6' : '#f59e0b'
    return `<div class="vm-row">
      <div class="vm-name">${name}</div>
      <div class="vm-track"><div class="vm-fill" style="width:${Math.max(pct, count > 0 ? 10 : 0)}%;background:${color};">${count > 0 ? count : ''}</div></div>
      <div class="vm-stat">
        ${count}/${visitTarget}
        <span class="vm-badge ${onTrack ? 'ontrack' : 'behind'}">${count >= visitTarget ? '✓ Tercapai' : onTrack ? 'On Track' : 'Behind'}</span>
      </div>
    </div>`
  }).join('')
}

function renderVisitList() {
  const el = document.getElementById('visit-list'); if (!el) return

  // Populate sales filter dynamically
  const sel = document.getElementById('v-filter-sales')
  if (sel) {
    const uniqueSales = [...new Set(visits.map(v => v.profiles?.name || v.sales_name).filter(Boolean))].sort()
    const cur = sel.value || 'all'
    const opts = '<option value="all">Semua Sales</option>' + uniqueSales.map(n => `<option value="${n.replace(/"/g, '&quot;')}">${n}</option>`).join('')
    if (sel.innerHTML !== opts) { sel.innerHTML = opts; sel.value = uniqueSales.includes(cur) || cur === 'all' ? cur : 'all' }
  }

  const sf = sel?.value || 'all'
  const filtered = visits.filter(v => sf === 'all' || (v.profiles?.name || v.sales_name) === sf).slice(0, 100)

  el.innerHTML = filtered.length ? filtered.map(v => {
    const salesName = v.profiles?.name || v.sales_name || '-'
    const mine = v.created_by === currentUser?.id
    return `<div class="visit-row">
      <div class="visit-date">${fmtD(v.visit_date)}</div>
      <div class="visit-info">
        <div class="visit-cust">${v.customer_name}${v.contact ? ' · ' + v.contact : ''}</div>
        <div class="visit-meta">${v.purpose || ''} · ${salesName}</div>
        ${v.notes ? `<div class="visit-notes">${v.notes}</div>` : ''}
      </div>
      ${(mine || isAdmin()) ? `<button class="bdel" onclick="delVisit('${v.id}')">🗑</button>` : ''}
    </div>`
  }).join('') : '<div class="empty">Belum ada visit tercatat.</div>'
}

let vSelectedCustId = null

function vCustSearch(q) {
  const drop = document.getElementById('v-cust-drop'); if (!drop) return
  vSelectedCustId = null
  const ql = (q || '').toLowerCase()
  const matches = customers.filter(c => (c.company || '').toLowerCase().includes(ql)).slice(0, 8)
  if (!matches.length) { drop.style.display = 'none'; return }
  drop.innerHTML = matches.map(c =>
    `<div class="v-acitem" onclick="vCustPick('${c.id}')"><b>${c.company}</b>${c.contact ? ' · ' + c.contact : ''}</div>`
  ).join('')
  drop.style.display = 'block'
}

function vCustPick(id) {
  const c = customers.find(x => x.id === id); if (!c) return
  vSelectedCustId = c.id
  document.getElementById('v-cust').value = c.company || ''
  document.getElementById('v-contact').value = ''
  document.getElementById('v-cust-drop').style.display = 'none'
}

function showVCtDrop() {
  const drop = document.getElementById('v-ct-drop'); if (!drop) return
  if (!vSelectedCustId) { drop.style.display = 'none'; return }
  const kList = contactsOf(vSelectedCustId)
  if (!kList.length) { drop.style.display = 'none'; return }
  drop.innerHTML = kList.map(k =>
    `<div class="v-acitem" onmousedown="pickVCt('${k.id}')"><b>${k.name}</b>${k.role ? ' <span style="font-size:10px;background:#e0e7ff;color:#3730a3;padding:1px 6px;border-radius:5px;">' + k.role + '</span>' : ''}</div>`
  ).join('')
  drop.style.display = 'block'
}

function hideVCtDrop() {
  setTimeout(() => { const d = document.getElementById('v-ct-drop'); if (d) d.style.display = 'none' }, 150)
}

function pickVCt(id) {
  const k = contacts.find(x => x.id === id); if (!k) return
  document.getElementById('v-contact').value = k.name || ''
  document.getElementById('v-ct-drop').style.display = 'none'
}

async function saveVisit() {
  if (!canQuote()) { toast('Engineer tidak bisa input visit', false); return }
  const custName = document.getElementById('v-cust').value.trim()
  if (!custName) { toast('Nama customer wajib diisi', false); return }
  const btn = document.getElementById('btn-save-visit')
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Menyimpan...'
  try {
    const myName = profiles.find(p => p.id === currentUser?.id)?.name || (currentUser?.email || '').split('@')[0]
    const v = await addVisit({
      visit_date: document.getElementById('v-date').value || new Date().toISOString().slice(0, 10),
      customer_id: vSelectedCustId,
      customer_name: custName,
      contact: document.getElementById('v-contact').value,
      purpose: document.getElementById('v-purpose').value,
      notes: document.getElementById('v-notes').value,
      sales_name: myName
    })
    visits.unshift({ ...v, profiles: { name: myName } })
    toast('Visit tersimpan!')
    document.getElementById('v-cust').value = ''
    document.getElementById('v-contact').value = ''
    document.getElementById('v-notes').value = ''
    vSelectedCustId = null
    renderVisitStats(); renderVisitMonthly(); renderVisitList()
  } catch (e) { toast('Gagal: ' + e.message, false) }
  btn.disabled = false; btn.innerHTML = '💾 Simpan Visit'
}

async function delVisit(id) {
  if (!confirm('Hapus catatan visit ini?')) return
  try {
    await deleteVisit(id)
    visits = visits.filter(v => v.id !== id)
    renderVisitStats(); renderVisitMonthly(); renderVisitList()
    toast('Visit dihapus')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

async function saveVisitTarget(val) {
  if (!guardAdmin()) return
  const n = parseInt(val)
  if (!n || n < 1) { toast('Target tidak valid', false); return }
  try {
    await setSetting('visit_target_monthly', n)
    visitTarget = n
    renderVisitStats(); renderVisitMonthly()
    toast('Target diupdate!')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

// PRICELIST
function initPills() {
  document.getElementById('pl-pills').innerHTML = '<button class="pill on" onclick="plSetCat(\'\')">Semua</button>' +
    PL_CATS.map((c, i) => `<button class="pill" onclick="plSetCat(${i})">${c}</button>`).join('')
}

function plSetCat(ci) {
  plCat = ci
  document.querySelectorAll('#pl-pills .pill').forEach((b, i) => b.classList.toggle('on', i === (ci === '' ? 0 : parseInt(ci) + 1)))
  plPg = 1; plSearch()
}

function plSearch() {
  const q = document.getElementById('pl-q')?.value.toLowerCase().trim() || ''
  const sort = document.getElementById('pl-sort')?.value || ''
  const minP = +(document.getElementById('pl-min')?.value || 0)
  const maxP = +(document.getElementById('pl-max')?.value || 0)
  plF = PL_ITEMS.filter(([name, part, price, catI]) => {
    if (plCat !== '' && catI !== parseInt(plCat)) return false
    if (minP > 0 && price < minP) return false
    if (maxP > 0 && price > maxP) return false
    if (!q) return true
    return q.split(/\s+/).every(t => (name + ' ' + part).toLowerCase().includes(t))
  })
  if (sort === 'asc') plF.sort((a, b) => a[2] - b[2])
  else if (sort === 'desc') plF.sort((a, b) => b[2] - a[2])
  else if (sort === 'az') plF.sort((a, b) => a[1].localeCompare(b[1]))
  const rc = document.getElementById('pl-rc')
  if (rc) rc.textContent = plF.length === PL_ITEMS.length ? PL_ITEMS.length + ' produk' : plF.length + ' dari ' + PL_ITEMS.length
  plPg = 1; renderPL()
}

function renderPL() {
  const start = (plPg - 1) * PER, slice = plF.slice(start, start + PER)
  const body = document.getElementById('pl-body'); if (!body) return
  body.innerHTML = slice.length ? slice.map(([name, part, price, catI], i) => {
    const spec = name !== part ? name.replace(part, '').replace(/^\s*\[/, '[').trim() : ''
    return `<tr>
      <td style="color:#94a3b8;font-size:11px;">${start + i + 1}</td>
      <td><div style="font-weight:500;font-size:12px;">${part}</div>${spec ? `<div style="font-size:10px;color:#94a3b8;">${spec}</div>` : ''}</td>
      <td><span class="badge">${PL_CATS[catI]}</span></td>
      <td class="pc">${fmtPL(price)}</td>
      <td style="display:flex;gap:4px;">
        ${canQuote() ? `<button class="bxs" onclick="addFromPL('${part.replace(/'/g, "\\'")}','${name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}',${price})">+ Quote</button>` : ''}
        ${isAdmin() ? `<button class="bxs" style="border-color:#e2e8f0;color:#64748b;" onclick="saveStarPL('${part.replace(/'/g, "\\'")}',${price},'${PL_CATS[catI]}')">★</button>` : ''}
      </td></tr>`
  }).join('') : `<tr><td colspan="5" class="empty">Tidak ada produk cocok.</td></tr>`
  const total = Math.ceil(plF.length / PER)
  const pg = document.getElementById('pl-pg'); if (!pg) return
  pg.innerHTML = total <= 1 ? '' : (plPg > 1 ? `<button onclick="plGo(${plPg - 1})">← Prev</button>` : '') + `<span style="color:#94a3b8;">Hal ${plPg} / ${total}</span>` + (plPg < total ? `<button onclick="plGo(${plPg + 1})">Next →</button>` : '')
}
function plGo(p) { plPg = p; renderPL() }
function addFromPL(part, name, price) { aItem(name, part, 1, 'unit', price, 0); nav('quotation'); qt('items'); toast(part + ' ditambahkan!') }
async function saveStarPL(part, price, cat) {
  if (!guardAdmin()) return
  try {
    const p = await upsertProduct({ name: part, part, price, unit: 'unit', category: cat })
    if (!products.find(x => x.id === p.id)) products.unshift(p)
    toast(part + ' disimpan ke database!')
    renderProdList('')
    document.getElementById('pc').textContent = products.length
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

// MODAL
function openModal() {
  document.getElementById('m-q').value = ''; document.getElementById('m-cat').value = ''
  mF = PL_ITEMS.slice(); mPg = 1; renderM()
  document.getElementById('modal-overlay').classList.add('on')
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('on') }
function mSearch() {
  const q = document.getElementById('m-q').value.toLowerCase().trim()
  const ci = document.getElementById('m-cat').value
  mF = PL_ITEMS.filter(([name, part, , catI]) => {
    if (ci !== '' && catI !== parseInt(ci)) return false
    if (!q) return true
    return q.split(/\s+/).every(t => (name + ' ' + part).toLowerCase().includes(t))
  })
  mPg = 1; renderM()
}
function renderM() {
  const start = (mPg - 1) * PER, slice = mF.slice(start, start + PER)
  document.getElementById('m-bd').innerHTML = slice.length ? slice.map(([name, part, price, catI]) => {
    const spec = name !== part ? name.replace(part, '').replace(/^\s*\[/, '[').trim() : ''
    return `<tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:5px 7px;"><div style="font-weight:500;font-size:11px;">${part}</div>${spec ? `<div style="font-size:10px;color:#94a3b8;">${spec}</div>` : ''}</td>
      <td style="padding:5px 7px;"><span class="badge" style="font-size:9px;">${PL_CATS[catI]}</span></td>
      <td style="padding:5px 7px;text-align:right;font-weight:600;color:#002060;white-space:nowrap;">${fmtPL(price)}</td>
      <td style="padding:5px 7px;"><button class="bxs" onclick="mAdd('${part.replace(/'/g, "\\'")}','${name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}',${price})">+ Tambah</button></td>
    </tr>`
  }).join('') : `<tr><td colspan="4" class="empty">Tidak ada produk.</td></tr>`
  const total = Math.ceil(mF.length / PER)
  document.getElementById('m-pg').innerHTML = total <= 1 ? '' : (mPg > 1 ? `<button onclick="mGo(${mPg - 1})">←</button>` : '') + `<span style="color:#94a3b8;">${mPg}/${total}</span>` + (mPg < total ? `<button onclick="mGo(${mPg + 1})">→</button>` : '')
}
function mGo(p) { mPg = p; renderM() }
function mAdd(part, name, price) { aItem(name, part, 1, 'unit', price, 0); closeModal(); qt('items'); toast(part + ' ditambahkan!') }

// PIPELINE
function renderPip() {
  // Populate sales filter dropdown dynamically with unique sales names
  const salesSelect = document.getElementById('pip-sales')
  if (salesSelect) {
    const uniqueSales = [...new Set(pipeline.map(h => h.profiles?.name || h.sales_name).filter(Boolean))].sort()
    const currentVal = salesSelect.value || 'all'
    const optsHtml = '<option value="all">Semua Sales</option>' + uniqueSales.map(n => `<option value="${n.replace(/"/g, '&quot;')}">${n}</option>`).join('')
    if (salesSelect.innerHTML !== optsHtml) {
      salesSelect.innerHTML = optsHtml
      salesSelect.value = uniqueSales.includes(currentVal) || currentVal === 'all' ? currentVal : 'all'
    }
  }

  const q = (document.getElementById('pip-q')?.value || '').toLowerCase()
  const f = document.getElementById('pip-f')?.value || ''
  const sf = document.getElementById('pip-sales')?.value || 'all'

  const filtered = pipeline.filter(h => {
    const matchQ = !q || ((h.qo_number || '') + (h.customer_snapshot?.company || '') + (h.sales_name || '')).toLowerCase().includes(q)
    const matchF = !f || h.status === f
    const salesName = h.profiles?.name || h.sales_name || ''
    const matchS = sf === 'all' || salesName === sf
    return matchQ && matchF && matchS
  })

  const stats = { Open: 0, Nego: 0, 'On Hold': 0, 'Closed - Won': 0, 'Closed - Lost': 0 }
  const vals = { ...stats }
  filtered.forEach(h => { if (h.status in stats) { stats[h.status]++; vals[h.status] += (h.grand_total || 0) } })

  const sg = document.getElementById('sg')
  if (sg) sg.innerHTML = Object.entries(stats).map(([s, n]) => `<div class="sc"><div class="sn">${n}</div><div class="sl">${s}</div><div class="sv">${canSeeVal() ? 'Rp ' + ((vals[s] || 0) / 1e6).toFixed(0) + 'M' : 'Rp •••'}</div></div>`).join('')

  const bd = document.getElementById('pip-bd'); if (!bd) return
  bd.innerHTML = filtered.map(h => {
    const cust = h.customer_snapshot || {}
    const desc = h.title || (h.items || []).filter(r => r.t === 'i').map(r => r.name).join(', ').slice(0, 50)
    const salesName = h.profiles?.name || h.sales_name || '-'
    const isMe = h.created_by === currentUser?.id
    return `<tr>
      <td style="font-weight:600;white-space:nowrap;">${h.qo_number || '-'}${isMe ? '<span class="my-badge">Saya</span>' : ''}</td>
      <td style="white-space:nowrap;font-size:10px;">${h.date ? new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}</td>
      <td style="font-size:11px;color:#64748b;">${salesName}</td>
      <td>${cust.company || '-'}</td>
      <td style="color:#64748b;font-size:11px;">${desc || '-'}</td>
      <td style="text-align:right;font-weight:600;white-space:nowrap;color:#002060;">${h.grand_total ? fmt(h.grand_total) : '-'}</td>
      <td>${(isAdmin() || (myRole === 'sales' && isMe)) ? `<select onchange="updS('${h.id}',this.value)">${['Open', 'Nego', 'On Hold', 'Closed - Won', 'Closed - Lost'].map(s => `<option${h.status === s ? ' selected' : ''}>${s}</option>`).join('')}</select>` : `<span style="font-size:11px;color:#64748b;">${h.status || '-'}</span>`}</td>
    </tr>`
  }).join('') || `<tr><td colspan="7" class="empty">Tidak ada data.</td></tr>`

  const ct = document.getElementById('pip-ct')
  if (ct) ct.textContent = filtered.length + ' dari ' + pipeline.length + ' penawaran'
}

// DASHBOARD
function renderDashboard() {
  const greetName = (currentUser?.email || '').split('@')[0]
  const greetEl = document.getElementById('db-greet')
  if (greetEl) greetEl.innerHTML = `Halo, <span>${greetName}</span> 👋`

  // Overall stats
  const totalQuo = pipeline.length
  const totalValue = pipeline.reduce((s, h) => s + (h.grand_total || 0), 0)
  const wonValue = pipeline.filter(h => h.status === 'Closed - Won').reduce((s, h) => s + (h.grand_total || 0), 0)
  const wonCount = pipeline.filter(h => h.status === 'Closed - Won').length
  const winRate = totalQuo ? Math.round((wonCount / totalQuo) * 100) : 0

  const sg = document.getElementById('dash-stats')
  if (sg) sg.innerHTML = `
    <div class="sc"><div class="sn">${totalQuo}</div><div class="sl">Total Quotation</div></div>
    <div class="sc"><div class="sn">Rp ${(totalValue / 1e9).toFixed(2)}M</div><div class="sl">Total Pipeline Value</div><div class="sv">dalam Miliar</div></div>
    <div class="sc"><div class="sn">Rp ${(wonValue / 1e9).toFixed(2)}M</div><div class="sl">Closed Won Value</div></div>
    <div class="sc"><div class="sn">${winRate}%</div><div class="sl">Win Rate</div></div>
    <div class="sc"><div class="sn">${customers.length}</div><div class="sl">Total Customer</div></div>
  `

  // Pipeline status chart
  const statuses = ['Open', 'Nego', 'On Hold', 'Closed - Won', 'Closed - Lost']
  const statusColors = { 'Open': '#3b82f6', 'Nego': '#f59e0b', 'On Hold': '#94a3b8', 'Closed - Won': '#22c55e', 'Closed - Lost': '#ef4444' }
  const statusCounts = {}
  statuses.forEach(s => statusCounts[s] = pipeline.filter(h => h.status === s).length)
  const maxCount = Math.max(...Object.values(statusCounts), 1)

  const chartEl = document.getElementById('dash-pipeline-chart')
  if (chartEl) chartEl.innerHTML = statuses.map(s => {
    const n = statusCounts[s]
    const pct = Math.max((n / maxCount) * 100, n > 0 ? 8 : 0)
    return `<div class="bar-row">
      <div class="bar-label">${s}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${statusColors[s]};">${n > 0 ? n : ''}</div></div>
      <div class="bar-val">${n}</div>
    </div>`
  }).join('')

  // Leaderboard by sales
  const salesMap = {}
  pipeline.forEach(h => {
    const name = h.profiles?.name || h.sales_name || 'Unknown'
    if (!salesMap[name]) salesMap[name] = { count: 0, value: 0, won: 0 }
    salesMap[name].count++
    salesMap[name].value += (h.grand_total || 0)
    if (h.status === 'Closed - Won') salesMap[name].won++
  })
  const leaderboard = Object.entries(salesMap).sort((a, b) => b[1].value - a[1].value).slice(0, 8)

  const lbEl = document.getElementById('dash-leaderboard')
  if (lbEl) lbEl.innerHTML = leaderboard.length ? leaderboard.map(([name, d], i) => {
    const rankClass = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : ''
    return `<div class="lb-row">
      <div class="lb-rank ${rankClass}">${i + 1}</div>
      <div class="lb-info"><div class="lb-name">${name}</div><div class="lb-sub">${d.count} quotation · ${d.won} won</div></div>
      <div class="lb-val">${fmt(d.value)}</div>
    </div>`
  }).join('') : `<div class="empty">Belum ada data quotation.</div>`

  // Top customers by value
  const custMap = {}
  pipeline.forEach(h => {
    const name = h.customer_snapshot?.company || 'Unknown'
    if (!custMap[name]) custMap[name] = { count: 0, value: 0 }
    custMap[name].count++
    custMap[name].value += (h.grand_total || 0)
  })
  const topCust = Object.entries(custMap).sort((a, b) => b[1].value - a[1].value).slice(0, 6)

  const tcEl = document.getElementById('dash-top-customer')
  if (tcEl) tcEl.innerHTML = topCust.length ? topCust.map(([name, d]) => `
    <div class="tc-row">
      <div><div class="tc-name">${name}</div><div class="tc-sub">${d.count} quotation</div></div>
      <div class="tc-val">${fmt(d.value)}</div>
    </div>`).join('') : `<div class="empty">Belum ada data.</div>`

  // Customer database breakdown
  const ptCount = customers.filter(c => c.customer_type !== 'End User').length
  const euCount = customers.filter(c => c.customer_type === 'End User').length
  const cbEl = document.getElementById('dash-cust-breakdown')
  if (cbEl) cbEl.innerHTML = `
    <div class="cb-row"><span style="font-size:12px;color:#64748b;"><span class="badge badge-pt">PT</span> Perusahaan</span><span style="font-weight:600;color:#002060;">${ptCount}</span></div>
    <div class="cb-row"><span style="font-size:12px;color:#64748b;"><span class="badge badge-eu">End User</span> Individu</span><span style="font-weight:600;color:#002060;">${euCount}</span></div>
    <div class="cb-row"><span style="font-size:12px;color:#64748b;">Total Customer</span><span style="font-weight:700;color:#002060;">${customers.length}</span></div>
    <div class="cb-row"><span style="font-size:12px;color:#64748b;">Produk Tersimpan</span><span style="font-weight:700;color:#002060;">${products.length}</span></div>
  `

  // Visit performance per sales (this month)
  const dvEl = document.getElementById('dash-visits')
  if (dvEl) {
    const now = new Date()
    const ym = now.toISOString().slice(0, 7)
    const mv = visits.filter(v => (v.visit_date || '').startsWith(ym))
    const allSales = [...new Set([
      ...profiles.map(p => p.name),
      ...visits.map(v => v.profiles?.name || v.sales_name),
    ].filter(Boolean))].sort()
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const expectedByNow = visitTarget * (dayOfMonth / daysInMonth)
    dvEl.innerHTML = allSales.length ? allSales.map(name => {
      const count = mv.filter(v => (v.profiles?.name || v.sales_name) === name).length
      const pct = Math.min((count / visitTarget) * 100, 100)
      const onTrack = count >= expectedByNow
      const color = count >= visitTarget ? '#16a34a' : onTrack ? '#3b82f6' : '#f59e0b'
      return `<div class="vm-row">
        <div class="vm-name">${name}</div>
        <div class="vm-track"><div class="vm-fill" style="width:${Math.max(pct, count > 0 ? 10 : 0)}%;background:${color};">${count > 0 ? count : ''}</div></div>
        <div class="vm-stat">${count}/${visitTarget} <span class="vm-badge ${onTrack ? 'ontrack' : 'behind'}">${count >= visitTarget ? '✓ Tercapai' : onTrack ? 'On Track' : 'Behind'}</span></div>
      </div>`
    }).join('') : '<div class="empty">Belum ada data visit.</div>'
  }

  // Recent quotations
  const recent = pipeline.slice(0, 8)
  const recEl = document.getElementById('dash-recent')
  const statusBadgeClass = { 'Open': 'bopen', 'Nego': 'bnego', 'On Hold': 'bhold', 'Closed - Won': 'bwon', 'Closed - Lost': 'blost' }
  if (recEl) recEl.innerHTML = recent.length ? recent.map(h => {
    const salesName = h.profiles?.name || h.sales_name || '-'
    return `<div class="recent-row">
      <div class="recent-info">
        <div class="recent-no">${h.qo_number || '-'} <span class="${statusBadgeClass[h.status] || 'bopen'}">${h.status || 'Open'}</span></div>
        <div class="recent-meta">${h.customer_snapshot?.company || '-'} · ${salesName} · ${fmtD(h.date)}</div>
      </div>
      <div class="recent-val">${h.grand_total ? fmt(h.grand_total) : '-'}</div>
    </div>`
  }).join('') : `<div class="empty">Belum ada penawaran.</div>`
}

async function updS(id, val) {
  const h0 = pipeline.find(x => x.id === id)
  if (!(isAdmin() || (myRole === 'sales' && h0?.created_by === currentUser?.id))) {
    toast('Kamu hanya bisa mengubah status penawaran milikmu sendiri', false); renderPip(); return
  }
  try {
    await updateQuotationStatus(id, val)
    const h = pipeline.find(x => x.id === id); if (h) h.status = val
    renderPip(); toast('Status: ' + val)
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

function expCSV() {
  if (!guardAdmin()) return
  const r = [['QO No.', 'Tanggal', 'Sales', 'Customer', 'Grand Total', 'Status'], ...pipeline.map(h => [h.qo_number, h.date, h.sales_name, h.customer_snapshot?.company, h.grand_total, h.status])]
  const csv = r.map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv); a.download = 'GSO_Pipeline.csv'; a.click()
  toast('Pipeline diekspor!')
}

// DATABASE - CUSTOMER
let newCustType = 'PT'
let custTypeFilter = 'all'

function toggleAddCust() {
  const el = document.getElementById('add-cust-form')
  el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none'
}

function setNewCustType(type) {
  newCustType = type
  document.getElementById('type-pt').classList.toggle('on', type === 'PT')
  document.getElementById('type-eu').classList.toggle('on', type === 'End User')
}

function setCustTypeFilter(val) {
  custTypeFilter = val
  renderCustList(document.querySelector('.filter-bar input')?.value || '')
}

async function saveNewCust() {
  if (!guardAdmin()) return
  const name = document.getElementById('nc-name').value.trim()
  if (!name) { toast('Nama wajib diisi', false); return }
  const btn = document.getElementById('btn-save-cust')
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>'
  try {
    const c = await upsertCustomer({
      company: name,
      contact: document.getElementById('nc-contact').value,
      tel: document.getElementById('nc-tel').value,
      email: document.getElementById('nc-email').value,
      address: document.getElementById('nc-addr').value,
      customer_type: newCustType,
      industry: document.getElementById('nc-industry').value
    })
    customers.unshift(c)
    toast('Customer tersimpan!')
    renderCustList('')
    document.getElementById('cc').textContent = customers.length
    // Reset form
    ;['nc-name', 'nc-contact', 'nc-tel', 'nc-email', 'nc-addr', 'nc-industry'].forEach(id => document.getElementById(id).value = '')
    toggleAddCust()
  } catch (e) { toast('Gagal: ' + e.message, false) }
  btn.disabled = false; btn.textContent = 'Simpan'
}

function renderCustList(q) {
  let f = customers
  if (q) f = f.filter(c => (c.company || '').toLowerCase().includes(q.toLowerCase()) || (c.contact || '').toLowerCase().includes(q.toLowerCase()) || contactsOf(c.id).some(k => k.name.toLowerCase().includes(q.toLowerCase())))
  if (custTypeFilter !== 'all') f = f.filter(c => c.customer_type === custTypeFilter)

  const list = document.getElementById('db-cust-list'); if (!list) return
  list.innerHTML = f.length ? f.map(c => {
    if (editingCustId === c.id) return renderCustEditRow(c)
    const nContacts = contactsOf(c.id).length
    const row = `
    <div class="dbi">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="badge ${c.customer_type === 'End User' ? 'badge-eu' : 'badge-pt'}">${c.customer_type || 'PT'}</span>
          <div class="dn">${c.company || '-'}</div>
        </div>
        <div class="dm">${[c.contact, c.tel, c.industry].filter(Boolean).join(' · ') || '—'}</div>
        ${c.email ? `<div class="dm">${c.email}</div>` : ''}
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        <button class="bxs" onclick="toggleContacts('${c.id}')">👥 Kontak${nContacts ? ' (' + nContacts + ')' : ''}</button>
        ${canQuote() ? `<button class="bxs" onclick="selC('${c.id}');nav('quotation')">Gunakan</button>` : ''}
        ${isAdmin() ? `<button class="bxs" style="border-color:#fbbf24;color:#92400e;" onclick="startEditCust('${c.id}')">✏️ Edit</button>
        <button class="bdel" onclick="delCustDB('${c.id}')">🗑</button>` : ''}
      </div>
    </div>`
    return expandedContactCustId === c.id ? row + renderContactPanel(c) : row
  }).join('') : `<div class="empty">Tidak ada customer.</div>`
}

let editingCustId = null

function renderCustEditRow(c) {
  return `
    <div class="add-form" style="display:block;margin-bottom:5px;">
      <div style="font-size:12px;font-weight:600;margin-bottom:.65rem;color:#002060;">Edit Customer</div>
      <div style="margin-bottom:.65rem;">
        <div class="type-toggle">
          <button class="type-btn ${c.customer_type !== 'End User' ? 'on' : ''}" id="edit-type-pt" onclick="setEditCustType('PT')">🏭 PT / Perusahaan</button>
          <button class="type-btn ${c.customer_type === 'End User' ? 'on' : ''}" id="edit-type-eu" onclick="setEditCustType('End User')">👤 End User</button>
        </div>
      </div>
      <div class="g2" style="margin-bottom:8px;">
        <div class="fld"><label>Nama Perusahaan / Nama</label><input id="ec-name" value="${(c.company || '').replace(/"/g, '&quot;')}"></div>
        <div class="fld"><label>Kontak Person</label><input id="ec-contact" value="${(c.contact || '').replace(/"/g, '&quot;')}"></div>
      </div>
      <div class="g3" style="margin-bottom:8px;">
        <div class="fld"><label>Telp / Mobile</label><input id="ec-tel" value="${(c.tel || '').replace(/"/g, '&quot;')}"></div>
        <div class="fld"><label>Email</label><input id="ec-email" value="${(c.email || '').replace(/"/g, '&quot;')}"></div>
        <div class="fld"><label>Industri / Keterangan</label><input id="ec-industry" value="${(c.industry || '').replace(/"/g, '&quot;')}"></div>
      </div>
      <div class="fld" style="margin-bottom:8px;">
        <label>Alamat</label>
        <textarea id="ec-addr" style="min-height:44px;">${c.address || ''}</textarea>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="bp" style="padding:6px 12px;font-size:11px;" id="btn-save-edit-cust" onclick="saveEditCust('${c.id}')">Simpan Perubahan</button>
        <button class="bs" style="padding:6px 12px;font-size:11px;" onclick="cancelEditCust()">Batal</button>
      </div>
    </div>`
}

let editCustType = 'PT'

function startEditCust(id) {
  const c = customers.find(x => x.id === id); if (!c) return
  editingCustId = id
  editCustType = c.customer_type === 'End User' ? 'End User' : 'PT'
  renderCustList(document.querySelector('.filter-bar input')?.value || '')
}

function setEditCustType(type) {
  editCustType = type
  document.getElementById('edit-type-pt').classList.toggle('on', type === 'PT')
  document.getElementById('edit-type-eu').classList.toggle('on', type === 'End User')
}

function cancelEditCust() {
  editingCustId = null
  renderCustList(document.querySelector('.filter-bar input')?.value || '')
}

async function saveEditCust(id) {
  if (!guardAdmin()) return
  const name = document.getElementById('ec-name').value.trim()
  if (!name) { toast('Nama wajib diisi', false); return }
  const btn = document.getElementById('btn-save-edit-cust')
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>'
  try {
    const c = await upsertCustomer({
      id,
      company: name,
      contact: document.getElementById('ec-contact').value,
      tel: document.getElementById('ec-tel').value,
      email: document.getElementById('ec-email').value,
      address: document.getElementById('ec-addr').value,
      customer_type: editCustType,
      industry: document.getElementById('ec-industry').value
    })
    const idx = customers.findIndex(x => x.id === id)
    if (idx >= 0) customers[idx] = c
    editingCustId = null
    toast('Customer berhasil diupdate!')
    renderCustList('')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

async function delCustDB(id) {
  if (!guardAdmin()) return
  if (!confirm('Hapus customer ini?')) return
  try {
    await deleteCustomer(id)
    customers = customers.filter(x => x.id !== id)
    renderCustList('')
    document.getElementById('cc').textContent = customers.length
    toast('Customer dihapus')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

// DATABASE - PRODUCT
function renderProdList(q) {
  const f = q ? products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : products
  const list = document.getElementById('db-prod-list'); if (!list) return
  list.innerHTML = f.length ? f.map(p => {
    if (editingProdId === p.id) return renderProdEditRow(p)
    return `
    <div class="dbi">
      <div><div class="dn">${p.name}</div><div class="dm">${fmtPL(p.price || 0)} / ${p.unit || 'unit'} · ${p.category || ''}</div></div>
      <div style="display:flex;gap:4px;">
        ${canQuote() ? `<button class="bxs" onclick="aItem('${p.name.replace(/'/g, "\\'")}','${(p.part || '').replace(/'/g, "\\'")}',1,'${p.unit || 'unit'}',${p.price || 0},0);nav('quotation');qt('items')">+ Quote</button>` : ''}
        ${isAdmin() ? `<button class="bxs" style="border-color:#fbbf24;color:#92400e;" onclick="startEditProd('${p.id}')">✏️ Edit</button>
        <button class="bdel" onclick="delProd('${p.id}')">🗑</button>` : ''}
      </div>
    </div>`
  }).join('') : `<div class="empty">Belum ada produk tersimpan.<br>Klik ★ di Pricelist untuk simpan.</div>`
}

let editingProdId = null

function renderProdEditRow(p) {
  return `
    <div class="add-form" style="display:block;margin-bottom:5px;">
      <div style="font-size:12px;font-weight:600;margin-bottom:.65rem;color:#002060;">Edit Produk</div>
      <div class="g2" style="margin-bottom:7px;">
        <div class="fld"><label>Nama</label><input id="ep-n" value="${(p.name || '').replace(/"/g, '&quot;')}"></div>
        <div class="fld"><label>Part No.</label><input id="ep-p" value="${(p.part || '').replace(/"/g, '&quot;')}"></div>
      </div>
      <div class="g3" style="margin-bottom:7px;">
        <div class="fld"><label>Harga (Rp)</label><input id="ep-pr" type="number" value="${p.price || 0}"></div>
        <div class="fld"><label>Unit</label><input id="ep-u" value="${(p.unit || 'unit').replace(/"/g, '&quot;')}"></div>
        <div class="fld"><label>Kategori</label><input id="ep-c" value="${(p.category || '').replace(/"/g, '&quot;')}"></div>
      </div>
      <div style="display:flex;gap:5px;">
        <button class="bp" style="padding:5px 10px;font-size:11px;" id="btn-save-edit-prod" onclick="saveEditProd('${p.id}')">Simpan</button>
        <button class="bs" style="padding:5px 10px;font-size:11px;" onclick="cancelEditProd()">Batal</button>
      </div>
    </div>`
}

function startEditProd(id) {
  editingProdId = id
  renderProdList(document.querySelector('#db-product-panel input')?.value || '')
}

function cancelEditProd() {
  editingProdId = null
  renderProdList('')
}

async function saveEditProd(id) {
  if (!guardAdmin()) return
  const n = document.getElementById('ep-n').value.trim()
  if (!n) { toast('Nama wajib diisi', false); return }
  const btn = document.getElementById('btn-save-edit-prod')
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>'
  try {
    const p = await upsertProduct({
      id, name: n,
      part: document.getElementById('ep-p').value,
      price: +(document.getElementById('ep-pr').value || 0),
      unit: document.getElementById('ep-u').value || 'unit',
      category: document.getElementById('ep-c').value
    })
    const idx = products.findIndex(x => x.id === id)
    if (idx >= 0) products[idx] = p
    editingProdId = null
    toast('Produk berhasil diupdate!')
    renderProdList('')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

function toggleAP() { const el = document.getElementById('ap'); el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none' }

async function saveProd() {
  if (!guardAdmin()) return
  const n = document.getElementById('np-n').value; if (!n) { toast('Nama wajib diisi', false); return }
  try {
    const p = await upsertProduct({ name: n, part: document.getElementById('np-p').value, price: +(document.getElementById('np-pr').value || 0), unit: document.getElementById('np-u').value || 'unit', category: document.getElementById('np-c').value })
    if (!products.find(x => x.id === p.id)) products.unshift(p)
    renderProdList(''); document.getElementById('pc').textContent = products.length
    toast('Produk tersimpan!'); toggleAP()
    ;['np-n', 'np-p', 'np-pr'].forEach(id => document.getElementById(id).value = '')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

async function delProd(id) {
  if (!guardAdmin()) return
  try {
    await deleteProduct(id)
    products = products.filter(x => x.id !== id)
    renderProdList(''); document.getElementById('pc').textContent = products.length
    toast('Produk dihapus')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}
