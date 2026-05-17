const https = require("https")

const mailSender = async (email, title, body) => {
  try {
    const data = JSON.stringify({
      sender: { name: "EduAI LMS", email: "a68c66001@smtp-brevo.com" },
      to: [{ email: email }],
      subject: title,
      htmlContent: body,
    })

    return new Promise((resolve) => {
      const options = {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(data),
        },
      }

      const req = https.request(options, (res) => {
        let responseData = ""
        res.on("data", (chunk) => { responseData += chunk })
        res.on("end", () => {
          console.log("Email API response:", res.statusCode, responseData)
          if (res.statusCode === 201) {
            console.log("Email sent successfully to:", email)
            resolve({ messageId: JSON.parse(responseData).messageId })
          } else {
            console.log("Email API error:", responseData)
            resolve(null)
          }
        })
      })

      req.on("error", (error) => {
        console.log("Email request error:", error.message)
        resolve(null)
      })

      req.write(data)
      req.end()
    })
  } catch (error) {
    console.log("mailSender ERROR:", error.message)
    return null
  }
}

module.exports = mailSender