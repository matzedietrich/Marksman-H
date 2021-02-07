var socket = io()
var WTInput
var WTName
var WTDesc
var currentUser

document.addEventListener('DOMContentLoaded', function () {
  WTInput = document.getElementById('WTInput')
  WTName = document.getElementById('WTName')
  WTDesc = document.getElementById('WTDesc')
  WishInput = document.getElementById('WishInput')
  WishWord = document.getElementById('WishWord')

  document.getElementById('WTName').addEventListener('input', function () {
    console.log(WTName.value + ' - ' + WTDesc.value)
    if (WTName.value && WTDesc.value) {
      console.log('both full')
      sendWTDraft()
    }
  })

  document.getElementById('WTDesc').addEventListener('input', function () {
    if (WTName.value && WTDesc.value) {
      console.log('both full')
      sendWTDraft()
    }
  })
})

const sendWTDraft = () => {
  console.log(currentUser)
  socket.emit('saveWTDraft', {
    rfid: currentUser,
    name: WTName.value,
    desc: WTDesc.value
  })
  console.log('saving')
}


socket.on('enableWTInput', function (rfid) {
  WTInput.classList.add('enabled')
  document.getElementById('WTName').focus();
  currentUser = rfid
  console.log(currentUser)
})

socket.on('disableWTInput', function () {
  WTInput.classList.remove('enabled')
})

socket.on('enableWishInput', function (rfid) {
  WishInput.classList.add('enabled')
  document.getElementById('WishWord').focus();
  currentUser = rfid
  console.log(currentUser)
})

socket.on('disableWishInput', function () {
  WishInput.classList.remove('enabled')
})
