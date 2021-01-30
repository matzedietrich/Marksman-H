#include <SPI.h>
#include <MFRC522.h>
#include "RFID_Reader.h"


#define TABLE_1_SS_PIN 10
#define TABLE_1_RST_PIN 9

RFID_Reader table1(TABLE_1_SS_PIN, TABLE_1_RST_PIN, "input");

void setup()
{
Serial.begin(9600);
SPI.begin();
}

void loop()
{
table1.update();
}
