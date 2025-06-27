const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lastCompanySchema = new Schema({
    companyName: { type: String, trim: true },
    yearWorked: { type: String, trim: true },
    description: { type: String, trim: true }
});

const contractorProfileSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        trim: true
    },
    lastCompanies: [lastCompanySchema],
    strengths: [{ type: String, trim: true }],
    weaknesses: [{ type: String, trim: true }],
    safetyConditions: [{ type: String, trim: true }],
    photos: [{ type: String }], // Assumes storing URLs to photos
    socialNetworks: {
        linkedin: { type: String, trim: true },
        twitter: { type: String, trim: true },
        facebook: { type: String, trim: true }
    },
    contactInfo: {
        phoneNumber: { type: String, trim: true },
        email: {
            type: String,
            required: [true, "Email is required."],
            trim: true,
            lowercase: true,
            match: [/.+\@.+\..+/, "Please fill a valid email address"]
        },
        addressLine1: { type: String, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        googleMapLink: { type: String, trim: true }
    },
    // Link to the user who created this profile
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ensures each user can only have one contractor profile
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('ContractorProfile', contractorProfileSchema);