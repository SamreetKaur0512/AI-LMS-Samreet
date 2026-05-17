const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: `This email is not registered with us.`,
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    await User.findOneAndUpdate(
      { email },
      { token, resetPasswordExpires: Date.now() + 3600000 },
      { new: true }
    );

    const url = `${process.env.FRONTEND_URL}/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset - EduAI LMS",
      `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
       <a href="${url}" style="background:#FFD60A;padding:10px 20px;border-radius:5px;color:#000;text-decoration:none;font-weight:bold;">Reset Password</a>
       <p>If you did not request this, ignore this email.</p>`
    );

    res.json({
      success: true,
      message: "Reset email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("resetPasswordToken error:", error.message);
    return res.json({
      success: false,
      message: `Error sending reset email.`,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (!password || !confirmPassword || !token) {
      return res.json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match." });
    }

    const userDetails = await User.findOne({ token });
    if (!userDetails) {
      return res.json({ success: false, message: "Token is invalid." });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Token has expired. Please request a new reset link.",
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log("Resetting password for user:", userDetails.email);

    // Directly set on the document and save — most reliable approach
    userDetails.password = encryptedPassword;
    userDetails.token = undefined;
    userDetails.resetPasswordExpires = undefined;
    await userDetails.save();

    console.log("Password reset successfully for:", userDetails.email);

    return res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("resetPassword error:", error.message);
    return res.json({
      success: false,
      message: "Error resetting password.",
    });
  }
};