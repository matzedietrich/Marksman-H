//import modules
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const app = require('./app')

//init ports
const wallPort = new SerialPort('COM5', { baudRate: 9600 })
const tablePort = new SerialPort('COM6', { baudRate: 9600 })

//start reading
const wallParser = wallPort.pipe(new Readline({ delimiter: '\n' }))
const tableParser = tablePort.pipe(new Readline({ delimiter: '\n' }))

//on 'open' tell me
wallPort.on('open', () => {
  console.log('wall serial port open')
})

//on 'error' tell me
wallPort.on('error', err => {
  console.log('error ----> ' + err)
})

//on 'data' handle data
wallParser.on('data', data => {
  let type = data.split(':')[0]
  let rfid = data.split(':')[1].trim()

  if (data.length > 15) {
    // no data, just a message
    console.log(data)
  } else if (rfid != 'removed') {
    //recognized card!
    let slot = type
    console.log(
      '__RECOGNIZED CARD WITH RF_ID "' + rfid + '" AT SLOT "' + slot + '"__'
    )
    app.handleWallCard(slot, rfid)
  }
})

// on 'open' tell me
tablePort.on('open', () => {
  console.log('table serial port open')
})

// on 'error' tell me
tablePort.on('error', function (err) {
  console.log('error ----> ' + err)
})

// on 'data' handle data
tableParser.on('data', data => {
  let type = data.split(':')[0]
  let rfid = data.split(':')[1].trim()

  if (data.length > 15) {
    // no data, just a message
    console.log(data)
  } else if (rfid == 'removed') {
    console.log('__RECOGNIZED REMOVED CARD AT TABLE AREA "' + type + '"__')
    app.handleTableCard(type, rfid)
  } else if (rfid != 'removed') {
    console.log(
      '__RECOGNIZED CARD "' + rfid + '" AT TABLE AREA "' + type + '"__'
    )
    app.handleTableCard(type, rfid)
  }
})
