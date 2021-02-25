var socket = io()
var userInput
var name
var desc
var currentUser
var slots
var cards

//get DOM Elements on load
document.addEventListener('DOMContentLoaded', function () {
  slots = document.getElementsByClassName('slot')
  cards = document.getElementsByClassName('card')

  for (let card of cards) {
    card.addEventListener('animationend', function () {
      card.parentNode.classList.remove('added')
    })
  }
})

//update slots when programme was updated
const updateSlots = slots => {
  console.log(slots)
  slots.forEach(slot => {
    let el = document.querySelector(`#${slot.S_NAME}`)
    if (slot.participants > 0) {
      el.getElementsByTagName('h1')[0].innerHTML = slot.NAME
      el.getElementsByTagName('p')[0].innerHTML = slot.DESC
      el.querySelector('.card').innerHTML = slot.participants
      el.classList.remove('empty')
      el.classList.add('added')
      el.classList.add('created')
    } else {
      if (!el.classList.contains('empty')) {
        el.classList.add('empty')
        el.classList.remove('added')
        el.classList.remove('created')

        el.getElementsByTagName('h1')[0].innerHTML = ''
        el.getElementsByTagName('p')[0].innerHTML = ''
        el.querySelector('.card').innerHTML = ''
      }
    }
  })
}

socket.on('getSlots', slots => updateSlots(slots))
