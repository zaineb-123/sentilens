jest.mock("../src/services/csvImportService");
jest.mock("../src/services/orgClient");
const request = require("supertest");
const csvImportService = require("../src/services/csvImportService");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const hrAuth = { Authorization: `Bearer ${tokenFor({ role: "hr" })}` };
const employeeAuth = { Authorization: `Bearer ${tokenFor({ role: "employee" })}` };

beforeEach(() => jest.clearAllMocks());

it("employee cannot import CSVs", async () => {
  const res = await request(app).post("/api/feedback/import").set(employeeAuth).attach("file", Buffer.from("id,comment,date,department\n1,hi,2026-01-01,Sales"), "f.csv");
  expect(res.status).toBe(403);
});

it("rejects a request with no file attached", async () => {
  const res = await request(app).post("/api/feedback/import").set(hrAuth);
  expect(res.status).toBe(400);
});

it("hr can upload a CSV and receives the batch summary", async () => {
  csvImportService.importCsv.mockResolvedValue({ _id: "b1", total: 1, valid: 1, invalid: 0, status: "done" });
  const res = await request(app).post("/api/feedback/import").set(hrAuth)
    .attach("file", Buffer.from("id,comment,date,department\n1,hi,2026-01-01,Sales"), "f.csv");
  expect(res.status).toBe(201);
  expect(res.body.batch.status).toBe("done");
});
