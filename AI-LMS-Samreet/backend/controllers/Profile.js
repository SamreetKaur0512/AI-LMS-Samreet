const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress")
const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const cloudinary = require("cloudinary").v2
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    })
    await user.save()

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    console.log(id)
    const user = await User.findById({ _id: id })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // 1. Delete profile image from Cloudinary
    if (user.image && user.image.includes("cloudinary")) {
      try {
        // Extract public_id from cloudinary URL
        const urlParts = user.image.split("/")
        const fileName = urlParts[urlParts.length - 1].split(".")[0]
        const folder = process.env.FOLDER_NAME || "ai_lms"
        const publicId = `${folder}/${fileName}`
        await cloudinary.uploader.destroy(publicId)
        console.log("Profile image deleted from Cloudinary:", publicId)
      } catch (err) {
        console.log("Could not delete profile image from Cloudinary:", err.message)
      }
    }

    // 2. Delete user ratings and reviews, and remove them from courses
    const userReviews = await RatingAndReview.find({ user: id })
    for (const review of userReviews) {
      await Course.findByIdAndUpdate(review.course, {
        $pull: { ratingAndReviews: review._id }
      })
    }
    await RatingAndReview.deleteMany({ user: id })
    console.log("Deleted", userReviews.length, "reviews for user:", id)

    // 3. Delete associated Profile
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    })

    // 4. Remove user from enrolled courses
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      )
    }

    // 5. If instructor, handle their courses
    if (user.accountType === "Instructor") {
      const Section = require("../models/Section")
      const SubSection = require("../models/SubSection")
      const Category = require("../models/Category")
      const instructorCourses = await Course.find({ instructor: id })

      for (const course of instructorCourses) {
        const enrolledCount = course.studentsEnrolled?.length || 0

        if (enrolledCount > 0) {
          // Students enrolled — keep course, anonymize instructor
          // isAnonymized hides it from catalog for non-enrolled users
          await Course.findByIdAndUpdate(course._id, {
            $set: { instructorName: "Anonymous Instructor", instructor: null, isAnonymized: true }
          })
          console.log("Kept course with anonymous instructor:", course.courseName, "| enrolled:", enrolledCount)
        } else {
          // No enrolled students — fully delete course
          for (const sectionId of course.courseContent) {
            const section = await Section.findById(sectionId)
            if (section) {
              for (const subSectionId of section.subSection) {
                await SubSection.findByIdAndDelete(subSectionId)
              }
            }
            await Section.findByIdAndDelete(sectionId)
          }
          if (course.category) {
            await Category.findByIdAndUpdate(course.category, {
              $pull: { courses: course._id }
            })
          }
          await RatingAndReview.deleteMany({ course: course._id })
          await Course.findByIdAndDelete(course._id)
          console.log("Fully deleted course:", course.courseName)
        }
      }
      console.log("Processed", instructorCourses.length, "courses for instructor:", id)
    }

    // 6. Delete course progress
    await CourseProgress.deleteMany({ userId: id })

    // 7. Delete user
    await User.findByIdAndDelete({ _id: id })

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    console.log("DEBUG: Request Files ->", req.files);
    console.log("DEBUG: User ID from Token ->", req.user.id);

    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      })
    }

    const displayPicture = req.files.displayPicture
    const userId = req.user.id

    // Delete old profile image from Cloudinary before uploading new one
    const existingUser = await User.findById(userId)
    if (existingUser?.image && existingUser.image.includes("cloudinary")) {
      try {
        const urlParts = existingUser.image.split("/")
        const fileName = urlParts[urlParts.length - 1].split(".")[0]
        const folder = process.env.FOLDER_NAME || "ai_lms"
        const publicId = `${folder}/${fileName}`
        await cloudinary.uploader.destroy(publicId)
        console.log("Old profile image deleted from Cloudinary:", publicId)
      } catch (err) {
        console.log("Could not delete old profile image:", err.message)
      }
    }

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course?.studentsEnrolled?.length || 0
      const totalAmountGenerated = totalStudentsEnrolled * (course?.price || 0)

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}