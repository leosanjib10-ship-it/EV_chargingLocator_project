// Express 5 makes req.query a read-only getter, which breaks packages like
// express-mongo-sanitize that try to reassign it. This middleware achieves
// the same goal (stripping Mongo operator keys like `$` and `.`) by mutating
// objects in place instead of reassigning them.

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const sanitizeInPlace = (obj) => {
  if (!isPlainObject(obj) && !Array.isArray(obj)) return obj;

  if (Array.isArray(obj)) {
    obj.forEach((item) => sanitizeInPlace(item));
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    if (isPlainObject(obj[key]) || Array.isArray(obj[key])) {
      sanitizeInPlace(obj[key]);
    }
  }
  return obj;
};

const sanitize = (req, res, next) => {
  if (req.body) sanitizeInPlace(req.body);
  if (req.params) sanitizeInPlace(req.params);
  if (req.query) sanitizeInPlace(req.query);
  next();
};

export default sanitize;
