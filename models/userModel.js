const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username must be defined"],
  },
  //password should have at least 8 chars
  password: {
    type: String,
    minlength: 8,
    required: [true, "Password must be defined"],
    validate: {
      // This only works on CREATE AND SAVE
      validator: function (value) {
        return value == this.passwordConfirm;
      },
      message: "The Confirm password must match the password",
    },
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (value) {
        return value == this.password;
      },
      message: "The Confirm password must match the password",
    },
  },
  passwordChangedAt: Date,
  //login via email, not user name
  email: {
    type: String,
    required: [true, "Please enter the email"],
    unique: true,
    lowercase: true, //transform email to lowercase
    // use the validator package:
    validate: [
      validator.isEmail,
      "Please provide a valid email Ex: tung123@gmail.com",
    ],
  },
  //store image in the file system
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
  },
});

//encription before saving happens between the input of user
// and output of it
// we want to encript it only when the password changed
userSchema.pre("save", async function (next) {
  //this refers to current process document

  //Only run this function if password was acctually modified
  //Hash the password with cost of 12
  if (!this.isModified("password")) return next();
  //hashing Decript
  //protect againts brute force attacks
  //add a random string into the password
  //package bcrypt
  //this is async version
  this.password = await bcrypt.hash(this.password, 12);
  // this not persist in the database, required input, not acctucally in the DB
  this.passwordConfirm = undefined;
  next();
});

//an instant method available on all the documents of the project
// this keyword also point to the current document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// we need a field save the time the password change time
//check the JWTtimestamp and the time password created

//this has access the current document
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //if there is password change timestamp
  if (this.passwordChangedAt) {
    const changedTimeAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimeAt;
    // we change the token after the token was issue => 100 < 200 true
    // 100 < 200; true
    // 300 < 200; false => not changed
  }
  //The user not changed the password
  return false;
};

//call this function in auth controller
//model User from schema
const User = mongoose.model("User", userSchema);
module.exports = User;

//Note:
// always encript the password
//
