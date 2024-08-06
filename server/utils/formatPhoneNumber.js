// utils/formatPhoneNumber.js

const formatPhoneNumber = (phoneNumber, countryCode) => {
    // Format phone number to E.164 format if not already
    if (!phoneNumber.startsWith('+')) {
      return `+${countryCode}${phoneNumber.replace(/^0+/, '')}`;
    }
    return phoneNumber;
  };
  
  module.exports = formatPhoneNumber; 
  