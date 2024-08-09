const otpStorage = new Map();

const storeOtp = (phoneNumber, otp) => {
  const expiresIn = Date.now() + 5 * 60 * 1000; 
  otpStorage.set(phoneNumber, { otp, expiresIn, verified: false });
};

const getOtp = (phoneNumber) => {
  const otpData = otpStorage.get(phoneNumber);
  if (!otpData) return null;
  if (Date.now() > otpData.expiresIn) {
    otpStorage.delete(phoneNumber);
    return null; 
  }
  return otpData.otp;
};

const markAsVerified = (phoneNumber) => {
  const otpData = otpStorage.get(phoneNumber);
  if (otpData) {
    otpData.verified = true;
    otpStorage.set(phoneNumber, otpData);
  }
};

const isVerified = (phoneNumber) => {
  const otpData = otpStorage.get(phoneNumber);
  return otpData && otpData.verified;
};

const clearOtp = (phoneNumber) => {
  otpStorage.delete(phoneNumber);
};

module.exports = { storeOtp, getOtp, markAsVerified, isVerified, clearOtp };
