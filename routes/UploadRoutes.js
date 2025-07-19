const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const BUNNY_STORAGE_ZONE = "job-portal-storage";
const BUNNY_STORAGE_PASSWORD = "cde9b0b1-8351-4eb2-8a1867e1b6d1-4dfc-49e2"; // not API Key!
const BUNNY_STORAGE_REGION = "sg";

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded.");

    // Decide filename
    let finalFileName;
    if (req.body.source) {
      // Use "resume", "profile", etc, keeping extension
      const ext = path.extname(file.originalname);
      finalFileName = req.body.source + ext;
    } else {
      finalFileName = file.originalname;
    }
    const bunnyPath = `${req.user.id}/${finalFileName}`;
    const bunnyUrl = `https://${BUNNY_STORAGE_REGION}.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${bunnyPath}`;
    const fileStream = fs.createReadStream(file.path);

    // Upload to Bunny
    const response = await axios.put(bunnyUrl, fileStream, {
      headers: {
        AccessKey: BUNNY_STORAGE_PASSWORD,
        "Content-Type": file.mimetype,
        "Content-Length": file.size,
      },
      maxBodyLength: Infinity,
    });

    fs.unlinkSync(file.path);

    // CDN URL (adjust pull zone name to yours)
    const cdnUrl = `https://job-portal-storage-pull.b-cdn.net/${bunnyPath}`;

    res.json({ success: true, url: cdnUrl });
  } catch (error) {
    console.error("Bunny upload failed", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
