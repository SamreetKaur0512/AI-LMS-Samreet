const mongoose = require("mongoose")

const aiUsageLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  message: { type: String },
  tokensUsed: { type: Number, default: 0 },
  topic: { type: String, default: "General" },
  feature: { type: String, enum: ["chatbot", "timetable", "quiz"], default: "chatbot" },
}, { timestamps: true })

module.exports = mongoose.model("AIUsageLog", aiUsageLogSchema)
