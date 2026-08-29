
// ── theme ────────────────────────────────────────────────────────────
const html = document.documentElement
const themeBtns = document.querySelectorAll('.theme-btn')

function applyTheme(theme) {
  html.dataset.theme = theme
  localStorage.setItem('theme', theme)
  const label = theme === 'dark' ? 'light' : 'dark'
  themeBtns.forEach(btn => { btn.textContent = label })
  const dropColor = theme === 'dark' ? '18,26,40' : '216,237,255'
  document.querySelectorAll('.rain-canvas').forEach(c => { c.dataset.baseColor = dropColor })
}

const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
applyTheme(savedTheme)

themeBtns.forEach(btn => btn.addEventListener('click', () => {
  applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark')
}))

const cards = document.querySelectorAll('.anim')
const title = document.querySelectorAll('.tit')

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((rep) => {
    if (rep.intersectionRatio > 0) {
      rep.target.style.animation = `anim1 2s ${rep.target.dataset.delay} forwards ease-out`
    } else {
      rep.target.style.animation = 'none'
    }
  })
})

const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(rep => {
    if (rep.intersectionRatio > 0) {
      rep.target.style.animation = `anim2 1s ${rep.target.dataset.delay} forwards ease-in`
    } else {
      rep.target.style.animation = 'none'
    }
  })
})

cards.forEach(c => cardObserver.observe(c))
title.forEach(t => titleObserver.observe(t))

// dd rise → slide right → float up
const dl = document.querySelector('dl.table');
const dds = document.querySelectorAll('dl.table dd');

const ddObserver = new IntersectionObserver((entries) => {
  entries.forEach((rep) => {
    if (rep.isIntersecting) {
      dl.style.opacity = '1'
      // dl.style.animation = 'anim-right 1s forwards ease-in-out'
      dds.forEach((dd, i) => {
        dd.style.animation = `anim-dd-rise 0.4s ${i * 0.15}s forwards ease-out`
      })
      const last = dds[dds.length - 1]
      last.addEventListener('animationend', () => {
        dds.forEach(dd => { dd.style.animation = 'anim-dd-right 1s forwards ease-in-out' })
        last.addEventListener('animationend', () => {
          dds.forEach(dd => { dd.style.animation = 'anim-dd-up 0.7s forwards ease-in' })
        }, { once: true })
      }, { once: true })
    } else {
      dl.style.opacity = '0'
      dds.forEach((dd) => {
        dd.style.animation = 'none'
        dd.style.opacity = '0'
      })
    }
  })
}, { threshold: 0.3 })

ddObserver.observe(dl)

function initRainCanvas(rainCanvas) {
  const ctx = rainCanvas.getContext('2d')
  const shadowColor = rainCanvas.dataset.shadow || 'rgba(22, 33, 48,0.1)'
  let drops = []
  let rafId = null
  let lastScroll = Date.now()
  let startTime = null

  window.addEventListener('scroll', () => { lastScroll = Date.now() })

  function initDrops() {
    const parent = rainCanvas.parentElement
    rainCanvas.width = rainCanvas.offsetWidth || parent.offsetWidth
    rainCanvas.height = rainCanvas.offsetHeight || parent.offsetHeight
    startTime = Date.now()
    drops = Array.from({ length: 90 }, () => ({
      x: Math.random() * rainCanvas.width,
      y: Math.random() * rainCanvas.height,
      r: 1.5 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.8,
      opacity: 0.35 + Math.random() * 0.45
    }))
  }

  function drawRain() {
    const elapsed = (Date.now() - startTime) / 1000
    const ramp = 0.04 + 0.96 * Math.min(1, elapsed / 18)  // crawls at 4%, full speed at 18s
    const idleSeconds = (Date.now() - lastScroll) / 1000
    const multiplier = ramp * (1 + Math.min(idleSeconds * 0.6, 5))
    const baseColor = rainCanvas.dataset.baseColor || '216,237,255'
    ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height)
    ctx.shadowColor = shadowColor
    ctx.shadowBlur = 20
    drops.forEach(d => {
      // base drop — background-matching fill
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${baseColor},${d.opacity})`
      ctx.fill()
      // highlight — small white glint at upper-left of drop
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(d.x - d.r * 0.28, d.y - d.r * 0.3, d.r * 0.38, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.88)'
      ctx.fill()
      ctx.shadowBlur = 20
      d.x += Math.sin(d.y * 0.04) * 0.4
      d.y -= d.speed * multiplier
      if (d.y < -d.r) {
        d.y = rainCanvas.height + d.r
        d.x = Math.random() * rainCanvas.width
      }
    })
    rafId = requestAnimationFrame(drawRain)
  }

  const rainObserver = new IntersectionObserver((entries) => {
    entries.forEach(rep => {
      if (rep.isIntersecting) {
        initDrops()
        drawRain()
      } else {
        cancelAnimationFrame(rafId)
        ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height)
      }
    })
  }, { threshold: 0.1 })

  rainObserver.observe(rainCanvas)
}

document.querySelectorAll('.rain-canvas').forEach(initRainCanvas)

// header canvas needs layout to be settled before offsetWidth/Height are non-zero
window.addEventListener('load', () => {
  document.querySelectorAll('.header-rain-canvas').forEach(initRainCanvas)
})

// contact title — scroll-driven left sweep capped so full string stays on screen
const contactTitle = document.querySelector('.title')
if (contactTitle) {
  const CYCLE = 1500
  const maxTravel = contactTitle.getBoundingClientRect().left
  window.addEventListener('scroll', () => {
    const t = (window.scrollY % CYCLE) / CYCLE
    const ease = (Math.cos(t * Math.PI * 2) - 1) / 2  // 0 → -1 → 0
    contactTitle.style.transform = `translate(${ease * maxTravel}px, ${ease * -50}px)`
  }, { passive: true })
}


// maps section — scroll-driven node animation with RAF-based splash
const mapsWrapper = document.querySelector('.maps-wrapper')
if (mapsWrapper) {
  const mapsCanvas = mapsWrapper.querySelector('.maps-canvas')
  const ctx2 = mapsCanvas.getContext('2d')
  const SKILL_LABELS = ['Layout Systems', 'Data Handling', 'Component Design', 'Scripting', 'Integration']
  const NODE_RADIUS = 8
  let nodes = []
  let mapsProgress = 0
  let mapsRafId = null

  function generateNodes() {
    mapsCanvas.width = mapsCanvas.offsetWidth
    mapsCanvas.height = mapsCanvas.offsetHeight
    const pad = 80
    const bandH = (mapsCanvas.height - pad * 2) / SKILL_LABELS.length
    nodes = SKILL_LABELS.map((label, i) => ({
      x: pad + Math.random() * (mapsCanvas.width - pad * 2),
      y: pad + i * bandH + Math.random() * bandH,
      label,
      splashPhase: -1,  // -1 = waiting, 0→1 = animating
      prevOpacity: 0
    }))
  }

  function nodeOpacityAt(i, progress) {
    if (i === 0) return 1
    const segProgress = Math.max(0, Math.min(1, progress - (i - 1)))
    const t = (i - 1) / (nodes.length - 2)
    const fadeStart = 0.4 + 0.6 * t
    const fadeWindow = 1.0 - fadeStart
    return fadeWindow < 0.01
      ? (segProgress >= 1 ? 1 : 0)
      : Math.max(0, Math.min(1, (segProgress - fadeStart) / fadeWindow))
  }

  function mapColors() {
    return html.dataset.theme === 'dark'
      ? { line: 'rgba(100,130,220,0.6)', node: 'rgba(180,205,255,0.9)', label: 'rgba(180,205,255,0.8)', ring: [100,130,220] }
      : { line: 'rgba(31,20,189,0.5)',   node: 'rgba(31,20,89,0.9)',    label: 'rgba(31,20,89,0.8)',    ring: [31,20,189] }
  }

  function drawMaps() {
    const progress = mapsProgress
    const completedSegments = Math.floor(progress)
    const segFraction = progress % 1
    const c = mapColors()

    nodes.forEach(n => {
      if (n.splashPhase >= 0 && n.splashPhase < 1) n.splashPhase = Math.min(1, n.splashPhase + 0.028)
    })

    ctx2.clearRect(0, 0, mapsCanvas.width, mapsCanvas.height)

    ctx2.strokeStyle = c.line
    ctx2.lineWidth = 3
    for (let i = 0; i < completedSegments && i < nodes.length - 1; i++) {
      ctx2.beginPath()
      ctx2.moveTo(nodes[i].x, nodes[i].y)
      ctx2.lineTo(nodes[i + 1].x, nodes[i + 1].y)
      ctx2.stroke()
    }
    if (completedSegments < nodes.length - 1) {
      const a = nodes[completedSegments]
      const b = nodes[completedSegments + 1]
      ctx2.beginPath()
      ctx2.moveTo(a.x, a.y)
      ctx2.lineTo(a.x + (b.x - a.x) * segFraction, a.y + (b.y - a.y) * segFraction)
      ctx2.stroke()
    }

    for (let i = 0; i < nodes.length; i++) {
      const nodeOpacity = nodeOpacityAt(i, progress)
      const n = nodes[i]

      if (nodeOpacity > 0 && n.prevOpacity === 0 && n.splashPhase === -1) n.splashPhase = 0
      n.prevOpacity = nodeOpacity

      // expanding splash ring
      if (n.splashPhase >= 0) {
        const sp = n.splashPhase
        const [r, g, b] = c.ring
        ctx2.beginPath()
        ctx2.arc(n.x, n.y, NODE_RADIUS + NODE_RADIUS * 3.5 * sp, 0, Math.PI * 2)
        ctx2.strokeStyle = `rgba(${r},${g},${b},${(1 - sp) * 0.5})`
        ctx2.lineWidth = 1.5
        ctx2.stroke()
      }

      if (nodeOpacity <= 0) continue

      // node pops in at 1.4x, settles to 1.0 as opacity reaches 1
      const scale = 1 + (1 - nodeOpacity) * 0.4
      ctx2.globalAlpha = nodeOpacity
      ctx2.save()
      ctx2.translate(n.x, n.y)
      ctx2.scale(scale, scale)
      ctx2.beginPath()
      ctx2.arc(0, 0, NODE_RADIUS, 0, Math.PI * 2)
      ctx2.fillStyle = c.node
      ctx2.fill()
      ctx2.font = '18px Hind Madurai, sans-serif'
      ctx2.fillStyle = c.label
      ctx2.textAlign = 'center'
      ctx2.fillText(n.label, 0, NODE_RADIUS + 16)
      ctx2.restore()
      ctx2.globalAlpha = 1
    }

    mapsRafId = requestAnimationFrame(drawMaps)
  }

  function onMapsScroll() {
    const top = mapsWrapper.getBoundingClientRect().top
    const scrollRange = mapsWrapper.offsetHeight - window.innerHeight
    mapsProgress = Math.max(0, Math.min(1, -top / scrollRange)) * (nodes.length - 1)
  }

  const mapsObserver = new IntersectionObserver((entries) => {
    entries.forEach(rep => {
      if (rep.isIntersecting) {
        generateNodes()
        window.addEventListener('scroll', onMapsScroll, { passive: true })
        onMapsScroll()
        mapsRafId = requestAnimationFrame(drawMaps)
      } else {
        window.removeEventListener('scroll', onMapsScroll)
        cancelAnimationFrame(mapsRafId)
        ctx2.clearRect(0, 0, mapsCanvas.width, mapsCanvas.height)
      }
    })
  }, { threshold: 0.05 })

  mapsObserver.observe(mapsWrapper)
}

// scroll arrows — up hides at top, down hides at bottom
const arrowUp = document.querySelector('.scroll-arrow--up')
const arrowDown = document.querySelector('.scroll-arrow--down')

function updateScrollArrows() {
  const atTop = window.scrollY <= 0
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
  if (arrowUp) arrowUp.classList.toggle('hidden', atTop)
  if (arrowDown) arrowDown.classList.toggle('hidden', atBottom)
}

if (arrowUp || arrowDown) {
  window.addEventListener('scroll', updateScrollArrows, { passive: true })
  updateScrollArrows()
  arrowUp?.addEventListener('click', () => window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' }))
  arrowDown?.addEventListener('click', () => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' }))
}

// footer visible only while contact section is in view
const siteFooter = document.querySelector('footer')
const contactSection = document.querySelector('#contact')

if (siteFooter && contactSection) {
  const footerVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(rep => {
      siteFooter.classList.toggle('visible', rep.isIntersecting)
    })
  }, { threshold: 0.1 })

  footerVisibilityObserver.observe(contactSection)
}

// show hide showForm

function showForm() {
  const form = document.querySelector('#form')
  const trigger = document.querySelector('.contact-trigger')
  form.classList.toggle('hidden')
  if (trigger) trigger.setAttribute('aria-expanded', String(!form.classList.contains('hidden')))
}