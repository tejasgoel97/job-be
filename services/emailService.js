// services/EmailServices.js
const sgMail = require("@sendgrid/mail");

const FROM_EMAIL = "no-reply@onlinemybusiness.com";
const APP_NAME = "Online My Business";

if (!process.env.SENDGRID_API_KEY) {
  console.warn("[EmailServices] Missing SENDGRID_API_KEY env var");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to send emails
const sendEmail = async (msg) => {
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

class EmailServices {
  /**
   * Send new job alert email
   * @param {string} email - Recipient email
   * @param {Object} jobData - Job details
   * @returns {Promise<void>}
   */


  static async sendEmail(msg) {
     try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
  }

  static async sendNewJobAlert(email, jobData) {
    if (!email) throw new Error("Email is required");
    if (!jobData) throw new Error("Job data is required");

    const { subject, html, text } = EmailServices.#buildNewJobAlertContent(jobData);

    const msg = {
      to: email,
      from: { email: FROM_EMAIL, name: APP_NAME },
      subject,
      html,
      text,
    };

    return this.sendEmail(msg);
  }

  /**
   * Send application status change alert email
   * @param {string} email - Recipient email
   * @param {Object} applicationData - Application details
   * @returns {Promise<void>}
   */
  static async sendStatusChangeAlert(email, applicationData) {
    if (!email) throw new Error("Email is required");
    if (!applicationData) throw new Error("Application data is required");

    const { subject, html, text } = EmailServices.#buildStatusChangeAlertContent(applicationData);

    const msg = {
      to: email,
      from: { email: FROM_EMAIL, name: APP_NAME },
      subject,
      html,
      text,
    };

    return this.sendEmail(msg);
  }

  static #buildNewJobAlertContent(jobData) {
    const subject = `New Job Alert: ${jobData.title} at ${jobData.companyName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Job Opportunity</h2>
        <h3>${jobData.title}</h3>
        <div style="margin: 20px 0;">
          <p><strong>Company:</strong> ${jobData.companyName}</p>
          <p><strong>Department:</strong> ${jobData.department}</p>
          <p><strong>Location:</strong> ${jobData.jobLocation}</p>
          ${jobData.salaryFrom && jobData.salaryTo ? 
            `<p><strong>Salary Range:</strong> ${jobData.salaryCurrency} ${jobData.salaryFrom} - ${jobData.salaryTo}</p>` 
            : ''}
        </div>
        <div style="margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/jobs/${jobData.jobId}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Job Details
          </a>
        </div>
      </div>
    `;

    const text = `
      New Job Opportunity: ${jobData.title}
      Company: ${jobData.companyName}
      Department: ${jobData.department}
      Location: ${jobData.jobLocation}
      ${jobData.salaryFrom && jobData.salaryTo ? 
        `Salary Range: ${jobData.salaryCurrency} ${jobData.salaryFrom} - ${jobData.salaryTo}` 
        : ''}
      
      View the job at: ${process.env.FRONTEND_URL}/jobs/${jobData.jobId}
    `;

    return { subject, html, text };
  }

  static #buildStatusChangeAlertContent(applicationData) {
    const subject = `Application Status Update: ${applicationData.jobTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Status Update</h2>
        <h3>${applicationData.jobTitle}</h3>
        <div style="margin: 20px 0;">
          <p><strong>Company:</strong> ${applicationData.companyName}</p>
          <p><strong>New Status:</strong> <span style="color: #007bff; font-weight: bold;">${applicationData.changedStatus}</span></p>
          <p><strong>Department:</strong> ${applicationData.jobDepartment}</p>
        </div>
        <div style="margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/applications/${applicationData.jobId}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Application
          </a>
        </div>
      </div>
    `;

    const text = `
      Application Status Update: ${applicationData.jobTitle}
      Company: ${applicationData.companyName}
      New Status: ${applicationData.changedStatus}
      Department: ${applicationData.jobDepartment}
      
      View your application at: ${process.env.FRONTEND_URL}/applications/${applicationData.jobId}
    `;

    return { subject, html, text };
  }
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
