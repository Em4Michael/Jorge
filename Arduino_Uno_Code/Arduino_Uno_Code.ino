#include <SPI.h>
#include <RFID.h>
#include <Keypad.h>


#define SDA_DIO 10
#define RESET_DIO 9
RFID RC522(SDA_DIO, RESET_DIO); 

const byte ROWS = 4; // four rows
const byte COLS = 4; // four columns
char keys[ROWS][COLS] = {
  {'1','4','7','*'},
  {'2','5','8','0'},
  {'3','6','9','#'},
  {'A','B','C','D'}
};
byte rowPins[ROWS] = {9, 8, 7, 6}; // connect to the row pinouts of the keypad
byte colPins[COLS] = {5, 4, 3, 2}; // connect to the column pinouts of the keypad

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

String accessPassword = "123A"; // access password
String password = ""; // to store the entered password

//SoftwareSerial mySerial(4, 5); // RX, TX

void setup()
{ 
  Serial.begin(9600);
 // mySerial.begin(9600); // Initialize software serial communication with Arduino Mega
  SPI.begin(); 
  RC522.init();

  pinMode(2, INPUT);
  pinMode(3, OUTPUT);
}

void loop()
{
  char key = keypad.getKey();
  
  if (key) {
    if (key == '#') {
      if (password == accessPassword) {
        sendAccessStatus("Password", false);
      } else {
        Serial.println("No access");
      }
      password = ""; // reset the password
    } else if (key == '*') {
      password = ""; // clear the password
    } else {
      if (password.length() < 4) {
        password += key; // append the key to the password
      }
      if (password.length() == 4) {
        if (password == accessPassword) {
          sendAccessStatus("Password", false);
        } else {
          Serial.println("No access");
        }
        password = ""; // reset the password after checking
      }
    }
  }

  if (RC522.isCard())
  {
    RC522.readCardSerial();
    unsigned long cardID = 0;
    for (int i = 0; i < 5; i++)
    {
      cardID = cardID * 256 + RC522.serNum[i];
    }

    if (cardID == 1700077277)
    {
      sendAccessStatus("CEO", false);
    }
    else if (cardID == 1464354810)
    {
      sendAccessStatus("Worker", false);
    }
    else if (cardID == 1818371673)
    {
      sendAccessStatus("Emergency", false);
    }
    else
    {
      sendAccessStatus("null", false);
    }
  }

  if (digitalRead(2) == LOW) {
    digitalWrite(3, LOW);
    Serial.println("{\"Access\": null, \"Exist\": true}");
   // mySerial.println("{\"Access\": null, \"Exist\": true}");
  } else {
    digitalWrite(3, HIGH);
  }

// delay(100);
}

void sendAccessStatus(String accessType, bool exitStatus) {
  String message = "{\"Access\":\"" + accessType + "\",\"Exist\":" + (exitStatus ? "true" : "false") + "}";
  Serial.println(message);
 // mySerial.println(message);
}
