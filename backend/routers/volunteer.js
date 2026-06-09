const express = require("express");
const bcrypt = require("bcrypt");
const volunteer = require("../models/volunteer");
const upload = require("../utils/multer");

const volunteerRouter = express.Router();

volunteerRouter.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharPhoto", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        name,
        phone,
        email,
        password,
        alternate_number,
        pincode,
        lat,
        log,
        aadhar_number,
      } = req.body;

      const photo = req.files?.photo?.[0];
      const aadharPhoto = req.files?.aadharPhoto?.[0];

      if (
        !name ||
        !phone ||
        !email ||
        !password ||
        !alternate_number ||
        !pincode ||
        !lat ||
        !log ||
        !aadhar_number ||
        !photo ||
        !aadharPhoto
      ) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      const existingVolunteer = await volunteer.findOne({ email });

      if (existingVolunteer) {
        return res.status(400).json({
          error: "Volunteer already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newVolunteer = new volunteer({
        name,
        phone,
        email,
        password: hashedPassword,
        alternate_number,
        photo: photo.path,
        pincode,
        lat,
        log,
        aadhar_number,
        aadharPhoto: aadharPhoto.path,
      });

      await newVolunteer.save();

      res.status(201).json({
        message: "Volunteer registered successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);



// login router 


module.exports = volunteerRouter;