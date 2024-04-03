const AppError = require("../utils/appError");

const sendErrorDev = function (err, response) {
  response.status(`${err.statusCode}`).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// all of these,  we use the custom AppError instead of the
//Error object
const sendErrorProduction = function (err, response) {
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    response.status(`${err.statusCode}`).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: dont leak the details to the client
  } else {
    // 1) Log error
    response.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

//handle each operational error with a custom function
const handleCastErrorDB = function (err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400); //bad request
};

const handleDuplicateErrorDB = function (err) {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}, Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = function (err) {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
// 401 => Unauthorized
const handleJWTError = () =>
  new AppError("Invalid Token, Please log in again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your Token has expired, Please log in again");

//this error middleware recieves the params from every next() function
// 1. if we see next() without param => NO ERROR
// 2. if we see next(new AppError(message,statusCode));a
exports.handleError = function (err, request, response, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, response);
  } else if (process.env.NODE_ENV === "production") {
    //handle invalid MongoID
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateErrorDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError();
    sendErrorProduction(err, response);
  }
};
