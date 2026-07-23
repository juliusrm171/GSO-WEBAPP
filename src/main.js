import { supabase, getSession, signOut } from './lib/supabase.js'
import { renderLogin } from './pages/login.js'
import { renderApp } from './pages/app.js'

let currentUser = null

function isRecoveryFlow() {
  return window.location.hash.includes('type=recovery')
}

async function init() {
  // If this is a password-recovery redirect, ALWAYS show the login page
  // (which will render the "set new password" form) instead of the dashboard,
  // even though Supabase has already created an active session for the user.
  if (isRecoveryFlow()) {
    renderLogin(document.getElementById('app'), onLogin)
    return
  }

  const session = await getSession()
  if (session) {
    currentUser = session.user
    renderApp(document.getElementById('app'), currentUser, logout)
  } else {
    renderLogin(document.getElementById('app'), onLogin)
  }

  supabase.auth.onAuthStateChange((event, session) => {
    // PENTING: Supabase memicu SIGNED_IN / TOKEN_REFRESHED setiap kali tab kembali fokus
    // atau token diperbarui. JANGAN render ulang aplikasi untuk itu — kalau tidak,
    // seluruh UI dibangun ulang dan balik ke Dashboard (form quotation yang belum
    // disimpan hilang). Hanya render ulang bila BENAR-BENAR ganti akun (user id beda).
    if (event === 'SIGNED_IN' && session && !isRecoveryFlow()) {
      if (currentUser && currentUser.id === session.user.id) return // tab refocus / token refresh → abaikan
      currentUser = session.user
      renderApp(document.getElementById('app'), currentUser, logout)
    } else if (event === 'SIGNED_OUT') {
      currentUser = null
      renderLogin(document.getElementById('app'), onLogin)
    }
    // TOKEN_REFRESHED, USER_UPDATED, dll sengaja diabaikan agar tidak reset UI.
  })
}

function onLogin(user) {
  currentUser = user
  renderApp(document.getElementById('app'), currentUser, logout)
}

async function logout() {
  await signOut()
}

init().catch(err => {
  console.error('Init gagal:', err)
  const app = document.getElementById('app')
  if (app) app.innerHTML = `<div style="max-width:420px;margin:80px auto;padding:24px;text-align:center;font-family:system-ui,sans-serif;color:#334155;">
    <div style="font-size:34px;margin-bottom:8px;">⚠️</div>
    <div style="font-weight:700;font-size:16px;margin-bottom:6px;">Gagal memuat aplikasi</div>
    <div style="font-size:13px;color:#64748b;margin-bottom:16px;">Periksa koneksi internet lalu muat ulang halaman.</div>
    <button onclick="location.reload()" style="background:#002060;color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13px;cursor:pointer;">↻ Muat ulang</button>
  </div>`
})
