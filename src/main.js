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
    // Ignore SIGNED_IN events that are actually part of a recovery flow —
    // the login page's own handler manages the new-password form for those.
    if (event === 'SIGNED_IN' && session && !isRecoveryFlow()) {
      currentUser = session.user
      renderApp(document.getElementById('app'), currentUser, logout)
    } else if (event === 'SIGNED_OUT') {
      currentUser = null
      renderLogin(document.getElementById('app'), onLogin)
    }
  })
}

function onLogin(user) {
  currentUser = user
  renderApp(document.getElementById('app'), currentUser, logout)
}

async function logout() {
  await signOut()
}

init()
