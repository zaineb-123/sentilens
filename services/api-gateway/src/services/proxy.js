"use strict";
const { upstreamUnavailable } = require("@sentilens/shared");

// Headers that must never be forwarded as-is (either meaningless cross-hop, or recalculated
// by fetch/undici itself for the new request/response).
const HOP_BY_HOP_REQUEST = new Set(["host", "connection", "content-length", "transfer-encoding"]);
const HOP_BY_HOP_RESPONSE = new Set(["connection", "transfer-encoding", "content-encoding", "content-length"]);

/** Builds the {url, init} for the outbound fetch from an incoming Express request. Pure and
 *  synchronous (no I/O) so it is trivial to unit test - see tests/proxy.test.js. */
function buildProxyRequest(req, targetBaseUrl) {
  const url = targetBaseUrl.replace(/\/$/, "") + req.originalUrl;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP_REQUEST.has(key) && value !== undefined) headers[key] = value;
  }
  headers["x-correlation-id"] = req.correlationId;

  const init = { method: req.method, headers };
  if (!["GET", "HEAD"].includes(req.method)) {
    if (Buffer.isBuffer(req.body)) {
      init.body = req.body; // raw passthrough: multipart/form-data (CSV import), boundary preserved in content-type
    } else if (req.body && Object.keys(req.body).length > 0) {
      init.body = JSON.stringify(req.body);
      headers["content-type"] = "application/json";
    }
  }
  return { url, init };
}

/** Forwards the proxied Express request to one backend service and relays its response
 *  (status, headers incl. Set-Cookie, and body) back to the original caller unchanged. */
function proxyTo(targetBaseUrl) {
  return async (req, res, next) => {
    if (req.originalUrl.includes("/api/auth/refresh")) {
      console.log(
        "[REFRESH DEBUG] Cookie header received:",
        Boolean(req.headers.cookie)
      );
    }

    const { url, init } = buildProxyRequest(req, targetBaseUrl);
    let upstream;

    try {
      upstream = await fetch(url, init);
    } catch (e) {
      return next(upstreamUnavailable(`${targetBaseUrl} is unreachable`));
    }


    
res.status(upstream.status);

const setCookies =
  typeof upstream.headers.getSetCookie === "function"
    ? upstream.headers.getSetCookie()
    : [];

for (const [key, value] of upstream.headers.entries()) {
  if (
    !HOP_BY_HOP_RESPONSE.has(key) &&
    key.toLowerCase() !== "set-cookie"
  ) {
    res.setHeader(key, value);
  }
}

if (setCookies.length > 0) {
  res.setHeader("Set-Cookie", setCookies);
} else {
  const cookie = upstream.headers.get("set-cookie");
  if (cookie) {
    res.setHeader("Set-Cookie", cookie);
  }
}


    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  };
}

module.exports = { proxyTo, buildProxyRequest };
