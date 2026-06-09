const express = require("express");
const womenRouter = express.Router();
const upload = require("../utils/multer"); // your multer config
const women = require("../models/women");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

womenRouter.post(
  "/register",
  upload.single("photo"), // field name from form-data
  async (req, res) => {
    try {
      const {
        name,
        phone,
        email,
        password,
        alternate_number,
        emergency_phone,
        emergency_email,
        pincode,
        lat,
        log,
      } = req.body;

      // uploaded image
      const photo = req.file;

      if (
        !name ||
        !phone ||
        !email ||
        !password ||
        !alternate_number ||
        !photo ||
        !emergency_phone ||
        !emergency_email ||
        !pincode ||
        !lat ||
        !log
      ) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      const checkUser = await women.findOne({ email });
      if (checkUser) {
        return res.status(406).json({
          error: "user Already exist please login"
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newWomen = new women({
        name,
        phone,
        email,
        password: hashedPassword,
        alternate_number,
        photo: req.file.path,
        emergency_phone,
        emergency_email,
        pincode,
        lat,
        log,
      })

      await newWomen.save();
      const token = jwt.sign(
        {
          id: newWomen._id,
          name: newWomen.name,
          email: newWomen.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );


      res.status(200).json({
        message: "User registered successfully",
        newWomen,
        token,

      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);



// Login Router 
womenRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      })
    }

    const userExist = await women.findOne({ email });

    if (!userExist) {
      return res.status(400).json({
        error: "User not exist"
      })
    }

    const isMatch = await bcrypt.compare(password, userExist.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "wrong email and password"
      })
    }


    // JWT  token 
    const token = jwt.sign(
      {
        email: userExist.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      message: "User login sucessfully",
      token
    })
  } catch (error) {
    res.status(500).json({
      error: "Internal server error"
    })
    console.log(error);
  }
})

// GET me 
womenRouter.get("/me", auth, async (req, res) => {
  try {
    const email = req.user.email; // from token

    const woman = await women.findOne({ email });

    if (!woman) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User",
      name: woman.name,
      email: woman.email,
      imageUrl: `http://localhost:8000/${woman.photo.replace(/\\/g, "/")}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});



// update password 

womenRouter.put("/change-password/:email", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { email } = req.params;

    const user = await women.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "User not exist",
      });
    }

    // Compare old password (hashed)
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "Password doesn't match",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = womenRouter;