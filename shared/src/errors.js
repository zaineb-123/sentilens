'use strict';

/** Uniform error envelope used by every Node service: { error: { code, message, details? } }. */
class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new ApiError(400, 'BAD_REQUEST', message, details);
const validationError = (details) => new ApiError(422, 'VALIDATION_ERROR', 'invalid request', details);
const unauthorized = (message = 'authentication required') => new ApiError(401, 'UNAUTHORIZED', message);
const forbidden = (message = 'insufficient permissions') => new ApiError(403, 'FORBIDDEN', message);
const notFound = (message = 'resource not found') => new ApiError(404, 'NOT_FOUND', message);
const conflict = (message) => new ApiError(409, 'CONFLICT', message);
const tooManyRequests = (message = 'rate limit exceeded') => new ApiError(429, 'RATE_LIMITED', message);
const internal = (message = 'internal error') => new ApiError(500, 'INTERNAL_ERROR', message);
const upstreamUnavailable = (message) => new ApiError(503, 'UPSTREAM_UNAVAILABLE', message);

/** Express error-handling middleware. Mount last, after all routes. */
function errorHandler(logger = console) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    if (err instanceof ApiError) {
      if (err.status >= 500) logger.error(err);
      return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    }
    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'invalid JSON body' } });
    }
    logger.error(err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'internal error' } });
  };
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `no route for ${req.method} ${req.path}` } });
}

module.exports = {
  ApiError, badRequest, validationError, unauthorized, forbidden, notFound, conflict,
  tooManyRequests, internal, upstreamUnavailable, errorHandler, notFoundHandler,
};
