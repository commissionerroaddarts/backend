import sendMail from "../config/mail.js";
import { CONTACT_US, THANKS_FOR_CONTACTING } from "../constants/emailTemplets.js";
import ContactUs from "../models/ContactUs.js";


// Create Contact Message
export const createContact = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, message } = req.body;
    const newContact = new ContactUs({ firstname, lastname, email, phone, message });
    await newContact.save();

    sendMail(THANKS_FOR_CONTACTING({ firstname, email }));
    sendMail(CONTACT_US({ firstname, lastname, email: "commissioner@roaddarts.com", phone, message }));
    res.status(201).json({ message: 'Contact message submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await ContactUs.find().skip(skip).limit(limit);
    const totalItems = await ContactUs.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: contacts,
      totalItems,
      totalPages,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

