function logger(req, _res, next) {
  console.log(`${req.method} ${req.path}`);
  next();
}

module.exports = logger;
