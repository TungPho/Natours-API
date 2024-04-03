const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//Create a class to refactor all the features (CRUD, pagination, sort and limit)
//all the url param:

//1 /:id
//2 sort = price , fields,
//3. methods: Tour.find(), Tour.sort(), Tour.skip().limit()
//4.

//Alias ( as a middleware)
exports.aliasTopTour = async function (request, response, next) {
  request.query.limit = "5";
  request.query.sort = "price";
  request.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
};

//filtering:
exports.getAllTours = async function (request, response) {
  //return all the documents in the tour collection
  try {
    const features = new APIFeatures(Tour.find(), request.query)
      .filter()
      .sort()
      .limit()
      .pagination();

    //EXECUTE THE QUERY
    const tours = await features.query;
    //SEND RESPONSE
    response.status(200).json({
      status: "success",
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getTour = catchAsync(async function (request, response, next) {
  const tourResult = await Tour.findById(request.params.id);
  if (tourResult == null) {
    return next(new AppError("No Tour found with that id", 404));
  }
  response.status(200).json({
    status: "success",
    data: {
      tour: tourResult,
    },
  });
});

exports.createTour = catchAsync(async function (request, response, next) {
  //because we did not specify the error code and status => default will be 500 and "error" in the error controller
  const newTour = await Tour.create(request.body);
  response.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async function (request, response) {
  const result = await Tour.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  if (result == null) {
    return next(new AppError("No Tour found with that id", 404));
  }
  response.status(200).json({
    status: "success",
    data: {
      message: "Updated tour here",
      tour: result,
    },
  });
});

//delete by Id, or delete One
exports.deleteTour = catchAsync(async function (request, response) {
  const result = await Tour.findByIdAndDelete(request.params.id);
  if (result == null) {
    return next(new AppError("No Tour found with that id", 404));
  }
  response.status(204).json({
    status: "success",
    data: null,
    deletedTour: result,
  });
});

exports.getTourStats = catchAsync(async function (request, response) {
  //pass in an array stages
  //each element in the array is one of the stages
  // 1) match
  // 2) group
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    }, // condition gte 4.5 ratingsAverage all records
    {
      //group by the difficulty
      $group: {
        _id: "$difficulty",
        numTour: { $sum: 1 }, //counts the tour
        // 1 will be added to the numTour, like accumulator in reduce
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },

    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  response.status(200).json({
    status: "success",
    data: {
      tour: stats,
    },
  });
});
//Calculate number of tours for each month of a given year
// Mongo has many operators like $month, $toDate , $year
//Stages and operators

exports.monthlyPlan = catchAsync(async function (request, response) {
  const year = request.params.year;
  const tour = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $sort: { startDates: 1 },
    },

    {
      $limit: 12,
    },
  ]);
  response.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});
