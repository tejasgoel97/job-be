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

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/subscription", require("./routes/subscription"));
app.use("/api/jobs", require("./routes/JobRoutes"));

app.use("/api/expertise", require("./routes/ExpertiseRoutes"));
app.use("/api/company", require("./routes/CompanyRoutes"));


app.use('/api/contracts', require('./routes/ContractRoutes')); // Or any other prefix you prefer

const PORT = process.env.PORT || 3000; // Define PORT here

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
