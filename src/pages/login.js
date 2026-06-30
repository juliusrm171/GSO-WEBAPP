import { signIn, signUp, resetPassword, updatePassword } from '../lib/supabase.js'

export function renderLogin(container, onSuccess) {
  container.innerHTML = `
  <style>
    .auth-bg { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#001040 0%,#002060 100%); padding:1rem; }
    .auth-card { background:#fff; border-radius:16px; padding:2rem; width:100%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,.3); }
    .auth-logo { text-align:center; margin-bottom:1.5rem; }
    .auth-logo .logo-icon { width:56px;height:56px;background:#002060;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;margin:0 auto 10px; }
    .auth-logo h1 { font-size:20px;font-weight:600;color:#1e293b; }
    .auth-logo p { font-size:12px;color:#64748b;margin-top:2px; }
    .auth-tabs { display:flex;gap:0;border-bottom:1px solid #e2e8f0;margin-bottom:1.5rem; }
    .auth-tab { flex:1;padding:.6rem;text-align:center;font-size:13px;cursor:pointer;color:#64748b;border-bottom:2px solid transparent;transition:all .15s; }
    .auth-tab.on { color:#002060;border-bottom-color:#002060;font-weight:500; }
    .fld { display:flex;flex-direction:column;gap:4px;margin-bottom:12px; }
    .fld label { font-size:11px;color:#64748b;font-weight:500; }
    .fld input { padding:9px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;transition:border .15s; }
    .fld input:focus { outline:none;border-color:#002060;box-shadow:0 0 0 3px rgba(0,32,96,.1); }
    .btn-submit { width:100%;padding:10px;background:#002060;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;margin-top:4px;transition:background .15s; }
    .btn-submit:hover { background:#001548; }
    .btn-submit:disabled { background:#94a3b8;cursor:not-allowed; }
    .auth-err { background:#fef2f2;color:#dc2626;padding:9px 12px;border-radius:8px;font-size:12px;margin-bottom:12px;display:none; }
    .auth-ok { background:#f0fdf4;color:#16a34a;padding:9px 12px;border-radius:8px;font-size:12px;margin-bottom:12px;display:none; }
    .auth-forgot { text-align:right;margin:-6px 0 14px; }
    .auth-forgot a { font-size:11.5px;color:#002060;cursor:pointer;text-decoration:none; }
    .auth-forgot a:hover { text-decoration:underline; }
    .auth-back { font-size:11.5px;color:#64748b;cursor:pointer;display:inline-block;margin-bottom:14px; }
    .auth-back:hover { color:#002060; }
    .auth-desc { font-size:12px;color:#64748b;margin-bottom:14px;line-height:1.5; }
  </style>
  <div class="auth-bg">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="logo-icon">G</div>
        <h1>GSO Quotation App</h1>
        <p>PT Global Sahabat Otomasi</p>
      </div>
      <div class="auth-tabs" id="auth-tabs">
        <div class="auth-tab on" id="tab-login" onclick="switchTab('login')">Masuk</div>
        <div class="auth-tab" id="tab-register" onclick="switchTab('register')">Daftar</div>
      </div>
      <div id="auth-err" class="auth-err"></div>
      <div id="auth-ok" class="auth-ok"></div>

      <div id="form-login">
        <div class="fld"><label>Email</label><input type="email" id="l-email" placeholder="nama@gso.co.id"></div>
        <div class="fld"><label>Password</label><input type="password" id="l-pass" placeholder="Password" onkeydown="if(event.key==='Enter')doLogin()"></div>
        <div class="auth-forgot"><a onclick="switchTab('forgot')">Lupa password?</a></div>
        <button class="btn-submit" onclick="doLogin()" id="btn-login">Masuk</button>
      </div>

      <div id="form-register" style="display:none;">
        <div class="fld"><label>Nama</label><input type="text" id="r-name" placeholder="Julius Ricky Mayco"></div>
        <div class="fld"><label>Email</label><input type="email" id="r-email" placeholder="nama@gso.co.id"></div>
        <div class="fld"><label>Password</label><input type="password" id="r-pass" placeholder="Min. 6 karakter"></div>
        <button class="btn-submit" onclick="doRegister()" id="btn-reg">Daftar</button>
      </div>

      <div id="form-forgot" style="display:none;">
        <div class="auth-back" onclick="switchTab('login')">&larr; Kembali ke Masuk</div>
        <div class="auth-desc">Masukkan email akun kamu. Kami akan kirim link untuk reset password ke email tersebut.</div>
        <div class="fld"><label>Email</label><input type="email" id="f-email" placeholder="nama@gso.co.id" onkeydown="if(event.key==='Enter')doForgot()"></div>
        <button class="btn-submit" onclick="doForgot()" id="btn-forgot">Kirim Link Reset</button>
      </div>

      <div id="form-newpass" style="display:none;">
        <div class="auth-desc">Masukkan password baru untuk akun kamu.</div>
        <div class="fld"><label>Password Baru</label><input type="password" id="np-pass" placeholder="Min. 6 karakter"></div>
        <div class="fld"><label>Ulangi Password Baru</label><input type="password" id="np-pass2" placeholder="Ulangi password baru" onkeydown="if(event.key==='Enter')doNewPass()"></div>
        <button class="btn-submit" onclick="doNewPass()" id="btn-newpass">Simpan Password Baru</button>
      </div>
    </div>
  </div>`

  window.switchTab = (tab) => {
    document.getElementById('form-login').style.display = tab === 'login' ? '' : 'none'
    document.getElementById('form-register').style.display = tab === 'register' ? '' : 'none'
    document.getElementById('form-forgot').style.display = tab === 'forgot' ? '' : 'none'
    document.getElementById('form-newpass').style.display = 'none'
    document.getElementById('auth-tabs').style.display = (tab === 'login' || tab === 'register') ? '' : 'none'
    document.getElementById('tab-login').classList.toggle('on', tab === 'login')
    document.getElementById('tab-register').classList.toggle('on', tab === 'register')
    document.getElementById('auth-err').style.display = 'none'
    document.getElementById('auth-ok').style.display = 'none'
  }

  function showErr(msg) {
    const el = document.getElementById('auth-err')
    el.textContent = msg; el.style.display = 'block'
    document.getElementById('auth-ok').style.display = 'none'
  }
  function showOk(msg) {
    const el = document.getElementById('auth-ok')
    el.textContent = msg; el.style.display = 'block'
    document.getElementById('auth-err').style.display = 'none'
  }

  window.doLogin = async () => {
    const email = document.getElementById('l-email').value.trim()
    const pass = document.getElementById('l-pass').value
    if (!email || !pass) return showErr('Email dan password wajib diisi')
    const btn = document.getElementById('btn-login')
    btn.disabled = true; btn.textContent = 'Memuat...'
    try {
      const { user } = await signIn(email, pass)
      onSuccess(user)
    } catch (e) {
      showErr(e.message === 'Invalid login credentials' ? 'Email atau password salah' : e.message)
      btn.disabled = false; btn.textContent = 'Masuk'
    }
  }

  window.doRegister = async () => {
    const name = document.getElementById('r-name').value.trim()
    const email = document.getElementById('r-email').value.trim()
    const pass = document.getElementById('r-pass').value
    if (!name || !email || !pass) return showErr('Semua field wajib diisi')
    if (pass.length < 6) return showErr('Password minimal 6 karakter')
    const btn = document.getElementById('btn-reg')
    btn.disabled = true; btn.textContent = 'Mendaftar...'
    try {
      await signUp(email, pass, name)
      showOk('Akun berhasil dibuat! Cek email untuk verifikasi, lalu masuk.')
      window.switchTab('login')
    } catch (e) {
      showErr(e.message)
    }
    btn.disabled = false; btn.textContent = 'Daftar'
  }

  window.doForgot = async () => {
    const email = document.getElementById('f-email').value.trim()
    if (!email) return showErr('Email wajib diisi')
    const btn = document.getElementById('btn-forgot')
    btn.disabled = true; btn.textContent = 'Mengirim...'
    try {
      await resetPassword(email)
      showOk('Link reset password sudah dikirim! Cek email kamu (termasuk folder spam) lalu klik link tersebut.')
    } catch (e) {
      showErr(e.message)
    }
    btn.disabled = false; btn.textContent = 'Kirim Link Reset'
  }

  window.doNewPass = async () => {
    const p1 = document.getElementById('np-pass').value
    const p2 = document.getElementById('np-pass2').value
    if (!p1 || !p2) return showErr('Isi kedua field password')
    if (p1.length < 6) return showErr('Password minimal 6 karakter')
    if (p1 !== p2) return showErr('Password tidak sama')
    const btn = document.getElementById('btn-newpass')
    btn.disabled = true; btn.textContent = 'Menyimpan...'
    try {
      await updatePassword(p1)
      showOk('Password berhasil diubah! Silakan masuk dengan password baru.')
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => window.switchTab('login'), 1500)
    } catch (e) {
      showErr(e.message)
    }
    btn.disabled = false; btn.textContent = 'Simpan Password Baru'
  }

  // Detect Supabase password-recovery redirect (hash contains type=recovery)
  if (window.location.hash.includes('type=recovery')) {
    document.getElementById('form-login').style.display = 'none'
    document.getElementById('form-register').style.display = 'none'
    document.getElementById('form-forgot').style.display = 'none'
    document.getElementById('form-newpass').style.display = ''
    document.getElementById('auth-tabs').style.display = 'none'
  }
}
