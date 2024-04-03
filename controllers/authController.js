const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
//if you can return onetime, just return imediately
const signToken = function (id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

//Create an user
//Authentication  => functions relative for the user itself
//Admin or normal user?
exports.signup = catchAsync(async function (req, res, next) {
  //if we want to create the admin, we gonna do it manually
  // limit the user from creating any thing that not related

  const newUser = await User.create({
    username: req.body.username,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    email: req.body.email,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const token = signToken(newUser._id);

  //201 for created
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  //1. check if the input email or password is not empty or undefined
  // 400 bad request
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  //2 Check if user exists && password is Correct?
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));
  //401 : Unauthorize

  //3.Generate the token, and send back to the user
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

//protecting routes when using the JWT token
exports.protect = catchAsync(async function (req, res, next) {
  //1. Get the token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  //if the token not exist, beacause we are not logged in
  if (!token) {
    return next(
      new AppError("You are not logged in, Please login to get accesss", 401)
    );
  }
  //2. Verification the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3. Check if the user exist, what if the user change the password, or delete token
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The Token belonging to this user is no longer exist", 401)
    );
  }

  //4)Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password, Please log in again")
    );
  }
  //iat is at milisecond timestamp
  //grant access to protected route
  req.user = currentUser;
  next();
});
// passing args into the middleware functon
//create the wrapper function return the middle function that we want to create
exports.restrictTo = (...roles) => {
  //thanks to closure => the inner function can access the roles arr
  return (req, res, next) => {
    //roles is an array [admin, lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to access this feature", 403),
        401
      );
    }
    next();
  };
};

//the protect methods authorize => protect => req.user = currentUser
//and then the restrictTo() method => so the req has saved the current user
// the same request can be chain like a middleware
