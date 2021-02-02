var socket = io()
var userInput
var name
var desc
var currentUser
const sqlite3 = require('sqlite3').verbose()

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
  slots.forEach(element => {
    updateSlot(element.id.split['-'][0], element.id.split['-'][1])
  })
})

const updateSlot = (day, slot) => {
}
