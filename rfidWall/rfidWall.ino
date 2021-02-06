
#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN         9
#define SS_1_PIN        3
#define SS_2_PIN        5
//#define SS_3_PIN        2
//#define SS_4_PIN        6


#define NR_OF_READERS   2

byte ssPins[] = {SS_1_PIN, SS_2_PIN};

MFRC522 mfrc522[NR_OF_READERS];

void setup() {

  Serial.begin(9600);
  while (!Serial);

  SPI.begin();
  for (uint8_t reader = 0; reader < NR_OF_READERS; reader++) {
    mfrc522[reader].PCD_Init(ssPins[reader], RST_PIN);
    Serial.print(F("Reader "));
    Serial.print(reader);
    Serial.print(F(": "));
    mfrc522[reader].PCD_DumpVersionToSerial();
  }
}

/**
   Main loop.
*/
void loop() {

  for (uint8_t reader = 0; reader < NR_OF_READERS; reader++) {
    // Look for new cards

    if (mfrc522[reader].PICC_IsNewCardPresent() && mfrc522[reader].PICC_ReadCardSerial()) {
      if (reader == 0) {
        Serial.print("mo-1");
      }
      else if (reader == 1) {
        Serial.print("mo-2");

      }
      Serial.print(":");
      long code = 0;
      for (byte i = 0; i < mfrc522[reader].uid.size; i++)
      {
        code = ((code + mfrc522[reader].uid.uidByte[i]) * 10);
      }
      Serial.println(String(code));
      bool cardRemoved = false;
      int counter = 0;
      bool current, previous;

      previous = mfrc522[reader].PICC_IsNewCardPresent();

      while (!cardRemoved) {
        current = !mfrc522[reader].PICC_IsNewCardPresent();
        if (current && previous) counter++;
        previous = current;
        cardRemoved = (counter > 2);
        delay(50);
      }

      if (reader == 0) {
        Serial.print("mo-1");
      }
      else if (reader == 1) {
        Serial.print("mo-2");

      }

      Serial.println(":removed");

      delay(500);

      mfrc522[reader].PICC_HaltA();
      mfrc522[reader].PCD_StopCrypto1();
    }
  }
}
