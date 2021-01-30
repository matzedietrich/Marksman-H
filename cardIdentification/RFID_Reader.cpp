#include "RFID_Reader.h"

RFID_Reader::RFID_Reader(byte SS_PIN, byte RST_PIN, String type) {
  this->SS_PIN = SS_PIN;
  this->RST_PIN = RST_PIN;
  this->type = type;
  init();
}

void RFID_Reader::init() {
  RFID = MFRC522(SS_PIN, RST_PIN);
}

void RFID_Reader::update(){

  if ( ! RFID.PICC_IsNewCardPresent())
  {
      return;
  }

  if ( ! RFID.PICC_ReadCardSerial())
  {
  return;
  }  

  long code = 0;
  for (byte i = 0; i < RFID.uid.size; i++)
  {
    code=((code+RFID.uid.uidByte[i])*10);
  }
  Serial.println(type+":"+String(code));
  bool cardRemoved = false;
  int counter = 0;
  bool current, previous;
  
  previous = !RFID.PICC_IsNewCardPresent();
    
  while(!cardRemoved){
    current =!RFID.PICC_IsNewCardPresent();
    if (current && previous) counter++;
    previous = current;
    cardRemoved = (counter>2);      
    delay(50);
  }
  
  Serial.println(type+":removed");

  delay(500);
  RFID.PICC_HaltA();
  RFID.PCD_StopCrypto1();

  
}
