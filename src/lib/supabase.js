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

// FASE 14: upload lampiran ke Supabase Storage (bucket 'attachments') → balikin URL publik
export async function uploadAttachment(file, folder) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${folder}/${Date.now()}_${safe}`
  const { error } = await supabase.storage.from('attachments').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('attachments').getPublicUrl(path)
  return { name: file.name, url: data.publicUrl, path }
}
export async function updatePOFields(id, fields) {
  const { data, error } = await supabase.from('purchase_orders').update(fields).eq('id', id).select('*, profiles!purchase_orders_sales_id_fkey(name)').single()
  if (error) throw error
  return data
}
export async function updateProductFields(id, fields) {
  const { data, error } = await supabase.from('products').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

// FASE 13: update sebagian kolom customer (tanpa menyentuh kolom lain)
export async function updateCustomerFields(id, fields) {
  const { data, error } = await supabase.from('customers').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

// FASE 13: gabungkan customer duplikat → pindahkan semua relasi lalu hapus duplikatnya
export async function mergeCustomerInto(keepId, keepName, dropId, dropName) {
  let r = await supabase.from('customer_contacts').update({ customer_id: keepId }).eq('customer_id', dropId)
  if (r.error) throw r.error
  r = await supabase.from('visits').update({ customer_id: keepId, customer_name: keepName }).eq('customer_id', dropId)
  if (r.error) throw r.error
  // samakan nama teks di tabel yang menyimpan nama customer sebagai string
  if (dropName && dropName !== keepName) {
    r = await supabase.from('visits').update({ customer_name: keepName }).eq('customer_name', dropName)
    if (r.error) throw r.error
    r = await supabase.from('shodans').update({ customer_name: keepName }).eq('customer_name', dropName)
    if (r.error) throw r.error
    r = await supabase.from('purchase_orders').update({ customer_name: keepName }).eq('customer_name', dropName)
    if (r.error) throw r.error
  }
  r = await supabase.from('customers').delete().eq('id', dropId)
  if (r.error) throw r.error
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

export async function updateVisit(id, fields) {
  const { data, error } = await supabase.from('visits').update(fields).eq('id', id).select('*, profiles(name)').single()
  if (error) throw error
  return data
}

export async function deleteVisit(id) {
  const { error } = await supabase.from('visits').delete().eq('id', id)
  if (error) throw error
}

export async function updateQuotationFields(id, fields) {
  const { error } = await supabase.from('quotations').update(fields).eq('id', id)
  if (error) throw error
}

// SHODAN (inquiry)
export async function getShodans() {
  const { data, error } = await supabase
    .from('shodans')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addShodan(sh) {
  const session = await getSession()
  const payload = { ...sh, created_by: session.user.id }
  const { data, error } = await supabase.from('shodans').insert(payload).select('*, profiles(name)').single()
  if (error) throw error
  return data
}

export async function updateShodan(id, fields) {
  const { data, error } = await supabase.from('shodans').update(fields).eq('id', id).select('*, profiles(name)').single()
  if (error) throw error
  return data
}

export async function deleteShodan(id) {
  const { error } = await supabase.from('shodans').delete().eq('id', id)
  if (error) throw error
}

// PURCHASE ORDERS
export async function getPOs() {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, profiles!purchase_orders_sales_id_fkey(name)')
    .order('po_date', { ascending: false })
  if (error) throw error
  return data
}

export async function addPO(po) {
  const session = await getSession()
  const payload = { ...po, created_by: session.user.id }
  const { data, error } = await supabase.from('purchase_orders').insert(payload).select('*, profiles!purchase_orders_sales_id_fkey(name)').single()
  if (error) throw error
  return data
}

export async function deletePO(id) {
  const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
  if (error) throw error
}

// SALES TARGETS
export async function getTargets() {
  const { data, error } = await supabase.from('sales_targets').select('*')
  if (error) throw error
  return data
}

export async function setTarget(sales_id, period, fields) {
  const { data, error } = await supabase.from('sales_targets')
    .upsert({ sales_id, period, ...fields }, { onConflict: 'sales_id,period' })
    .select().single()
  if (error) throw error
  return data
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
