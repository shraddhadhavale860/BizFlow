const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("./models/user");
const Customer = require("./models/customer");
const Bill = require("./models/bill");

require("dotenv").config();

const app = express();


// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());


// =========================
// HOME / TEST
// =========================

app.get("/", (req, res) => {
  res.send("BizFlow Backend is working!");
});


// =========================
// LOGIN
// =========================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt:", username);

    // Check fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Clean username
    const cleanUsername = username.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      username: cleanUsername,
    });

    console.log(
      "User found:",
      user ? user.username : "NO USER"
    );

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    console.log(
      "Password correct:",
      isPasswordCorrect
    );

    // Wrong password
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log(
      "Login successful:",
      user.username
    );

    // Send response
    return res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =========================
// ADD CUSTOMER
// =========================

app.post("/api/customers", async (req, res) => {
  try {
    const { name, whatsappNumber } = req.body;

    console.log(
      "Adding customer:",
      name,
      whatsappNumber
    );

    // Check fields
    if (!name || !whatsappNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name and WhatsApp number are required",
      });
    }

    // Create customer
    const customer = new Customer({
      name: name.trim(),
      whatsappNumber: whatsappNumber.trim(),
    });

    // Save to MongoDB
    await customer.save();

    console.log(
      "Customer added:",
      customer.name
    );

    return res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customer,
    });

  } catch (error) {
    console.error(
      "Add customer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add customer",
    });
  }
});


// =========================
// GET ALL CUSTOMERS
// =========================

app.get("/api/customers", async (req, res) => {
  try {

    const customers = await Customer.find()
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      customers,
    });

  } catch (error) {

    console.error(
      "Get customers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
});


// =========================
// DELETE CUSTOMER
// =========================

app.delete(
  "/api/customers/:id",
  async (req, res) => {
    try {

      const { id } = req.params;

      const customer =
        await Customer.findByIdAndDelete(id);

      // Customer not found
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      console.log(
        "Customer deleted:",
        customer.name
      );

      return res.json({
        success: true,
        message:
          "Customer deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete customer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete customer",
      });
    }
  }
);
// =========================
// BILL APIs
// =========================

// Create new bill
app.post("/api/bills", async (req, res) => {
  try {
    const {
      customer,
      items,
      subtotal,
      grandTotal,
    } = req.body;

    if (
      !customer ||
      !items ||
      items.length === 0 ||
      subtotal === undefined ||
      grandTotal === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer and bill items are required",
      });
    }

    const bill = new Bill({
      customer,
      items,
      subtotal,
      grandTotal,
    });

    await bill.save();

    console.log("Bill created:", bill._id);

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    console.error("Create bill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create bill",
    });
  }
});


// Get all bills
app.get("/api/bills", async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("customer")
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
    });
  }
});
// =========================
// WHATSAPP API
// =========================

app.post("/api/whatsapp/send", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanNumber = String(phoneNumber).replace(/\D/g, "");

    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: cleanNumber,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp template sent:", cleanNumber);

    return res.json({
      success: true,
      message: "WhatsApp message sent successfully",
      data: response.data,
    });

  } catch (error) {
    console.error(
      "WhatsApp error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        "Failed to send WhatsApp message",
    });
  }
});
// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log(
      "MongoDB connected successfully"
    );

    app.listen(
      process.env.PORT || 5000,
      () => {

        console.log(
          `Server running on port ${
            process.env.PORT || 5000
          }`
        );

      }
    );

  })

  .catch((error) => {

    console.error(
      "MongoDB connection failed:",
      error.message
    );

  });