const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('COM5', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));


const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/waschDB.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to database.');
});





/* db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
}); */


port.on("open", () => {
  console.log('serial port open');
});
parser.on('data', data =>{
  console.log('ID:', data);


let sql = `SELECT * FROM User WHERE RF_ID = ?`;

db.get(sql, [data], (err, row) => {
 if (err) {
    return console.error(err.message);
  }
  return row
    ? console.log(row.SALDO)
    : console.log(`No user found with RFID ${data}`);
});

});
