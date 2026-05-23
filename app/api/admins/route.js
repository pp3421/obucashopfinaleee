import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// GET - lista svih admina
export async function GET() {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ admins: data })
}

// POST - dodaj admina (samo superadmin)
export async function POST(request) {
  const { email, requesterEmail } = await request.json()

  // Provjeri da li je onaj ko dodaje superadmin
  const { data: requester } = await supabase
    .from('admins')
    .select('role')
    .eq('email', requesterEmail.toLowerCase())
    .single()

  if (!requester || requester.role !== 'superadmin') {
    return Response.json({ error: 'Nemate ovlaštenje.' }, { status: 403 })
  }

  // Provjeri limit (max 3)
  const { data: allAdmins } = await supabase.from('admins').select('id')
  if (allAdmins && allAdmins.length >= 3) {
    return Response.json({ error: 'Maksimalno 3 admina.' }, { status: 400 })
  }

  // Provjeri duplikat
  const { data: existing } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    return Response.json({ error: 'Taj admin već postoji.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('admins')
    .insert({ email: email.toLowerCase(), role: 'admin' })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ admin: data })
}

// DELETE - ukloni admina (samo superadmin)
export async function DELETE(request) {
  const { email, requesterEmail } = await request.json()

  const { data: requester } = await supabase
    .from('admins')
    .select('role')
    .eq('email', requesterEmail.toLowerCase())
    .single()

  if (!requester || requester.role !== 'superadmin') {
    return Response.json({ error: 'Nemate ovlaštenje.' }, { status: 403 })
  }

  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('email', email.toLowerCase())

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
