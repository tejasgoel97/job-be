// services/EmailServices.js
const sgMail = require("@sendgrid/mail");

const FROM_EMAIL = "no-reply@onlinemybusiness.com";
const APP_NAME = "Online My Business";

if (!process.env.SENDGRID_API_KEY) {
  console.warn("[EmailServices] Missing SENDGRID_API_KEY env var");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailServices {
  /**
   * Send an OTP email for a specific reason (e.g., "Register")
   * @param {string} email - Recipient email
   * @param {string|number} OTP - The one-time password
   * @param {string} reason - Reason for sending OTP, e.g. "Register"
   * @returns {Promise<void>}
   */
  static async sendOtp(email, OTP, reason = "Register") {
    if (!email) throw new Error("Email is required");
    if (!OTP) throw new Error("OTP is required");

    const { subject, html, text } = EmailServices.#buildOtpContent(OTP, reason);

    const msg = {
      to: email,
      from: { email: FROM_EMAIL, name: APP_NAME },
      subject,
      html,
      text,
    };

    try {
      await sgMail.send(msg);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[EmailServices] OTP email sent to ${email} for ${reason}`);
      }
    } catch (err) {
      console.error("[EmailServices] SendGrid error:", err?.response?.body || err);
      throw new Error("Failed to send OTP email");
    }
  }

  // --- private helpers ---

  static #buildOtpContent(OTP, reason) {
    const ttlMins = 10; // suggest code expiry (adjust to your backend)
    const safeOtp = String(OTP).trim();

    switch ((reason || "").toLowerCase()) {
      case "register":
      default: {
        const subject = `Your ${APP_NAME} OTP: ${safeOtp}`;
        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">
            <h2 style="margin:0 0 8px">${APP_NAME} Verification</h2>
            <p>Use the following One-Time Password (OTP) to complete your <strong>registration</strong>:</p>
            <p style="font-size:24px;font-weight:700;letter-spacing:2px;margin:16px 0">
              ${safeOtp}
            </p>
            <p>This code is valid for <strong>${ttlMins} minutes</strong>. Do not share it with anyone.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
            <p style="font-size:12px;color:#666">If you didn’t request this code, you can safely ignore this email.</p>
          </div>
        `.trim();

        const text = `
${APP_NAME} Verification

Use this One-Time Password (OTP) to complete your registration:

${safeOtp}

This code is valid for ${ttlMins} minutes. Do not share it with anyone.
If you didn’t request this code, you can ignore this email.
        `.trim();

        return { subject, html, text };
      }
    }
  }
}

module.exports = EmailServices;
