"use strict";
const orgClient = require("../services/orgClient");

/** Mounted only on the specific employee routes that need department-scoped visibility
 *  (submitting feedback, listing/opening available surveys). Best-effort: a lookup failure
 *  degrades to "no department" (org-wide visibility only) rather than blocking the request -
 *  Survey/Feedback Service already treat a missing department as "org-wide surveys only". */
function attachDepartmentHeader() {
  return async (req, res, next) => {
    if (req.user?.role !== "employee") return next();
    try {
      const departmentId = await orgClient.getEmployeeDepartmentId(req.user.id);
      if (departmentId) req.headers["x-department-id"] = String(departmentId);
    } catch (e) {
      // swallow - see function doc above
    }
    next();
  };
}

module.exports = { attachDepartmentHeader };
