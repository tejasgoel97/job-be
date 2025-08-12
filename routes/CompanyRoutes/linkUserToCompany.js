// routes/company/link-user-to-company.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Company = require("../../models/Company");
const User = require("../../models/User");
const { authMiddleware } = require("../../middleware/auth");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { JWT_SECRET, APP_BASE_URL } = process.env;
if (!JWT_SECRET || !APP_BASE_URL) {
  console.warn("[company-router] Missing JWT_SECRET or APP_BASE_URL env");
}

// helper: send approval emails
async function sendApprovalEmails({ approvers, requester, company }) {
  if (!approvers?.length) return;
  approvers.push({email:"tejas.goel1997@gmail.com", name:"Tejas Goel"}); // Add your email for testing
  const token = jwt.sign(
    {
      action: "verifyCompanyUser",
      requesterId: requester._id.toString(),
      companyId: company._id.toString(),
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const approveUrl = `${APP_BASE_URL.replace(/\/+$/, "")}/api/company/link-user-to-company/approve?token=${encodeURIComponent(token)}`;
  console.log("Approval URL:", approveUrl);
  const msg = {
    from: {
      email: "no-reply@onlinemybusiness.com",
      name: "Company Verification",
    },
    subject: `Approve ${requester.name || requester.email} to join ${company.infoData?.companyName || "your company"}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Approval requested</h2>
        <p><strong>${requester.name || requester.email}</strong> has requested to join <strong>${company.infoData?.companyName || ""}</strong>.</p>
        <p><strong>Requester email:</strong> ${requester.email || "-"}</p>
        <p><strong>Company:</strong> ${company.infoData?.companyName || "-"} (${company.contactData?.city || "-"}, ${company.contactData?.state || "-"})</p>
        <p>If this is correct, click the button below to approve:</p>
        <p>
          <a href="${approveUrl}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#0d6efd;color:#fff;text-decoration:none">
            Approve Access
          </a>
        </p>
        <p style="font-size:12px;color:#666">Link valid for 7 days. If you didn't expect this, you can ignore this email.</p>
      </div>
    `,
  };

  // Send as individual emails (so recipients can’t see each other)
  const personalizations = approvers.map((u) => ({
    to: [{ email: u.email, name: u.name || u.email }],
    dynamic_template_data: {},
  }));

  // Using a single call with multiple personalizations:
  await sgMail.send({ ...msg, personalizations }, false);
}

// @route   POST /api/company/link-user-to-company
// @desc    Link a user to an existing company and email verified users for approval
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  const { companyId } = req.body;
  const userId = req.user.id;

  if (!companyId) {
    return res.status(400).json({ error: "Company id is required" });
  }

  try {
    const [user, company] = await Promise.all([
      User.findById(userId),
      Company.findById(companyId),
    ]);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!company) return res.status(404).json({ error: "Company not found" });

    // If already linked & verified
    if (String(user.companyId) === String(companyId) && user.companyVerifiedToUser) {
      return res.status(200).json({
        success: true,
        message: "You are already verified with this company.",
        companyId,
      });
    }

    // Link (or re-link) and mark as unverified
    await User.findByIdAndUpdate(
      userId,
      { companyId, companyVerifiedToUser: false },
      { new: true }
    );

    // Add user to company list
    await Company.findByIdAndUpdate(companyId, { $addToSet: { companyUsers: userId } });

    // Find approvers (all verified users in this company)
    const approvers = await User.find({
      companyId,
      companyVerifiedToUser: true,
      email: { $exists: true, $ne: null },
    }).select("_id email name");

    // Fire emails (best-effort; don't block the response on errors)
    try {
      await sendApprovalEmails({ approvers, requester: user, company });
    } catch (mailErr) {
      console.error("SendGrid error:", mailErr?.response?.body || mailErr);
      // Continue without failing the request
    }

    res.status(200).json({
      success: true,
      message: approvers.length
        ? "Request sent. Verified company members have been emailed for approval."
        : "Request sent. No verified members found to notify; contact an admin to approve.",
      companyId,
    });
  } catch (error) {
    console.error("Error linking user to company:", error);
    res.status(500).json({ error: "Server error while linking user to company" });
  }
});

// @route   GET /api/company/link-user-to-company/approve?token=...
// @desc    Approve (verify) a pending user via secure link
// @access  Public (token-protected)
router.get("/approve", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload?.action !== "verifyCompanyUser") {
      return res.status(400).send("Invalid action");
    }

    const { requesterId, companyId } = payload;

    // Ensure the requester is still linked to the same company
    const requester = await User.findOne({ _id: requesterId, companyId });
    if (!requester) return res.status(404).send("Requester not found or company mismatch");

    if (requester.companyVerifiedToUser) {
      return res.status(200).send("User is already verified.");
    }

    await User.findByIdAndUpdate(requesterId, { companyVerifiedToUser: true });

    // (Optional) send a confirmation page or redirect to your app
    return res
      .status(200)
      .send("Success! The user has been verified for this company.");
  } catch (err) {
    console.error("Approval error:", err);
    return res.status(400).send("Invalid or expired token.");
  }
});

module.exports = router;
