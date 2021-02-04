var socket = io()
var userInput
var name
var desc
var currentUser

var slots

var mo1
var mo2
var mo3
var mo4
var di1
var di2
var di3
var di4
var mi1
var mi2
var mi3
var mi4
var do1
var do2
var do3
var do4
var fr1
var fr2
var fr3
var fr4
var sa1
var sa2
var sa3
var sa4
var so1
var so2
var so3
var so4

document.addEventListener('DOMContentLoaded', function () {
  slots = document.getElementsByClassName('slot')
})

const updateSlot = slot => {}

const updateSlots = slots => {
  console.log(slots)
  slots.forEach(slot => {
    console.log(slot.S_NAME);
    let el = document.querySelector(`#${slot.S_NAME}`)
    el.getElementsByTagName('h1')[0].innerHTML = slot.NAME
    el.getElementsByTagName('p')[0].innerHTML = slot.DESC    
    el.querySelector('.card').innerHTML = slot.participants
    el.classList.remove('empty')
  });

}

socket.on('programmeUpdated', function (slot,res) {
  console.log("got event!")
  let updatedSlot = document.getElementById(slot)
  updatedSlot.getElementsByTagName('h1')[0].innerHTML = res.NAME
  updatedSlot.getElementsByTagName('p')[0].innerHTML = res.DESC
})

socket.on('getSlots', slots => updateSlots(slots))

