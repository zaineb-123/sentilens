"use strict";
/**
 * SentiLens demo seed script.
 * Phase 1: direct MongoDB bootstrap (org, departments, 3 demo accounts - bcrypt-hashed).
 * Phase 2: real API calls through the Gateway (survey, CSV import, employee feedback) so the
 * genuine Feedback -> Analysis -> AI -> Analytics pipeline is exercised, not faked.
 *
 * Usage: docker compose up --build, then: cd seed && npm install && npm run seed
 * NOT VERIFIED: never run against a live stack in the build sandbox - see seed/README.md.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { buildFeedbackRows, toCsv } = require("./feedbackData");

const GATEWAY_URL = "http://localhost:8080";
const MONGO_HOST = process.env.MONGO_HOST || "127.0.0.1:27017";

// MongoDB local sans authentification
function mongoUri(db) {
  const u = process.env.MONGO_ROOT_USER, p = process.env.MONGO_ROOT_PASSWORD;
  const auth = u && p ? encodeURIComponent(u) + ":" + encodeURIComponent(p) + "@" : "";
  return "mongodb://" + auth + MONGO_HOST + "/" + db + (auth ? "?authSource=admin" : "");
}

const ORG = { name: "Acme Sentilens Demo", slug: "acme-sentilens-demo" };
const DEMO_USERS = [
  { email: "admin.demo@acme-sentilens.test", password: "Demo!Admin2026", role: "admin" },
  { email: "hr.demo@acme-sentilens.test", password: "Demo!HR2026", role: "hr" },
  { email: "employee.demo@acme-sentilens.test", password: "Demo!Employee2026", role: "employee" },
];
const DEPARTMENT_NAMES = ["Engineering", "Marketing", "Sales", "Customer Support", "Human Resources", "Finance"];

async function bootstrapDatabase() {
  console.log("\n[1/4] Bootstrapping organization, departments, and demo accounts (direct DB)...");
  const orgConn = await mongoose.createConnection(mongoUri("org_db")).asPromise();
  const authConn = await mongoose.createConnection(mongoUri("auth_db")).asPromise();
  const Organization = orgConn.model("Organization", new mongoose.Schema({ name: String, slug: String, settings: Object }, { timestamps: true }));
  const Department = orgConn.model("Department", new mongoose.Schema({ orgId: mongoose.Schema.Types.ObjectId, name: String, headcount: Number }, { timestamps: true }));
  const EmployeeProfile = orgConn.model("EmployeeProfile", new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, orgId: mongoose.Schema.Types.ObjectId, departmentId: mongoose.Schema.Types.ObjectId, locale: String, joinedAt: Date }, { timestamps: true }));
  const User = authConn.model("User", new mongoose.Schema({ email: String, passwordHash: String, role: String, orgId: mongoose.Schema.Types.ObjectId, status: String, lastLoginAt: Date }, { timestamps: true }));

  let org = await Organization.findOne({ slug: ORG.slug });
  if (!org) { org = await Organization.create({ ...ORG, settings: { minGroupSize: 5, allowAnonymousBox: true, showOrgResultsToEmployees: true, languages: ["fr", "en", "ar"], retentionDays: 730 } }); console.log(`  created organization ${org.name} (${org._id})`); }
  else console.log(`  organization already exists (${org._id})`);

  const departments = {};
  for (const name of DEPARTMENT_NAMES) {
    let dept = await Department.findOne({ orgId: org._id, name });
    if (!dept) dept = await Department.create({ orgId: org._id, name, headcount: 10 + Math.floor(Math.random() * 30) });
    departments[name] = dept;
  }
  console.log(`  ${Object.keys(departments).length} departments ready`);

  const users = {};
  for (const demo of DEMO_USERS) {
    let user = await User.findOne({ email: demo.email });
    if (!user) { const passwordHash = await bcrypt.hash(demo.password, 12); user = await User.create({ email: demo.email, passwordHash, role: demo.role, orgId: org._id, status: "active" }); console.log(`  created ${demo.role} account: ${demo.email}`); }
    else console.log(`  ${demo.role} account already exists: ${demo.email}`);
    users[demo.role] = user;
  }

  const employeeDept = departments["Engineering"];
  await EmployeeProfile.findOneAndUpdate({ userId: users.employee._id }, { userId: users.employee._id, orgId: org._id, departmentId: employeeDept._id, locale: "fr", joinedAt: new Date() }, { upsert: true });
  console.log(`  demo employee profile linked to ${employeeDept.name}`);
  await orgConn.close(); await authConn.close();
}

async function login(email, password) { const res = await axios.post(`${GATEWAY_URL}/api/auth/login`, { email, password }); return res.data.accessToken; }

async function seedSurveys(hrToken) {
  console.log("\n[2/4] Creating and publishing a demo survey (via the real API)...");
  const headers = { Authorization: `Bearer ${hrToken}` };
  const payload = {
    title: { fr: "Sondage trimestriel T3", en: "Q3 Pulse Survey" },
    description: { fr: "Un sondage rapide sur votre expérience ce trimestre.", en: "A quick pulse check on your experience this quarter." },
    questions: [
      { order: 0, type: "likert", prompt: { fr: "Je me sens soutenu(e) par mon équipe", en: "I feel supported by my team" }, required: true },
      { order: 1, type: "likert", prompt: { fr: "Ma charge de travail est gérable", en: "My workload is manageable" }, required: true },
      { order: 2, type: "text", prompt: { fr: "Autre chose à partager ?", en: "Anything else you'd like to share?" }, required: false },
    ],
  };
  const { data } = await axios.post(`${GATEWAY_URL}/api/surveys`, payload, { headers });
  await axios.post(`${GATEWAY_URL}/api/surveys/${data.survey._id}/publish`, {}, { headers });
  console.log(`  survey "${payload.title.en}" published (${data.survey._id})`);
}

async function seedFeedbackCsv(hrToken) {
  console.log("\n[3/4] Importing 110 fictional feedback rows via CSV (via the real API)...");
  const rows = buildFeedbackRows({ count: 110 });
  const csv = toCsv(rows);
  const FormData = require("form-data");
  const form = new FormData();
  form.append("file", Buffer.from(csv), { filename: "demo-feedback.csv", contentType: "text/csv" });
  const { data } = await axios.post(`${GATEWAY_URL}/api/feedback/import`, form, { headers: { Authorization: `Bearer ${hrToken}`, ...form.getHeaders() } });
  console.log(`  import batch ${data.batch._id}: ${data.batch.valid} valid / ${data.batch.invalid} invalid of ${data.batch.total} rows`);
}

async function seedEmployeeFeedback(employeeToken) {
  console.log("\n[4/4] Submitting a couple of anonymous feedback items as the demo employee...");
  const headers = { Authorization: `Bearer ${employeeToken}` };
  const comments = ["I love the team but the workload is too high.", "J'aime beaucoup l'ambiance mais la charge de travail devient difficile."];
  for (const comment of comments) { const { data } = await axios.post(`${GATEWAY_URL}/api/feedback`, { comment }, { headers }); console.log(`  submitted, receipt code: ${data.receiptCode}`); }
}

async function main() {
  await bootstrapDatabase();
  console.log("\nLogging in as the demo HR and employee accounts...");
  const hrToken = await login("hr.demo@acme-sentilens.test", "Demo!HR2026");
  const employeeToken = await login("employee.demo@acme-sentilens.test", "Demo!Employee2026");
  await seedSurveys(hrToken);
  await seedFeedbackCsv(hrToken);
  await seedEmployeeFeedback(employeeToken);
  console.log("\nDone. The AI/Analysis pipeline processes feedback asynchronously - give it 1-2 minutes, then open the HR dashboard. See README for demo credentials.");
  process.exit(0);
}
main().catch((err) => { console.error("\nSeed script failed:", err.response?.data || err.message); process.exit(1); });
