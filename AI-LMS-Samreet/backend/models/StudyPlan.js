const mongoose = require("mongoose")

const studyPlanSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    targetCompletionDate: {
      type: Date,
      required: true,
    },
    plannedHoursPerDay: {
      type: Number,
      required: true,
      min: 0.5,
      max: 24,
    },
  },
  { timestamps: true }
)

// One plan per student per course
studyPlanSchema.index({ student: 1, course: 1 }, { unique: true })

module.exports = mongoose.model("StudyPlan", studyPlanSchema)
