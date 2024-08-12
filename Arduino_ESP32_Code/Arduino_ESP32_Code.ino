#include <ArduinoJson.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <WebSocketsClient.h> 

const char* ssid = "MTN_4G_31E593";
const char* password = "C6E31CBF";
const char* webSocketServerAddress = "192.168.0.139"; 
const uint16_t webSocketServerPort = 5000;
WebSocketsClient webSocket;

#define RX1_PIN 16 // Use GPIO 16 for RX
#define TX1_PIN 17 // Use GPIO 17 for TX
HardwareSerial espSerial(1); // Use Serial1

void setup() {
  Serial.begin(115200);
  espSerial.begin(115200, SERIAL_8N1, RX1_PIN, TX1_PIN);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  Serial.println("IP Address: " + WiFi.localIP().toString());

  webSocket.begin(webSocketServerAddress, webSocketServerPort, "/");
  webSocket.setReconnectInterval(5000);
  webSocket.onEvent(onWebSocketEvent); // Add event handler
}

void loop() {
  webSocket.loop();

  // Replace Serial.available with Serial.availableForWrite() to prevent buffer overflow
  if (espSerial.available()) {
    String sensorData = espSerial.readStringUntil('\n');
    Serial.println(sensorData);

    // Parse JSON data
    DynamicJsonDocument jsonDocument(200);
    DeserializationError error = deserializeJson(jsonDocument, sensorData);

    if (!error) {
     // Create a JSON object and add sensor data to it
JsonObject sensorJson = jsonDocument.as<JsonObject>();
sensorJson["sensorData"] = sensorData;

// Serialize JSON object to a string
String jsonString;
serializeJson(sensorJson, jsonString);

// Send JSON string to WebSocket server
webSocket.sendTXT(jsonString);
    } else {
      Serial.println("Error parsing JSON data");
    }
  }
}

void onWebSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket");
      break;
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket");
      break;
    case WStype_TEXT:
      Serial.printf("Received text: %s\n", payload);
      break;
    case WStype_BIN:
      Serial.printf("Received binary data\n");
      break;
    case WStype_ERROR:
      Serial.println("WebSocket error");
      break;
    case WStype_PING:
      Serial.println("WebSocket ping");
      break;
    case WStype_PONG:
      Serial.println("WebSocket pong");
      break;
  }
}
