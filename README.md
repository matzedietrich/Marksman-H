# Welcome to the WaschRaum!

This prototype focuses on the interaction of the users through the WaschTisch (WashTable) and the WaschProgramm (WashProgramme). These are equipped with two RFID-Modules each. Through a RFID-Tag the user are able to access the user interface. The prototype allows the users to add new wishes, as well as so called WaschTreffs (WashMeetings), or to express their participation . This data is stored inside a SQLite Database. 
Follow these steps to start the interactive prototype:

## Preperation

In order to start the prototype, prepare the following hardware:

1. Short Distance Projector
2. (Usual) Projector
3. PC/Mac (with two USB-Ports)
4. Second PC/Mac/Raspberry Pi
5. Bluetooth Keyboard
6. 4 x RFID-Module
7. At least one S50 Card (RFID-Tag)
8. Table with white surface (min. 65 x 35 x 20 cm)
9. Opaque sheet / projection screen (min. 140 x 130 cm)
10. 2 x Microcontroller (ESP32, Arduino Uno, Elegoo Uno R3, ..)
11. Wifi Access (Wifi-Router)


## Hardware Setup

#### Fritzing
Connect the microcontrollers to two RDID-Modules each, as shown in the image:
![fritzing](https://github.com/[matthias.dietrich]/WaschRaum/blob/master/images/fritzing.png?raw=true)

### Hardware assembly
Now, that you have all the hardware prepared, assembly it as shown in the image:
![hardware assembly](https://github.com/[matthias.dietrich]/WaschRaum/blob/master/images/aufbau.png?raw=true)

## Software Setup

### Clone repository
First, clone the repository to your workspace.
Either via SSH `git@git.imd.rocks:matthias.dietrich/waschraum.git` or via `https://git.imd.rocks/matthias.dietrich/waschraum.git`

### Install dependencies
Now install all the dependencies by running `npm install` inside the root directory.

### Upload to microcontroller
In order to use the microcontrollers, you need to upload the scripts inside `rfidTable` and `rfidWall`.
Therefore open them up inside the Arduino IDE one after another. Connect your microcontroller via USB and make sure to select the correct board and PORT. Now you are ready to upload the programme.
You may also need to install some libraries used in the programme.

### Replace PORTS
Now you need to open up the `server.js` script and replace the Ports (`COM5`,`COM6`) to match your system:
```
const wallPort = new SerialPort('COM5', { baudRate: 9600 })
const tablePort = new SerialPort('COM6', { baudRate: 9600 })
```

## Start application

### Connect your microcontrollers
Now make sure to have both microcontrollers connected via USB.

### Run Script
Finally, inside the root folder run `npm start`.
If the terminal returns some errors, you propably got the Ports wrong.
Now navigate via webbrowser to: `your.ip.adress:3000`

## Arrange projections

### WaschProgramm
What you see is the WaschProgramm-Projection. It reacts to changes made through the RFID-Readers.
This HTML-document needs to be projected by the short distance projector onto the sheet/projection screen. Make sure to match the position of the RFID-Modules with the position of the projection.

### WaschTisch
To see the WaschTisch-projection simply navigate to `/table`. This HTML-Document needs to be projected onto the surface of the table. Again, make sure to match the projection to the position of the RFID-Modules.


## Experience the WaschRaum!
Now you are ready to experience the WaschRaum. Therefore, you could start with placing the RFID-Card at the provided area on the table. An input field should show up. Use the bluetooth keyboard to write down some wishes or create a new WaschTreff. After writing down your own WaschTreff, try to publish it in the WaschProgramm. Enjoy!







