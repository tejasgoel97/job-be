const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  customJobTitle: { type: String },
  department: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: String, required: true },
  salaryFrom: { type: String, default:"" },
  salaryTo: { type: String, default:""},
  jobType: { type: String },
  qualification: { type: String },
  minExperience: { type: String, required: true },
  deadline: { type: Date },
  country: { type: String },
  city: { type: String },

  address: { type: String },
    expertise: {
    type: [
      {
        category: { type: String },
        subcategories: { type: [String], default: [] },
        processes: { type: [String], default: [] },
      },
    ],
    default: [],
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", JobSchema);
