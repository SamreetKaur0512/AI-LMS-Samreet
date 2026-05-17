const nodemailer = require("nodemailer")

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const user = process.env.MAIL_USER
  const pass = process.env.MAIL_PASS

  if (!user || !pass) {
    console.error("mailSender: MAIL_USER or MAIL_PASS not set in .env")
    return null
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,        // port 587 uses STARTTLS, not SSL
    pool: true,
    maxConnections: 3,
    auth: {
      user: user,
      pass: pass.replace(/\s/g, ""),
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  console.log("mailSender: transporter created for", user)
  return transporter
}

const mailSender = async (email, title, body) => {
  try {
    const t = getTransporter()
    if (!t) return null

    const info = await t.sendMail({
      from: `"EduAI LMS" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("mailSender ERROR:", error.message)
    if (error.message.includes("Invalid login") || error.message.includes("535")) {
      console.error(">> Gmail auth failed — regenerate App Password at https://myaccount.google.com/apppasswords")
      transporter = null
    }
    return null
  }
}

module.exports = mailSender