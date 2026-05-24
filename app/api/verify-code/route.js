import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return Response.json({ error: 'Nedostaju podaci.' }, { status: 400 })
    }

    // Dohvati kod iz baze
    const { data: record } = await supabase
      .from('login_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (!record) {
      return Response.json({ error: 'Kod nije pronađen. Zatražite novi.' }, { status: 400 })
    }

    // Provjeri da li je istekao
    if (new Date(record.expires_at) < new Date()) {
      return Response.json({ error: 'Kod je istekao. Zatražite novi.' }, { status: 400 })
    }

    // Provjeri kod
    if (record.code !== code) {
      return Response.json({ error: 'Pogrešan kod.' }, { status: 400 })
    }

    // Obriši upotrijebljeni kod
    await supabase.from('login_codes').delete().eq('email', email.toLowerCase())

    // Provjeri ulogu admina
    const { data: admins } = await supabase.from('admins').select('email, role')
    const isFirstEver = !admins || admins.length === 0

    if (isFirstEver) {
      // Registruj prvog superadmina
      await supabase.from('admins').insert({
        email: email.toLowerCase(),
        role: 'superadmin'
      })
      return Response.json({ success: true, role: 'superadmin', isFirstEver: true })
    }

    const adminRecord = admins.find(a => a.email.toLowerCase() === email.toLowerCase())
    if (!adminRecord) {
      return Response.json({ error: 'Nema pristupa.' }, { status: 403 })
    }

    return Response.json({ success: true, role: adminRecord.role, isFirstEver: false })

  } catch (err) {
    console.error('Verify code error:', err)
    return Response.json({ error: 'Greška pri provjeri koda.' }, { status: 500 })
  }
}
