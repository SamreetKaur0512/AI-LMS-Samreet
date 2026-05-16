const { contactUsEmail } = require("../mail/templates/contactFormRes")
const mailSender = require("../utils/mailSender")
const ContactUs = require("../models/ContactUs")

exports.contactUsController = async (req, res) => {
  const { email, firstname, lastname, message, phoneNo, countrycode } = req.body
  console.log(req.body)
  try {
    // Save contact to database
    const contact = new ContactUs({
      firstname,
      lastname,
      email,
      message,
      phoneNo,
      countrycode,
    })
    await contact.save()

    // Send confirmation email to user (background)
    mailSender(
      email,
      "We received your message - EduAI LMS",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    ).catch(err => console.log("Contact user email error:", err))

    // Send notification email to admin (background)
    mailSender(
      process.env.MAIL_USER,
      `New Contact Form Message from ${firstname} ${lastname}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;border-radius:8px;">
        <h2 style="color:#FFD60A;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstname} ${lastname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${countrycode} ${phoneNo}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#fff;padding:15px;border-left:4px solid #FFD60A;border-radius:4px;">
          ${message}
        </div>
        <p style="color:#999;font-size:12px;margin-top:20px;">Received on ${new Date().toLocaleString("en-IN")}</p>
      </div>`
    ).catch(err => console.log("Contact admin email error:", err))

    return res.json({
      success: true,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.log("Error", error)
    console.log("Error message :", error.message)
    return res.json({
      success: false,
      message: "Something went wrong...",
    })
  }
}

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.find({}).sort({ createdAt: -1 })
    return res.json({
      success: true,
      data: contacts,
    })
  } catch (error) {
    console.log("Error fetching contacts:", error)
    return res.json({
      success: false,
      message: "Failed to fetch contacts",
    })
  }
}

exports.updateContactStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const contact = await ContactUs.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!contact) {
      return res.json({
        success: false,
        message: "Contact not found",
      })
    }

    return res.json({
      success: true,
      message: "Contact status updated successfully",
      data: contact,
    })
  } catch (error) {
    console.log("Error updating contact status:", error)
    return res.json({
      success: false,
      message: "Failed to update contact status",
    })
  }
}