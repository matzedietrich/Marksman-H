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

  socket.on('saveIdea', idea => {
    let name = idea.name
    let desc = idea.desc
    let rfid = idea.rfid

    let db = new sqlite3.Database('./db/waschDB.db')

    db.run(
      `UPDATE USER SET IDEA_NAME = ?, IDEA_DESC = ? WHERE RF_ID = ?`,
      [name, desc, rfid],
      (err, res) => {
        if (err) {
          console.log(err)
          res.status(500).send({ Response: 'Error updating user', err })
        } else {
          console.log("updated!")
        }
      }
    )

    /* db.get(
      `SELECT IDEA_NAME FROM USER WHERE RF_ID = ?`, [rfid],
      (err, row) => {
        if (err) {
          return console.log(err.message)
        }
        // get the last insert id
        console.log(`updated user`)
      }
    ) */

    db.close(err => {
      if (err) {
        return console.error(err.message)
      }
      console.log('Close the database connection.')
    })
  })
})

http.listen(3000, () => {
  console.log('listening on :3000')
})

/* 
const sqlite3 = require('sqlite3').verbose()
var bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies */

/* app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/table', function (req, res) {
  res.sendFile(__dirname + '/table.html')
}) */

/*

app.post('/table', (req, res) => {
  console.log('Got body:', req.body)
  res.sendStatus(200)

  let db = new sqlite3.Database('./db/waschDB.db')
  let nameInput = req.body.name_field
  let descInput = req.body.desc_field
  let creatorInput = 'Matthias'
  let activeInput = 0

  db.run(`INSERT INTO IDEAS(NAME,DESC,CREATOR,ACTIVE) VALUES (?, ?, ?, ?)`,[nameInput, descInput, creatorInput, activeInput], function (err) {
      if (err) {
        return console.log(err.message)
      }
      // get the last insert id
      console.log(`A row has been inserted with rowid ${this.lastID}`)
    }
  )

  db.close(err => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close the database connection.')
  })
})


*/



const enableInput = rfid => {
  io.emit('enableInput', rfid)
}

const disableInput = () => {
  io.emit('disableInput')
}


const updateProgramme = () => {
  io.emit('update')
}

exports.enableInput = enableInput
exports.disableInput = disableInput
exports.updateProgramme = updateProgramme


