# 🚀 Obuća Shop — Vodič za postavljanje (15 minuta)

---

## KORAK 1 — Supabase (5 min)

1. Idi na **supabase.com** → prijavi se → otvori svoj projekat

2. Lijevo u meniju klikni **"SQL Editor"**

3. Klikni **"New Query"**

4. Otvori fajl `SUPABASE_SETUP.sql` (iz ovog ZIP-a), kopiraj SVE i zalijepi u editor

5. Klikni **"Run"** (zeleno dugme)
   - Trebao bi vidjeti: "Success. No rows returned"

6. Sad idi na **Settings → API** (lijevo u meniju)

7. Kopiraj i sačuvaj ova dva podatka:
   - **Project URL** → npr. `https://abcxyz.supabase.co`
   - **anon public** ključ → dugačak string koji počinje sa `eyJ...`

---

## KORAK 2 — Resend (3 min)

1. Idi na **resend.com** → prijavi se (ili registruj se besplatno)

2. Lijevo klikni **"API Keys"** → **"Create API Key"**

3. Daj mu ime npr. `obucashop` → klikni **"Add"**

4. **ODMAH kopiraj ključ** (počinje sa `re_`) — prikazuje se samo jednom!

### ⚠️ VAŽNO — Email domena:
- Besplatni Resend nalog može slati samo na **tvoju vlastitu email adresu** dok ne dodaš domenu
- Idi na **Resend → Domains → Add Domain** i dodaj svoju domenu (npr. obucashop.ba)
- Alternativno: za testiranje koristi `onboarding@resend.dev` kao FROM adresu

---

## KORAK 3 — Vercel (7 min)

1. Idi na **vercel.com** → prijavi se

2. Klikni **"Add New Project"**

3. Odaberi **"Upload"** (ili povuci folder `obucashop-next`)
   - Ako koristiš GitHub: push folder na GitHub, pa poveži repo

4. Prije nego klikneš **Deploy**, klikni na **"Environment Variables"** i dodaj:

   | Naziv | Vrijednost |
   |-------|-----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | tvoj Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tvoj Supabase anon ključ |
   | `RESEND_API_KEY` | tvoj Resend API ključ (re_...) |
   | `RESEND_FROM_EMAIL` | npr. `noreply@tvojadomena.com` |

5. Klikni **"Deploy"** → čekaj 1-2 minute

6. **Gotovo!** Vercel ti daje link poput `https://obucashop-xyz.vercel.app`

---

## KORAK 4 — Prva prijava

1. Otvori svoj Vercel link u browseru

2. Klikni **"Prijavite se kao Admin"**

3. Unesi **svoju Gmail adresu** — ovo je automatski tvoj **Superadmin** nalog

4. Primit ćeš email sa 4-znamenkastim kodom

5. Unesi kod → dobrodošao u Admin Panel! 🎉

---

## ❓ Česti problemi

**"Email nije poslan"**
→ Provjeri da je RESEND_API_KEY ispravno unesen u Vercel
→ Provjeri da je FROM email sa verifikovanom domenom na Resend

**"Nema pristupa"**
→ Provjeri Supabase URL i anon ključ u Vercel env varijablama
→ Provjeri da si pokrenuo SQL skriptu u Supabase

**"Build failed" na Vercel**
→ Provjeri da si uploadao cijeli folder `obucashop-next` (sa svim fajlovima)

---

## 📁 Struktura projekta

```
obucashop-next/
├── app/
│   ├── api/
│   │   ├── send-code/route.js    ← šalje kod na Gmail
│   │   ├── verify-code/route.js  ← provjera koda
│   │   ├── products/route.js     ← CRUD za proizvode
│   │   └── admins/route.js       ← upravljanje adminima
│   ├── page.js                   ← glavna stranica
│   ├── page.module.css           ← svi stilovi
│   └── layout.js                 ← Next.js layout
├── lib/
│   └── supabase.js               ← konekcija na bazu
├── public/
│   └── assets/                   ← slike proizvoda
├── SUPABASE_SETUP.sql            ← SQL za bazu (pokreni ovo!)
├── VODIC.md                      ← ovaj fajl
├── next.config.js
└── package.json
```

---

*Napravljeno sa ❤️ — Obuća Shop Admin System*
