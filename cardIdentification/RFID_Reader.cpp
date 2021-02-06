#include "RFID_Reader.h"
#include <SPI.h>
#include <MFRC522.h>

RFID_Reader::RFID_Reader(byte SS_PIN, byte RST_PIN, String type): _SS_PIN(SS_PIN), _RST_PIN(RST_PIN), rfid(SS_PIN, RST_PIN) {
  _SS_PIN = SS_PIN;
  _RST_PIN = RST_PIN;
  this->type = type;
}

void RFID_Reader::init() {
  //rfid = MFRC522(_SS_PIN, _RST_PIN);
  rfid.PCD_Init(_SS_PIN, _RST_PIN);
  Serial.print(type+":" );
  rfid.PCD_DumpVersionToSerial();

}

void RFID_Reader::update(){
  if ( ! rfid.PICC_IsNewCardPresent())
  {
      return;
  }

  if ( ! rfid.PICC_ReadCardSerial())
  {
  return;
  }  

  long code = 0;
  for (byte i = 0; i < rfid.uid.size; i++)
  {
    code=((code+rfid.uid.uidByte[i])*10);
  }
  Serial.println(type+":"+String(code));
  bool cardRemoved = false;
  int counter = 0;
  bool current, previous;
  
  previous = !rfid.PICC_IsNewCardPresent();
    
  while(!cardRemoved){
    current =!rfid.PICC_IsNewCardPresent();
    if (current && previous) counter++;
    previous = current;
    cardRemoved = (counter>2);      
    delay(50);
  }
  
  Serial.println(type+":removed");

  delay(500);
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
 
}
