module.exports = function (func) {
  return new Promise((resolve, reject) => {
    resolve(func);
  });
};
