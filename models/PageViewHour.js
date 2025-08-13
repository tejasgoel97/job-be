// models/PageViewHour.ts
const { Schema, model } = require("mongoose");

const PageViewHourSchema = new Schema({
  visitorId: { type: String, required: true },       
  visitorType: { type:String, required:true },       // from frontend
  pageType:  { type: String, enum: ["candidate","job","company"], required: true },
  pageId:    { type: String, required: true },
  hour:      { type: Date, required: true },                // UTC start of hour
  // optional fields:
  visits:    { type: Number, default: 1 },
  firstSeen: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensures only ONE doc per visitor+page per hour
PageViewHourSchema.index({ visitorId: 1, pageType: 1, pageId: 1, hour: 1 }, { unique: true });

module.exports= model("PageViewHour", PageViewHourSchema);
