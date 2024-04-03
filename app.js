const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const { handleError } = require("./controllers/errorController");

const app = express();
//1. Middlewares
// app.use to use the middleware

// if the environment var == development
//The reading of variables in the file only happens once
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); //morgan return a function (req,res,next), like all the middleware
}

app.use(express.json());
app.use(express.static("starter/public"));
//eachtime a request come, the middlewares will execute
app.use((request, response, next) => {
  console.log("Hello from the middleware");
  //call the next function, or stuck forever!
  next(); //never forget to use this
});
//middleware to tell the time of the request
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  console.log(request.headers);
  next();
});

//ROUTING:
//root URL
app.get("/", (request, response) => {
  response
    .status(200)
    .json({ message: "Hello from the server side", app: "Notours" }); //send response back
});

// URL which we want to use the middleware
// if the request travel in this middleware, it goes in the tourRouter
// middleware
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// handle for the unhandled routes, all the url
app.all("*", (request, response, next) => {
  next(
    new AppError(`Can't find the ${request.originalUrl} on this server!`, 404)
  );
});

// after take in the error, jump to this middleware imediately
// and handle it
app.use(handleError);

//app listen to the port number

module.exports = app; //export app
