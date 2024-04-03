const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async function (request, response, next) {
  const users = await User.find();
  response.status(200).json({
    status: "success",
    data: {
      users: users,
    },
  });
});
exports.createUser = catchAsync(async function (request, response) {
  response.status(201).json({
    status: "success",
  });
});

exports.getUser = catchAsync(async function (request, response) {
  response.status(201).json({
    status: "success",
  });
});

exports.updateUser = catchAsync(async function (request, response) {
  response.status(201).json({
    status: "success",
  });
});

exports.deleteUser = catchAsync(async function (request, response) {
  response.status(201).json({
    status: "success",
  });
});
