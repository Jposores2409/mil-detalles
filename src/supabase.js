// src/supabase.js
import { createClient } from '@supabase/supabase-js'
 
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
 
// ── Productos ──────────────────────────────────────────
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}
 
export const createProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  if (error) throw error
  return data
}
 
export const updateProduct = async (id, product) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
 
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw error
}
 
// ── Imágenes ───────────────────────────────────────────
export const uploadImage = async (file) => {
  const ext      = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
 
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { cacheControl: '3600', upsert: false })
 
  if (error) throw error
 
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename)
 
  return data.publicUrl
}

