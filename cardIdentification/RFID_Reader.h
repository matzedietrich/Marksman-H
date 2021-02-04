#ifndef RFID_Reader_h
#define RFID_Reader_h
#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>

class RFID_Reader {
  
  private:
    byte _SS_PIN;
    byte _RST_PIN;
    String type;
    bool active = false;
    MFRC522 rfid;
    
  public:
    RFID_Reader(byte SS_PIN, byte RST_PIN, String type);
    void init();
    void update();
    long code = 0;
  
};
#endif
