module.exports = catchAsyncFunction = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};
