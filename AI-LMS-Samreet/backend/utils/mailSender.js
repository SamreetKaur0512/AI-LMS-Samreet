const nodemailer = require("nodemailer")

const mailSender = async (email, title, body) => {
  try {
    console.log("mailSender: MAIL_USER =", process.env.MAIL_USER ? process.env.MAIL_USER : "NOT SET")
    console.log("mailSender: MAIL_PASS =", process.env.MAIL_PASS ? "SET (length " + process.env.MAIL_PASS.length + ")" : "NOT SET")

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error("mailSender: MAIL_USER or MAIL_PASS is missing from .env file!")
      return null
    }

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

    // Verify connection before sending
    await transporter.verify()
    console.log("mailSender: SMTP connection verified successfully")

    let info = await transporter.sendMail({
      from: `"EduAI LMS" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log("mailSender: Email sent successfully. MessageId:", info.messageId)
    return info
  } catch (error) {
    console.error("mailSender ERROR:", error.message)
    if (error.message.includes("Invalid login") || error.message.includes("Username and Password")) {
      console.error(">> Gmail auth failed. Your App Password may be wrong or expired.")
      console.error(">> Go to: https://myaccount.google.com/apppasswords and generate a new one.")
      console.error(">> Make sure 2-Step Verification is ON for your Google account.")
    }
    return null
  }
}

module.exports = mailSender