import { getCustomers, upsertCustomer, deleteCustomer, getProducts, upsertProduct, deleteProduct, getQuotations, saveQuotation, updateQuotationStatus, getProfiles, getSession } from '../lib/supabase.js'
import { PL_CATS, PL_ITEMS } from '../lib/pricelist.js'
import { generatePDF } from '../lib/pdf.js'

const CSS = `<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',system-ui,sans-serif;background:#f0f3f8;color:#1e293b;font-size:13px;}
nav{background:#002060;display:flex;align-items:stretch;padding:0 1rem;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(0,32,96,.3);}
.nlogo{display:flex;align-items:center;gap:8px;padding:.6rem .5rem;margin-right:1.25rem;font-weight:600;font-size:14px;color:#fff;white-space:nowrap;}
.nlogo em{background:#fff;color:#002060;font-style:normal;font-size:11px;font-weight:800;width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
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
.itbl td textarea{resize:none;min-height:30px;line-height:1.35;}
.itbl td input:focus,.itbl td textarea:focus{border-color:#93c5fd;background:#eff6ff;outline:none;}
.itbl tr.sub td{background:#f8fafc;}
.addr{display:flex;align-items:center;gap:5px;padding:5px 9px;border:1px dashed #e2e8f0;border-radius:7px;background:none;cursor:pointer;color:#64748b;font-size:12px;margin-top:5px;}
.addr:hover{background:#f8fafc;}
.srow{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#64748b;border-bottom:1px solid #f1f5f9;}
.srow:last-child{border:none;font-weight:600;font-size:15px;color:#002060;padding-top:9px;}
.prev{background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-size:10px;}
.prev-hd{background:#002060;color:#fff;padding:9px 14px;display:flex;justify-content:space-between;align-items:center;}
.prev-bd{padding:12px 14px;}
.prev-meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;margin-bottom:10px;}
.prev-meta .l{color:#888;font-size:9px;}
.ptbl{width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:8px;}
.ptbl th{background:#002060;color:#fff;padding:4px 5px;text-align:left;}
.ptbl th.r{text-align:right;}
.ptbl td{padding:3px 5px;border-bottom:1px solid #eee;}
.ptbl td.r{text-align:right;}
.ptbl tr.grp td{font-weight:600;background:#f0f3f8;}
.ptbl tr.sub td{color:#666;background:#fafafa;}
.ptot{display:flex;justify-content:flex-end;margin-bottom:8px;}
.ptot table{min-width:200px;font-size:10px;}
.ptot td{padding:3px 8px;}
.ptot td:last-child{text-align:right;font-weight:500;}
.ptot tr.grd{border-top:2px solid #002060;font-weight:700;}
.ptot tr.grd td{padding-top:6px;font-size:12px;color:#002060;}
.prev-ft{border-top:1px solid #eee;padding:7px 14px;font-size:9px;color:#777;}
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
</style>`

let rows = [], ctr = 0, plF = PL_ITEMS.slice(), plPg = 1, plCat = ''
let mF = PL_ITEMS.slice(), mPg = 1
let customers = [], products = [], pipeline = [], profiles = []
let currentUser = null, onLogout = null
let dbTab = 'customer', custType = 'all', pipFilter = 'all'
const PER = 40

function fmt(n) { return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID') }
function fmtD(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-' }
function gv(id) { return document.getElementById(id)?.value || '' }
function calcR(r) { return r.qty * (r.price || 0) * (1 - (r.disc || 0) / 100) }

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
    <div class="nlogo"><em>G</em> GSO Automation</div>
    <div class="ntab on" onclick="nav('quotation')">📄 Quotation</div>
    <div class="ntab" onclick="nav('pricelist')">💰 Pricelist</div>
    <div class="ntab" onclick="nav('pipeline')">📊 Pipeline</div>
    <div class="ntab" onclick="nav('database')">🗄 Database</div>
    <div class="nright">
      <span class="user-info" id="user-label">...</span>
      <button class="btn-logout" onclick="doLogout()">Keluar</button>
    </div>
  </nav>

  <!-- QUOTATION -->
  <div id="p-quotation" class="page on">
    <div class="ptabs">
      <div class="ptab on" id="qt-info" onclick="qt('info')">Info</div>
      <div class="ptab" id="qt-items" onclick="qt('items')">Item & Harga</div>
      <div class="ptab" id="qt-prev" onclick="qt('prev')">Preview</div>
    </div>
    <div id="qp-info">
      <div class="card"><div class="chd">Info Quotation</div>
        <div class="g3" style="margin-bottom:9px;">
          <div class="fld"><label>Quotation No.</label><input id="f-no" value="QJRM20260602"></div>
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
          <div class="fld"><label>Up (Kontak)</label><input id="f-ct"></div>
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
        <div class="prev-hd">
          <div><div style="font-size:13px;font-weight:600;">PT Global Sahabat Otomasi</div><div style="font-size:9px;opacity:.75;">"Your Automation Partner" · order@gso.co.id</div></div>
          <div style="font-size:19px;font-weight:700;letter-spacing:.05em;">QUOTATION</div>
        </div>
        <div class="prev-bd">
          <div class="prev-meta" id="pv-meta"></div>
          <table class="ptbl"><thead><tr>
            <th style="width:20px;">#</th><th style="width:68px;">Part No.</th><th>Description</th>
            <th style="width:26px;" class="r">Qty</th><th style="width:32px;">Unit</th>
            <th style="width:82px;" class="r">Unit Price</th><th style="width:34px;" class="r">Disc</th>
            <th style="width:82px;" class="r">Price</th>
          </tr></thead><tbody id="pv-body"></tbody></table>
          <div class="ptot" id="pv-tot"></div>
          <div class="prev-ft" id="pv-ft"></div>
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
          <option value="me">Punya Saya</option>
        </select>
        <button class="bs" style="padding:7px 11px;font-size:11px;" onclick="expCSV()">⬇ CSV</button>
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
          <button class="bxs" onclick="toggleAddCust()">+ Tambah Customer</button>
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
          <button class="bxs" onclick="toggleAP()">+ Tambah Manual</button>
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

  await Promise.all([loadCustomers(), loadProducts(), loadPipeline(), loadProfiles()])

  // Expose globals
  Object.assign(window, {
    nav, qt, acSrch, selC, recalc, aGrp, aItem, aNote, delR, delS, uf, us,
    openModal, closeModal, mSearch, mGo, mAdd, plSearch, plSetCat, plGo, addFromPL, saveStarPL,
    renderPip, updS, expCSV, loadPipeline, loadCustomers,
    renderCustList, setCustTypeFilter, toggleAddCust, setNewCustType, saveNewCust, delCustDB,
    doSaveCust, renderProdList, delProd, toggleAP, saveProd,
    doPDF, doSaveQuo, doLogout: onLogout,
    switchDbTab
  })
}

// NAV
function nav(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'))
  document.querySelectorAll('nav .ntab').forEach(b => b.classList.remove('on'))
  document.getElementById('p-' + name).classList.add('on')
  const idx = ['quotation', 'pricelist', 'pipeline', 'database'].indexOf(name)
  document.querySelectorAll('nav .ntab')[idx].classList.add('on')
  if (name === 'pipeline') renderPip()
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

function selC(id) {
  const c = customers.find(x => x.id === id); if (!c) return
  document.getElementById('f-co').value = c.company || ''
  document.getElementById('f-ct').value = c.contact || ''
  document.getElementById('f-tel').value = c.tel || ''
  document.getElementById('f-em').value = c.email || ''
  document.getElementById('f-addr').value = c.address || ''
  document.getElementById('acdrop').style.display = 'none'
}

// ITEMS
function aGrp() { rows.push({ id: ++ctr, t: 'g', label: 'ENGINEERING SERVICE' }); renderRows() }
function aItem(name = '', part = '', qty = 1, unit = 'unit', price = 0, disc = 0) { rows.push({ id: ++ctr, t: 'i', name, part, qty, unit, price, disc, subs: [] }); renderRows(); recalc() }
function aNote() { rows.push({ id: ++ctr, t: 'n', text: '' }); renderRows() }
function delR(id) { rows = rows.filter(r => r.id !== id); rows.forEach(r => { if (r.subs) r.subs = r.subs.filter(s => s.id !== id) }); renderRows(); recalc() }
function delS(pid, sid) { const p = rows.find(r => r.id === pid); if (p) p.subs = p.subs.filter(s => s.id !== sid); renderRows() }
function uf(id, f, v) { const r = rows.find(x => x.id === id); if (r) { r[f] = ['qty', 'price', 'disc'].includes(f) ? +v : v; recalc() } }
function us(pid, sid, v) { const p = rows.find(r => r.id === pid); if (p) { const s = p.subs.find(x => x.id === sid); if (s) s.text = v } }

function renderRows() {
  let nc = 0
  document.getElementById('ibd').innerHTML = rows.map(r => {
    if (r.t === 'g') return `<tr><td colspan="2"></td><td colspan="6"><input value="${r.label || ''}" oninput="uf(${r.id},'label',this.value)" placeholder="Nama grup..." style="width:100%;font-weight:600;padding:4px 5px;border:1px solid transparent;border-radius:4px;background:transparent;font-size:12px;font-family:inherit;"></td><td><button class="bdel" onclick="delR(${r.id})">✕</button></td></tr>`
    if (r.t === 'n') return `<tr><td colspan="8"><textarea placeholder="Catatan..." oninput="uf(${r.id},'text',this.value)" style="width:100%;padding:3px 5px;border:1px solid transparent;border-radius:3px;background:transparent;color:#64748b;font-size:11px;font-family:inherit;resize:none;min-height:26px;">${r.text || ''}</textarea></td><td><button class="bdel" onclick="delR(${r.id})">✕</button></td></tr>`
    nc++
    const subs = (r.subs || []).map((s, si) => `<tr class="sub"><td style="text-align:right;color:#94a3b8;font-size:10px;">${nc}.${si + 1}</td><td></td><td colspan="6"><textarea oninput="us(${r.id},${s.id},this.value)" placeholder="Sub-item..." style="width:100%;padding:3px 4px;border:1px solid transparent;border-radius:3px;background:transparent;color:#64748b;font-size:11px;font-family:inherit;resize:none;min-height:24px;">${s.text || ''}</textarea></td><td><button class="bdel" onclick="delS(${r.id},${s.id})">✕</button></td></tr>`).join('')
    return `<tr>
      <td style="text-align:center;color:#94a3b8;">${nc}</td>
      <td><input value="${r.part || ''}" placeholder="Part no." oninput="uf(${r.id},'part',this.value)"></td>
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
}

function renderPrev() {
  const tot = rows.filter(r => r.t === 'i').reduce((s, r) => s + calcR(r), 0)
  const dp = +(gv('f-disc') || 0), vp = +(gv('f-vat') || 12)
  const da = tot * dp / 100, sub = tot - da, vat = sub * vp / 100, grand = sub + vat
  document.getElementById('pv-meta').innerHTML = [
    ['To', `<b>${gv('f-co') || '-'}</b>`], ['Quotation No.', `<b>${gv('f-no')}</b>`],
    gv('f-addr') ? ['Alamat', gv('f-addr')] : null,
    ['Date', fmtD(gv('f-date'))], ['Up', gv('f-ct') || '-'],
    ['Valid Until', fmtD(gv('f-valid'))], ['Payment', gv('f-pay') || '-'], ['Sales', gv('f-sales') || ''],
  ].filter(Boolean).map(([k, v]) => `<div><div class="l">${k}</div><div>${v}</div></div>`).join('')
  let nc = 0
  document.getElementById('pv-body').innerHTML = rows.map(r => {
    if (r.t === 'g') return `<tr class="grp"><td></td><td></td><td colspan="6">${r.label || ''}</td></tr>`
    if (r.t === 'n') return `<tr><td colspan="8" style="color:#888;font-size:9px;">${(r.text || '').replace(/\n/g, '<br>')}</td></tr>`
    nc++
    const subs = (r.subs || []).map((s, si) => `<tr class="sub"><td style="text-align:right;color:#aaa;">${nc}.${si + 1}</td><td></td><td colspan="6">${s.text || ''}</td></tr>`).join('')
    return `<tr><td>${nc}</td><td style="font-size:9px;">${r.part || ''}</td><td style="font-weight:500;">${r.name || ''}</td><td class="r">${r.qty}</td><td>${r.unit || ''}</td><td class="r">${fmt(r.price || 0)}</td><td class="r">${r.disc ? r.disc + '%' : '-'}</td><td class="r">${fmt(calcR(r))}</td></tr>${subs}`
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:#aaa;padding:8px;">Belum ada item</td></tr>'
  document.getElementById('pv-tot').innerHTML = `<table><tr><td>TOTAL</td><td>${fmt(tot)}</td></tr>${dp > 0 ? `<tr><td>DISKON (${dp}%)</td><td>- ${fmt(da)}</td></tr>` : ''}<tr><td>SUB TOTAL</td><td>${fmt(sub)}</td></tr><tr><td>VAT (${vp}%)</td><td>${fmt(vat)}</td></tr><tr class="grd"><td>GRAND TOTAL</td><td>${fmt(grand)}</td></tr></table>`
  const n = gv('f-notes'); document.getElementById('pv-ft').innerHTML = n ? '<b>Notes:</b><br>' + n.replace(/\n/g, '<br>') : ''
}

function doPDF() {
  const dp = +(gv('f-disc') || 0), vp = +(gv('f-vat') || 12)
  generatePDF({
    info: { qo_number: gv('f-no'), date: gv('f-date'), valid_until: gv('f-valid'), sales_name: gv('f-sales'), sales_mobile: gv('f-mobile'), payment_terms: gv('f-pay'), delivery_terms: gv('f-del'), notes: gv('f-notes'), vat_pct: vp, discount_pct: dp },
    customer: { company: gv('f-co'), contact: gv('f-ct'), tel: gv('f-tel'), email: gv('f-em'), address: gv('f-addr') },
    items: rows
  })
  toast('PDF berhasil didownload!')
}

async function doSaveQuo() {
  const btn = document.getElementById('btn-save-quo')
  const tot = rows.filter(r => r.t === 'i').reduce((s, r) => s + calcR(r), 0)
  const dp = +(gv('f-disc') || 0), vp = +(gv('f-vat') || 12)
  const da = tot * dp / 100, sub = tot - da, vat = sub * vp / 100
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>'
  try {
    await saveQuotation({
      qo_number: gv('f-no'), date: gv('f-date') || null, valid_until: gv('f-valid') || null,
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
      <td class="pc">Rp ${Math.round(price).toLocaleString('id-ID')}</td>
      <td style="display:flex;gap:4px;">
        <button class="bxs" onclick="addFromPL('${part.replace(/'/g, "\\'")}','${name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}',${price})">+ Quote</button>
        <button class="bxs" style="border-color:#e2e8f0;color:#64748b;" onclick="saveStarPL('${part.replace(/'/g, "\\'")}',${price},'${PL_CATS[catI]}')">★</button>
      </td></tr>`
  }).join('') : `<tr><td colspan="5" class="empty">Tidak ada produk cocok.</td></tr>`
  const total = Math.ceil(plF.length / PER)
  const pg = document.getElementById('pl-pg'); if (!pg) return
  pg.innerHTML = total <= 1 ? '' : (plPg > 1 ? `<button onclick="plGo(${plPg - 1})">← Prev</button>` : '') + `<span style="color:#94a3b8;">Hal ${plPg} / ${total}</span>` + (plPg < total ? `<button onclick="plGo(${plPg + 1})">Next →</button>` : '')
}
function plGo(p) { plPg = p; renderPL() }
function addFromPL(part, name, price) { aItem(name, part, 1, 'unit', price, 0); nav('quotation'); qt('items'); toast(part + ' ditambahkan!') }
async function saveStarPL(part, price, cat) {
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
      <td style="padding:5px 7px;text-align:right;font-weight:600;color:#002060;white-space:nowrap;">Rp ${Math.round(price).toLocaleString('id-ID')}</td>
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
  const q = (document.getElementById('pip-q')?.value || '').toLowerCase()
  const f = document.getElementById('pip-f')?.value || ''
  const sf = document.getElementById('pip-sales')?.value || 'all'

  const filtered = pipeline.filter(h => {
    const matchQ = !q || ((h.qo_number || '') + (h.customer_snapshot?.company || '') + (h.sales_name || '')).toLowerCase().includes(q)
    const matchF = !f || h.status === f
    const matchS = sf === 'all' || (sf === 'me' && h.created_by === currentUser?.id)
    return matchQ && matchF && matchS
  })

  const stats = { Open: 0, Nego: 0, 'On Hold': 0, 'Closed - Won': 0, 'Closed - Lost': 0 }
  const vals = { ...stats }
  pipeline.forEach(h => { if (h.status in stats) { stats[h.status]++; vals[h.status] += (h.grand_total || 0) } })

  const sg = document.getElementById('sg')
  if (sg) sg.innerHTML = Object.entries(stats).map(([s, n]) => `<div class="sc"><div class="sn">${n}</div><div class="sl">${s}</div><div class="sv">Rp ${((vals[s] || 0) / 1e6).toFixed(0)}M</div></div>`).join('')

  const bd = document.getElementById('pip-bd'); if (!bd) return
  bd.innerHTML = filtered.map(h => {
    const cust = h.customer_snapshot || {}
    const desc = (h.items || []).filter(r => r.t === 'i').map(r => r.name).join(', ').slice(0, 50)
    const salesName = h.profiles?.name || h.sales_name || '-'
    const isMe = h.created_by === currentUser?.id
    return `<tr>
      <td style="font-weight:600;white-space:nowrap;">${h.qo_number || '-'}${isMe ? '<span class="my-badge">Saya</span>' : ''}</td>
      <td style="white-space:nowrap;font-size:10px;">${h.date ? new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}</td>
      <td style="font-size:11px;color:#64748b;">${salesName}</td>
      <td>${cust.company || '-'}</td>
      <td style="color:#64748b;font-size:11px;">${desc || '-'}</td>
      <td style="text-align:right;font-weight:600;white-space:nowrap;color:#002060;">${h.grand_total ? 'Rp ' + Math.round(h.grand_total).toLocaleString('id-ID') : '-'}</td>
      <td><select onchange="updS('${h.id}',this.value)">${['Open', 'Nego', 'On Hold', 'Closed - Won', 'Closed - Lost'].map(s => `<option${h.status === s ? ' selected' : ''}>${s}</option>`).join('')}</select></td>
    </tr>`
  }).join('') || `<tr><td colspan="7" class="empty">Tidak ada data.</td></tr>`

  const ct = document.getElementById('pip-ct')
  if (ct) ct.textContent = filtered.length + ' dari ' + pipeline.length + ' penawaran'
}

async function updS(id, val) {
  try {
    await updateQuotationStatus(id, val)
    const h = pipeline.find(x => x.id === id); if (h) h.status = val
    renderPip(); toast('Status: ' + val)
  } catch (e) { toast('Gagal: ' + e.message, false) }
}

function expCSV() {
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
  el.style.display = el.style.display === 'none' ? '' : 'none'
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
  if (q) f = f.filter(c => (c.company || '').toLowerCase().includes(q.toLowerCase()) || (c.contact || '').toLowerCase().includes(q.toLowerCase()))
  if (custTypeFilter !== 'all') f = f.filter(c => c.customer_type === custTypeFilter)

  const list = document.getElementById('db-cust-list'); if (!list) return
  list.innerHTML = f.length ? f.map(c => `
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
        <button class="bxs" onclick="selC('${c.id}');nav('quotation')">Gunakan</button>
        <button class="bdel" onclick="delCustDB('${c.id}')">🗑</button>
      </div>
    </div>`).join('') : `<div class="empty">Tidak ada customer.</div>`
}

async function delCustDB(id) {
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
  list.innerHTML = f.length ? f.map(p => `
    <div class="dbi">
      <div><div class="dn">${p.name}</div><div class="dm">Rp ${Math.round(p.price || 0).toLocaleString('id-ID')} / ${p.unit || 'unit'} · ${p.category || ''}</div></div>
      <div style="display:flex;gap:4px;">
        <button class="bxs" onclick="aItem('${p.name.replace(/'/g, "\\'")}','${(p.part || '').replace(/'/g, "\\'")}',1,'${p.unit || 'unit'}',${p.price || 0},0);nav('quotation');qt('items')">+ Quote</button>
        <button class="bdel" onclick="delProd('${p.id}')">🗑</button>
      </div>
    </div>`).join('') : `<div class="empty">Belum ada produk tersimpan.<br>Klik ★ di Pricelist untuk simpan.</div>`
}

function toggleAP() { const el = document.getElementById('ap'); el.style.display = el.style.display === 'none' ? '' : 'none' }

async function saveProd() {
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
  try {
    await deleteProduct(id)
    products = products.filter(x => x.id !== id)
    renderProdList(''); document.getElementById('pc').textContent = products.length
    toast('Produk dihapus')
  } catch (e) { toast('Gagal: ' + e.message, false) }
}
