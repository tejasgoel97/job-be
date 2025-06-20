const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const SES = new AWS.SES();

class EmailService {
  static async sendOTP(email, otp) {
    const params = {
      Source: "no-reply@onlinemybusiness.com",
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: "Your OTP Verification Code",
        },
        Body: {
          Text: {
            Data: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
          },
        },
      },
    };
    try {
      await SES.sendEmail(params).promise();
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

module.exports = EmailService;
