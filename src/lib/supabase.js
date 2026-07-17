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

export async function updateProfile(id, fields) {
  const { data, error } = await supabase.from('profiles').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

// VISITS
export async function getVisits() {
  const { data, error } = await supabase
    .from('visits')
    .select('*, profiles(name)')
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data
}

export async function addVisit(visit) {
  const session = await getSession()
  const payload = { ...visit, created_by: session.user.id }
  const { data, error } = await supabase.from('visits').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteVisit(id) {
  const { error } = await supabase.from('visits').delete().eq('id', id)
  if (error) throw error
}

// SETTINGS
export async function getSetting(key) {
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle()
  if (error) throw error
  return data?.value
}

export async function setSetting(key, value) {
  const { error } = await supabase.from('app_settings').upsert({ key, value: String(value), updated_at: new Date().toISOString() })
  if (error) throw error
}

// CUSTOMER CONTACTS
export async function getContacts() {
  const { data, error } = await supabase.from('customer_contacts').select('*').order('name')
  if (error) throw error
  return data
}

export async function addContact(contact) {
  const session = await getSession()
  const payload = { ...contact, created_by: session.user.id }
  const { data, error } = await supabase.from('customer_contacts').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteContact(id) {
  const { error } = await supabase.from('customer_contacts').delete().eq('id', id)
  if (error) throw error
}

export async function updateContact(id, fields) {
  const { data, error } = await supabase.from('customer_contacts').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
