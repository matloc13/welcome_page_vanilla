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



// show hide showForm

const showForm = () => {

  const hidden = document.querySelector('#form')
  hidden.classList.toggle('hidden')
}



window.addEventListener("load", () => {
  const cgm = fetch(`https://cgm-tracker.herokuapp.com/`)
    // .then(console.log('cgm woken up'))

  const bgg = fetch(`https://bgg-lister-client.herokuapp.com/`)
    // .then( console.log('bgg woken up'))

  const touring = fetch(`https://touring-interurban.herokuapp.com`)
    // .then( console.log('ti woken up'))

  const pi = fetch('https://personal-inventory.herokuapp.com/')
    // .then( console.log('form woken up'))
  return Promise.all([
  cgm,
  bgg, 
  touring,
  pi
  ]).then(res =>  res.forEach((ele, i) => {
    console.log( `${i + 1}: ${ele.status}`);
   
  })
)})