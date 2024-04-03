const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./models/tourModel");

//config file
dotenv.config({ path: `${__dirname}/config.env` });

const connectString = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(connectString)
  .then((con) => console.log("DB connection OK"))
  .catch((err) => console.log(err.message));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/starter/dev-data/data/tours.json`, "utf-8")
);

const importData = async function () {
  try {
    const result = await Tour.create(tours);
    console.log("Data Loaded");
  } catch (error) {
    console.log(error.message);
  }
};

//DELETE all the data
const deleteData = async function () {
  try {
    await Tour.deleteMany();
    console.log("All Data deleted!");
  } catch (error) {
    console.log(error.meesage);
  }
};

// process.argv is an array of our commands, not environment variable
//VD: node ./import-dev-data.js --import
// returns an array [node, ./import-dev-data.js, --import]
console.log(process.argv);
if (process.argv[2] == "--import") {
  importData();
} else if (process.argv[2] == "--delete") {
  deleteData();
}
