
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

// rain canvas
const rainCanvas = document.querySelector('.rain-canvas')
if (rainCanvas) {
  const ctx = rainCanvas.getContext('2d')
  const COLORS = ['rgba(244,246,249,0.8)', 'rgba(238,224,233,0.6)', 'rgba(216,237,255,0.7)']
  let drops = []
  let rafId = null
  let lastScroll = Date.now()

  window.addEventListener('scroll', () => { lastScroll = Date.now() })

  function initDrops() {
    rainCanvas.width = rainCanvas.offsetWidth
    rainCanvas.height = rainCanvas.offsetHeight
    drops = Array.from({ length: 90 }, () => ({
      x: Math.random() * rainCanvas.width,
      y: Math.random() * rainCanvas.height,
      r: 1.5 + Math.random() * 3,
      speed: 0.8 + Math.random() * 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }))
  }

  function drawRain() {
    const idleSeconds = (Date.now() - lastScroll) / 1000
    const multiplier = 1 + Math.min(idleSeconds * 0.6, 5)

    ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height)
    drops.forEach(d => {
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = d.color
      ctx.fill()
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

// maps section — nodes + line animation
const mapsSection = document.querySelector('#maps')
if (mapsSection) {
  const mapsCanvas = mapsSection.querySelector('.maps-canvas')
  const ctx2 = mapsCanvas.getContext('2d')
  const ICON_KEYS = ['layout', 'data', 'component', 'script', 'connect']
  const NODE_RADIUS = 8
  const LINE_SPEED = 0.018
  let nodes = []
  let progress = 0
  let mapsRafId = null

  function generateNodes() {
    mapsCanvas.width = mapsCanvas.offsetWidth
    mapsCanvas.height = mapsCanvas.offsetHeight
    const pad = 80
    nodes = ICON_KEYS.map(key => ({
      x: pad + Math.random() * (mapsCanvas.width - pad * 2),
      y: pad + Math.random() * (mapsCanvas.height - pad * 2),
      key
    }))
  }

  function drawMapFrame() {
    ctx2.clearRect(0, 0, mapsCanvas.width, mapsCanvas.height)

    const completedSegments = Math.floor(progress)
    const segFraction = progress % 1

    // draw completed line segments
    ctx2.strokeStyle = 'rgba(216,237,255,0.5)'
    ctx2.lineWidth = 1.5
    for (let i = 0; i < completedSegments && i < nodes.length - 1; i++) {
      ctx2.beginPath()
      ctx2.moveTo(nodes[i].x, nodes[i].y)
      ctx2.lineTo(nodes[i + 1].x, nodes[i + 1].y)
      ctx2.stroke()
    }

    // draw in-progress line segment
    if (completedSegments < nodes.length - 1) {
      const a = nodes[completedSegments]
      const b = nodes[completedSegments + 1]
      ctx2.beginPath()
      ctx2.moveTo(a.x, a.y)
      ctx2.lineTo(a.x + (b.x - a.x) * segFraction, a.y + (b.y - a.y) * segFraction)
      ctx2.stroke()
    }

    // draw nodes that have been reached
    const visibleCount = Math.min(Math.ceil(progress) + 1, nodes.length)
    for (let i = 0; i < visibleCount; i++) {
      const n = nodes[i]
      ctx2.beginPath()
      ctx2.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2)
      ctx2.fillStyle = 'rgba(244,246,249,0.9)'
      ctx2.fill()
      ctx2.font = '11px Hind Madurai, sans-serif'
      ctx2.fillStyle = 'rgba(216,237,255,0.8)'
      ctx2.textAlign = 'center'
      ctx2.fillText(n.key, n.x, n.y + NODE_RADIUS + 16)
    }

    progress += LINE_SPEED
    if (progress < nodes.length - 1) {
      mapsRafId = requestAnimationFrame(drawMapFrame)
    }
  }

  const mapsObserver = new IntersectionObserver((entries) => {
    entries.forEach(rep => {
      if (rep.isIntersecting) {
        cancelAnimationFrame(mapsRafId)
        generateNodes()
        progress = 0
        drawMapFrame()
      } else {
        cancelAnimationFrame(mapsRafId)
        ctx2.clearRect(0, 0, mapsCanvas.width, mapsCanvas.height)
      }
    })
  }, { threshold: 0.2 })

  mapsObserver.observe(mapsSection)
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