const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const password = process.env.DATABASE_PASSWORD;
let connectString = process.env.DATABASE.replace("<password>", password);

//let connectString = process.env.DATABASE_LOCAL;

console.log(connectString);
mongoose
  .connect(connectString)
  .then((con) => {
    console.log("DB connection successful");
  })
  .catch((err) => console.log(err));

const app = require("./app");
const PORT_NUMBER = process.env.PORT || 8000;

const server = app.listen(PORT_NUMBER, () => {
  console.log(`App is running on port ${PORT_NUMBER}`);
});

//////////////////// ALL ERROR GOES TO THE error handler
//Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION");
  console.log(err.name, err.message);
  //by saying server.close() => give server time to finsish all the request pending and then shutdown
  server.close(() => {
    process.exit(1);
  });
});
// => Wrong password: bad auth Authentication Failed

//=> console.log(x) without defining x
process.on("uncaughtException", (err) => {
  console.log("UNHANDLED EXCEPTIONS");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
