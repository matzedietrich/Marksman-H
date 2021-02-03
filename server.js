const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const html = require('./web/html')
const port = new SerialPort('COM5', { baudRate: 9600 })
const parser = port.pipe(new Readline({ delimiter: '\n' }))

const sqlite3 = require('sqlite3').verbose()

/* db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
}); */

port.on('open', () => {
  console.log('serial port open')
})
parser.on('data', data => {
  let type = data.split(':')[0]
  let rfid = data.split(':')[1].trim()

  if (type == 'input') {
    if (rfid == 'removed') {
      html.disableInput()
    } else {
      html.enableInput(rfid)
      console.log('enabling')
    }
  } else if (rfid != 'removed') {
    let slot = type
    handleWallCard(slot, rfid)
    //html.updateProgramme(type, rfid)
  }

  /* let db = new sqlite3.Database('./db/waschDB.db', err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Connected to database.')
  })

  let sql = `SELECT * FROM User WHERE RF_ID = ?`

  db.get(sql, [rfid], (err, row) => {
    if (err) {
      return console.error(err.message)
    }
    return row
      ? console.log(row.SALDO)
      : console.log(`No user found with RFID ${data}`)
  })

  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  })
   */
})

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

          console.log(user_current_WT + ' : ' + slot_WT)

          if (
            user_current_WT != slot_WT ||
            user_current_WT == undefined ||
            slot_WT == undefined
          ) {
            console.log('not same')
            sql = `SELECT STORED_WT_NAME, STORED_WT_DESC FROM User WHERE RF_ID = ?`

            db.get(sql, [rfid], (err, row) => {
              if (err) {
                return console.error(err.message)
              }
              return row
                ? updateProgramme(
                    slot,
                    rfid,
                    row.STORED_WT_NAME,
                    row.STORED_WT_DESC
                  )
                : console.log(`No user found with RFID ${rfid}`)
            })
          }
        })
        .catch(function (err) {
          console.log('error: ' + err)
        })
    })
    .catch(function (err) {
      console.log('error: ' + err)
      db.close(err => {
        if (err) {
          return console.error(err.message)
        }
      })
    })
}

const updateProgramme = (slot, rfid, name, desc) => {
  let db = new sqlite3.Database('./db/waschDB.db')

  db.run(
    `INSERT INTO Waschtreffs (NAME, DESC, RF_ID) VALUES (?, ?, ?)`,
    [name, desc, rfid],
    function (err, res) {
      if (err) {
        console.log(err)
      } else {
        db.run(
          `UPDATE User SET CURRENT_WT = ? WHERE RF_ID = ?`,
          [this.lastID, rfid],
          (err, res) => {
            if (err) {
              console.log(err)
              res.status(500).send({ Response: 'Error updating user', err })
            } else {
            }
          }
        )
        db.run(
          `UPDATE Slots SET WT_ID = ? WHERE S_NAME = ?`,
          [this.lastID, slot],
          (err, res) => {
            if (err) {
              console.log(err)
              res.status(500).send({ Response: 'Error updating user', err })
            } else {
              console.log('updated!')
              html.updateSlot(slot)
            }
          }
        )
      }
    }
  )

/*   db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  }) */
}

const getCurrentUserWT = function (rfid) {
  let db = new sqlite3.Database('./db/waschDB.db', err => {
    if (err) {
      return console.error(err.message)
    }
  })

  return new Promise(function (resolve, reject) {
    let sql = `SELECT CURRENT_WT FROM User WHERE RF_ID = ?`

    db.get(sql, [rfid], (err, row) => {
      if (err) {
        reject(new Error('Error rows is undefined'))
      }
      resolve(row.CURRENT_WT)
    })
  })
}

const getCurrentSlotWT = function (slot) {
  let db = new sqlite3.Database('./db/waschDB.db', err => {
    if (err) {
      return console.error(err.message)
    }
  })

  return new Promise(function (resolve, reject) {
    let sql = `SELECT WT_ID FROM Slots WHERE S_NAME = ?`

    db.get(sql, [slot], (err, row) => {
      if (err) {
        reject(new Error('Error rows is undefined'))
      }
      resolve(row.WT_ID)
    })
  })
}
