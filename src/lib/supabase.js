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

// ── FASE 9: STOCK ──
export async function getStockItems() {
  const { data, error } = await supabase.from('stock_items').select('*').order('part_number')
  if (error) throw error
  return data
}
export async function upsertStockItem(item) {
  const { data, error } = await supabase.from('stock_items').upsert(item, { onConflict: 'part_number' }).select().single()
  if (error) throw error
  return data
}
export async function updateStockItem(id, fields) {
  const { data, error } = await supabase.from('stock_items').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteStockItem(id) {
  const { error } = await supabase.from('stock_items').delete().eq('id', id)
  if (error) throw error
}
export async function getStockMoves(limit = 100) {
  const { data, error } = await supabase.from('stock_moves')
    .select('*, stock_items(part_number, name), profiles(name)')
    .order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data
}
export async function addStockMove(m) {
  const session = await getSession()
  const { data, error } = await supabase.from('stock_moves').insert({ ...m, created_by: session.user.id })
    .select('*, stock_items(part_number, name), profiles(name)').single()
  if (error) throw error
  return data
}

// ── FASE 12: PROJECT ──
export async function getProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
export async function addProject(p) {
  const session = await getSession()
  const { data, error } = await supabase.from('projects').insert({ ...p, created_by: session.user.id }).select().single()
  if (error) throw error
  return data
}
export async function updateProject(id, fields) {
  const { data, error } = await supabase.from('projects').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
export async function getProjectChildren(pid) {
  const [t, b, f, u, m] = await Promise.all([
    supabase.from('project_tasks').select('*, profiles(name)').eq('project_id', pid).order('created_at'),
    supabase.from('project_boms').select('*').eq('project_id', pid).order('created_at'),
    supabase.from('project_files').select('*, profiles(name)').eq('project_id', pid).order('created_at', { ascending: false }),
    supabase.from('project_updates').select('*, profiles(name)').eq('project_id', pid).order('created_at', { ascending: false }),
    supabase.from('project_milestones').select('*').eq('project_id', pid).order('target_date', { ascending: true, nullsFirst: false }),
  ])
  for (const r of [t, b, f, u, m]) if (r.error) throw r.error
  return { tasks: t.data, boms: b.data, files: f.data, updates: u.data, milestones: m.data }
}
export async function addProjectMilestone(row) {
  const { data, error } = await supabase.from('project_milestones').insert(row).select().single()
  if (error) throw error
  return data
}
export async function updateProjectMilestone(id, fields) {
  const { data, error } = await supabase.from('project_milestones').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteProjectMilestone(id) {
  const { error } = await supabase.from('project_milestones').delete().eq('id', id)
  if (error) throw error
}
export async function addProjectTask(row) {
  const { data, error } = await supabase.from('project_tasks').insert(row).select('*, profiles(name)').single()
  if (error) throw error
  return data
}
export async function updateProjectTask(id, fields) {
  const { data, error } = await supabase.from('project_tasks').update(fields).eq('id', id).select('*, profiles(name)').single()
  if (error) throw error
  return data
}
export async function deleteProjectTask(id) {
  const { error } = await supabase.from('project_tasks').delete().eq('id', id)
  if (error) throw error
}
export async function addProjectBom(row) {
  const { data, error } = await supabase.from('project_boms').insert(row).select().single()
  if (error) throw error
  return data
}
export async function updateProjectBom(id, fields) {
  const { data, error } = await supabase.from('project_boms').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteProjectBom(id) {
  const { error } = await supabase.from('project_boms').delete().eq('id', id)
  if (error) throw error
}
export async function deleteProjectBomsFor(projectId) {
  const { error } = await supabase.from('project_boms').delete().eq('project_id', projectId)
  if (error) throw error
}
export async function addProjectFile(row) {
  const session = await getSession()
  const { data, error } = await supabase.from('project_files').insert({ ...row, uploaded_by: session.user.id }).select('*, profiles(name)').single()
  if (error) throw error
  return data
}
export async function deleteProjectFile(id) {
  const { error } = await supabase.from('project_files').delete().eq('id', id)
  if (error) throw error
}
export async function addProjectUpdate(row) {
  const session = await getSession()
  const { data, error } = await supabase.from('project_updates').insert({ ...row, created_by: session.user.id }).select('*, profiles(name)').single()
  if (error) throw error
  return data
}
export async function getMyOpenTasks(uid) {
  const { data, error } = await supabase.from('project_tasks').select('*, projects(name, stage)').eq('assignee_id', uid).eq('status', 'open').order('due_date')
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
