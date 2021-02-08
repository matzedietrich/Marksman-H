var socket = io()
var WTInput
var WTName
var WTDesc
var WishWord
var wishesContainer
var shine
var currentUser = 777730

document.addEventListener('DOMContentLoaded', function () {
  WTInput = document.getElementById('WTInput')
  WTName = document.getElementById('WTName')
  WTDesc = document.getElementById('WTDesc')
  WishInput = document.getElementById('WishInput')
  WishWord = document.getElementById('WishWord')
  wishesContainer = document.getElementById('wishesContainer')
  shine = document.getElementById('shine')

  document.getElementById('WTName').addEventListener('input', function () {
    if (WTName.value && WTDesc.value) {
      console.log('both full')
    } else {
    }
  })

  document.getElementById('WTDesc').addEventListener('input', function () {
    if (WTName.value && WTDesc.value) {
      console.log('both full')
    } else {
    }
  })

  WishWord.addEventListener('keypress', function (event) {
    if (event.which == 13) {
      event.preventDefault()
      let wish = document.getElementById('WishWord').value.trim()
      if (wish == '') {
        return
      }
      document.getElementById('WishWord').value = ''
      console.log('submitting')
      sendWish(currentUser, wish)
    }
  })

  WTName.addEventListener('keypress', function (event) {
    if (event.which == 13) {
      event.preventDefault()
      let name = WTName.value.trim()
      let desc = WTDesc.value.trim()
      if (name == '') {
        WTName.focus()
        return
      } else {
        WTDesc.focus()
        return
      }
      sendWTDraft(currentUser, name, desc)
    }
  })

  WTDesc.addEventListener('keypress', function (event) {
    if (event.which == 13) {
      event.preventDefault()
      let name = WTName.value.trim()
      let desc = WTDesc.value.trim()
      if (name == '') {
        WTName.focus()
        return
      } else if (desc == '') {
        WTDesc.focus()
        return
      }
      WTName.value = ''
      WTDesc.value = ''
      console.log('submitting')
      sendWTDraft(currentUser, name, desc)
    }
  })
})

const sendWish = (rfid, wish) => {
  console.log(currentUser)
  socket.emit('saveWish', {
    rfid: rfid,
    word: wish
  })
  console.log('saving')
}

const sendWTDraft = (rfid, name, desc) => {
  socket.emit('saveWTDraft', {
    rfid: rfid,
    name: name,
    desc: desc
  })
  console.log('saving')
}

const updateWishes = wishes => {
  wishes.forEach(wish => {
    if (document.getElementById(wish.W_ID)) {
    } else {
      let wishContainer1 = document.createElement('div')
      wishContainer1.classList.add('wishContainer1')
      let wishContainer2 = document.createElement('div')
      wishContainer2.classList.add('wishContainer2')
      let wishEl = document.createElement('div')
      wishContainer1.id = wish.W_ID
      wishEl.classList.add('wish')
      wishEl.classList.add('little')

      let wishMoveString =
        'wishMove' + Math.floor(Math.random() * Math.floor(3) + 1)

      wishEl.classList.add(wishMoveString)
      wishEl.innerHTML = wish.WORD

      wishContainer2.appendChild(wishEl)
      wishContainer1.appendChild(wishContainer2)
      wishesContainer.appendChild(wishContainer1)
    }
  })

  let allWishContainer1 = document.getElementsByClassName('wishContainer1')
  console.log(allWishContainer1)

  updateWishPos(allWishContainer1)
}

const updateWishPos = wishes => {
  let index = 0
  numberOfWishes = wishes.length

  for (wish of wishes) {
    let angle = 180 - index * (360 / numberOfWishes)
    let radAngle = angle * (Math.PI / 180)
    cosAngle = Math.cos(radAngle)
    sinAngle = Math.sin(radAngle)
    angle *= -1
    wish.style.transform =
      'translate(' +
      parseInt(sinAngle * 100) * 2 +
      'px,' +
      parseInt(cosAngle * 100) * 2 +
      'px) rotate(' +
      angle +
      'deg)'

    index++
  }
}

socket.on('enableWTInput', function (rfid) {
  WTInput.classList.add('enabled')
  document.getElementById('WTName').focus()
  shine.style.left = 'auto'
  shine.style.right = '0px'
  shine.classList.add('appear')
  currentUser = rfid
})

socket.on('disableWTInput', function () {
  WTInput.classList.remove('enabled')
  shine.classList.remove('appear')
})

socket.on('enableWishInput', function (rfid) {
  WishInput.classList.add('enabled')
  document.getElementById('WishWord').focus()
  shine.style.right = 'auto'
  shine.style.left = '0px'
  shine.classList.add('appear')
  currentUser = rfid
})

socket.on('disableWishInput', function () {
  WishInput.classList.remove('enabled')
  shine.classList.remove('appear')
})

socket.on('getWishes', wishes => updateWishes(wishes))
