import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Design tokens ─────────────────────────────────── */
const G    = '#1B3A2D'
const GOLD = '#C8A96E'
const CREAM = '#FDF6F0'
const WA_NUMBER = '2348067132019'

/* squircle radii – mirrors CSS custom props */
const R = { xs: 8, sm: 12, md: 18, lg: 24, xl: 32, x2: 40, pill: 999 } as const

const NAV_ITEMS = ['Home', 'Atelier', 'Commissions', 'Archives'] as const
type Page = typeof NAV_ITEMS[number]

/* ─── Data ───────────────────────────────────────────── */
const MOTIFS = [
  { id:1, icon:'🎂', x:73, y:18, size:92, dur:'6.8s', delay:'0s',   rot:-14, pF:22 },
  { id:2, icon:'🧁', x:84, y:52, size:76, dur:'8.2s', delay:'1.3s', rot:9,   pF:38 },
  { id:3, icon:'🍰', x:61, y:72, size:68, dur:'7.1s', delay:'0.6s', rot:-7,  pF:18 },
  { id:4, icon:'🎂', x:22, y:62, size:54, dur:'9.0s', delay:'2.1s', rot:16,  pF:28 },
  { id:5, icon:'🧁', x:44, y:8,  size:50, dur:'6.4s', delay:'1.9s', rot:-19, pF:42 },
  { id:6, icon:'🍰', x:89, y:82, size:60, dur:'7.8s', delay:'3.2s', rot:11,  pF:20 },
  { id:7, icon:'🎂', x:14, y:30, size:46, dur:'8.6s', delay:'0.9s', rot:-4,  pF:32 },
  { id:8, icon:'🧁', x:52, y:88, size:42, dur:'7.3s', delay:'2.7s', rot:22,  pF:15 },
]

const CATALOGUE = [
  { name:'Velvet Rose Entremets',   desc:'Raspberry coulis, rose water cream, 24k gold leaf, edible flora.',    price:'₦45,000',  tag:'Signature', img:'photo-1578985545062-69928b1d9587' },
  { name:'Pistachio Opéra',         desc:'Layered joconde sponge, crème de pistache, dark feuilletine.',        price:'₦38,000',  tag:'Seasonal',  img:'photo-1563729784474-d77dbb933a9e' },
  { name:'Croquembouche Royale',    desc:'100 petit choux, spun sugar, champagne crème pâtissière.',            price:'₦120,000', tag:'Bespoke',   img:'photo-1464349095431-e9a21285b5f3' },
  { name:'Champagne Mille-Feuille', desc:'Caramelised puff, Valrhona cream, edible gold flake.',                price:'₦28,000',  tag:'Classic',   img:'photo-1571115177098-24ec42ed204d' },
  { name:'Saffron Choux Tart',      desc:'Persian saffron custard, burnt honey, candied kumquat.',              price:'₦32,000',  tag:'Limited',   img:'photo-1488477304112-4944851de03d' },
  { name:'Dark Valrhona Tower',     desc:'Guanaja 70%, salted caramel, hazelnut praline, mirror glaze.',        price:'₦55,000',  tag:'Signature', img:'photo-1565958011703-44f9829ba187' },
]

const CART_INIT = [
  { id:1, name:'Rose Velvet Entremets',   sub:'Raspberry, rose water, 24k gold leaf', price:'₦45,000',  raw:45000,  qty:1 },
  { id:2, name:'Pistachio Financier',     sub:'Brown butter, Sicilian pistachios',    price:'₦12,500',  raw:12500,  qty:2 },
  { id:3, name:'Champagne Croquembouche',sub:'Petit choux, caramel, spun sugar',      price:'₦120,000', raw:120000, qty:1 },
]

/* ─── Hooks ─────────────────────────────────────────── */
function useMagnetic(strength = 0.3) {
  const ref  = useRef<HTMLElement>(null)
  const [off, setOff] = useState({ x:0, y:0 })
  const move = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    setOff({ x:(e.clientX-(r.left+r.width/2))*strength, y:(e.clientY-(r.top+r.height/2))*strength })
  }
  const leave = () => setOff({ x:0, y:0 })
  return { ref, off, move, leave }
}

/* ─── Small shared components ───────────────────────── */
function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.3em', color: light ? 'rgba(200,169,110,0.75)' : GOLD, textTransform:'uppercase' as const, fontWeight:600, display:'block', marginBottom:10 }}>
      ✦ &nbsp; {children}
    </span>
  )
}
function Title({ children, light, italic }: { children: React.ReactNode; light?: boolean; italic?: boolean }) {
  return (
    <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle: italic ? 'italic' : 'normal', fontSize:'clamp(26px,4vw,48px)', color: light ? CREAM : G, margin:0, letterSpacing:'-0.01em', lineHeight:1.1 }}>
      {children}
    </h2>
  )
}

/* Squircle card wrapper */
function SCard({ children, style, className, onMouseOver, onMouseOut }: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>
  onMouseOut?: React.MouseEventHandler<HTMLDivElement>
}) {
  return (
    <div
      className={className}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      style={{
        background:'rgba(253,246,240,0.65)',
        backdropFilter:'blur(14px)',
        border:'1px solid rgba(200,169,110,0.18)',
        borderRadius: R.lg,
        overflow:'hidden',
        transition:'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* Squircle button */
function SBtn({
  children, onClick, onMouseEnter, onMouseLeave,
  variant = 'primary', style, className,
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  variant?: 'primary' | 'outline' | 'ghost' | 'gold' | 'wa'
  style?: React.CSSProperties
  className?: string
  type?: 'button' | 'submit'
}) {
  const base: React.CSSProperties = {
    border: 'none',
    fontFamily: "'Inter',sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    borderRadius: R.md,
    padding: '13px 26px',
    transition: 'all 0.22s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: G,         color: GOLD,              boxShadow:`0 4px 20px rgba(27,58,45,0.2)` },
    outline: { background: 'none',    color: GOLD,              border:`1px solid rgba(200,169,110,0.45)` },
    ghost:   { background: 'none',    color: G,                 border:`1px solid rgba(27,58,45,0.2)` },
    gold:    { background: GOLD,      color: G,                 boxShadow:`0 4px 16px rgba(200,169,110,0.35)` },
    wa:      { background: '#25D366', color: '#fff',            boxShadow:`0 4px 20px rgba(37,211,102,0.3)` },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  )
}

/* ─── Cake card ─────────────────────────────────────── */
function CakeCard({ cake, onCommission, setCHov }: {
  cake: typeof CATALOGUE[0]
  onCommission: () => void
  setCHov: (v: boolean) => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <SCard
      onMouseOver={() => { setHov(true); setCHov(true) }}
      onMouseOut={() => { setHov(false); setCHov(false) }}
      style={{ transform: hov ? 'translateY(-6px)' : undefined, boxShadow: hov ? '0 24px 52px rgba(27,58,45,0.13), 0 4px 14px rgba(200,169,110,0.14)' : undefined }}
    >
      <div style={{ height:200, background:`#e8d5da url(https://images.unsplash.com/${cake.img}?w=480&h=300&fit=crop&auto=format) center/cover no-repeat`, position:'relative' }}>
        <span style={{ position:'absolute', top:12, right:12, background:G, color:GOLD, fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', padding:'5px 11px', borderRadius:R.sm }}>
          {cake.tag}
        </span>
      </div>
      <div style={{ padding:'18px 20px 22px' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:G, marginBottom:5 }}>{cake.name}</div>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11.5, color:'rgba(27,58,45,0.58)', lineHeight:1.65, margin:'0 0 14px' }}>{cake.desc}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:16, color:GOLD, fontWeight:600 }}>{cake.price}</span>
          <SBtn
            variant={hov ? 'gold' : 'outline'}
            onClick={onCommission}
            onMouseEnter={() => setCHov(true)}
            onMouseLeave={() => setCHov(false)}
            style={{ padding:'7px 14px', fontSize:9 }}
          >
            Commission
          </SBtn>
        </div>
      </div>
    </SCard>
  )
}

/* ═══════════════════════════════════════════
   PAGE: HOME
   ═══════════════════════════════════════════ */
function HomePage({ loaded, mouse, onExplore, onAtelier, onAddrClick, setCHov }: {
  loaded: boolean; mouse:{x:number;y:number}
  onExplore:()=>void; onAtelier:()=>void; onAddrClick:()=>void
  setCHov:(v:boolean)=>void
}) {
  const mag = useMagnetic(0.28)
  return (
    <div className="page-in">
      {/* Floating motifs */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        {MOTIFS.map(m => (
          <div key={m.id} style={{
            position:'absolute', left:`${m.x}%`, top:`${m.y}%`, fontSize:m.size,
            opacity: loaded ? 0.48 : 0, transition:'opacity 1.4s ease', transitionDelay:m.delay,
            transform:`translateX(${mouse.x*m.pF*-0.5}px) translateY(${mouse.y*m.pF*-0.5}px)`,
            animation: loaded ? `bob ${m.dur} ${m.delay} ease-in-out infinite` : 'none',
            // @ts-ignore
            '--rot':`${m.rot}deg`,
            filter:'drop-shadow(0 8px 24px rgba(200,169,110,0.22))',
            willChange:'transform',
          }}>{m.icon}</div>
        ))}
      </div>

      {/* ── Hero ── */}
      <section className="hero-section" style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'120px 64px 80px' }}>
        <div style={{ marginBottom:22, animation: loaded ? 'fadeIn 0.6s ease 0.3s both' : 'none', opacity: loaded ? undefined : 0 }}>
          <Eyebrow>Édition Limitée · 2025</Eyebrow>
        </div>

        <div style={{ overflow:'hidden', marginBottom:4 }}>
          <h1 className="hero-title" style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:'clamp(52px,7vw,108px)', color:G, lineHeight:0.92, letterSpacing:'-0.02em', margin:0, animation: loaded ? 'revealUp 1s cubic-bezier(0.16,1,0.3,1) 0.45s both' : 'none', opacity: loaded ? undefined : 0 }}>
            Haute
          </h1>
        </div>
        <div style={{ overflow:'hidden', marginBottom:18 }}>
          <h1 className="hero-title gold-shimmer" style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(52px,7vw,108px)', lineHeight:0.92, letterSpacing:'-0.02em', margin:0, animation: loaded ? 'revealUp 1s cubic-bezier(0.16,1,0.3,1) 0.6s both' : 'none', opacity: loaded ? undefined : 0 }}>
            Pâtisserie
          </h1>
        </div>

        <div style={{ maxWidth:440, animation: loaded ? 'fadeIn 0.8s ease 1s both' : 'none', opacity: loaded ? undefined : 0 }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:18, color:'rgba(27,58,45,0.68)', lineHeight:1.65, margin:'0 0 6px' }}>
            Where confection becomes culture.
          </p>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:'rgba(27,58,45,0.4)', lineHeight:1.8, margin:0, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Bespoke · Ceremonial · Edible Architecture
          </p>
        </div>

        <div style={{ marginTop:44, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', animation: loaded ? 'fadeIn 0.8s ease 1.15s both' : 'none', opacity: loaded ? undefined : 0 }}>
          <SBtn
            ref={mag.ref as React.RefObject<HTMLButtonElement>}
            variant="primary"
            onClick={onExplore}
            onMouseEnter={() => setCHov(true)}
            onMouseLeave={() => { mag.leave(); setCHov(false) }}
            className="magnetic-btn"
            style={{ padding:'16px 36px', borderRadius:R.md, transform:`translate(${mag.off.x}px,${mag.off.y}px)` }}
          >
            Explore Commissions
          </SBtn>
          <button onClick={onAtelier} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
            style={{ background:'none', border:'none', fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:15, color:G, display:'flex', alignItems:'center', gap:8, letterSpacing:'0.03em' }}>
            Visit the Atelier <span style={{ color:GOLD, fontStyle:'normal', fontSize:18 }}>→</span>
          </button>
        </div>

        <div className="scroll-hint" style={{ position:'absolute', bottom:44, left:64, display:'flex', alignItems:'center', gap:12, animation: loaded ? 'fadeIn 0.8s ease 1.4s both' : 'none', opacity: loaded ? undefined : 0 }}>
          <div style={{ width:1, height:44, background:`linear-gradient(180deg,transparent,${GOLD})` }} />
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.25em', color:'rgba(27,58,45,0.38)', textTransform:'uppercase', writingMode:'vertical-rl' }}>Scroll to discover</span>
        </div>
      </section>

      {/* ── Featured strip ── */}
      <section className="section-pad" style={{ padding:'80px 64px', borderTop:'1px solid rgba(200,169,110,0.14)', background:'rgba(255,255,255,0.2)', position:'relative', zIndex:1 }}>
        <div style={{ marginBottom:36 }}>
          <Eyebrow>Featured Creations</Eyebrow>
          <Title>This Season's Éditions</Title>
        </div>
        <div className="grid-3col" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {CATALOGUE.slice(0,3).map(c => <CakeCard key={c.name} cake={c} onCommission={onExplore} setCHov={setCHov} />)}
        </div>
        <div style={{ marginTop:36, textAlign:'center' }}>
          <SBtn variant="outline" onClick={onAtelier} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}>
            View Full Atelier →
          </SBtn>
        </div>
      </section>

      {/* ── Find us ── */}
      <section className="find-us-strip" style={{ padding:'72px 64px', background:G, position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:32 }}>
        <div>
          <Eyebrow light>Find Us</Eyebrow>
          <Title light italic>Lagos · By Appointment</Title>
          <button onClick={onAddrClick} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
            style={{ background:'none', border:'none', padding:0, fontFamily:"'Inter',sans-serif", fontSize:13, color:'rgba(253,246,240,0.62)', marginTop:14, lineHeight:1.8, textAlign:'left', textDecoration:'underline', textDecorationColor:'rgba(200,169,110,0.38)' }}>
            5, Banjoko Olowu Street<br />Ikoyi, Lagos Island
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {['Wednesdays – Saturdays','10:00am – 5:00pm','hello@joyfulexotic.ng','+234 806 713 2019'].map(t => (
            <span key={t} style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:'rgba(253,246,240,0.5)', letterSpacing:'0.04em' }}>{t}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PAGE: ATELIER
   ═══════════════════════════════════════════ */
function AtelierPage({ onCommission, setCHov }: { onCommission:()=>void; setCHov:(v:boolean)=>void }) {
  return (
    <div className="page-in">
      <div className="atelier-header" style={{ padding:'120px 64px 52px', borderBottom:'1px solid rgba(200,169,110,0.14)' }}>
        <Eyebrow>L'Atelier · Our Studio</Eyebrow>
        <Title>Signature Éditions</Title>
        <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:16, color:'rgba(27,58,45,0.58)', marginTop:14, maxWidth:520, lineHeight:1.7 }}>
          Every piece is conceived, baked, and adorned entirely in-house. No shortcuts. No surrogates. Only craft.
        </p>
      </div>

      <div className="atelier-body" style={{ padding:'56px 64px 80px' }}>
        <div className="grid-3col" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
          {CATALOGUE.map(c => <CakeCard key={c.name} cake={c} onCommission={onCommission} setCHov={setCHov} />)}
        </div>
      </div>

      {/* Process */}
      <div className="section-pad" style={{ padding:'64px 64px', background:'rgba(27,58,45,0.03)', borderTop:'1px solid rgba(200,169,110,0.12)' }}>
        <div style={{ marginBottom:40 }}>
          <Eyebrow>The Process</Eyebrow>
          <Title>From Brief to Masterpiece</Title>
        </div>
        <div className="process-grid grid-4col" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {[
            { step:'01', title:'Consultation',    desc:'A private session to understand your occasion, taste profile, and vision.' },
            { step:'02', title:'Design Atelier',  desc:'Mood boards, flavour pairings, and a full aesthetic proposal are prepared.' },
            { step:'03', title:'Artisan Craft',   desc:'Each tier is built by hand, layer by layer, over 3–5 days in our studio.' },
            { step:'04', title:'Delivery & Setup',desc:'White-glove delivery and installation at your venue. Precision guaranteed.' },
          ].map(s => (
            <SCard key={s.step} style={{ borderRadius:R.lg, overflow:'visible' }}>
              <div style={{ padding:'26px 22px 28px' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:30, color:'rgba(200,169,110,0.3)', fontWeight:900, marginBottom:10 }}>{s.step}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:G, marginBottom:7 }}>{s.title}</div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:'rgba(27,58,45,0.52)', lineHeight:1.65, margin:0 }}>{s.desc}</p>
              </div>
            </SCard>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PAGE: COMMISSIONS
   ═══════════════════════════════════════════ */
function CommissionsPage({ onOpenCart, setCHov }: { onOpenCart:()=>void; setCHov:(v:boolean)=>void }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', occasion:'', date:'', guests:'', notes:'' })
  const [sent, setSent] = useState(false)

  const sendWA = () => {
    const msg = encodeURIComponent(
      `Hello Joyful Exotic! 🎂\n\nCommission Enquiry:\n\n👤 Name: ${form.name}\n📧 Email: ${form.email}\n📞 Phone: ${form.phone}\n🎉 Occasion: ${form.occasion}\n📅 Date needed: ${form.date}\n👥 Guests: ${form.guests}\n\n📝 Notes:\n${form.notes}\n\nLooking forward to your response!`
    )
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
    setSent(true)
  }

  const Field = ({ id, label, type='text' }: { id: keyof typeof form; label: string; type?: string }) => (
    <div>
      <label style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.22em', color:'rgba(27,58,45,0.45)', textTransform:'uppercase' as const, fontWeight:600, display:'block', marginBottom:7 }}>{label}</label>
      <input
        type={type}
        value={form[id]}
        placeholder={`${label}…`}
        onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))}
        onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
        style={{ width:'100%', background:'rgba(255,255,255,0.55)', border:'1px solid rgba(200,169,110,0.28)', borderRadius:R.sm, padding:'12px 14px', fontFamily:"'Inter',sans-serif", fontSize:13, color:G, transition:'border-color 0.2s, box-shadow 0.2s' }}
      />
    </div>
  )

  return (
    <div className="page-in">
      {/* Header */}
      <div className="commissions-header" style={{ padding:'120px 64px 48px', borderBottom:'1px solid rgba(200,169,110,0.14)' }}>
        <Eyebrow>Bespoke Commissions</Eyebrow>
        <Title>Begin Your Commission</Title>
        <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:16, color:'rgba(27,58,45,0.58)', marginTop:14, maxWidth:520, lineHeight:1.7 }}>
          Every masterpiece begins with a conversation. Share your vision and we'll craft something extraordinary.
        </p>
      </div>

      {/* Two-col body */}
      <div className="commissions-body" style={{ padding:'52px 64px 80px' }}>
        <div className="commissions-layout" style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:48, alignItems:'start' }}>

          {/* ── Form ── */}
          <div>
            {sent ? (
              <div style={{ textAlign:'center', padding:'56px 24px', background:'rgba(253,246,240,0.6)', borderRadius:R.xl, border:'1px solid rgba(200,169,110,0.15)' }}>
                <div style={{ fontSize:60, marginBottom:14, animation:'cakeFloat 3s ease-in-out infinite' }}>🎂</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:26, color:G, margin:'0 0 10px' }}>Enquiry Sent!</h3>
                <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:14, color:'rgba(27,58,45,0.58)', margin:'0 0 28px', lineHeight:1.7 }}>
                  Your details have been sent via WhatsApp.<br />We'll respond within 24 hours.
                </p>
                <SBtn variant="outline" onClick={() => setSent(false)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}>
                  New Enquiry
                </SBtn>
              </div>
            ) : (
              <>
                <div className="form-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
                  <Field id="name"     label="Full Name" />
                  <Field id="email"    label="Email Address" type="email" />
                  <Field id="phone"    label="Phone Number"  type="tel" />
                  <Field id="occasion" label="Occasion Type" />
                  <Field id="date"     label="Required Date"  type="date" />
                  <Field id="guests"   label="Number of Guests" />
                </div>
                <div style={{ marginBottom:26 }}>
                  <label style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.22em', color:'rgba(27,58,45,0.45)', textTransform:'uppercase', fontWeight:600, display:'block', marginBottom:7 }}>Vision &amp; Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes:e.target.value }))}
                    onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
                    placeholder="Describe your vision, flavour preferences, colour palette, dietary requirements…"
                    rows={5}
                    style={{ width:'100%', background:'rgba(255,255,255,0.55)', border:'1px solid rgba(200,169,110,0.28)', borderRadius:R.sm, padding:'12px 14px', fontFamily:"'Inter',sans-serif", fontSize:13, color:G, lineHeight:1.65, resize:'vertical', transition:'border-color 0.2s, box-shadow 0.2s' }}
                  />
                </div>
                <SBtn
                  variant="wa"
                  onClick={sendWA}
                  onMouseEnter={() => setCHov(true)}
                  onMouseLeave={() => setCHov(false)}
                  style={{ padding:'15px 32px', borderRadius:R.md, width:'100%', fontSize:11 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send via WhatsApp
                </SBtn>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:'rgba(27,58,45,0.38)', marginTop:10, letterSpacing:'0.02em' }}>
                  Opens WhatsApp with your details pre-filled · Replies within 24hrs
                </p>
              </>
            )}
          </div>

          {/* ── Info panel ── */}
          <div>
            <div className="commissions-info" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                { icon:'📅', title:'Lead Time',   body:'Standard commissions require 7–10 days. Couture pieces may require up to 4 weeks.' },
                { icon:'💎', title:'Pricing',      body:'Bespoke pricing from ₦45,000. Final quote provided after consultation.' },
                { icon:'🚚', title:'Delivery',     body:'White-glove delivery across Lagos Island & Mainland. Setup included.' },
                { icon:'📞', title:'Speak to Us',  body:'+234 806 713 2019 · hello@joyfulexotic.ng' },
              ].map(item => (
                <SCard key={item.title} style={{ borderRadius:R.lg }}>
                  <div style={{ padding:'20px 20px' }}>
                    <div style={{ fontSize:22, marginBottom:7 }}>{item.icon}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:14, color:G, marginBottom:4 }}>{item.title}</div>
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:'rgba(27,58,45,0.52)', lineHeight:1.65, margin:0 }}>{item.body}</p>
                  </div>
                </SCard>
              ))}
              <SBtn
                variant="outline"
                onClick={onOpenCart}
                onMouseEnter={() => setCHov(true)}
                onMouseLeave={() => setCHov(false)}
                style={{ width:'100%', justifyContent:'center' }}
              >
                View Your Cart →
              </SBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PAGE: ARCHIVES
   ═══════════════════════════════════════════ */
function ArchivesPage({ setCHov }: { setCHov:(v:boolean)=>void }) {
  const [vol, setVol] = useState('Vol. III · 2024')

  const volumes: Record<string, { caption:string; img:string; label:string }[]> = {
    'Vol. I · 2022': [
      { caption:'The First Rose',      img:'photo-1578985545062-69928b1d9587', label:'Commission No. 001' },
      { caption:'Golden Beginnings',   img:'photo-1464349095431-e9a21285b5f3', label:'Commission No. 008' },
      { caption:'Midsummer Dream',     img:'photo-1488477304112-4944851de03d', label:'Commission No. 014' },
      { caption:'The Ivory Tower',     img:'photo-1571115177098-24ec42ed204d', label:'Commission No. 021' },
    ],
    'Vol. II · 2023': [
      { caption:'Sakura Season',       img:'photo-1563729784474-d77dbb933a9e', label:'Commission No. 022' },
      { caption:'Dark Chocolate Opus', img:'photo-1565958011703-44f9829ba187', label:'Commission No. 031' },
      { caption:'Pearl & Champagne',   img:'photo-1578985545062-69928b1d9587', label:'Commission No. 035' },
      { caption:'Macarons en Masse',   img:'photo-1464349095431-e9a21285b5f3', label:'Commission No. 038' },
    ],
    'Vol. III · 2024': [
      { caption:'Tropical Serenade',   img:'photo-1488477304112-4944851de03d', label:'Commission No. 039' },
      { caption:'Forest Entremets',    img:'photo-1571115177098-24ec42ed204d', label:'Commission No. 040' },
      { caption:'The Croquembouche',   img:'photo-1563729784474-d77dbb933a9e', label:'Commission No. 041' },
      { caption:'Commission 042',      img:'photo-1565958011703-44f9829ba187', label:'Commission No. 042 — Classified' },
    ],
  }

  return (
    <div className="page-in">
      <div className="archives-header" style={{ padding:'120px 64px 48px', background:G }}>
        <Eyebrow light>Archives</Eyebrow>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(30px,5vw,56px)', color:CREAM, margin:'8px 0 0', letterSpacing:'-0.01em' }}>
          Every cake, a memoir.
        </h2>
        <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:14, color:'rgba(253,246,240,0.48)', marginTop:10, lineHeight:1.7 }}>
          A curated record of every commission that has left our atelier.
        </p>
        <div className="vol-tabs" style={{ display:'flex', gap:10, marginTop:36, flexWrap:'wrap' }}>
          {Object.keys(volumes).map(v => (
            <button key={v} onClick={() => setVol(v)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
              style={{ background: vol===v ? GOLD : 'none', border:`1px solid ${vol===v ? GOLD : 'rgba(200,169,110,0.35)'}`, borderRadius:R.sm, padding:'9px 18px', fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.16em', color: vol===v ? G : 'rgba(200,169,110,0.65)', textTransform:'uppercase', transition:'all 0.25s' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="archives-body" style={{ padding:'52px 64px 72px' }}>
        <div className="archives-grid grid-4col" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }} key={vol}>
          {volumes[vol].map(item => (
            <div key={item.caption} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
              className="page-in"
              style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', borderRadius:R.lg, background:'#e8d5da' }}>
              <img
                src={`https://images.unsplash.com/${item.img}?w=320&h=420&fit=crop&auto=format`}
                alt={item.caption}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.5s ease' }}
                onMouseOver={e => { (e.currentTarget as HTMLImageElement).style.transform='scale(1.07)' }}
                onMouseOut={e => { (e.currentTarget as HTMLImageElement).style.transform='' }}
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 45%,rgba(10,20,14,0.8) 100%)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'14px 16px 18px' }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:'0.2em', color:GOLD, textTransform:'uppercase', marginBottom:3 }}>{item.label}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:14, color:CREAM, lineHeight:1.3 }}>{item.caption}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="section-pad stats-row" style={{ padding:'56px 64px', borderTop:'1px solid rgba(200,169,110,0.14)', display:'flex', gap:48, flexWrap:'wrap' }}>
        {[
          { val:'042+', label:'Commissions Completed' },
          { val:'3',    label:'Years of Artisan Craft' },
          { val:'100%', label:'Bespoke, Always' },
          { val:'0',    label:'Compromises Made' },
        ].map(s => (
          <div key={s.label}>
            <div className="gold-shimmer" style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(30px,5vw,40px)', marginBottom:5 }}>{s.val}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, letterSpacing:'0.2em', color:'rgba(27,58,45,0.45)', textTransform:'uppercase', fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   ROOT APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [loaded,   setLoaded]   = useState(false)
  const [page,     setPage]     = useState<Page>('Home')
  const [hovNav,   setHovNav]   = useState<string|null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [sideOpen, setSideOpen] = useState(false)
  const [items,    setItems]    = useState(CART_INIT)
  const [cursor,   setCursor]   = useState({ x:-300, y:-300 })
  const [cHov,     setCHov]     = useState(false)
  const [mouse,    setMouse]    = useState({ x:0, y:0 })
  const [addrM,    setAddrM]    = useState(false)
  const [vipM,     setVipM]     = useState(false)
  const [confetti, setConfetti] = useState<{id:number;x:number;y:number;vx:number;vy:number;color:string;r:number}[]>([])
  const [note,     setNote]     = useState('')
  const cartMag = useMagnetic(0.38)

  useEffect(() => { setTimeout(() => setLoaded(true), 60) }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      setCursor({ x:e.clientX, y:e.clientY })
      setMouse({ x:(e.clientX/window.innerWidth-0.5)*2, y:(e.clientY/window.innerHeight-0.5)*2 })
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  const go = useCallback((p: Page) => {
    setPage(p); setSideOpen(false)
    window.scrollTo({ top:0, behavior:'smooth' })
  }, [])

  const boom = useCallback(() => {
    const cols = ['#C8A96E','#FFE08A','#1B3A2D','#F8C1D0','#fff','#FFD700','#E8A0BF']
    setConfetti(Array.from({length:56},(_,i) => ({ id:i, x:30+Math.random()*40, y:20+Math.random()*40, vx:(Math.random()-0.5)*20, vy:-(8+Math.random()*16), color:cols[i%cols.length], r:Math.random()*360 })))
    setTimeout(() => setConfetti([]), 2800)
  }, [])

  const openAddr = () => { setAddrM(true); boom() }
  const qty   = items.reduce((s,i) => s+i.qty, 0)
  const total = items.reduce((s,i) => s+i.raw*i.qty, 0)
  const totalFmt = `₦${total.toLocaleString()}`

  const rmItem = (id:number) => setItems(p => p.filter(i=>i.id!==id))
  const adjQty = (id:number, d:number) => setItems(p => p.map(i => i.id===id ? {...i,qty:Math.max(1,i.qty+d)} : i))

  const checkoutWA = () => {
    const lines = items.map(i=>`• ${i.name} ×${i.qty} — ${i.price}`).join('\n')
    const msg = encodeURIComponent(`Hello Joyful Exotic! 🎂\n\nOrder Request:\n\n${lines}\n\nTotal: ${totalFmt}${note?`\n\nNotes: ${note}`:''}\n\nPlease confirm availability. Thank you!`)
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  const SW = 260

  /* ── Sidebar content (shared desktop + mobile) ── */
  const SideContent = () => (
    <>
      {/* Logo */}
      <div style={{ marginBottom:44 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:10, letterSpacing:'0.22em', color:GOLD, textTransform:'uppercase', marginBottom:4 }}>Joyful Exotic</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:20, color:G, letterSpacing:'0.04em', lineHeight:1.15 }}>
          Cake <span style={{ color:GOLD }}>&amp;</span> Creams
        </div>
        <div style={{ width:28, height:1.5, background:`linear-gradient(90deg,${GOLD},transparent)`, marginTop:10 }} />
      </div>

      {/* Nav */}
      <nav style={{ flex:1 }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:'0.24em', color:'rgba(27,58,45,0.38)', textTransform:'uppercase', marginBottom:16 }}>Navigation</div>
        <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:2 }}>
          {NAV_ITEMS.map(item => {
            const active = page===item
            const hov    = hovNav===item
            return (
              <li key={item} style={{ position:'relative' }}>
                <button
                  onClick={() => go(item)}
                  onMouseEnter={() => { setHovNav(item); setCHov(true) }}
                  onMouseLeave={() => { setHovNav(null); setCHov(false) }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 0 11px 22px', background:'none', border:'none', fontFamily:"'Playfair Display',serif", fontSize: active ? 17 : 15, fontStyle: active ? 'italic' : 'normal', fontWeight: active ? 700 : 400, color: active ? G : 'rgba(27,58,45,0.6)', letterSpacing:'0.03em', position:'relative', transition:'all 0.3s', textAlign:'left' }}>
                  <span style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width: active ? 14 : hov ? 8 : 0, height:1.5, background:GOLD, transition:'width 0.3s cubic-bezier(0.23,1,0.32,1)', opacity: active||hov ? 1 : 0 }} />
                  {item}
                  {(item==='Atelier'||item==='Commissions') && (hov||active) && (
                    <span style={{ fontSize:12, animation:'whisIn 0.3s ease both', marginLeft:'auto', paddingRight:4 }}>
                      {item==='Atelier' ? '🥄' : '📋'}
                    </span>
                  )}
                </button>
                {active && <div style={{ position:'absolute', left:-32, top:0, bottom:0, width:2, background:`linear-gradient(180deg,transparent,${GOLD},transparent)`, borderRadius:1 }} />}
              </li>
            )
          })}
        </ul>

        {/* Commission 042 badge */}
        <div style={{ marginTop:24 }}>
          <button
            onClick={() => setVipM(true)}
            onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
            style={{ background:'none', border:`1px solid rgba(200,169,110,0.32)`, borderRadius:R.md, padding:'10px 14px', width:'100%', textAlign:'left', transition:'border-color 0.2s' }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:'0.2em', color:GOLD, fontWeight:600, textTransform:'uppercase' }}>Commission No.</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:G, fontStyle:'italic' }}>042</div>
          </button>
        </div>
      </nav>

      {/* Contact */}
      <div style={{ borderTop:'1px solid rgba(200,169,110,0.16)', paddingTop:20 }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, letterSpacing:'0.2em', color:'rgba(27,58,45,0.36)', textTransform:'uppercase', marginBottom:10 }}>Find Us</div>
        <button onClick={openAddr} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
          style={{ background:'none', border:'none', padding:0, textAlign:'left', fontFamily:"'Inter',sans-serif", fontSize:11, color:G, lineHeight:1.7, textDecoration:'underline', textDecorationColor:'rgba(200,169,110,0.38)' }}>
          5, Banjoko Olowu Street<br /><span style={{ color:'rgba(27,58,45,0.48)' }}>Lagos · By Appt.</span>
        </button>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:'rgba(27,58,45,0.48)', marginTop:8, lineHeight:1.7 }}>
          hello@joyfulexotic.ng<br />+234 806 713 2019
        </div>
      </div>
    </>
  )

  /* ── Cart pill button ── */
  const CartPill = ({ mag }: { mag: ReturnType<typeof useMagnetic> }) => (
    <button
      ref={mag.ref as React.RefObject<HTMLButtonElement>}
      onMouseMove={mag.move as unknown as React.MouseEventHandler<HTMLButtonElement>}
      onMouseLeave={() => { mag.leave(); setCHov(false) }}
      onMouseEnter={() => setCHov(true)}
      onClick={() => setCartOpen(true)}
      className="magnetic-btn"
      style={{ display:'flex', alignItems:'center', gap:8, background:G, border:'none', borderRadius:R.pill, padding:'9px 18px', transform:`translate(${mag.off.x}px,${mag.off.y}px)`, animation:'goldenPulse 2.4s ease infinite' }}>
      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'rgba(200,169,110,0.85)', textTransform:'uppercase' }}>Cart</span>
      <span style={{ background:GOLD, color:G, borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, flexShrink:0 }}>{qty}</span>
    </button>
  )

  return (
    <>
      {/* Cursor */}
      <div className={`cursor-dot${cHov?' hovering':''}`} style={{ left:cursor.x, top:cursor.y }} />

      {/* BG glow */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:`radial-gradient(ellipse 70% 55% at 65% 40%,rgba(200,169,110,0.13) 0%,transparent 65%),radial-gradient(ellipse 50% 40% at 20% 70%,rgba(248,193,208,0.35) 0%,transparent 60%)`,
        animation: loaded ? 'bgGlow 1.4s ease both' : 'none' }} />

      {/* ══════ MOBILE TOP BAR ══════ */}
      <div className="mobile-topbar" style={{ position:'fixed', top:0, left:0, right:0, height:62, zIndex:200, background:'rgba(247,228,233,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(200,169,110,0.14)', alignItems:'center', justifyContent:'space-between', padding:'0 18px', gap:12 }}>
        {/* Hamburger */}
        <button onClick={() => setSideOpen(v=>!v)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
          style={{ background:'none', border:'none', display:'flex', flexDirection:'column', gap:5, padding:'8px 6px', justifyContent:'center', flexShrink:0 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ display:'block', width:22, height:1.5, background:G, borderRadius:1, transition:'all 0.3s ease',
              transform: sideOpen ? (i===0 ? 'translateY(6.5px) rotate(45deg)' : i===2 ? 'translateY(-6.5px) rotate(-45deg)' : undefined) : undefined,
              opacity: sideOpen && i===1 ? 0 : 1, scaleX: sideOpen && i===1 ? 0 : 1 }} />
          ))}
        </button>
        {/* Logo */}
        <button onClick={() => go('Home')} style={{ background:'none', border:'none', fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:15, color:G, letterSpacing:'0.03em', flexShrink:0 }}>
          Cake <span style={{ color:GOLD }}>&amp;</span> Creams
        </button>
        {/* Cart */}
        <CartPill mag={cartMag} />
      </div>

      {/* ══════ MOBILE DRAWER ══════ */}
      {sideOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:190 }}>
          <div onClick={() => setSideOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(27,58,45,0.28)', backdropFilter:'blur(3px)' }} />
          <div style={{ position:'absolute', top:0, left:0, bottom:0, width:SW, background:'rgba(247,228,233,0.97)', backdropFilter:'blur(28px)', borderRight:`1px solid rgba(200,169,110,0.18)`, display:'flex', flexDirection:'column', padding:'72px 28px 36px', animation:'drawerIn 0.4s cubic-bezier(0.16,1,0.3,1) both', overflowY:'auto' }}>
            <SideContent />
          </div>
        </div>
      )}

      <div style={{ display:'flex', minHeight:'100vh', position:'relative', zIndex:1 }}>
        {/* ══════ DESKTOP SIDEBAR ══════ */}
        <aside className="desktop-sidebar" style={{ width:SW, minHeight:'100vh', position:'fixed', top:0, left:0, display:'flex', flexDirection:'column', padding:'44px 28px', zIndex:100, background:'rgba(247,228,233,0.78)', backdropFilter:'blur(22px)', borderRight:'1px solid rgba(200,169,110,0.16)', animation: loaded ? 'sidebarIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both' : 'none', overflowY:'auto' }}>
          <SideContent />
        </aside>

        {/* ══════ MAIN ══════ */}
        <main className="main-offset" style={{ marginLeft:SW, flex:1, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
          {/* Desktop topbar */}
          <div className="desktop-topbar" style={{ position:'fixed', top:0, left:SW, right:0, height:68, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 44px', zIndex:90, background:'rgba(247,228,233,0.65)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(200,169,110,0.1)', animation: loaded ? 'fadeIn 0.6s ease 0.4s both' : 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, letterSpacing:'0.22em', color:'rgba(27,58,45,0.42)', textTransform:'uppercase', fontWeight:500 }}>
                Haute Pâtisserie · Lagos
              </span>
              <CartPill mag={cartMag} />
            </div>
          </div>

          {/* Page content */}
          <div style={{ paddingTop:0, flex:1 }} key={page}>
            {page==='Home'        && <HomePage loaded={loaded} mouse={mouse} onExplore={() => go('Commissions')} onAtelier={() => go('Atelier')} onAddrClick={openAddr} setCHov={setCHov} />}
            {page==='Atelier'     && <AtelierPage onCommission={() => go('Commissions')} setCHov={setCHov} />}
            {page==='Commissions' && <CommissionsPage onOpenCart={() => setCartOpen(true)} setCHov={setCHov} />}
            {page==='Archives'    && <ArchivesPage setCHov={setCHov} />}
          </div>

          {/* Footer */}
          <footer className="footer-pad" style={{ padding:'32px 64px', borderTop:'1px solid rgba(200,169,110,0.13)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, background:'rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:13, color:'rgba(27,58,45,0.38)' }}>© 2025 Joyful Exotic Cake &amp; Creams · Lagos</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.22em', color:GOLD, textTransform:'uppercase' }}>Crafted with Gold Leaf &amp; Obsession</span>
          </footer>
        </main>
      </div>

      {/* ══════ CART PANEL ══════ */}
      {cartOpen && (
        <div className="cart-outer" style={{ position:'fixed', inset:0, zIndex:300, display:'flex' }}>
          <div onClick={() => setCartOpen(false)} style={{ flex:1, background:'rgba(27,58,45,0.24)', backdropFilter:'blur(3px)' }} />
          <div className="cart-panel" style={{ width:420, minHeight:'100vh', background:'rgba(253,246,240,0.9)', backdropFilter:'blur(36px) saturate(200%)', borderLeft:'1px solid rgba(200,169,110,0.28)', borderRadius:`${R.xl}px 0 0 ${R.xl}px`, display:'flex', flexDirection:'column', animation:'cartIn 0.5s cubic-bezier(0.16,1,0.3,1) both', boxShadow:'-20px 0 60px rgba(27,58,45,0.1)' }}>
            {/* Header */}
            <div style={{ padding:'32px 32px 20px', borderBottom:'1px solid rgba(200,169,110,0.16)', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.25em', color:GOLD, textTransform:'uppercase', fontWeight:600, marginBottom:5 }}>✦ &nbsp; Votre Sélection</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:26, color:G, margin:0 }}>Your Cart</h3>
              </div>
              <button onClick={() => setCartOpen(false)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
                style={{ background:'none', border:'1px solid rgba(200,169,110,0.32)', borderRadius:R.pill, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:G, flexShrink:0 }}>✕</button>
            </div>

            {/* Items */}
            <div style={{ flex:1, overflowY:'auto', padding:'14px 32px' }}>
              {items.length===0 ? (
                <div style={{ textAlign:'center', padding:'48px 0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🧁</div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:14, color:'rgba(27,58,45,0.48)' }}>Your cart is empty.</p>
                </div>
              ) : items.map(item => (
                <div key={item.id} style={{ display:'flex', gap:12, padding:'14px 0', borderBottom:'1px solid rgba(200,169,110,0.1)' }}>
                  <div style={{ width:48, height:48, background:'rgba(200,169,110,0.1)', borderRadius:R.md, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🎂</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:13, color:G, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:'rgba(27,58,45,0.45)', marginBottom:8 }}>{item.sub}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <div style={{ display:'flex', alignItems:'center', border:'1px solid rgba(200,169,110,0.28)', borderRadius:R.sm, overflow:'hidden' }}>
                        {[-1,1].map(d => (
                          <button key={d} onClick={() => adjQty(item.id,d)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
                            style={{ background:'none', border:'none', width:26, height:26, fontSize:14, color:G, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {d===-1?'−':'+'}
                          </button>
                        ))}
                        <span style={{ width:26, textAlign:'center', fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600, color:G, borderLeft:'1px solid rgba(200,169,110,0.28)', borderRight:'1px solid rgba(200,169,110,0.28)', lineHeight:'26px' }}>{item.qty}</span>
                      </div>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:14, color:GOLD, fontWeight:600, marginLeft:'auto' }}>{item.price}</span>
                      <button onClick={() => rmItem(item.id)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
                        style={{ background:'none', border:'none', fontSize:12, color:'rgba(27,58,45,0.3)', padding:2 }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding:'18px 32px 32px', borderTop:'1px solid rgba(200,169,110,0.16)' }}>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.2em', color:'rgba(27,58,45,0.42)', textTransform:'uppercase', fontWeight:600, display:'block', marginBottom:7 }}>Atelier Notes</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
                  placeholder="Flavour preferences, dietary notes, occasion details…" rows={3}
                  style={{ width:'100%', background:'rgba(255,255,255,0.55)', border:'1px solid rgba(200,169,110,0.26)', borderRadius:R.sm, padding:'10px 12px', fontFamily:"'Inter',sans-serif", fontSize:12, color:G, lineHeight:1.6, resize:'none', transition:'border-color 0.2s, box-shadow 0.2s' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, letterSpacing:'0.14em', color:'rgba(27,58,45,0.48)', textTransform:'uppercase', fontWeight:500 }}>Total</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:22, color:G, fontWeight:700 }}>{totalFmt}</span>
              </div>
              <SBtn variant="wa" onClick={checkoutWA} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)}
                style={{ width:'100%', padding:'14px', borderRadius:R.md, fontSize:11 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Checkout via WhatsApp
              </SBtn>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:'rgba(27,58,45,0.38)', marginTop:9, textAlign:'center', letterSpacing:'0.02em' }}>
                Opens WhatsApp · +234 806 713 2019
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════ ADDRESS EASTER EGG ══════ */}
      {addrM && (
        <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {confetti.map(c => (
            <div key={c.id} style={{ position:'fixed', left:`${c.x}%`, top:`${c.y}%`, width:8, height:8, borderRadius: c.id%3===0 ? '50%' : R.xs, background:c.color, pointerEvents:'none', zIndex:500,
              // @ts-ignore
              '--cx':`${c.vx*14}px`, '--cy':`${c.vy*14}px`, '--cr':`${c.r}deg`,
              animation:`confettiFall 1.8s ${c.id*0.018}s cubic-bezier(0.25,0.46,0.45,0.94) both` }} />
          ))}
          <div onClick={() => setAddrM(false)} style={{ position:'absolute', inset:0, background:'rgba(27,58,45,0.42)', backdropFilter:'blur(6px)' }} />
          <div className="modal-box" style={{ position:'relative', background:'rgba(253,246,240,0.96)', backdropFilter:'blur(32px)', border:'1px solid rgba(200,169,110,0.38)', borderRadius:R.x2, padding:'44px 44px 38px', maxWidth:400, width:'90vw', textAlign:'center', animation:'modalPop 0.55s cubic-bezier(0.16,1,0.3,1) both', boxShadow:`0 32px 80px rgba(27,58,45,0.18)` }}>
            <div style={{ fontSize:68, marginBottom:4, animation:'cakeFloat 3s ease-in-out infinite', filter:'drop-shadow(0 8px 20px rgba(200,169,110,0.35))' }}>🍰</div>
            <div style={{ fontSize:28, marginBottom:16, animation:'goldenPulse 1.8s ease infinite', display:'inline-block' }}>📍</div>
            <Eyebrow>You Found Us</Eyebrow>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:23, color:G, margin:'0 0 10px', letterSpacing:'-0.01em' }}>5, Banjoko Olowu Street</h3>
            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:13, color:'rgba(27,58,45,0.58)', lineHeight:1.7, margin:'0 0 22px' }}>
              Ikoyi, Lagos Island<br />Open by appointment only.<br /><span style={{ color:GOLD }}>Wed – Sat · 10am – 5pm</span>
            </p>
            <div style={{ background:`linear-gradient(135deg,${G},#2D5A45)`, borderRadius:R.md, padding:'13px 18px', marginBottom:18 }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:'0.2em', color:GOLD, textTransform:'uppercase', fontWeight:600, marginBottom:3 }}>GPS</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:13, color:'rgba(253,246,240,0.78)' }}>6.4498° N, 3.4421° E</div>
            </div>
            <SBtn variant="outline" onClick={() => setAddrM(false)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)} style={{ borderRadius:R.sm }}>
              Close
            </SBtn>
          </div>
        </div>
      )}

      {/* ══════ VIP EASTER EGG ══════ */}
      {vipM && (
        <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div onClick={() => setVipM(false)} style={{ position:'absolute', inset:0, background:'rgba(8,18,12,0.74)', backdropFilter:'blur(8px)' }} />
          <div className="modal-box" style={{ position:'relative', background:`linear-gradient(145deg,rgba(27,58,45,0.98),rgba(16,36,24,0.99))`, border:'1px solid rgba(200,169,110,0.38)', borderRadius:R.x2, padding:'48px 44px 40px', maxWidth:460, width:'100%', textAlign:'center', animation:'modalPop 0.55s cubic-bezier(0.16,1,0.3,1) both', boxShadow:`0 0 0 1px rgba(200,169,110,0.14), 0 40px 100px rgba(0,0,0,0.55)`, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ width:48, height:1, background:`linear-gradient(90deg,transparent,${GOLD},transparent)`, margin:'0 auto 22px' }} />
            <div className="gold-shimmer" style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:'0.35em', fontWeight:700, textTransform:'uppercase', marginBottom:12 }}>✦ &nbsp; VIP Reserve &nbsp; ✦</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:28, color:CREAM, margin:'0 0 4px', letterSpacing:'-0.01em' }}>Commission No. 042</h3>
            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:12, color:'rgba(253,246,240,0.36)', margin:'0 0 28px', letterSpacing:'0.04em' }}>Private Reserve · By Introduction Only</p>
            {[
              { name:'Couture Wedding Tier',  desc:'Fully bespoke 5-tier, gold & floral',       price:'From ₦850,000' },
              { name:'Private Dégustation',   desc:'In-atelier tasting for up to 6 guests',     price:'From ₦120,000' },
              { name:'Corporate Showpiece',   desc:'Branded centrepiece for events & launches', price:'From ₦300,000' },
              { name:'Anniversary Archive',   desc:'Annual commission, recreated each year',    price:'From ₦200,000' },
            ].map((item,i,arr) => (
              <div key={item.name} style={{ borderBottom: i<arr.length-1 ? '1px solid rgba(200,169,110,0.1)' : 'none', padding:'13px 0', display:'flex', gap:12, textAlign:'left', alignItems:'flex-start' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:14, color:CREAM, marginBottom:2 }}>{item.name}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:'rgba(253,246,240,0.4)' }}>{item.desc}</div>
                </div>
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:12, color:GOLD, fontWeight:600, whiteSpace:'nowrap', paddingTop:2 }}>{item.price}</span>
              </div>
            ))}
            <div style={{ marginTop:26, display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <SBtn variant="gold" onClick={() => { setVipM(false); go('Commissions') }} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)} style={{ borderRadius:R.md }}>
                Request Access
              </SBtn>
              <SBtn variant="outline" onClick={() => setVipM(false)} onMouseEnter={() => setCHov(true)} onMouseLeave={() => setCHov(false)} style={{ borderRadius:R.md, borderColor:'rgba(200,169,110,0.28)', color:'rgba(200,169,110,0.65)' }}>
                Close
              </SBtn>
            </div>
            <div style={{ width:48, height:1, background:`linear-gradient(90deg,transparent,${GOLD},transparent)`, margin:'26px auto 0' }} />
          </div>
        </div>
      )}
    </>
  )
}
