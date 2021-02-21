//import modules
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 3000
const sqlite3 = require('sqlite3').verbose()

//listen to port, ip-address
  http.listen(3000, '192.168.0.152', () => {
    console.log('listening on :3000')
  })

//allow access to static folder
app.use('/static', express.static(__dirname + '/web/static'))

//send html document
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/web/index.html')
})

//send another html document
app.get('/table', (req, res) => {
  res.sendFile(__dirname + '/web/table.html')
})

//on new socket connection
io.on('connection', socket => {
  //update programme
  updateSlots()
  //update wishes
  updateWishes()

  //handle events
  socket.on('saveWTDraft', draft => saveWTDraft(draft))
  socket.on('saveWish', wish => saveWish(wish).then(() => updateWishes()))
})

// decide what to do with a card that was recognized by some rfid-reader at the WaschProgramm
const handleWallCard = (slot, rfid) => {
  let db = new sqlite3.Database('./db/waschDB.db', err => {
    if (err) {
      return console.error(err.message)
    }
  })

  let user_current_WT
  let slot_WT

  checkIfRegistered(rfid)
    .then(isRegistered => {
      return new Promise(function (resolve, reject) {
        if (isRegistered) {
          resolve()
        } else if (!isRegistered) {
          registerCard(rfid, 0).then(resolve())
        }
      })
    })
    .then(
      getCurrentUserWT(rfid).then(function (results) {
        user_current_WT = results
        //find out what WaschTreff is stored in the slot
        getCurrentSlotWT(slot)
          .then(function (results) {
            slot_WT = results

            //if the slot is empty continue
            if (slot_WT == 0) {
              sql = `SELECT STORED_WT_NAME, STORED_WT_DESC FROM User WHERE RF_ID = ?`

              db.get(sql, [rfid], (err, row) => {
                if (err) {
                  return console.error(err.message)
                }
                if (row) {
                  //if the user is storing a WT Draft add the WT to the database and assign it to the slot
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
              //if it is not empty, the user wants to participate in that WT
            } else if (slot_WT != user_current_WT) {
              setCurrentWT(slot_WT, rfid).then(() => updateSlots())
            } // if the user already particiaptes in that WT, he wants to cancel the particiaption
            else if (slot_WT == user_current_WT) {
              console.log('-> canceling participation...')
              setCurrentWT(0, rfid).then(() => updateSlots())
            }
          })
          .catch(function (err) {
            console.log('error catch1: ' + err)
          })
      })
    )
    .catch(function (err) {
      console.log('error catch2: ' + err)
      db.close(err => {
        if (err) {
          return console.error(err.message)
        }
      })
    })
}

// decide what to do with a card that was recognized by some rfid-reader at the WaschTisch
const handleTableCard = (type, rfid) => {
  //check if card is registered

  if (rfid != 'removed') {
    checkIfRegistered(rfid)
      .then(isRegistered => {
        return new Promise(function (resolve, reject) {
          if (isRegistered) {
            //already registered? -> continue
            resolve()
          } else if (!isRegistered) {
            //not registered? -> register
            registerCard(rfid, 0)
              .then(resolve())
              .catch(function (err) {
                console.log('error: ', err)
              })
          }
        })
      })
      .catch(function (err) {
        console.log('error: ', err)
      })
  }
  if (type == 'wt') {
    if (rfid == 'removed') {
      disableWTInput()
      console.log('-> disabling WT Input')
    } else {
      enableWTInput(rfid)
      console.log('-> enabling WT Input')
    }
  } else if (type == 'wish') {
    if (rfid == 'removed') {
      disableWishInput()
      console.log('-> disabling Wish Input')
    } else {
      enableWishInput(rfid)
      console.log('-> enabling Wish Input')
    }
  }
}

//get all programme-slots which currently contain a waschtreff
const getSlots = () => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `SELECT NAME, DESC, S_NAME, WT_ID FROM Slots INNER JOIN Waschtreffs ON Waschtreffs.WT_ID = Slots.S_WT_ID`

    db.all(sql, (err, res) => {
      if (err) {
        console.log('err:' + err)
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
        console.log('-> removed WT from Slot "' + slotname + '"')
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
          console.log('-> WT "' + slot.WT_ID + '" has no participants anymore')
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
        if (!row.CURRENT_WT) {
          console.log('-> user is not participating in any WT')
        } else {
          console.log('-> user is participating in WT "' + row.CURRENT_WT + '"')
        }
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
      if (row.S_WT_ID) {
        console.log(
          '-> "' + slot + '" is currently carrying WT "' + row.S_WT_ID + '"'
        )
      } else {
        console.log('-> "' + slot + '" is currently carrying no WT')
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
        console.log('-> added WT "' + this.lastID + '" to database')
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
        console.log('-> user is now particiapting in WT "' + WT_ID + '"')
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
        console.log('-> assigned WT "' + WT_ID + '" to slot "' + slot + '"')
        resolve()
      }
    })
  })
}

//assign the WT Draft to the user
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

const checkIfRegistered = rfid => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    db.all(`SELECT * FROM User WHERE RF_ID = ?`, [rfid], (err, rows) => {
      if (err) {
        reject()
      } else if (rows.length > 0) {
        resolve(true)
      } else {
        console.log('-> user is not registered')
        resolve(false)
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

const registerCard = (rfid, saldo) => {
  console.log('-> registering...')
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    db.run(
      `INSERT INTO User (RF_ID, SALDO) VALUES (?, ?)`,
      [rfid, saldo],
      err => {
        if (err) {
          console.log(err)
          reject()
        } else {
          console.log('-> registered successfully')
          resolve()
        }
      }
    )
  })

  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  })
}

exports.handleWallCard = handleWallCard
exports.handleTableCard = handleTableCard
