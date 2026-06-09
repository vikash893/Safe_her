const mongoose = require('mongoose');
const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    alternate_number: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    log: {
      type: Number,
      required: true,
    },
    aadhar_number: {
      type: String,
      required: true,
    },
    aadhar_photo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);