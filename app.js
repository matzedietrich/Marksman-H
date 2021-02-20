const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 3000
const sqlite3 = require('sqlite3').verbose()

http.listen(3000, '192.168.0.152', () => {
  console.log('listening on :3000')
})

app.use('/static', express.static(__dirname + '/web/static'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/web/index.html')
})

app.get('/table', (req, res) => {
  res.sendFile(__dirname + '/web/table.html')
})

io.on('connection', socket => {
  console.log('a user connected')
  updateSlots()
  updateWishes()

  socket.on('saveWTDraft', draft => saveWTDraft(draft))
  socket.on('saveWish', wish => saveWish(wish).then(() => updateWishes()))
})

// decide what to do with a card that was recognized by some rfid-reader
const handleWallCard = (slot, rfid) => {
  let db = new sqlite3.Database('./db/waschDB.db', err => {
    if (err) {
      return console.error(err.message)
    }
  })

  let user_current_WT
  let slot_WT

  getCurrentUserWT(rfid)
    .then(function (results) {
      user_current_WT = results
      getCurrentSlotWT(slot)
        .then(function (results) {
          slot_WT = results
          console.log(slot_WT + ' : ' + user_current_WT)

          if (slot_WT == 0) {
            sql = `SELECT STORED_WT_NAME, STORED_WT_DESC FROM User WHERE RF_ID = ?`

            db.get(sql, [rfid], (err, row) => {
              if (err) {
                return console.error(err.message)
              }
              if (row) {
                if (row.STORED_WT_NAME && row.STORED_WT_NAME != '') {
                  addWT(row.STORED_WT_NAME, row.STORED_WT_DESC, rfid)
                    .then(addedWT_ID => setCurrentWT(addedWT_ID, rfid))
                    .then(res => setSlotWT(res, slot))
                    .then(() => updateSlots())
                }
              } else {
                console.log(`No user found with RFID ${rfid}`)
              }
            })
          } else if (slot_WT != user_current_WT) {
            setCurrentWT(slot_WT, rfid).then(() => updateSlots())
          } else if (slot_WT == user_current_WT) {
            setCurrentWT(0, rfid).then(() => updateSlots())
          }
        })
        .catch(function (err) {
          console.log('error catch1: ' + err)
        })
    })
    .catch(function (err) {
      console.log('error catch2: ' + err)
      db.close(err => {
        if (err) {
          return console.error(err.message)
        }
      })
    })
}

//get all programme-slots which currently contain a waschtreff
const getSlots = () => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `SELECT NAME, DESC, S_NAME, WT_ID FROM Slots INNER JOIN Waschtreffs ON Waschtreffs.WT_ID = Slots.S_WT_ID`

    db.all(sql, (err, res) => {
      if (err) {
        console.log(err)
        reject(new Error('Error rows is undefined'))
      }
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

// activate the waschtreff input on the table
const enableWTInput = rfid => {
  io.emit('enableWTInput', rfid)
}

// deactivate the waschtreff input on the table
const disableWTInput = () => {
  io.emit('disableWTInput')
}

// activate the wish-input on the table
const enableWishInput = rfid => {
  io.emit('enableWishInput', rfid)
}

// deactivate the wish-input on the table
const disableWishInput = () => {
  io.emit('disableWishInput')
}

// remove Waschtreff from slot (when noone is participating)
const removeWTFromSlot = slotname => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `UPDATE Slots SET S_WT_ID = ? WHERE S_NAME = ?`
    db.run(sql, [0, slotname], function (err, res) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// count the number of participants of a waschtreff
const countParticipantsOf = WT_ID => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `SELECT COUNT(*) FROM User WHERE CURRENT_WT = ?`

    db.all(sql, [WT_ID], (err, res) => {
      if (err) {
        reject(new Error('Error rows is undefined'))
      }

      resolve(res[0]['COUNT(*)'])
    })
  })
}

//update the wishes on the table
const updateWishes = () => {
  getWishes().then(wishes => {
    console.log(wishes)
    io.emit('getWishes', wishes)
  })
}

//update the slots on the wall
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
      var nextPromises = []
      slots.forEach(slot => {
        if (slot.participants == 0) {
          nextPromises.push(removeWTFromSlot(slot.S_NAME))
        }
      })
      Promise.all(nextPromises).then(() => {
        io.emit('getSlots', slots)
      })
    })
  })
}

//get the current waschtreff of a user
const getCurrentUserWT = function (rfid) {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `SELECT CURRENT_WT FROM User WHERE RF_ID = ?`

    db.get(sql, [rfid], (err, row) => {
      if (err) {
        console.log(err)
        reject(new Error(err))
      } else if (row) {
        resolve(row.CURRENT_WT)
      }
    })
  })
}

//get the current waschtreff of a slot
const getCurrentSlotWT = function (slot) {
  let db = new sqlite3.Database('./db/waschDB.db', err => {
    if (err) {
      return console.error(err.message)
    }
  })

  return new Promise(function (resolve, reject) {
    let sql = `SELECT S_WT_ID FROM Slots WHERE S_NAME = ?`

    db.get(sql, [slot], (err, row) => {
      if (err) {
        console.log(err)
        reject(new Error(err))
      }
      resolve(row.S_WT_ID)
    })
  })
}

// add a new wish to the database
const saveWish = wish => {
  let word = wish.word
  let rfid = wish.rfid

  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `INSERT INTO Wuensche (WORD, CREATOR) VALUES (?, ?)`

    db.run(sql, [word, rfid], function (err, res) {
      if (err) {
        console.log(err)
        reject(new Error('Error rows is undefined'))
      } else {
        console.log('lastID:' + this.lastID)
        resolve()
      }
    })
  })
  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  })
}

//get wishes from database
const getWishes = () => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `SELECT W_ID, CREATOR, WORD FROM Wuensche`

    db.all(sql, (err, res) => {
      if (err) {
        console.log(err)
        reject(new Error('Error rows is undefined'))
      }
      console.log("selected:"+res)
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

// add a new waschtreff to the database
const addWT = (name, desc, rfid) => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `INSERT INTO Waschtreffs (NAME, DESC, CREATOR) VALUES (?, ?, ?)`

    db.run(sql, [name, desc, rfid], function (err, res) {
      if (err) {
        console.log(err)
        reject(new Error('Error rows is undefined'))
      } else {
        console.log('lastID:' + this.lastID)
        resolve(this.lastID)
      }
    })
  })
  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  })
}

// set the current waschtreff of a user
const setCurrentWT = (WT_ID, rfid) => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `UPDATE User SET CURRENT_WT = ? WHERE RF_ID = ?`
    db.run(sql, [WT_ID, rfid], (err, res) => {
      if (err) {
        reject(new Error('Error rows is undefined'))
      } else {
        resolve(WT_ID)
      }
    })
  })
  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  })
}

// set current waschtreff of a slot
const setSlotWT = (WT_ID, slot) => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `UPDATE Slots SET S_WT_ID = ? WHERE S_NAME = ?`
    db.run(sql, [WT_ID, slot], (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const saveWTDraft = draft => {
  console.log('saving draft')

  let name = draft.name
  let desc = draft.desc
  let rfid = draft.rfid

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
}

exports.handleWallCard = handleWallCard
exports.enableWTInput = enableWTInput
exports.disableWTInput = disableWTInput
exports.enableWishInput = enableWishInput
exports.disableWishInput = disableWishInput
