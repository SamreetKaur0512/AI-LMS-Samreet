const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5,
	},
});

async function sendVerificationEmail(email, otp) {
	try {
		console.log(`Attempting to send OTP email to: ${email}`);
		const mailResponse = await mailSender(
			email,
			"Verification Email - EduAI LMS",
			emailTemplate(otp)
		);
		if (mailResponse) {
			console.log("OTP email sent successfully. MessageId:", mailResponse.messageId);
		} else {
			console.error("OTP email failed — mailSender returned null. Check MAIL_USER and MAIL_PASS in .env");
		}
	} catch (error) {
		console.error("Error sending OTP email:", error.message);
	}
}

// Pre-save hook — awaits email so errors are visible in logs
OTPSchema.pre("save", async function (next) {
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;