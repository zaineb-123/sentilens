'use strict';
const { validationError } = require('./errors');

/** Express middleware: parses req[part] with a zod schema, replaces it with the parsed value. */
function validate(schema, part = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return next(validationError(result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))));
    }
    req[part] = result.data;
    next();
  };
}

module.exports = { validate };
