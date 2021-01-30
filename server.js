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
      console.log("enabling")
    }
  } else {
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
