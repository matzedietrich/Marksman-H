const express = require('express')
const app = express()
const port = 3000
const sqlite3 = require('sqlite3').verbose()
var bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/table', function (req, res) {
  res.sendFile(__dirname + '/table.html')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

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
