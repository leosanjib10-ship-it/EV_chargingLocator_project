import ApiError from '#utils/ApiError';

// Wraps a zod schema (expects { body, query, params } shape) and validates
// the incoming request, attaching parsed/coerced values back onto req.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    });
    return next(new ApiError(400, 'Validation failed', errors));
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.query = result.data.query;
  if (result.data.params) req.params = result.data.params;

  next();
};

export default validate;
