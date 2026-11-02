'use strict';
const jwt = require('jsonwebtoken');

const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 30;

function signAccessToken(secret, payload) {
  // payload: { sub: userId, orgId, role }
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TTL, issuer: 'sentilens-auth' });
}

function verifyAccessToken(secret, token) {
  return jwt.verify(token, secret, { issuer: 'sentilens-auth' });
}

module.exports = { signAccessToken, verifyAccessToken, ACCESS_TTL, REFRESH_TTL_DAYS };
