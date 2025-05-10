const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); // Set abortEarly to false to gather all errors
    if (error) {
      // const errorDetails = error.details.map((err) => err.message);
      // return res.status(400).json({
      //   success: false,
      //   error: "ValidationError",
      //   detail: errorDetails.join(", "), // Join all errors as a string
      //   status: 400,
      // });

      const formattedError = new Error('Validation failed: '+ error.message);
      formattedError.statusCode = 400;
      formattedError.details = error.details;
      return next(formattedError);
    }
    next(); // If validation passes, move to the next middleware
  };
};
export default validate;
