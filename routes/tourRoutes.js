const express = require("express");
const authController = require("../controllers/authController");
const {
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  getTour,
  aliasTopTour,
  getTourStats,
  monthlyPlan,
} = require("../controllers/tourController");
const { request, response } = require("../app");

const router = express.Router();

//using the middleware then the handlers
//get to the "/" and then "top5-cheap"
router.route("/top5-cheap").get(aliasTopTour, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(monthlyPlan);

router.route("/").get(authController.protect, getAllTours).post(createTour);

router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    deleteTour
  );

//export the router
module.exports = router;
