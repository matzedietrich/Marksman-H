var socket = io()
var userInput
var name
var desc
var currentUser

document.addEventListener('DOMContentLoaded', function () {
  userInput = document.getElementById('userInput')
  ideaName = document.getElementById('ideaName')
  ideaDesc = document.getElementById('ideaDesc')

  document.getElementById('ideaName').addEventListener('input', function () {
    console.log(ideaName.value + ' - ' + ideaDesc.value)
    if (ideaName.value && ideaDesc.value) {
      console.log('both full')
      sendIdea()
    }
  })

  document.getElementById('ideaDesc').addEventListener('input', function () {
    if (ideaName.value && ideaDesc.value) {
      console.log('both full')
      sendIdea()
    }
  })
})

const sendIdea = () => {
  console.log(currentUser)
  socket.emit('saveIdea', {
    rfid: currentUser,
    name: ideaName.value,
    desc: ideaDesc.value
  })
  console.log('saving')
}

/* 
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  }); */

socket.on('enableInput', function (rfid) {
  userInput.classList.add('enabled')
  currentUser = rfid
})

socket.on('disableInput', function () {
  userInput.classList.remove('enabled')
})
