const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config(); // Load environment variables from .env
const app = express();
app.use(cors());

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.get("/health", (req, res) => {
  console.log("OKAY")
  res.send("OK");

})
// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/subscription", require("./routes/subscription"));
app.use("/api/jobs", require("./routes/JobRoutes"));

app.use("/api/expertise", require("./routes/ExpertiseRoutes"));
app.use("/api/company", require("./routes/CompanyRoutes"));

app.use('/api/contracts', require('./routes/ContractRoutes')); // Or any other prefix you prefer
app.use('/api/resume', require('./routes/CandidateResumeRoutes'));
// In your main server file (e.g., server.js or app.js)

// ... other app.use() statements
app.use("/api/job-application", require("./routes/JobApplicationRoutes"));
app.use("/api/contractor-profile", require("./routes/ContractorProfileRoutes"));
app.use("/api/contract-application", require("./routes/ContractApplicationRoutes"));
app.use("/api/upload", require("./routes/UploadRoutes"));

const PORT = process.env.PORT || 3000; // Define PORT here

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;