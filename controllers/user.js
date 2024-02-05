const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.userRegistration = async function (req, res) {
  try {
    const { username, password, email, cpassword } = req.body;
    if (password !== cpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      } else {
        return res.status(400).json({ message: "Email already taken" });
      }
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    // Save new user
    const registeredUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: registeredUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// controller for fetching users
exports.fetchUsers = async function (req, res) {
  try {
    const users = await User.find();
    // senitized users (without passwords)
    const senitizedUsers = users.map((user) => ({
      username: user.username,
      email: user.email,
    }));
    res.status(200).json({ message: "All users found", users: senitizedUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// controller to login user
exports.loginUser = async function (req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const sanitizedUser = {
      userId: user._id,
      username: user.username,
      email: user.email,
    };
    // Generate JWT token
    const token = jwt.sign(sanitizedUser, process.env.SECRET_KEY, {
      expiresIn: "1h", // Set expiration time for the token
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// Middleware to verify the token
exports.authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};
