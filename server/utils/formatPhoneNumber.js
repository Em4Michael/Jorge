
const formatPhoneNumber = (phoneNumber, countryCode) => {
    if (!phoneNumber.startsWith('+')) {
      return `+${countryCode}${phoneNumber.replace(/^0+/, '')}`;
    }
    return phoneNumber;
  };
  
  module.exports = formatPhoneNumber; 
  