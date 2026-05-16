const mongoose = require("mongoose");

// Define the contact us schema
const contactUsSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			required: true,
			trim: true,
		},
		lastname: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
		phoneNo: {
			type: String,
			trim: true,
		},
		countrycode: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["Pending", "Resolved"],
			default: "Pending",
		},
	},
	{ timestamps: true }
);

// Export the ContactUs model
module.exports = mongoose.model("ContactUs", contactUsSchema);