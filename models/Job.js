const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  customJobTitle: { type: String },
  department: { type: String, required: true },
  description: { type: String, required: true },
  salaryFrom: { type: String, default: "" },
  salaryTo: { type: String, default: "" },
  fromSalary : { type: Number, default: 0 }, // <-- Added
  toSalary: { type: Number, default: 0 }, // <-- Added
  fromSalaryINR: { type: Number, default: 0 }, // <-- Added
  toSalaryINR: { type: Number, default: 0 }, // <-- Added
  salaryCurrency: { type: String, default: "" }, // <-- Added
  ageFrom: { type: String, default: "" },
  ageTo: { type: String, default: ""},
  expFrom: { type: String, default: "" },
  expTo: { type: String, default: "" },
  jobType: { type: String },
  qualification: { type: String },
  minExperience: { type: String, required: true },
  deadline: { type: Date },
  country: { type: String },
  city: { type: String },
  state: { type: String }, // <-- Added
  pinCode: { type: String }, // <-- Added
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
  keyResponsibilities: { type: [String], default: [] }, // <-- Added
  requiredSkills: { type: [String], default: [] }, // <-- Added
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", JobSchema);
