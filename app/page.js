'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './page.module.css'

/* ── helpers ── */
const EU_TO_CM = {34:21.3,35:22.0,36:22.7,37:23.3,38:24.0,39:24.7,40:25.3,41:26.0,42:26.7,43:27.3,44:28.0,45:28.7,46:29.3,47:30.0,48:30.7}
const ALL_SIZES = [34,35,36,37,38,39,40,41,42,43,44,45,46,47,48]
const CAT_LABELS = {patike:'Patike',cipele:'Cipele',cizme:'Čizme',gleznjace:'Gležnjerice',papuce:'Papuče'}
const CAT_SUBS = {patike:['Sportske','Running','Casual','Premium'],cipele:['Formalne','Poslovne','Casual','Premium'],cizme:['Planinarske','Radne','Urbane','Elegantne'],gleznjace:['Trail','Urbane','Premium'],papuce:['Kućne','Ljetne','Premium']}
const BADGE_LABELS = {novo:'Novo',bestseller:'Bestseller',rasprodaja:'Rasprodaja',premium:'Premium'}
const CAT_LETTER = {patike:'P',cipele:'C',cizme:'Č',gleznjace:'G',papuce:'Pa'}

function sizeNote(eu){if(eu<=36)return'Manji broj';if(eu>=46)return'Veći broj';return'—'}

function fuzzyMatch(p,q){
  if(!q)return true
  const tokens=q.toLowerCase().split(/\s+/).filter(Boolean)
  const text=[p.name,p.brand,p.subcategory||'',p.description||''].join(' ').toLowerCase()
  return tokens.every(t=>text.includes(t))
}

/* ── SEED DATA (ubit će se u Supabase pri prvom pokretanju) ── */
const SEED_PRODUCTS = [
  // PATIKE MUSKE
  {name:'AirStride Pro',brand:'RunTech',price:149,badge:'novo',category:'patike',gender:'muske',subcategory:'Running',description:'Lagane trčaće patike sa naprednom amortizacijom.',sizes:[38,39,40,41,42,43,44,45],images:['/assets/shoe-premium.jpg']},
  {name:'UrbanRunner X',brand:'StreetKing',price:119,badge:null,category:'patike',gender:'muske',subcategory:'Casual',description:'Urbane patike sa modernim dizajnom.',sizes:[39,40,41,42,43,44],images:['/assets/shoe-vans.jpg']},
  {name:'CloudWalk Elite',brand:'SoftStep',price:189,badge:'bestseller',category:'patike',gender:'muske',subcategory:'Premium',description:'Premium patike sa memorijskom pjenom.',sizes:[38,39,40,41,42,43,44,45,46],images:['/assets/shoe-premium.jpg']},
  {name:'MaxFlex 3000',brand:'FlexPro',price:79,old_price:129,badge:'rasprodaja',category:'patike',gender:'muske',subcategory:'Sportske',description:'Fleksibilne patike s posebnom tehnologijom potplata.',sizes:[40,41,42,43,44,45],images:['/assets/shoe-sport.jpg']},
  // PATIKE ZENSKE
  {name:'PinkStride Lite',brand:'GlowRun',price:129,badge:'novo',category:'patike',gender:'zenske',subcategory:'Running',description:'Lagane ženske patike u modernim pastelnim bojama.',sizes:[35,36,37,38,39,40,41],images:['/assets/shoe-vans.jpg']},
  {name:'VelvetRun',brand:'SoftStep',price:145,badge:null,category:'patike',gender:'zenske',subcategory:'Casual',description:'Baršunaste ženske patike.',sizes:[36,37,38,39,40],images:['/assets/shoe-premium.jpg']},
  {name:'CloudWalk Femme',brand:'AirFemme',price:165,badge:'bestseller',category:'patike',gender:'zenske',subcategory:'Premium',description:'Premium ženske patike s tehnologijom plovećeg potplata.',sizes:[35,36,37,38,39,40,41,42],images:['/assets/shoe-premium.jpg']},
  {name:'Neon Dash',brand:'ColorPop',price:69,old_price:109,badge:'rasprodaja',category:'patike',gender:'zenske',subcategory:'Sportske',description:'Živopisne patike za aktivan život.',sizes:[36,37,38,39,40,41],images:['/assets/shoe-sport.jpg']},
  // CIPELE
  {name:'Oxford Classic',brand:'BritonStyle',price:195,badge:'premium',category:'cipele',gender:'muske',subcategory:'Formalne',description:'Klasične Oxford cipele od prave kože.',sizes:[40,41,42,43,44,45],images:['/assets/shoe-leather.jpg']},
  {name:'Derby Elegance',brand:'CraftShoe',price:175,badge:null,category:'cipele',gender:'muske',subcategory:'Formalne',description:'Elegantne Derby cipele.',sizes:[39,40,41,42,43,44,45],images:['/assets/shoe-leather.jpg']},
  {name:'Loafer Heritage',brand:'VintageWalk',price:149,old_price:210,badge:'rasprodaja',category:'cipele',gender:'muske',subcategory:'Casual',description:'Loafer cipele u vintage stilu.',sizes:[41,42,43,44,45],images:['/assets/shoe-loafer.jpg']},
  {name:'Stiletto Royale',brand:'GlamStep',price:185,badge:'premium',category:'cipele',gender:'zenske',subcategory:'Premium',description:'Visoke potpetice za posebne prilike.',sizes:[35,36,37,38,39,40],images:['/assets/shoe-leather.jpg']},
  {name:'Ballet Luxe',brand:'SoftDance',price:115,badge:'novo',category:'cipele',gender:'zenske',subcategory:'Casual',description:'Luksuzne balerinke s premium potplatom.',sizes:[35,36,37,38,39,40],images:['/assets/shoe-loafer.jpg']},
  {name:'Mule Moderne',brand:'Moderno',price:89,old_price:125,badge:'rasprodaja',category:'cipele',gender:'zenske',subcategory:'Casual',description:'Moderne mule cipele.',sizes:[35,36,37,38,39,40,41],images:['/assets/shoe-loafer.jpg']},
  // CIZME
  {name:'Mountain Warrior',brand:'TrekPro',price:229,badge:'premium',category:'cizme',gender:'muske',subcategory:'Planinarske',description:'Planinarske čizme s vodonepropusnom membranom.',sizes:[40,41,42,43,44,45,46],images:[]},
  {name:'Chelsea Brown',brand:'CraftBoot',price:245,badge:'novo',category:'cizme',gender:'muske',subcategory:'Urbane',description:'Klasične Chelsea čizme od premium kože.',sizes:[41,42,43,44,45],images:[]},
  {name:'Over-Knee Glamour',brand:'WinterChic',price:255,badge:'bestseller',category:'cizme',gender:'zenske',subcategory:'Elegantne',description:'Čizme iznad koljena.',sizes:[35,36,37,38,39,40],images:[]},
  {name:'Chelsea Femme',brand:'Elegante',price:215,badge:'novo',category:'cizme',gender:'zenske',subcategory:'Urbane',description:'Ženska verzija Chelsea čizama.',sizes:[35,36,37,38,39,40],images:[]},
  // GLEZNJACE
  {name:'Hiker Edge',brand:'TrailPro',price:175,badge:'novo',category:'gleznjace',gender:'muske',subcategory:'Trail',description:'Gležnjerice za trail i hiking.',sizes:[40,41,42,43,44,45],images:[]},
  {name:'Alpine Pro',brand:'MountainStep',price:195,badge:'premium',category:'gleznjace',gender:'muske',subcategory:'Premium',description:'Premium gležnjerice za zahtjevne planine.',sizes:[40,41,42,43,44,45,46],images:[]},
  {name:'Trail Blossom',brand:'FloraWalk',price:165,badge:'novo',category:'gleznjace',gender:'zenske',subcategory:'Trail',description:'Ženske gležnjerice s cvjetnim detaljima.',sizes:[35,36,37,38,39,40],images:[]},
  {name:'Suede Adventure',brand:'WildFemme',price:149,badge:'bestseller',category:'gleznjace',gender:'zenske',subcategory:'Urbane',description:'Brušenokožne gležnjerice.',sizes:[36,37,38,39,40,41],images:[]},
  // PAPUCE
  {name:'Casa Comfort',brand:'HomeStep',price:65,badge:null,category:'papuce',gender:'muske',subcategory:'Kućne',description:'Kućne papuče s memorijskom pjenom.',sizes:[40,41,42,43,44,45],images:[]},
  {name:'Beach King',brand:'SunWalker',price:55,badge:'novo',category:'papuce',gender:'muske',subcategory:'Ljetne',description:'Ljetne japanke za plažu.',sizes:[39,40,41,42,43,44,45],images:[]},
  {name:'Spa Luxe',brand:'WellnessStep',price:95,badge:'premium',category:'papuce',gender:'zenske',subcategory:'Premium',description:'Premium spa papuče.',sizes:[35,36,37,38,39,40,41],images:[]},
  {name:'Soft Cloud',brand:'DreamStep',price:89,badge:'bestseller',category:'papuce',gender:'zenske',subcategory:'Kućne',description:'Papuče poput oblaka.',sizes:[36,37,38,39,40,41],images:[]},
]

export default function Home() {
  /* ── AUTH STATE ── */
  const [screen, setScreen] = useState('landing') // landing | loginEmail | loginCode | welcome | shop
  const [adminEmail, setAdminEmail] = useState('')
  const [adminRole, setAdminRole] = useState(null)
  const [isFirstEver, setIsFirstEver] = useState(false)
  const [codeInputs, setCodeInputs] = useState(['','','',''])
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [codeHint, setCodeHint] = useState('')
  const [admins, setAdmins] = useState([])
  const [welcomeExtra, setWelcomeExtra] = useState([])
  const [welcomeExtraInput, setWelcomeExtraInput] = useState('')
  const [products, setProducts] = useState([])
  const [seeded, setSeeded] = useState(false)

  /* ── SHOP STATE ── */
  const [currentCat, setCurrentCat] = useState(null)
  const [currentGender, setCurrentGender] = useState('muske')
  const [currentSubcat, setCurrentSubcat] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [catSearchQ, setCatSearchQ] = useState('')
  const [filterMode, setFilterMode] = useState('all')

  /* ── MODAL STATE ── */
  const [gmOpen, setGmOpen] = useState(false)
  const [gmCat, setGmCat] = useState(null)
  const [pdOpen, setPdOpen] = useState(false)
  const [pdProduct, setPdProduct] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSizes, setEditSizes] = useState([])
  const [editImages, setEditImages] = useState([])
  const [editTab, setEditTab] = useState('info')
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({name:'',brand:'',description:'',price:'',old_price:'',badge:'',category:'',gender:'',subcategory:''})
  const [addSizes, setAddSizes] = useState([])
  const [addImages, setAddImages] = useState([])
  const [addTab, setAddTab] = useState('info')
  const [mjereOpen, setMjereOpen] = useState(false)
  const [saOpen, setSaOpen] = useState(false)
  const [saNewEmail, setSaNewEmail] = useState('')
  const [galIdx, setGalIdx] = useState(0)
  const [notif, setNotif] = useState('')
  const [notifTimer, setNotifTimer] = useState(null)

  const codeRefs = [useRef(),useRef(),useRef(),useRef()]

  /* ── NOTIF ── */
  function showNotif(msg) {
    setNotif(msg)
    if(notifTimer) clearTimeout(notifTimer)
    setNotifTimer(setTimeout(()=>setNotif(''),3200))
  }

  /* ── LOAD PRODUCTS ── */
  const loadProducts = useCallback(async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    if(data.products) setProducts(data.products)
    return data.products || []
  }, [])

  /* ── SEED ── */
  async function seedIfEmpty(prods) {
    if(seeded || prods.length > 0) return
    setSeeded(true)
    for(const p of SEED_PRODUCTS) {
      await fetch('/api/products', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(p)
      })
    }
    await loadProducts()
    showNotif('Baza inicijalizirana sa demo proizvodima!')
  }

  /* ── LOAD ADMINS ── */
  const loadAdmins = useCallback(async () => {
    const res = await fetch('/api/admins')
    const data = await res.json()
    if(data.admins) setAdmins(data.admins)
  }, [])

  /* ── LOGIN ── */
  async function sendCode() {
    if(!adminEmail || !adminEmail.includes('@')) { setLoginError('Unesite ispravnu email adresu.'); return }
    setLoginLoading(true); setLoginError('')
    const res = await fetch('/api/send-code', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email: adminEmail})
    })
    const data = await res.json()
    setLoginLoading(false)
    if(!res.ok) { setLoginError(data.error || 'Greška.'); return }
    setIsFirstEver(data.isFirstEver)
    setCodeHint(`Kod poslan na: ${adminEmail}`)
    setScreen('loginCode')
    setTimeout(()=>codeRefs[0].current?.focus(), 200)
  }

  async function verifyCode() {
    const code = codeInputs.join('')
    if(code.length < 4) return
    setLoginLoading(true); setLoginError('')
    const res = await fetch('/api/verify-code', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email: adminEmail, code})
    })
    const data = await res.json()
    setLoginLoading(false)
    if(!res.ok) {
      setLoginError(data.error || 'Pogrešan kod.')
      setCodeInputs(['','','',''])
      codeRefs[0].current?.focus()
      return
    }
    setAdminRole(data.role)
    if(data.isFirstEver) {
      setScreen('welcome')
    } else {
      await enterShop()
    }
  }

  function handleCodeInput(i, val) {
    val = val.replace(/[^0-9]/g,'').slice(-1)
    const next = [...codeInputs]; next[i] = val; setCodeInputs(next)
    if(val && i < 3) codeRefs[i+1].current?.focus()
    if(next.join('').length === 4) setTimeout(()=>verifyCode(), 100)
  }

  function handleCodeKey(i, e) {
    if(e.key==='Backspace' && !codeInputs[i] && i > 0) codeRefs[i-1].current?.focus()
  }

  /* ── WELCOME ── */
  function addWelcomeAdmin() {
    const email = welcomeExtraInput.trim()
    if(!email.includes('@')) { showNotif('Nevažeća email adresa.'); return }
    if(welcomeExtra.length >= 2) { showNotif('Maksimalno 2 dodatna admina.'); return }
    if(welcomeExtra.includes(email)) { showNotif('Već dodan.'); return }
    setWelcomeExtra([...welcomeExtra, email])
    setWelcomeExtraInput('')
  }

  async function enterShop() {
    // Dodaj welcome admins ako postoje
    if(welcomeExtra.length > 0) {
      for(const email of welcomeExtra) {
        await fetch('/api/admins', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({email, requesterEmail: adminEmail})
        })
      }
    }
    await loadAdmins()
    const prods = await loadProducts()
    await seedIfEmpty(prods)
    setScreen('shop')
  }

  /* ── SUPERADMIN PANEL ── */
  async function saAddAdmin() {
    if(!saNewEmail.includes('@')) { showNotif('Nevažeća email adresa.'); return }
    const res = await fetch('/api/admins', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email: saNewEmail, requesterEmail: adminEmail})
    })
    const data = await res.json()
    if(!res.ok) { showNotif(data.error); return }
    setSaNewEmail('')
    await loadAdmins()
    showNotif('Admin dodan!')
  }

  async function saRemoveAdmin(email) {
    const res = await fetch('/api/admins', {
      method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email, requesterEmail: adminEmail})
    })
    if(res.ok) { await loadAdmins(); showNotif('Admin uklonjen.') }
  }

  /* ── PRODUCTS ── */
  function getFiltered() {
    let items = products.filter(p => {
      const catOk = !currentCat || p.category === currentCat
      const genOk = !currentCat || p.gender === currentGender
      const subOk = !currentSubcat || p.subcategory === currentSubcat
      const filterOk = filterMode === 'all' || p.badge === filterMode
      const searchOk = fuzzyMatch(p, currentCat ? catSearchQ : searchQ)
      return catOk && genOk && subOk && filterOk && searchOk
    })
    return items
  }

  function getFeatured() {
    return products
      .filter(p => fuzzyMatch(p, searchQ) && (filterMode==='all'||p.badge===filterMode))
      .slice(0, 8)
  }

  /* ── EDIT ── */
  function openEdit(p) {
    setEditProduct(p)
    setEditForm({
      name: p.name, brand: p.brand, description: p.description||'',
      price: p.price, old_price: p.old_price||'', badge: p.badge||'', subcategory: p.subcategory||''
    })
    setEditSizes(p.sizes||[])
    setEditImages(p.images||[])
    setEditTab('info')
    setEditOpen(true)
  }

  async function saveEdit() {
    const res = await fetch('/api/products', {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        id: editProduct.id,
        name: editForm.name,
        brand: editForm.brand,
        description: editForm.description,
        price: parseFloat(editForm.price),
        old_price: parseFloat(editForm.old_price)||null,
        badge: editForm.badge||null,
        subcategory: editForm.subcategory||null,
        sizes: editSizes,
        images: editImages,
      })
    })
    if(res.ok) {
      await loadProducts()
      setEditOpen(false)
      showNotif(`"${editForm.name}" ažuriran!`)
    }
  }

  async function deleteProduct() {
    if(!confirm(`Obrisati "${editProduct.name}"?`)) return
    const res = await fetch('/api/products', {
      method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id: editProduct.id})
    })
    if(res.ok) {
      await loadProducts()
      setEditOpen(false)
      showNotif('Proizvod obrisan.')
    }
  }

  /* ── ADD ── */
  async function saveAdd() {
    const {name,brand,category,gender,price} = addForm
    if(!name||!brand||!category||!gender||!price) {
      showNotif('Popunite obavezna polja: naziv, brend, kategorija, spol, cijena.')
      return
    }
    const res = await fetch('/api/products', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        ...addForm,
        price: parseFloat(addForm.price),
        old_price: parseFloat(addForm.old_price)||null,
        badge: addForm.badge||null,
        sizes: addSizes,
        images: addImages,
      })
    })
    if(res.ok) {
      await loadProducts()
      setAddOpen(false)
      setAddForm({name:'',brand:'',description:'',price:'',old_price:'',badge:'',category:'',gender:'',subcategory:''})
      setAddSizes([]); setAddImages([])
      showNotif('Novi proizvod dodan!')
    }
  }

  /* ── IMAGE UPLOAD ── */
  function handleImages(files, setter) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setter(prev => [...prev, e.target.result])
      reader.readAsDataURL(file)
    })
  }

  /* ── RENDER HELPERS ── */
  function PriceDisplay({price, old_price}) {
    return (
      <span className={s.price}>
        {old_price && <span className={s.oldPrice}>{old_price} KM</span>}
        {price}<sup>KM</sup>
      </span>
    )
  }

  function BadgePill({badge}) {
    if(!badge) return null
    const cls = badge==='rasprodaja' ? s.badgeSale : badge==='novo' ? s.badgeNew : s.badge
    return <span className={cls}>{BADGE_LABELS[badge]||badge}</span>
  }

  function ProductCard({p, idx}) {
    const letter = CAT_LETTER[p.category]||p.category?.[0]?.toUpperCase()||'?'
    const img = p.images?.[0]
    return (
      <div className={s.card} style={{animationDelay:`${idx*0.07}s`}} onClick={()=>{setPdProduct(p);setGalIdx(0);setPdOpen(true)}}>
        <BadgePill badge={p.badge}/>
        <div className={s.cardImg}>
          {img ? <img src={img} alt={p.name} loading="lazy"/> : <span className={s.cardLetter}>{letter}</span>}
        </div>
        <div className={s.cardInfo}>
          <div className={s.cardBrand}>{p.brand}</div>
          <div className={s.cardName}>{p.name}</div>
          <div className={s.cardFoot}>
            <PriceDisplay price={p.price} old_price={p.old_price}/>
          </div>
        </div>
        <div className={s.adminOverlay}>
          <button className={s.editBtn} onClick={e=>{e.stopPropagation();openEdit(p)}}>
            ✏️ Uredi
          </button>
        </div>
      </div>
    )
  }

  function SizePicker({selected, onChange}) {
    return (
      <div className={s.sizesPicker}>
        {ALL_SIZES.map(sz => (
          <button key={sz}
            className={selected.includes(sz) ? s.spBtnActive : s.spBtn}
            onClick={()=>onChange(selected.includes(sz)?selected.filter(s=>s!==sz):[...selected,sz].sort((a,b)=>a-b))}>
            {sz}
          </button>
        ))}
      </div>
    )
  }

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  const s = styles

  /* ── LANDING ── */
  if(screen==='landing') return (
    <div className={s.landing}>
      <div className={s.lc1}/><div className={s.lc2}/><div className={s.lc3}/>
      <div className={s.landAdminBadge}>✦ Admin Pristup ✦</div>
      <div className={s.landContent}>
        <h1 className={s.landHl}>Obuća<br/><span className={s.ac}>Shop</span></h1>
        <p className={s.landTag}>Admin Panel</p>
        <div className={s.landDiv}/>
        <button className={s.enterBtn} onClick={()=>setScreen('loginEmail')}>
          Prijavite se kao Admin
        </button>
      </div>
    </div>
  )

  /* ── LOGIN EMAIL ── */
  if(screen==='loginEmail') return (
    <div className={s.loginBg}>
      <div className={s.loginBox}>
        <div className={s.loginLogo}>Obuća <span className={s.ac}>Shop</span></div>
        <div className={s.loginSub}>Admin prijava</div>
        {loginError && <div className={s.loginErr}>{loginError}</div>}
        <div className={s.loginLabel}>Vaš Gmail</div>
        <input className={s.loginInput} type="email" placeholder="admin@gmail.com"
          value={adminEmail} onChange={e=>setAdminEmail(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&sendCode()}/>
        <div className={s.loginHint}>Unesite Gmail adresu — primit ćete 4-znamenkasti kod.</div>
        <button className={s.loginBtn} onClick={sendCode} disabled={loginLoading}>
          {loginLoading ? <span className={s.spinner}/> : 'Pošalji kod →'}
        </button>
      </div>
    </div>
  )

  /* ── LOGIN CODE ── */
  if(screen==='loginCode') return (
    <div className={s.loginBg}>
      <div className={s.loginBox}>
        <div className={s.loginLogo}>Obuća <span className={s.ac}>Shop</span></div>
        <div className={s.loginSub}>Unesite kod</div>
        {loginError && <div className={s.loginErr}>{loginError}</div>}
        <div className={s.loginHint}>{codeHint}</div>
        <div className={s.codeBoxes}>
          {codeInputs.map((v,i)=>(
            <input key={i} ref={codeRefs[i]} className={s.codeBox}
              type="text" inputMode="numeric" maxLength={1} value={v}
              onChange={e=>handleCodeInput(i,e.target.value)}
              onKeyDown={e=>handleCodeKey(i,e)}/>
          ))}
        </div>
        <button className={s.loginBtn} onClick={verifyCode} disabled={loginLoading}>
          {loginLoading ? <span className={s.spinner}/> : 'Potvrdi kod →'}
        </button>
        <button className={s.backBtn} onClick={()=>{setScreen('loginEmail');setCodeInputs(['','','','']);setLoginError('')}}>
          ← Nazad
        </button>
      </div>
    </div>
  )

  /* ── WELCOME ── */
  if(screen==='welcome') return (
    <div className={s.loginBg}>
      <div className={s.welcomeBox}>
        <div className={s.crown}>👑</div>
        <div className={s.welcomeTitle}>Dobrodošli, Superadmin!</div>
        <div className={s.welcomeSub}>Vi ste prvi — imate punu kontrolu.</div>
        <div className={s.welcomeInfo}>
          <strong>Vaš web sajt može imati do 3 admina.</strong><br/>
          Samo vi možete dodavati i uklanjati ostale admine.<br/>
          Ovu opciju možete mijenjati i unutar stranice — gumb <strong>Superadmin</strong> u navigaciji.
        </div>
        <div className={s.welcomeQ}>Dodajte još admina odmah (opcionalno):</div>
        <div className={s.adminSlots}>
          {[0,1].map(i=>(
            <div key={i} className={welcomeExtra[i]?s.slotFilled:s.slot}>
              <span className={s.slotIcon}>{welcomeExtra[i]?'✓':'👤'}</span>
              <div className={s.slotInfo}>
                <div className={s.slotRole}>Admin {i+2}</div>
                <div className={s.slotEmail}>{welcomeExtra[i]||<em style={{color:'var(--text-soft)'}}>Nije dodan</em>}</div>
              </div>
              {welcomeExtra[i] && <button className={s.slotRemove} onClick={()=>setWelcomeExtra(welcomeExtra.filter((_,j)=>j!==i))}>Ukloni</button>}
            </div>
          ))}
        </div>
        <div className={s.addAdminRow}>
          <input className={s.addAdminInput} type="email" placeholder="gmail adresa novog admina..."
            value={welcomeExtraInput} onChange={e=>setWelcomeExtraInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addWelcomeAdmin()}/>
          <button className={s.addAdminBtn} onClick={addWelcomeAdmin}>Dodaj</button>
        </div>
        <button className={s.welcomeContinue} onClick={enterShop}>Uđite u Admin Panel →</button>
      </div>
      {notif && <div className={`${s.notif} ${s.notifShow}`}>{notif}</div>}
    </div>
  )

  /* ── SHOP ── */
  const filtered = currentCat ? getFiltered() : getFeatured()
  const isSuperAdmin = adminRole === 'superadmin'

  return (
    <div className={s.shop}>

      {/* NAVBAR */}
      <nav className={s.navbar}>
        <div className={s.navLogo}>Obuća <span className={s.ac}>Shop</span></div>
        <div className={s.navRight}>
          <span className={s.adminBadge}>{isSuperAdmin?'👑 Superadmin':'⚡ Admin'}</span>
          <div className={s.sep}/>
          <button className={s.navAddBtn} onClick={()=>{setAddOpen(true);setAddTab('info')}}>
            + Dodaj proizvod
          </button>
          {isSuperAdmin && <>
            <div className={s.sep}/>
            <button className={s.navSuperBtn} onClick={()=>{loadAdmins();setSaOpen(true)}}>
              ★ Superadmin
            </button>
          </>}
        </div>
      </nav>

      {/* FILTER BAR */}
      <div className={s.filterBar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.searchInput} type="text" placeholder="Pretraži obuću..."
            value={searchQ} onChange={e=>{setSearchQ(e.target.value);setCurrentCat(null);setCurrentSubcat(null)}}/>
        </div>
        <div className={s.chips}>
          <button className={filterMode==='all'?s.chipActive:s.chip} onClick={()=>setFilterMode('all')}>Sve</button>
          <button className={filterMode==='rasprodaja'?s.chipSaleActive:s.chip} onClick={()=>setFilterMode('rasprodaja')}>Rasprodaja</button>
        </div>
      </div>

      {/* CAT BAR */}
      <div className={s.catBar}>
        {Object.entries(CAT_LABELS).map(([cat,label])=>(
          <button key={cat} className={currentCat===cat?s.catBtnActive:s.catBtn}
            onClick={()=>{setGmCat(cat);setGmOpen(true)}}>
            {label}
          </button>
        ))}
      </div>

      {/* HERO */}
      <div className={s.hero}>
        <div className={s.heroGlow}/>
        <div className={s.heroText}>
          <p className={s.heroEyebrow}>✦ Admin Panel ✦</p>
          <h2>Upravljajte<br/><em>kolekcijom</em></h2>
          <p>Kliknite na proizvod da ga uredite — ili dodajte novi.</p>
        </div>
        <div className={s.heroBadge}>
          <div className={s.heroNum}>{products.length}</div>
          <div className={s.heroSub}>Ukupno proizvoda</div>
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <div className={s.section}>
        <div className={s.secHdr}>
          <h2 className={s.secTitle}>{currentCat ? CAT_LABELS[currentCat] : 'Istaknuti proizvodi'}</h2>
          <span className={s.secSub}>
            {currentCat ? (currentGender==='muske'?'Muške':'Ženske') : 'Kliknite na proizvod da ga uredite'}
          </span>
        </div>

        {/* Gender tabs (samo kad je kategorija odabrana) */}
        {currentCat && (
          <div className={s.genderTabs}>
            <button className={currentGender==='muske'?s.gtabActive:s.gtab} onClick={()=>{setCurrentGender('muske');setCurrentSubcat(null)}}>Muške</button>
            <button className={currentGender==='zenske'?s.gtabActive:s.gtab} onClick={()=>{setCurrentGender('zenske');setCurrentSubcat(null)}}>Ženske</button>
          </div>
        )}

        {/* Subcat chips */}
        {currentCat && CAT_SUBS[currentCat] && (
          <div className={s.subcatBar}>
            <button className={!currentSubcat?s.scActive:s.sc} onClick={()=>setCurrentSubcat(null)}>Sve</button>
            {CAT_SUBS[currentCat].map(sc=>(
              <button key={sc} className={currentSubcat===sc?s.scActive:s.sc} onClick={()=>setCurrentSubcat(sc)}>{sc}</button>
            ))}
          </div>
        )}

        {/* Cat search */}
        {currentCat && (
          <div className={s.catSearchWrap}>
            <input className={s.catSearchInput} type="text" placeholder={`Pretraži u ${CAT_LABELS[currentCat]}...`}
              value={catSearchQ} onChange={e=>setCatSearchQ(e.target.value)}/>
          </div>
        )}

        {filtered.length === 0
          ? <p className={s.noResults}>Nema rezultata.</p>
          : <div className={s.grid}>{filtered.map((p,i)=><ProductCard key={p.id} p={p} idx={i}/>)}</div>
        }
      </div>

      {/* ── GENDER MODAL ── */}
      {gmOpen && (
        <div className={s.overlay} onClick={()=>setGmOpen(false)}>
          <div className={s.mbox} onClick={e=>e.stopPropagation()}>
            <button className={s.mclose} onClick={()=>setGmOpen(false)}>✕</button>
            <div className={s.gmBody}>
              <h2>{CAT_LABELS[gmCat]}</h2>
              <p>Odaberite kategoriju</p>
              <div className={s.gmChoices}>
                {['muske','zenske'].map(g=>(
                  <div key={g} className={s.gmChoice} onClick={()=>{setCurrentCat(gmCat);setCurrentGender(g);setCurrentSubcat(null);setCatSearchQ('');setGmOpen(false)}}>
                    <div className={s.gmIcon}>{g==='muske'?'👔':'👗'}</div>
                    <span className={s.gmLbl}>{g==='muske'?'Muške':'Ženske'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT DETAIL ── */}
      {pdOpen && pdProduct && (
        <div className={s.overlay} onClick={()=>setPdOpen(false)}>
          <div className={s.mbox} onClick={e=>e.stopPropagation()} style={{maxWidth:520}}>
            <button className={s.mclose} onClick={()=>setPdOpen(false)}>✕</button>
            {pdProduct.images?.length > 0 ? (
              <div className={s.galWrap}>
                <img src={pdProduct.images[galIdx]} alt={pdProduct.name} className={s.galImg}/>
                {pdProduct.images.length > 1 && <>
                  <button className={s.galPrev} onClick={()=>setGalIdx((galIdx-1+pdProduct.images.length)%pdProduct.images.length)}>‹</button>
                  <button className={s.galNext} onClick={()=>setGalIdx((galIdx+1)%pdProduct.images.length)}>›</button>
                  <div className={s.galDots}>
                    {pdProduct.images.map((_,i)=><span key={i} className={i===galIdx?s.galDotA:s.galDot} onClick={()=>setGalIdx(i)}/>)}
                  </div>
                </>}
              </div>
            ) : (
              <div className={s.pdImgPlaceholder}>
                <span>{CAT_LETTER[pdProduct.category]||'?'}</span>
              </div>
            )}
            <div className={s.pdBody}>
              <BadgePill badge={pdProduct.badge}/>
              <div className={s.pdName}>{pdProduct.name}</div>
              <div className={s.pdBrand}>{pdProduct.brand}</div>
              <div className={s.pdDesc}>{pdProduct.description}</div>
              <div className={s.pdSizesLbl}>Dostupne veličine</div>
              <div className={s.sizesRow}>{(pdProduct.sizes||[]).map(sz=><span key={sz} className={s.szBtnActive}>{sz}</span>)}</div>
              <div className={s.pdFoot}>
                <PriceDisplay price={pdProduct.price} old_price={pdProduct.old_price}/>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <button className={s.mjereBtn} onClick={()=>setMjereOpen(true)}>Tabela mjera</button>
                  <button className={s.editBtnLarge} onClick={()=>{setPdOpen(false);openEdit(pdProduct)}}>✏️ Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editOpen && editProduct && (
        <div className={s.overlay} onClick={()=>setEditOpen(false)}>
          <div className={s.mbox} onClick={e=>e.stopPropagation()} style={{maxWidth:580}}>
            <button className={s.mclose} onClick={()=>setEditOpen(false)}>✕</button>
            <div className={s.editHeader}>
              <h2>✏️ Uredi proizvod</h2>
              <p style={{color:'var(--gold)',fontFamily:'serif',fontStyle:'italic',marginTop:6}}>{editProduct.name}</p>
            </div>
            <div className={s.editForm}>
              {/* Tabs */}
              <div className={s.editTabs}>
                {['info','sizes','images'].map(t=>(
                  <button key={t} className={editTab===t?s.editTabActive:s.editTab} onClick={()=>setEditTab(t)}>
                    {t==='info'?'Informacije':t==='sizes'?'Veličine & Mjere':'Slike'}
                  </button>
                ))}
              </div>

              {editTab==='info' && <div>
                <div className={s.editRow}>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Naziv</label>
                    <input className={s.editInput} value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>
                  </div>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Brend</label>
                    <input className={s.editInput} value={editForm.brand} onChange={e=>setEditForm({...editForm,brand:e.target.value})}/>
                  </div>
                </div>
                <div className={s.editGroup}>
                  <label className={s.editLabel}>Opis</label>
                  <textarea className={s.editTextarea} value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})}/>
                </div>
                <div className={s.editRow}>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Cijena (KM)</label>
                    <input className={s.editInput} type="number" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})}/>
                  </div>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Stara cijena</label>
                    <input className={s.editInput} type="number" value={editForm.old_price} onChange={e=>setEditForm({...editForm,old_price:e.target.value})}/>
                  </div>
                </div>
                <div className={s.editRow}>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Oznaka</label>
                    <select className={s.editSelect} value={editForm.badge} onChange={e=>setEditForm({...editForm,badge:e.target.value})}>
                      <option value="">— Bez oznake —</option>
                      {Object.entries(BADGE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Podkategorija</label>
                    <input className={s.editInput} value={editForm.subcategory} onChange={e=>setEditForm({...editForm,subcategory:e.target.value})}/>
                  </div>
                </div>
              </div>}

              {editTab==='sizes' && <div>
                <label className={s.editLabel}>Dostupne veličine</label>
                <SizePicker selected={editSizes} onChange={setEditSizes}/>
                <div style={{marginTop:20}}>
                  <label className={s.editLabel}>Tabela mjera (cm)</label>
                  <div className={s.mjereTable}>
                    <div className={s.mjereHeader}><span>Veličina</span><span>Dužina (cm)</span><span>Napomena</span></div>
                    {editSizes.map(eu=>(
                      <div key={eu} className={s.mjereRow}>
                        <strong>{eu}</strong>
                        <span>{EU_TO_CM[eu]||'—'} cm</span>
                        <span style={{color:'var(--text-soft)',fontSize:'.78rem'}}>{sizeNote(eu)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>}

              {editTab==='images' && <div>
                <label className={s.editLabel}>Slike proizvoda</label>
                <div className={s.imgUpload} onClick={()=>document.getElementById('editImgFile').click()}>
                  <div>📷</div>
                  <p>Kliknite da dodate slike (JPG, PNG)</p>
                  <input id="editImgFile" type="file" accept="image/*" multiple style={{display:'none'}}
                    onChange={e=>handleImages(e.target.files, setEditImages)}/>
                </div>
                <div className={s.imgPreviews}>
                  {editImages.map((img,i)=>(
                    <div key={i} className={s.imgPreview}>
                      <img src={img} alt=""/>
                      <button className={s.removeImg} onClick={()=>setEditImages(editImages.filter((_,j)=>j!==i))}>✕</button>
                    </div>
                  ))}
                </div>
                <label className={s.editLabel} style={{marginTop:14,display:'block'}}>Ili URL slike</label>
                <div style={{display:'flex',gap:8}}>
                  <input className={s.editInput} id="editImgUrl" type="text" placeholder="https://..."/>
                  <button className={s.addUrlBtn} onClick={()=>{const u=document.getElementById('editImgUrl').value.trim();if(u){setEditImages([...editImages,u]);document.getElementById('editImgUrl').value=''}}}>Dodaj</button>
                </div>
              </div>}

              <button className={s.saveBtnPrimary} onClick={saveEdit}>💾 Sačuvaj izmjene</button>
              <button className={s.deleteBtnSecondary} onClick={deleteProduct}>🗑️ Obriši ovaj proizvod</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {addOpen && (
        <div className={s.overlay} onClick={()=>setAddOpen(false)}>
          <div className={s.mbox} onClick={e=>e.stopPropagation()} style={{maxWidth:580}}>
            <button className={s.mclose} onClick={()=>setAddOpen(false)}>✕</button>
            <div className={s.addHeader}>
              <h2>+ Dodaj novi proizvod</h2>
              <p>Popunite detalje novog proizvoda</p>
            </div>
            <div className={s.editForm}>
              <div className={s.editTabs}>
                {['info','sizes','images'].map(t=>(
                  <button key={t} className={addTab===t?s.editTabActive:s.editTab} onClick={()=>setAddTab(t)}>
                    {t==='info'?'Informacije':t==='sizes'?'Veličine':'Slike'}
                  </button>
                ))}
              </div>

              {addTab==='info' && <div>
                <div className={s.editRow}>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Naziv *</label>
                    <input className={s.editInput} value={addForm.name} onChange={e=>setAddForm({...addForm,name:e.target.value})}/>
                  </div>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Brend *</label>
                    <input className={s.editInput} value={addForm.brand} onChange={e=>setAddForm({...addForm,brand:e.target.value})}/>
                  </div>
                </div>
                <div className={s.editGroup}>
                  <label className={s.editLabel}>Opis</label>
                  <textarea className={s.editTextarea} value={addForm.description} onChange={e=>setAddForm({...addForm,description:e.target.value})}/>
                </div>
                <div className={s.editRow}>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Kategorija *</label>
                    <select className={s.editSelect} value={addForm.category} onChange={e=>setAddForm({...addForm,category:e.target.value})}>
                      <option value="">— Odaberite —</option>
                      {Object.entries(CAT_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Spol *</label>
                    <select className={s.editSelect} value={addForm.gender} onChange={e=>setAddForm({...addForm,gender:e.target.value})}>
                      <option value="">— Odaberite —</option>
                      <option value="muske">Muške</option>
                      <option value="zenske">Ženske</option>
                    </select>
                  </div>
                </div>
                <div className={s.editRow}>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Cijena (KM) *</label>
                    <input className={s.editInput} type="number" value={addForm.price} onChange={e=>setAddForm({...addForm,price:e.target.value})}/>
                  </div>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Stara cijena</label>
                    <input className={s.editInput} type="number" value={addForm.old_price} onChange={e=>setAddForm({...addForm,old_price:e.target.value})}/>
                  </div>
                </div>
                <div className={s.editRow}>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Oznaka</label>
                    <select className={s.editSelect} value={addForm.badge} onChange={e=>setAddForm({...addForm,badge:e.target.value})}>
                      <option value="">— Bez oznake —</option>
                      {Object.entries(BADGE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className={s.editGroup}>
                    <label className={s.editLabel}>Podkategorija</label>
                    <input className={s.editInput} value={addForm.subcategory} onChange={e=>setAddForm({...addForm,subcategory:e.target.value})}/>
                  </div>
                </div>
              </div>}

              {addTab==='sizes' && <div>
                <label className={s.editLabel}>Odaberite dostupne veličine</label>
                <SizePicker selected={addSizes} onChange={setAddSizes}/>
              </div>}

              {addTab==='images' && <div>
                <label className={s.editLabel}>Slike proizvoda</label>
                <div className={s.imgUpload} onClick={()=>document.getElementById('addImgFile').click()}>
                  <div>📷</div>
                  <p>Kliknite da dodate slike (JPG, PNG)</p>
                  <input id="addImgFile" type="file" accept="image/*" multiple style={{display:'none'}}
                    onChange={e=>handleImages(e.target.files, setAddImages)}/>
                </div>
                <div className={s.imgPreviews}>
                  {addImages.map((img,i)=>(
                    <div key={i} className={s.imgPreview}>
                      <img src={img} alt=""/>
                      <button className={s.removeImg} onClick={()=>setAddImages(addImages.filter((_,j)=>j!==i))}>✕</button>
                    </div>
                  ))}
                </div>
                <label className={s.editLabel} style={{marginTop:14,display:'block'}}>Ili URL slike</label>
                <div style={{display:'flex',gap:8}}>
                  <input className={s.editInput} id="addImgUrl" type="text" placeholder="https://..."/>
                  <button className={s.addUrlBtn} onClick={()=>{const u=document.getElementById('addImgUrl').value.trim();if(u){setAddImages([...addImages,u]);document.getElementById('addImgUrl').value=''}}}>Dodaj</button>
                </div>
              </div>}

              <button className={s.saveBtnPrimary} onClick={saveAdd}>+ Dodaj proizvod</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MJERE MODAL ── */}
      {mjereOpen && (
        <div className={s.overlay} onClick={()=>setMjereOpen(false)}>
          <div className={s.mbox} onClick={e=>e.stopPropagation()} style={{maxWidth:460}}>
            <button className={s.mclose} onClick={()=>setMjereOpen(false)}>✕</button>
            <div className={s.mjBody}>
              <div className={s.mjTitle}>Tabela veličina</div>
              <p className={s.mjSub}>Standardne EU veličine — dužine stopala</p>
              <div className={s.mj_table}>
                <div className={s.mjHeader}><span>Veličina</span><span>Dužina stopala</span><span>Napomena</span></div>
                {(pdProduct?.sizes||ALL_SIZES).map(eu=>(
                  <div key={eu} className={s.mjRow}>
                    <strong>{eu}</strong>
                    <span>{EU_TO_CM[eu]||'—'} cm</span>
                    <span style={{color:'var(--text-soft)',fontSize:'.75rem'}}>{sizeNote(eu)}</span>
                  </div>
                ))}
              </div>
              <button className={s.mjCloseBtn} onClick={()=>setMjereOpen(false)}>Zatvori →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUPERADMIN PANEL ── */}
      {saOpen && (
        <div className={s.overlay} onClick={()=>setSaOpen(false)}>
          <div className={s.mbox} onClick={e=>e.stopPropagation()} style={{maxWidth:520}}>
            <button className={s.mclose} onClick={()=>setSaOpen(false)}>✕</button>
            <div className={s.saHeader}>
              <h2>★ Superadmin Panel</h2>
              <p>Upravljajte adminima koji imaju pristup</p>
            </div>
            <div className={s.saBody}>
              <div className={s.saSlotsInfo}>
                <strong>{admins.length} od 3</strong> admin mjesta popunjeno.
                {admins.length < 3 && <> Možete dodati još <strong>{3-admins.length}</strong> admina.</>}
              </div>
              <div className={s.saList}>
                {admins.map(a=>(
                  <div key={a.email} className={a.role==='superadmin'?s.saCardSuper:s.saCard}>
                    <div className={s.saAvatar}>{a.email[0].toUpperCase()}</div>
                    <div className={s.saInfo}>
                      <div className={s.saRole}>{a.role==='superadmin'?'👑 Superadmin':'⚡ Admin'}</div>
                      <div className={s.saEmail}>{a.email}</div>
                      {a.email===adminEmail && <div className={s.saYou}>To ste vi</div>}
                    </div>
                    {a.role!=='superadmin' && (
                      <button className={s.saRemove} onClick={()=>saRemoveAdmin(a.email)}>Ukloni</button>
                    )}
                  </div>
                ))}
              </div>
              {admins.length < 3 && <div className={s.saAddRow}>
                <input className={s.saInput} type="email" placeholder="gmail adresa novog admina..."
                  value={saNewEmail} onChange={e=>setSaNewEmail(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&saAddAdmin()}/>
                <button className={s.saAddBtn} onClick={saAddAdmin}>Dodaj</button>
              </div>}
            </div>
          </div>
        </div>
      )}

      {/* NOTIF */}
      {notif && <div className={`${s.notif} ${s.notifShow}`}>{notif}</div>}
    </div>
  )
}
