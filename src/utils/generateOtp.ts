export const generateOtpWithTime = () => {
  // Generate each digit individually, ensuring they are above zero
  const digit1 = Math.floor(Math.random() * 9) + 1; // Range: 1 to 9
  const digit2 = Math.floor(Math.random() * 9) + 1; // Range: 1 to 9
  const digit3 = Math.floor(Math.random() * 9) + 1; // Range: 1 to 9
  const digit4 = Math.floor(Math.random() * 9) + 1; // Range: 1 to 9

  // Combine the digits to form the OTP
  const otp = parseInt(`${digit1}${digit2}${digit3}${digit4}`, 10);

  const creationTime = new Date();
  return { otp, creationTime };
};
