#include <SPI.h>
#include <MFRC522.h>
#include "RFID_Reader.h"

#define RST_PIN 9
#define WALL_1_SS_PIN 5
#define WALL_2_SS_PIN 3
//#define WALL_3_SS_PIN 2
//#define WALL_4_SS_PIN 6





RFID_Reader wall1(WALL_1_SS_PIN, RST_PIN, "mo-1");
RFID_Reader wall2(WALL_1_SS_PIN, RST_PIN, "mo-2");
//RFID_Reader wall3(WALL_1_SS_PIN, RST_PIN, "mo-3");
//RFID_Reader wall4(WALL_1_SS_PIN, RST_PIN, "mo-4");




void setup()
{
Serial.begin(9600);
SPI.begin();
wall1.init();
wall2.init();
//wall3.init();
//wall4.init();



}

void loop()
{
wall1.update();
wall2.update();
//wall3.update();
//wall4.update();





}
