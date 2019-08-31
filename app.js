console.log(1 + 1);
const cards = document.querySelectorAll('.anim')
const title = document.querySelectorAll('.tit')

const options = {
  root: null,
  rootMargin: '0px',
  threshold: .8
}

const observer = new IntersectionObserver((entries, options) => {
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

const titobserver = new IntersectionObserver((entries, options) => {
  entries.forEach(rep => {
    if (rep.intersectionRatio > 0) {
      rep.target.style.animation = `anim2 1s ${rep.target.dataset.delay} forwards ease-in`
    } else {
      rep.target.style.animation = 'none'
    }
  })
})



cards.forEach(c => {
  observer.observe(c)
})
title.forEach(t => {
  titobserver.observe(t)
})

// show hide showForm

const showForm = () => {

  const hidden = document.querySelector('#form')
  hidden.classList.toggle('hidden')
}



window.addEventListener("load", () => {
  fetch(`https://cgm-tracker.herokuapp.com/`)
    .then(res => console.log('cgm woken up'))

  fetch(`https://bgg-lister-client.herokuapp.com/`)
    .then(res => console.log('bgg woken up'))

  fetch(`https://github.com/matloc13/touring-interurban`)
    .then(res => console.log('ti woken up'))

  fetch('https://personal-inventory.herokuapp.com/')
    .then(res => console.log('form woken up'))
})