const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const app = require('./app')
const wallPort = new SerialPort('COM5', { baudRate: 9600 })
const tablePort = new SerialPort('COM6', { baudRate: 9600 })

const wallParser = wallPort.pipe(new Readline({ delimiter: '\n' }))
const tableParser = tablePort.pipe(new Readline({ delimiter: '\n' }))

wallPort.on('open', () => {
  console.log('wall serial port open')
})
wallParser.on('data', data => {
  let type = data.split(':')[0]
  let rfid = data.split(':')[1].trim()

  console.log(data)

  if (rfid != 'removed') {
    let slot = type
    app.handleWallCard(slot, rfid)
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
      app.disableWTInput()
    } else {
      app.enableWTInput(rfid)
      console.log('enabling')
    }
  } else if (type == 'wish') {
    if (rfid == 'removed') {
      app.disableWishInput()
    } else {
      app.enableWishInput(rfid)
      console.log('enabling')
    }
  }
})
