import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const contactUsSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const ContactUs = model('ContactUs', contactUsSchema);

export default ContactUs;
