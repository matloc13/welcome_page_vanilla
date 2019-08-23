console.log(1 + 1);
const cards = document.querySelectorAll('.anim')
const options = {
  root: null,
  rootMargin: '0px',
  threshold: .8
}

observer = new IntersectionObserver((entries, options) => {
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
cards.forEach(c => {
  observer.observe(c)
})
// observer.observe(cards)