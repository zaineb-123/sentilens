'use strict';
const { verifyAccessToken } = require('./jwt');
const { unauthorized, forbidden } = require('./errors');

/**
 * Verifies the JWT set by the Auth Service. Used directly by services running standalone,
 * and mirrored by the API Gateway (which forwards X-User-Id / X-User-Role / X-Org-Id instead
 * of re-shipping the raw token to every internal call).
 */
function requireAuth(secret) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return next(unauthorized('missing bearer token'));
    try {
      const payload = verifyAccessToken(secret, token);
      req.user = { id: payload.sub, orgId: payload.orgId, role: payload.role };
      next();
    } catch (e) {
      next(unauthorized('invalid or expired token'));
    }
  };
}

/** Trusts headers set by the API Gateway after it already verified the JWT. */
function trustGatewayHeaders(internalKey) {
  return (req, res, next) => {
    if (internalKey && req.headers['x-internal-key'] !== internalKey) {
      return next(unauthorized('missing or invalid internal key'));
    }
    const id = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    const orgId = req.headers['x-org-id'];
    req.user = id ? { id, role, orgId } : null;
    next();
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden(`requires role: ${roles.join(' or ')}`));
    next();
  };
}

module.exports = { requireAuth, trustGatewayHeaders, requireRole };
