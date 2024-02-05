require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Replace with the URL of your client application
    credentials: true, // Enable credentials (cookies) support
  })
);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
app.use("/api/user", userRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
