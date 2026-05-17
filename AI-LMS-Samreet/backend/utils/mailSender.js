const nodemailer = require("nodemailer")

const mailSender = async (email, title, body) => {
  try {
    console.log("MAIL CONFIG:", {
      host: process.env.MAIL_HOST,
      user: process.env.MAIL_USER,
      passLength: process.env.MAIL_PASS?.length,
    })

    let transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    let info = await transporter.sendMail({
      from: `"EduAI LMS" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log("Email sent successfully:", info.messageId)
    return info
  } catch (error) {
    console.log("mailSender ERROR:", error.message)
    return null
  }
}

module.exports = mailSender