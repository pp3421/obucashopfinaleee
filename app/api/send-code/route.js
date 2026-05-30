import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)
export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Nevažeća email adresa.' }, { status: 400 })
    }

    // Provjeri da li je email u listi admina
    const { data: admins } = await supabase
      .from('admins')
      .select('email, role')

    const isAllowed = admins && admins.some(
      a => a.email.toLowerCase() === email.toLowerCase()
    )

    // Ako nema ni jednog admina — prvi koji se prijavi postaje superadmin
    const isFirstEver = !admins || admins.length === 0

    if (!isAllowed && !isFirstEver) {
      return Response.json({ error: 'Ova email adresa nema admin pristup.' }, { status: 403 })
    }

    // Generiraj 4-znamenkasti kod
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minuta

    // Sačuvaj kod u bazu
    await supabase.from('login_codes').upsert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'email' })

    // Pošalji email
    await resend.emails.send({
      from: 'Obuća Shop <onboarding@resend.dev>',
      to: email,
      subject: 'Vaš admin login kod — Obuća Shop',
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fdf8f0;">
          <h1 style="font-size: 2rem; color: #2e1a0a; margin-bottom: 4px;">Obuća <span style="color: #c8924a;">Shop</span></h1>
          <p style="color: #8c6a3e; font-style: italic; margin-bottom: 32px;">Admin Panel</p>
          
          <p style="color: #5c4022; margin-bottom: 16px;">Vaš jednokratni login kod:</p>
          
          <div style="background: #2e1a0a; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 3rem; font-weight: 900; color: #c8924a; letter-spacing: 0.3em;">${code}</span>
          </div>
          
          <p style="color: #8c6a3e; font-size: 0.85rem;">Kod važi <strong>10 minuta</strong>. Ne dijelite ga sa nikime.</p>
          <p style="color: #b89a6a; font-size: 0.78rem; margin-top: 24px; border-top: 1px solid #e4d0b0; padding-top: 16px;">Obuća Shop Admin System</p>
        </div>
      `
    })

    return Response.json({ success: true, isFirstEver })

  } catch (err) {
    console.error('Send code error:', err)
    return Response.json({ error: 'Greška pri slanju koda.' }, { status: 500 })
  }
}
