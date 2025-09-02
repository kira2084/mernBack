import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  let foundUser = await User.findOne({ email: email.trim().toLowerCase() });
  //console.log("found", foundUser);
  if (!foundUser) {
    return res.status(400).json({ msg: "No user found with this email" });
  }
  if (foundUser) {
    const isMatch = await foundUser.comparePassword(password);

    if (isMatch) {
      const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      return res.status(200).json({
        msg: "user logged in",
        token,
        user: {
          _id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
        },
      });
    } else {
      return res.status(400).json({ msg: "Bad password" });
    }
  } else {
    return res.status(400).json({ msg: "Bad credentails" });
  }
};

const dashboard = async (req, res) => {
  const luckyNumber = Math.floor(Math.random() * 100);

  res.status(200).json({
    msg: `Hello, ${req.user.name}`,
    secret: `Here is your authorized data, your lucky number is ${luckyNumber}`,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide username, email, and password" });
    }

    // Check if user already exists
    let foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    // Hash password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const person = new User({
      name,
      email,
      password,
    });
    await person.save();

    return res.status(201).json({
      msg: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.resetOTP !== otp || Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.isOtpVerified = true;
    await user.save();

    res.json({
      message: "OTP verified successfully. You may now reset your password.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    // console.log(email, password);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isOtpVerified) {
      return res
        .status(400)
        .json({ message: "OTP not verified. Please verify first." });
    }

    // Update password not required due to save
    // const hashed = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;

    // Clear OTP + flag
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    user.isOtpVerified = false; // reset flag after use
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    //console.log(req.email);
    res
      .status(500)
      .json({ message: "Error resetting password", error: err.message });
  }
};
const getUser = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body; // Add others if needed
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export {
  login,
  register,
  dashboard,
  forgotPassword,
  resetPassword,
  verifyOtp,
  getUser,
  updateUser,
};
