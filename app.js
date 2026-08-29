
const cards = document.querySelectorAll('.anim')
const title = document.querySelectorAll('.tit')
const background = document.querySelector('#archive')

const options = {
  root: null,
  rootMargin: '0px',
  threshold: .8
}

const cardObserver = new IntersectionObserver((entries, options) => {
  console.log(entries)
  entries.forEach((rep) => {
    if (rep.intersectionRatio > 0) {
      rep.target.style.animation = `anim1 2s ${rep.target.dataset.delay} forwards ease-out`
      console.log('going');
    } else {
      rep.target.style.animation = 'none'
    }
  })

})

const titleObserver = new IntersectionObserver((entries, options) => {
  entries.forEach(rep => {
    if (rep.intersectionRatio > 0) {
      rep.target.style.animation = `anim2 1s ${rep.target.dataset.delay} forwards ease-in`
    } else {
      rep.target.style.animation = 'none'
    }
  })
})

const backgroundObserver = new IntersectionObserver((entries, options) => {
  entries.forEach(rep => {
    if (rep.isIntersecting === true) {
      rep.target.style.animation = `anim3 10s ${rep.target.dataset.delay} ease-in`
    } else {
      rep.target.style.animation = 'none'
    }
  })
})


cards.forEach(c => {
  cardObserver.observe(c)
})
title.forEach(t => {
  titleObserver.observe(t)
})


// dd rise then slide right
const dl = document.querySelector('dl.table')
const dds = document.querySelectorAll('dl.table dd')

const ddObserver = new IntersectionObserver((entries) => {
  entries.forEach((rep) => {
    if (rep.isIntersecting) {
      dl.style.opacity = '1'
      dds.forEach((dd, i) => {
        dd.style.animation = `anim-dd-rise 0.4s ${i * 0.15}s forwards ease-out`
      })
      const last = dds[dds.length - 1]
      last.addEventListener('animationend', () => {
        dds.forEach((dd) => {
          dd.style.animation = 'anim-dd-right 1s forwards ease-in-out'
        })
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
  const baseColor = rainCanvas.dataset.baseColor || '244,246,249'
  let drops = []
  let rafId = null
  let lastScroll = Date.now()
  let startTime = null

  window.addEventListener('scroll', () => { lastScroll = Date.now() })

  function initDrops() {
    rainCanvas.width = rainCanvas.offsetWidth
    rainCanvas.height = rainCanvas.offsetHeight
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
      d.y += d.speed * multiplier
      if (d.y > rainCanvas.height + d.r) {
        d.y = -d.r
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

// footer visible only while contact section is in view
const bottomDock = document.querySelector('.bottom-dock')
const contactSection = document.querySelector('#contact')

if (bottomDock && contactSection) {
  const footerVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(rep => {
      if (rep.isIntersecting) {
        bottomDock.classList.add('visible')
      } else {
        bottomDock.classList.remove('visible')
        const panel = document.querySelector('#contactPanel')
        if (panel && !panel.classList.contains('hidden')) {
          panel.classList.add('hidden')
          panel.querySelectorAll('.card').forEach(card => { card.style.animation = 'none' })
        }
      }
    })
  }, { threshold: 0.1 })

  footerVisibilityObserver.observe(contactSection)
}

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

// scroll line draw
const linePath = document.querySelector('.scroll-line__path')
if (linePath) {
  const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(rep => {
      if (rep.isIntersecting) {
        const len = linePath.getTotalLength()
        linePath.style.strokeDasharray = len
        linePath.style.strokeDashoffset = len
        linePath.getBoundingClientRect()
        linePath.classList.add('drawn')
      } else {
        linePath.classList.remove('drawn')
      }
    })
  }, { threshold: 0.2 })
  lineObserver.observe(document.querySelector('.scroll-line'))
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

  function drawMaps() {
    const progress = mapsProgress
    const completedSegments = Math.floor(progress)
    const segFraction = progress % 1

    nodes.forEach(n => {
      if (n.splashPhase >= 0 && n.splashPhase < 1) n.splashPhase = Math.min(1, n.splashPhase + 0.028)
    })

    ctx2.clearRect(0, 0, mapsCanvas.width, mapsCanvas.height)

    ctx2.strokeStyle = 'rgba(31, 20, 189,0.5)'
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
        ctx2.beginPath()
        ctx2.arc(n.x, n.y, NODE_RADIUS + NODE_RADIUS * 3.5 * sp, 0, Math.PI * 2)
        ctx2.strokeStyle = `rgba(31, 20, 189, ${(1 - sp) * 0.5})`
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
      ctx2.fillStyle = 'rgba(31, 20, 89,0.9)'
      ctx2.fill()
      ctx2.font = '18px Hind Madurai, sans-serif'
      ctx2.fillStyle = 'rgba(31, 20, 89,0.8)'
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

// show hide showForm

function showForm() {
  const hidden = document.querySelector('#form')
  hidden.classList.toggle('hidden')
}

function toggleContact() {
  const panel = document.querySelector('#contactPanel')
  panel.classList.toggle('hidden')

  const cards = panel.querySelectorAll('.card')
  if (!panel.classList.contains('hidden')) {
    cards.forEach((card, i) => {
      card.style.animation = 'none'
      card.offsetHeight
      card.style.animation = `anim-card-pop 0.4s ${(cards.length - 1 - i) * 0.2}s forwards ease-out`
    })
  } else {
    cards.forEach(card => card.style.animation = 'none')
  }
}



// window.addEventListener("load", () => {
//   const cgm = fetch(`https://cgm-tracker.herokuapp.com/`)
//     // .then(console.log('cgm woken up'))

//   const bgg = fetch(`https://bgg-lister-client.herokuapp.com/`)
//     // .then( console.log('bgg woken up'))

//   const touring = fetch(`https://touring-interurban.herokuapp.com`)
//     // .then( console.log('ti woken up'))

//   const pi = fetch('https://personal-inventory.herokuapp.com/')
//     // .then( console.log('form woken up'))
//   return Promise.all([
//   cgm,
//   bgg, 
//   touring,
//   pi
//   ]).then(res =>  res.forEach((ele, i) => {
//     console.log( `${i + 1}: ${ele.status}`);
   
//   })
// )})