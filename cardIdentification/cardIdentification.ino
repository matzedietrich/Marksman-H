#include <SPI.h>
#include <MFRC522.h>
#include "RFID_Reader.h"


#define WALL_1_SS_PIN 10
#define RST_PIN 9

#define TABLE_1_SS_PIN 2


RFID_Reader wall1(WALL_1_SS_PIN, RST_PIN, "mo-1");
RFID_Reader table1(TABLE_1_SS_PIN, RST_PIN, "input");


void setup()
{
Serial.begin(9600);
SPI.begin();
}

void loop()
{
table1.update();
wall1.update();

}
