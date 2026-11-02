const { buildProxyRequest } = require("../src/services/proxy");

function req({ method = "GET", originalUrl = "/api/surveys", body, headers = {}, correlationId = "cid-1" }) {
  return { method, originalUrl, body, headers, correlationId };
}

describe("buildProxyRequest (pure, no I/O)", () => {
  it("forwards the full original path and query string onto the target base URL", () => {
    const { url } = buildProxyRequest(req({ originalUrl: "/api/surveys?status=published" }), "http://survey-service:4003");
    expect(url).toBe("http://survey-service:4003/api/surveys?status=published");
  });

  it("re-serializes a parsed JSON body and sets the content-type", () => {
    const { init } = buildProxyRequest(req({ method: "POST", body: { title: { en: "x" } } }), "http://survey-service:4003");
    expect(init.body).toBe(JSON.stringify({ title: { en: "x" } }));
    expect(init.headers["content-type"]).toBe("application/json");
  });

  it("forwards a raw multipart Buffer unchanged (CSV import), preserving the original boundary header", () => {
    const buf = Buffer.from("--boundary\r\ncontent");
    const { init } = buildProxyRequest(req({ method: "POST", body: buf, headers: { "content-type": "multipart/form-data; boundary=boundary" } }), "http://feedback-service:4004");
    expect(init.body).toBe(buf);
    expect(init.headers["content-type"]).toBe("multipart/form-data; boundary=boundary");
  });

  it("sends no body for GET/HEAD even if req.body happens to be set", () => {
    const { init } = buildProxyRequest(req({ method: "GET", body: { ignored: true } }), "http://x");
    expect(init.body).toBeUndefined();
  });

  it("sends no body for a bodyless write (e.g. DELETE)", () => {
    const { init } = buildProxyRequest(req({ method: "DELETE", body: {} }), "http://x");
    expect(init.body).toBeUndefined();
  });

  it("forwards the Authorization header unchanged (downstream verifies the JWT itself)", () => {
    const { init } = buildProxyRequest(req({ headers: { authorization: "Bearer abc" } }), "http://x");
    expect(init.headers.authorization).toBe("Bearer abc");
  });

  it("forwards the Cookie header (needed for refresh-token rotation)", () => {
    const { init } = buildProxyRequest(req({ originalUrl: "/api/auth/refresh", method: "POST", headers: { cookie: "sentilens_refresh=abc" } }), "http://auth-service:4001");
    expect(init.headers.cookie).toBe("sentilens_refresh=abc");
  });

  it("strips hop-by-hop headers that must not be forwarded as-is", () => {
    const { init } = buildProxyRequest(req({ headers: { host: "gateway:8080", connection: "keep-alive", "content-length": "123" } }), "http://x");
    expect(init.headers).not.toHaveProperty("host");
    expect(init.headers).not.toHaveProperty("connection");
    expect(init.headers).not.toHaveProperty("content-length");
  });

  it("always injects the request's correlation id as a header", () => {
    const { init } = buildProxyRequest(req({ correlationId: "cid-xyz" }), "http://x");
    expect(init.headers["x-correlation-id"]).toBe("cid-xyz");
  });
});
