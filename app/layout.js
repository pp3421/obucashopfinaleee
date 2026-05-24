import { Outfit, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['300','400','500','600','700','800'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400','700','900'], style: ['normal','italic'] })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-cormorant', weight: ['300','400','600'], style: ['normal','italic'] })

export const metadata = {
  title: 'Obuća Shop — Admin Panel',
  description: 'Admin panel za upravljanje Obuća Shop web trgovinom.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="bs">
      <body className={`${outfit.variable} ${playfair.variable} ${cormorant.variable}`}>
        {children}
      </body>
    </html>
  )
}
