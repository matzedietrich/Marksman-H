var socket = io()
var WTInput
var WTName
var WTDesc
var WishWord
var wishesContainer
var shine
var currentUser


//focus input field
const focus = ID => {
  console.log(ID)
  document.getElementById(ID).focus()
  let numberString = ID + '_Number'
  document.getElementById(numberString).classList.add('activeInput')

  if (ID == 'WTName') {
    WTDesc_Number.classList.remove('activeInput')
  } else if ((ID = 'WTDesc')) {
    WTName_Number.classList.remove('activeInput')
  }
}

//find DOM Elements when loaded
document.addEventListener('DOMContentLoaded', function () {
  WTInput = document.getElementById('WTInput')
  WTName = document.getElementById('WTName')
  WTDesc = document.getElementById('WTDesc')
  WTName_Number = document.getElementById('WTName_Number')
  WTDesc_Number = document.getElementById('WTDesc_Number')
  WishInput = document.getElementById('WishInput')
  WishWord = document.getElementById('WishWord')
  wishesContainer = document.getElementById('wishesContainer')
  shine = document.getElementById('shine')
  focus('WTName')

  document.getElementById('WTName').addEventListener('focus', function () {
    WTName_Number.classList.add('activeInput')
    WTDesc_Number.classList.remove('activeInput')
  })

  document.getElementById('WTDesc').addEventListener('focus', function () {
    WTDesc_Number.classList.add('activeInput')
    WTName_Number.classList.remove('activeInput')
  })

  //listen to 'enter' key for submit
  WishWord.addEventListener('keypress', function (event) {
    if (event.key == 'Enter') {
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

  //listen to 'enter' key for submit
  WTName.addEventListener('keypress', function (event) {
    if (event.key == 'Enter') {
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
    } //listen for 'tab' key for input field switching
    else if (event.key == 'Tab') {
      console.log('tabbing')
      focus('WTDesc')
      if (event.preventDefault) {
        event.preventDefault()
      }
      return false
    }
  })

  //listen to 'enter' key for submit
  WTDesc.addEventListener('keypress', function (event) {
    if (event.key == 'Enter') {
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
    } else if (event.key == 'Tab') {
      console.log('tabbing')
      focus('WTName')
      if (event.preventDefault) {
        event.preventDefault()
      }
      return false
    }
  })
})

//send Wish to server
const sendWish = (rfid, wish) => {
  console.log(currentUser)
  socket.emit('saveWish', {
    rfid: rfid,
    word: wish
  })
  console.log('saving')
}

//server WT Draft to server
const sendWTDraft = (rfid, name, desc) => {
  socket.emit('saveWTDraft', {
    rfid: rfid,
    name: name,
    desc: desc
  })
  console.log('saving')
  WTInput.classList.add('savedWT')
  WTInput.classList.remove('enabled')
  shine.classList.remove('appear')
}

//update shown wishes
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


//update position of each wish
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


//listen to 'enableWTInput' event and react to it
socket.on('enableWTInput', function (rfid) {
  WTInput.classList.add('enabled')
  focus('WTName')
  shine.style.left = 'auto'
  shine.style.right = '0px'
  WTInput.classList.remove('savedWT')
  shine.classList.add('appear')

  currentUser = rfid
})

 //listen to 'disableWTInput' event and react to it
socket.on('disableWTInput', function () {
  WTInput.classList.remove('enabled')
  shine.classList.remove('appear')
})

//listen to 'enableWishInput' event and react to it
socket.on('enableWishInput', function (rfid) {
  WishInput.classList.add('enabled')
  document.getElementById('WishWord').focus()
  shine.style.right = 'auto'
  shine.style.left = '0px'
  shine.classList.add('appear')
  currentUser = rfid
})

 //listen to 'disableWishInput' event and react to it
socket.on('disableWishInput', function () {
  WishInput.classList.remove('enabled')
  shine.classList.remove('appear')
})

//update wishes when succuessfully stored in database
socket.on('getWishes', wishes => updateWishes(wishes))
