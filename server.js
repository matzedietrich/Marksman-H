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
  console.log(type)
  console.log(rfid)

  if (type == 'input') {
    if (rfid == 'removed') {
      html.disableInput()
    } else {
      html.enableInput(rfid)
      console.log('enabling')
    }
  } else if (rfid != 'removed') {
    let day = type.split('-')[0]
    let slot = type.split('-')[1]
    handleWallCard(day, slot, rfid)
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

const handleWallCard = (day, slot, rfid) => {
  let db = new sqlite3.Database('./db/waschDB.db', err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Connected to database.')
  })

  let sql = `SELECT IDEA_NAME, IDEA_DESC FROM User WHERE RF_ID = ?`

  db.get(sql, [rfid], (err, row) => {
    if (err) {
      return console.error(err.message)
    }
    return row
      ? updateProgrammeDatabase(day, slot, row.IDEA_NAME, row.IDEA_DESC, rfid)
      : console.log(`No user found with RFID ${rfid}`)
  })

  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  })
}

const updateProgrammeDatabase = (day, slot, name, desc, rfid) => {
   let db = new sqlite3.Database('./db/waschDB.db')

    db.run(
      `INSERT INTO TREFFS (NAME, DESC) VALUES (?, ?)`,
      [name, desc],
      (err, res) => {
        if (err) {
          console.log(err)
          res.status(500).send({ Response: 'Error updating user', err })
        } else {
    db.run(
      `UPDATE User SET CURRENT_TREFF_ID = ? WHERE RF_ID = ?`,
      [this.lastID, rfid],
      (err, res) => {
        if (err) {
          console.log(err)
          res.status(500).send({ Response: 'Error updating user', err })
        } else {
          console.log("updated!")
          html.updateProgramme()
        }
      }
    )        }
      }
    )

   
    db.close(err => {
      if (err) {
        return console.error(err.message)
      }
      console.log('Close the database connection.')
    })

}
