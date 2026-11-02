const jwt = require("jsonwebtoken");
function tokenFor({ id = "u1", orgId = "org1", role = "employee" }) {
  return jwt.sign({ sub: id, orgId, role }, "test-access-secret", { expiresIn: "15m", issuer: "sentilens-auth" });
}
module.exports = { tokenFor };
