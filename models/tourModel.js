const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
//mongoose use JS native dataType, create a models

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      maxlength: [
        40,
        "Tour name must have the length less or equal than 40 characters ",
      ],
      minlength: [
        10,
        "Tour name must have the length more than or equal 10 characters",
      ],
      validator: [validator.isAlpha, "Tour name must only contains characters"], // this function dont need to be called here
      //as soon as we create a new document, this function will be call (like a callback)
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, "A Tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [],
    },
    difficulty: {
      type: String,
      values: ["easy", "medium", "difficult"],
      message: "Difficulty must either be: easy, medium, difficulty",
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, "Rating points must below 5"],
      min: [1, "Rating points must more or equal 1"],
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A Tour must have a description"],
      trim: true,
    },
    //We should save the image somewhere
    imageCover: {
      type: String, // name of the string
      required: [true, "A Tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 1) Document middleware => pre()
tourSchema.pre("save", function (next) {
  console.log(this);
  next();
});
//  Document middleware => post()
tourSchema.post("save", function () {
  this.slug = slugify(this.name, { lower: true });
});

tourSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

//2) Query Middleware -> happens before (pre) or after (post)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

//3). Aggregation middleware
tourSchema.pre("aggregate", function (next) {
  //filter the pipeline for the tours that public, not secret
  //eachtime adding a property or condition, we need another nested object
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

//virtual properties
tourSchema.virtual("newName").get(function () {
  return this.name + "Tung";
});

//do the calculation rigtt in the model, use the get()
//and a callback  function
tourSchema.virtual("durationWeek").get(function () {
  return Math.ceil(this.duration / 7);
});

const Tour = mongoose.model("Tour", tourSchema);

//export the models itself
module.exports = Tour;
