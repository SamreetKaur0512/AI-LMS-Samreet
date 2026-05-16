const nodemailer = require("nodemailer")

const mailSender = async (email, title, body) => {
  try {
    // Try Gmail service first (most reliable)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    let info = await transporter.sendMail({
      from: `"EduAI LMS" <${process.env.MAIL_USER}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    })

    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.log("Mail error:", error.message)
    return null  // Never throw - caller handles null
  }
}

module.exports = mailSender