#include <ArduinoJson.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <WebSocketsClient.h> 
#include <WiFiManager.h>

//const char* ssid = "MTN_4G_31E593";
//const char* password = "C6E31CBF";
const char* webSocketServerAddress = "192.168.0.139"; 
const uint16_t webSocketServerPort = 5000;
WebSocketsClient webSocket;

#define RX1_PIN 16 // Use GPIO 16 for RX
#define TX1_PIN 17 // Use GPIO 17 for TX
HardwareSerial espSerial(1); // Use Serial1


const int E_motor_Down = 5;
const int E_motor_Up = 15;
const int E_Fan = 21;
const int E_Pump = 4;
const int E_pest = 18;
const int E_Light = 19;
const int E_Door = 5; // Added for the door control

// Initial states
bool state_E_motor_Down = LOW;
bool state_E_motor_Up = LOW;
bool state_E_Fan = LOW;
bool state_E_Pump = LOW;
bool state_E_pest = LOW;
bool state_E_Light = LOW;
bool state_E_Door = LOW;

String WIFI_Name = "Jorge";
String WIFI_KEY = "2024";

bool isValidUtf8(const String& str) {
    const char* cstr = str.c_str();
    for (size_t i = 0; i < str.length(); ++i) {
        if ((cstr[i] & 0x80) == 0) continue; // ASCII byte
        if ((cstr[i] & 0xE0) == 0xC0 && (i + 1 < str.length()) &&
            (cstr[i + 1] & 0xC0) == 0x80) {
            ++i; // Valid 2-byte sequence
            continue;
        }
        if ((cstr[i] & 0xF0) == 0xE0 && (i + 2 < str.length()) &&
            (cstr[i + 1] & 0xC0) == 0x80 && (cstr[i + 2] & 0xC0) == 0x80) {
            i += 2; // Valid 3-byte sequence
            continue;
        }
        if ((cstr[i] & 0xF8) == 0xF0 && (i + 3 < str.length()) &&
            (cstr[i + 1] & 0xC0) == 0x80 && (cstr[i + 2] & 0xC0) == 0x80 &&
            (cstr[i + 3] & 0xC0) == 0x80) {
            i += 3; // Valid 4-byte sequence
            continue;
        }
        return false; // Invalid UTF-8
    }
    return true;
}

void setup() {
  Serial.begin(115200);
  espSerial.begin(115200, SERIAL_8N1, RX1_PIN, TX1_PIN);


  pinMode(E_motor_Down, OUTPUT);
  pinMode(E_motor_Up, OUTPUT);
  pinMode(E_Fan, OUTPUT);
  pinMode(E_Pump, OUTPUT);
  pinMode(E_pest, OUTPUT);
  pinMode(E_Light, OUTPUT);
  pinMode(E_Door, OUTPUT);

  // Set initial states
  digitalWrite(E_motor_Down, state_E_motor_Down);
  digitalWrite(E_motor_Up, state_E_motor_Up);
  digitalWrite(E_Fan, state_E_Fan);
  digitalWrite(E_Pump, state_E_Pump);
  digitalWrite(E_pest, state_E_pest);
  digitalWrite(E_Light, state_E_Light);
  digitalWrite(E_Door, state_E_Door);



  WiFiManager wifiManager;
  
  // If the WiFi credentials are not saved, start the captive portal
  if (!wifiManager.autoConnect("Jorge")) {
    Serial.println("Failed to connect to WiFi and hit timeout");
    // Reset the ESP to retry WiFi connection
    ESP.restart();
  }
  
  Serial.println("Connected to WiFi");
  Serial.println("IP Address: " + WiFi.localIP().toString());
  
 // WiFi.begin(ssid, password);
 // while (WiFi.status() != WL_CONNECTED) {
  //  delay(1000);
 //   Serial.println("Connecting to WiFi...");
 // }

 // Serial.println("Connected to WiFi");
  //Serial.println("IP Address: " + WiFi.localIP().toString());

  webSocket.begin(webSocketServerAddress, webSocketServerPort, "/");
  webSocket.setReconnectInterval(5000);
  webSocket.onEvent(onWebSocketEvent); // Add event handler
}

void loop() {
  webSocket.loop();

 
  if (espSerial.available()) {
    String sensorData = espSerial.readStringUntil('\n');
    Serial.println(sensorData);

    // Validate UTF-8 and Parse JSON
    if (isValidUtf8(sensorData)) {
      DynamicJsonDocument jsonDocument(200);
      DeserializationError error = deserializeJson(jsonDocument, sensorData);

      if (!error) {
        // Send JSON string to WebSocket server
        String jsonString;
        serializeJson(jsonDocument, jsonString);
        webSocket.sendTXT(jsonString);
      } else {
        Serial.println("Error parsing JSON data");
      }
    } else {
      Serial.println("Received non-UTF-8 data");
    }
  }
}


void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_TEXT) {
    if (strncmp((char*)payload, "toggle:", 7) == 0) {
      char pinName[20];
      strncpy(pinName, (char*)payload + 7, length - 7);
      pinName[length - 7] = '\0';

      bool validPin = false;
      if (strcmp(pinName, "E_motor_Down") == 0) {
        state_E_motor_Down = !state_E_motor_Down;
        digitalWrite(E_motor_Down, state_E_motor_Down);
        validPin = true;
      } else if (strcmp(pinName, "E_motor_Up") == 0) {
        state_E_motor_Up = !state_E_motor_Up;
        digitalWrite(E_motor_Up, state_E_motor_Up);
        validPin = true;
      } else if (strcmp(pinName, "E_Fan") == 0) {
        state_E_Fan = !state_E_Fan;
        digitalWrite(E_Fan, state_E_Fan);
        validPin = true;
      } else if (strcmp(pinName, "E_Pump") == 0) {
        state_E_Pump = !state_E_Pump;
        digitalWrite(E_Pump, state_E_Pump);
        validPin = true;
      } else if (strcmp(pinName, "E_pest") == 0) {
        state_E_pest = !state_E_pest;
        digitalWrite(E_pest, state_E_pest);
        validPin = true;
      } else if (strcmp(pinName, "E_Light") == 0) {
        state_E_Light = !state_E_Light;
        digitalWrite(E_Light, state_E_Light);
        validPin = true;
      } else if (strcmp(pinName, "E_Door") == 0) {
        state_E_Door = !state_E_Door;
        digitalWrite(E_Door, state_E_Door);
        validPin = true;
      } else {
        Serial.println("Invalid pin name");
      }

      if (validPin) {
        // Send pin state back to the client
        webSocket.sendTXT(pinName);
      }
    }
  }
}
