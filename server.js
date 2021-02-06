const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const html = require('./web/html')
const wallPort = new SerialPort('COM5', { baudRate: 9600 })
const tablePort = new SerialPort('COM6', { baudRate: 9600 })

const wallParser = wallPort.pipe(new Readline({ delimiter: '\n' }))
const tableParser = tablePort.pipe(new Readline({ delimiter: '\n' }))

const sqlite3 = require('sqlite3').verbose()

wallPort.on('open', () => {
  console.log('wall serial port open')
})
wallParser.on('data', data => {
  let type = data.split(':')[0]
  let rfid = data.split(':')[1].trim()

  console.log(data)

  if (rfid != 'removed') {
    let slot = type
    handleWallCard(slot, rfid)
  }
})

tablePort.on('open', () => {
  console.log('table serial port open')
})
tableParser.on('data', data => {
  let type = data.split(':')[0]
  let rfid = data.split(':')[1].trim()

  console.log(data)

  if (type == 'wt') {
    if (rfid == 'removed') {
      html.disableWTInput()
    } else {
      html.enableWTInput(rfid)
      console.log('enabling')
    }
  } else if (type == 'wish') {
    if (rfid == 'removed') {
      html.disableWishInput()
    } else {
      html.enableWishInput(rfid)
      console.log('enabling')
    }
  }
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

          sql = `SELECT STORED_WT_NAME, STORED_WT_DESC FROM User WHERE RF_ID = ?`

          db.get(sql, [rfid], (err, row) => {
            if (err) {
              return console.error(err.message)
            }
            return row
              ? addWT(row.STORED_WT_NAME, row.STORED_WT_DESC, rfid)
                  .then(addedWT_ID => setCurrentWT(addedWT_ID, rfid))
                  .then(res => setSlotWT(res, slot))
                  .then(() => html.updateSlots())
              : console.log(`No user found with RFID ${rfid}`)
          })
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
      } else if (row) {
        resolve(row.CURRENT_WT)
      }
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
    let sql = `SELECT S_WT_ID FROM Slots WHERE S_NAME = ?`

    db.get(sql, [slot], (err, row) => {
      if (err) {
        reject(new Error('Error rows is undefined'))
      }
      resolve(row.S_WT_ID)
    })
  })
}

const addWT = (name, desc, rfid) => {
  let db = new sqlite3.Database('./db/waschDB.db')

  return new Promise(function (resolve, reject) {
    let sql = `INSERT INTO Waschtreffs (NAME, DESC, RF_ID) VALUES (?, ?, ?)`

    db.run(sql, [name, desc, rfid], function (err, res) {
      if (err) {
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
