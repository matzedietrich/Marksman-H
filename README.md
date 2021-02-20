# Welcome to the WaschRaum!

Follow these steps to start the interactive prototype.

## Setup

### Install dependencies
First of all you need to install all the dependencies by running `npm install` inside the root directory.

### Upload to microcontroller
In order to use the microcontrollers, you need to upload the scripts inside `rfidTable` and `rfidWall`.
Therefore open them up inside the Arduino IDE one after another. Connect your microcontroller via USB and make sure to select the correct board and PORT.
Now you are ready to upload the programme.
You may also need to install some libraries used in the programme.

### Connect your microcontrollers
Now make sure to have both microcontrollers connected via USB.

### Replace PORTS
Now you need to open up the `server.js` script and replace the Ports (`COM5`,`COM6`) to match your system:
```
const wallPort = new SerialPort('COM5', { baudRate: 9600 })
const tablePort = new SerialPort('COM6', { baudRate: 9600 }) to match your system
```

## Start application
Finally, inside the root folder run `npm start`.
If the terminal returns some errors, you propably got the Ports wrong.


Now navigate via webbrowser to: `your.ip.adress:3000`

### WaschProgramm
What you see is the WaschProgramm-Projection. It reacts to changes made through the RFID-Readers.

### WaschTisch
To see the WaschTisch-projection simply navigate to `/table`.







