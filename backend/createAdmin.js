const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await User.findOneAndUpdate(
      { username: "admin" },
      {
        username: "admin",
        password: hashedPassword,
        role: "admin",
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("Admin account ready!");
    console.log("Username: admin");
    console.log("Password: Admin@123");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createAdmin();