const authMiddleware = function (req, res, next) {};

export const helloLogger = (req, res, next) => {
  console.log("Hello..........");
  next();
};
