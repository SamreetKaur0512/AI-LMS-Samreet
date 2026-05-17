const nodemailer = require("nodemailer")

const mailSender = async (email, title, body) => {
  try {
    console.log(`mailSender: transporter created for ${process.env.MAIL_USER}`)

    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
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