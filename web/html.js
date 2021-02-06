const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 3000

const sqlite3 = require('sqlite3').verbose()

app.use('/static', express.static(__dirname + '/static'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/table', (req, res) => {
  res.sendFile(__dirname + '/table.html')
})

io.on('connection', socket => {
  console.log('a user connected')

  /*   getSlots(function (slots) {
    io.emit('getSlots', slots)
  }) */

  getSlots().then(slots => {
    var promises = []
    slots.forEach(slot => {
      promises.push(
        countParticipantsOf(slot.WT_ID).then(value => {
          slot.participants = value
        })
      )
    })
    Promise.all(promises).then(() => {
      io.emit('getSlots', slots)
    })
  })

  socket.on('saveIdea', idea => {
    let name = idea.name
    let desc = idea.desc
    let rfid = idea.rfid

    let db = new sqlite3.Database('./db/waschDB.db')

    db.run(
      `UPDATE User SET STORED_WT_NAME = ?, STORED_WT_DESC = ? WHERE RF_ID = ?`,
      [name, desc, rfid],
      (err, res) => {
        if (err) {
          console.log(err)
          res.status(500).send({ Response: 'Error updating user', err })
        } else {
          console.log('updated!')
        }
      }
    )

    db.close(err => {
      if (err) {
        return console.error(err.message)
      }
      console.log('Close the database connection.')
    })
  })
})

http.listen(3000, '192.168.0.152', () => {
  console.log('listening on :3000')
})

const getSlots = () => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `SELECT NAME, DESC, S_NAME, WT_ID FROM Slots INNER JOIN Waschtreffs ON Waschtreffs.WT_ID = Slots.S_WT_ID`

    db.all(sql, (err, res) => {
      if (err) {
        console.log(err)
        reject(new Error('Error rows is undefined'))
      }
      console.log(res)
      resolve(res)
    })
  })

  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection!')
  })
}

const enableWTInput = rfid => {
  io.emit('enableWTInput', rfid)
}

const disableWTInput = () => {
  io.emit('disableWTInput')
}

const enableWishInput = rfid => {
  io.emit('enableWishInput', rfid)
}

const disableWishInput = () => {
  io.emit('disableWishInput')
}

const updateSlot = slot => {
  let db = new sqlite3.Database('./db/waschDB.db')
  db.get(
    `SELECT NAME, DESC FROM Slots INNER JOIN Waschtreffs ON Waschtreffs.WT_ID = Slots.S_WT_ID WHERE S_NAME = ?`,
    [slot],
    function (err, res) {
      console.log(slot)
      if (err) {
        console.log(err)
      } else {
        console.log(res)
        io.emit('programmeUpdated', slot, res)
      }
    }
  )
}

const countParticipantsOf = WT_ID => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `SELECT COUNT(*) FROM User WHERE CURRENT_WT = ?`

    db.all(sql, [WT_ID], (err, res) => {
      console.log(WT_ID)
      if (err) {
        reject(new Error('Error rows is undefined'))
      }

      resolve(res[0]['COUNT(*)'])
    })
  })
}

const updateSlots = () => {
  getSlots().then(slots => {
    var promises = []
    slots.forEach(slot => {
      promises.push(
        countParticipantsOf(slot.WT_ID).then(value => {
          slot.participants = value
        })
      )
    })
    Promise.all(promises).then(() => {
      io.emit('getSlots', slots)
    })
  })
}

exports.enableWTInput = enableWTInput
exports.disableWTInput = disableWTInput
exports.enableWishInput = enableWishInput
exports.disableWishInput = disableWishInput
exports.updateSlot = updateSlot
exports.updateSlots = updateSlots
