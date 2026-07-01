const asyncHandler = (fn) => {
    // avoid try and catch block in every controllers
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;