const express = require("express");
const {
  userRegistration,
  fetchUsers,
  loginUser,
  authenticateToken,
} = require("../controllers/user");
const router = express.Router();

router.post("/", userRegistration);

router.get("/", authenticateToken, fetchUsers);

router.post("/login", loginUser);

// Apply the middleware to protected routes
router.get("/userDetails", authenticateToken, (req, res) => {
  // Access the authenticated user using req.user
  res.json({ message: "User Found!", user: req.user });
});

module.exports = router;
