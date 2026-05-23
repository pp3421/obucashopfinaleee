import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// GET - dohvati sve proizvode
export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ products: data })
}

// POST - dodaj novi proizvod
export async function POST(request) {
  const body = await request.json()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: body.name,
      brand: body.brand,
      description: body.description || '',
      price: body.price,
      old_price: body.old_price || null,
      badge: body.badge || null,
      category: body.category,
      gender: body.gender,
      subcategory: body.subcategory || null,
      sizes: body.sizes || [],
      images: body.images || [],
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ product: data })
}

// PUT - uredi postojeći proizvod
export async function PUT(request) {
  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('products')
    .update({
      name: updates.name,
      brand: updates.brand,
      description: updates.description,
      price: updates.price,
      old_price: updates.old_price || null,
      badge: updates.badge || null,
      subcategory: updates.subcategory || null,
      sizes: updates.sizes || [],
      images: updates.images || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ product: data })
}

// DELETE - obriši proizvod
export async function DELETE(request) {
  const { id } = await request.json()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
