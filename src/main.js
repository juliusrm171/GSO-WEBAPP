import { supabase, getSession, signOut } from './lib/supabase.js'
import { renderLogin } from './pages/login.js'
import { renderApp } from './pages/app.js'

let currentUser = null

async function init() {
  const session = await getSession()
  if (session) {
    currentUser = session.user
    renderApp(document.getElementById('app'), currentUser, logout)
  } else {
    renderLogin(document.getElementById('app'), onLogin)
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
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
