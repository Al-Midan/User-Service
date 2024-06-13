import nodemailer from "nodemailer";

export const sendOtpEmail = async (user: any, otp: Number) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.EmailPassword,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.Email,
      to: user.email,
      subject: "Your OTP Code",
      html: `<div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
  <div style="background-color: white; padding: 30px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h1 style="color: #333; margin-top: 0;">Verify Your Email Address</h1>
    <p style="color: #666;">Dear ${user.username},</p>
    <p style="color: #666;">Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address:</p>
    <div style="background-color: #0077b6; color: white; padding: 20px; text-align: center; border-radius: 5px; font-size: 24px; margin: 20px 0;">
      ${otp}
    </div>
    <p style="color: #666;">This code is valid for a limited time. If you did not initiate this request, please ignore this email.</p>
    <p style="color: #666; margin-bottom: 0;">Best regards,<br>Al-Midan Team</p>
  </div>
</div>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
