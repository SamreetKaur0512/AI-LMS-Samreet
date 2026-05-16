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

    // Send email in background - don't make user wait
    mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    ).catch(err => console.log("Contact email error:", err))

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