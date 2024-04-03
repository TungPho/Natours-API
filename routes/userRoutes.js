const express = require("express");
const { signup, login } = require("../controllers/authController");
const { getAllUsers } = require("../controllers/userController");

//authentication => special route and special controllers
//special cases
const userRoutes = express.Router();
userRoutes.route("/signup").post(signup);
userRoutes.route("/login").post(login);
userRoutes.route("/").get(getAllUsers);
module.exports = userRoutes;
