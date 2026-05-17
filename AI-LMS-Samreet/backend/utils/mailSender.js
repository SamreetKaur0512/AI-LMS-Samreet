const nodemailer = require("nodemailer")

const mailSender = async (email, title, body) => {
  try {
    const user = process.env.MAIL_USER
    const pass = process.env.MAIL_PASS

    if (!user || !pass) {
      console.error("mailSender: MAIL_USER or MAIL_PASS not set in .env")
      return null
    }

    // Remove any spaces from app password (Gmail allows both formats)
    const cleanPass = pass.replace(/\s/g, "")

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,       // SSL — more reliable than port 587 on most hosts
      auth: {
        user: user,
        pass: cleanPass,
      },
    })

    const info = await transporter.sendMail({
      from: `"EduAI LMS" <${user}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("mailSender ERROR:", error.message)
    if (
      error.message.includes("Invalid login") ||
      error.message.includes("Username and Password") ||
      error.message.includes("535")
    ) {
      console.error("=== GMAIL AUTH FAILED ===")
      console.error("1. Go to: https://myaccount.google.com/apppasswords")
      console.error("2. Generate a NEW App Password for 'Mail'")
      console.error("3. Update MAIL_PASS in your .env (no spaces needed)")
      console.error("4. Make sure 2-Step Verification is ON")
    }
    return null
  }
}

module.exports = mailSender