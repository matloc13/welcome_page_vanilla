console.log(2 + 2);
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
          dd.style.animation = 'anim-dd-right 0.6s forwards ease-in-out'
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


// nav drop animation per section
const nav = document.querySelector('nav')
const sections = document.querySelectorAll('header, .bio, .archive, .contact')

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((rep) => {
    if (rep.isIntersecting) {
      nav.style.animation = 'none'
      nav.offsetHeight // force reflow to restart animation
      nav.style.animation = 'anim-nav 0.4s forwards ease-out'
    }
  })
}, { threshold: 0.1 })

sections.forEach(s => navObserver.observe(s))


// show hide showForm

const showForm = () => {

  const hidden = document.querySelector('#form')
  hidden.classList.toggle('hidden')
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