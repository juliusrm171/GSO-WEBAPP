import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } }
  })
  if (error) throw error
  return data
}

export async function signOut() { await supabase.auth.signOut() }

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// CUSTOMERS
export async function getCustomers() {
  const { data, error } = await supabase.from('customers').select('*').order('company')
  if (error) throw error
  return data
}

export async function upsertCustomer(customer) {
  const session = await getSession()
  const payload = { ...customer, created_by: session.user.id }
  const { data, error } = await supabase.from('customers').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}

// PRODUCTS
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) throw error
  return data
}

export async function upsertProduct(product) {
  const session = await getSession()
  const payload = { ...product, created_by: session.user.id }
  const { data, error } = await supabase.from('products').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// QUOTATIONS
export async function getQuotations() {
  const { data, error } = await supabase
    .from('quotations')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function saveQuotation(q) {
  const session = await getSession()
  const payload = { ...q, created_by: session.user.id }
  const { data, error } = await supabase.from('quotations').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateQuotationStatus(id, status) {
  const { error } = await supabase.from('quotations').update({ status }).eq('id', id)
  if (error) throw error
}

// PROFILES
export async function getProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('name')
  if (error) throw error
  return data
}
