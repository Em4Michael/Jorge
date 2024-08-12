#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>

// LCD setup
LiquidCrystal_I2C lcd(0x27, 16, 4);

// DHT22 setup
#define DHTPIN 2     
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Sensor pins
const int rainPin = A4;
const int sunPin = A5;
const int moisturePin = A1;

// DS3231 setup
#define DS3231_I2C_ADDRESS 0x68

#define ESP_RX_PIN 18 // Choose a digital pin for RX
#define ESP_TX_PIN 19 // Choose a digital pin for TX
SoftwareSerial espSerial(ESP_RX_PIN, ESP_TX_PIN); // RX, TX

// Function to convert normal decimal numbers to binary coded decimal
byte decToBcd(byte val) {
  return ((val / 10 * 16) + (val % 10));
}

// Function to convert binary coded decimal to normal decimal numbers
byte bcdToDec(byte val) {
  return ((val / 16 * 10) + (val % 16));
}

// Function to set the DS3231 time
void setDS3231time(byte second, byte minute, byte hour, byte dayOfWeek, byte dayOfMonth, byte month, byte year) {
  Wire.beginTransmission(DS3231_I2C_ADDRESS);
  Wire.write(0); // set next input to start at the seconds register
  Wire.write(decToBcd(second)); // set seconds
  Wire.write(decToBcd(minute)); // set minutes
  Wire.write(decToBcd(hour)); // set hours
  Wire.write(decToBcd(dayOfWeek)); // set day of week (1=Sunday, 7=Saturday)
  Wire.write(decToBcd(dayOfMonth)); // set date (1 to 31)
  Wire.write(decToBcd(month)); // set month
  Wire.write(decToBcd(year)); // set year (0 to 99)
  Wire.endTransmission();
}

// Function to read the DS3231 time
void readDS3231time(byte *second, byte *minute, byte *hour, byte *dayOfWeek, byte *dayOfMonth, byte *month, byte *year) {
  Wire.beginTransmission(DS3231_I2C_ADDRESS);
  Wire.write(0); // set DS3231 register pointer to 00h
  Wire.endTransmission();
  Wire.requestFrom(DS3231_I2C_ADDRESS, 7);
  *second = bcdToDec(Wire.read() & 0x7f);
  *minute = bcdToDec(Wire.read());
  *hour = bcdToDec(Wire.read() & 0x3f);
  *dayOfWeek = bcdToDec(Wire.read());
  *dayOfMonth = bcdToDec(Wire.read());
  *month = bcdToDec(Wire.read());
  *year = bcdToDec(Wire.read());
}

void setup() {
  Wire.begin();
  lcd.begin();
  lcd.backlight();
  dht.begin();
  Serial.begin(9600);
   espSerial.begin(115200);
  pinMode(rainPin, INPUT);
  pinMode(sunPin, INPUT);
  pinMode(moisturePin, INPUT);
}

void loop() {
  StaticJsonDocument<200> jsonDocMega;
  StaticJsonDocument<200> jsonDocUno;
  String dataUno = "";

  if (Serial.available()) {
    while (Serial.available()) {
      char received = Serial.read();
      dataUno += received;
    }
    //Serial.println("Received from Uno: " + dataUno);
   // Serial1.println("Received from Uno: " + dataUno);
    
    // Deserialize the JSON data from Uno
    DeserializationError error = deserializeJson(jsonDocUno, dataUno);
    if (error) {
      Serial.println("Failed to parse JSON from Uno");
      return;
    }
  }

  delay(500);

  // Read sensor values
  int rainValue = analogRead(rainPin);
  int sunValue = analogRead(sunPin);
  int moistureValue = analogRead(moisturePin);

  // Convert sensor values to percentages
  int rainPercent = map(rainValue, 0, 1023, 100, 0);
 // int sunPercent = map(sunValue, 0, 1023, 0, 100);
  int moisturePercent = map(moistureValue, 0, 1023, 100, 0);

 
  // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):
  float voltage = sunValue * (5.0 / 1023.0);
  float UVindex = voltage/0.1;
 
  // Read temperature and humidity from DHT22
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  float heatIndex = dht.computeHeatIndex(temperature, humidity, false);

  // Read time from DS3231
  byte second, minute, hour, dayOfWeek, dayOfMonth, month, year;
  readDS3231time(&second, &minute, &hour, &dayOfWeek, &dayOfMonth, &month, &year);

  // Create JSON object for Mega
  jsonDocMega["Date"] = String(dayOfMonth) + "/" + String(month) + "/" + String(year); // Example: "7/7/24"
  jsonDocMega["Time"] = String(hour) + ":" + String(minute); // Example: "21:19"
  jsonDocMega["RN"] = rainPercent;
  jsonDocMega["UV"] = UVindex;
  jsonDocMega["MO"] = moisturePercent;
  jsonDocMega["TP"] = temperature;
  jsonDocMega["HM"] = humidity;
  jsonDocMega["HI"] = heatIndex;

  // Merge the JSON data from Uno and Mega
  jsonDocMega["Access"] = jsonDocUno["Access"];
  jsonDocMega["Exist"] = jsonDocUno["Exist"];

  // Serialize JSON to string
// Before sending, add start and end markers
String jsonString;
serializeJson(jsonDocMega, jsonString);
//jsonString = "{" + jsonString + "}"; // Add markers
espSerial.println(jsonString);

  
 // String jsonString;
 // serializeJson(jsonDocMega, jsonString);

  // Print JSON string to Serial
 // Serial.print("sensor : ");
 // Serial.println(jsonString);

 // espSerial.print("sensor to ESP : ");
 // espSerial.println(jsonString);

  // Serial.print("sensor2 : ");
 // Serial.print(jsonString + '\n');

 // espSerial.print("sensor to ESP2 : ");
//espSerial.print(jsonString + '\n');

  // Display values on the LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("RN:");
  lcd.print(rainPercent);
  lcd.print("% UV:");
  lcd.print(UVindex);
  lcd.print("%");

  lcd.setCursor(0, 1);
  lcd.print("MO:");
  lcd.print(moisturePercent);
  lcd.print("% TP:");
  lcd.print(temperature);
  lcd.print("C");

  lcd.setCursor(0, 2);
  lcd.print("HM: ");
  lcd.print(humidity);
  lcd.print("%");

  lcd.setCursor(0, 3);
  lcd.print("HI: ");
  lcd.print(heatIndex);
  lcd.print("C");

  delay(1000);
}
