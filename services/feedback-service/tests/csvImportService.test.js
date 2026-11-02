jest.mock("../src/models/Feedback");
jest.mock("../src/models/ImportBatch");
jest.mock("../src/services/analysisClient");
const Feedback = require("../src/models/Feedback");
const ImportBatch = require("../src/models/ImportBatch");
const analysisClient = require("../src/services/analysisClient");
const csvImportService = require("../src/services/csvImportService");

beforeEach(() => {
  jest.clearAllMocks();
  analysisClient.enqueue.mockResolvedValue(undefined);
});

const KNOWN_DEPARTMENTS = ["Development", "Marketing"];
const resolveDepartmentIds = async (names) =>
  Object.fromEntries(names.filter((n) => KNOWN_DEPARTMENTS.includes(n)).map((n) => [n, `id-${n}`]));

function csv(rows) {
  const header = "id,comment,date,department";
  return Buffer.from([header, ...rows].join("\n"));
}

describe("CSV import", () => {
  it("rejects a CSV missing required columns", async () => {
    const buffer = Buffer.from("id,comment\n1,hello");
    await expect(csvImportService.importCsv({ orgId: "org1", createdBy: "u1", filename: "f.csv", buffer, resolveDepartmentIds }))
      .rejects.toMatchObject({ status: 400 });
  });

  it("imports valid rows, masks PII, and reports invalid rows separately", async () => {
    ImportBatch.create.mockResolvedValue({ _id: "b1", save: jest.fn() });
    Feedback.insertMany.mockResolvedValue([{ _id: "f1", orgId: "org1" }]);
    const buffer = csv([
      '1,"The team is excellent",2026-09-01,Development',
      '2,"",2026-09-02,Marketing',
      '3,"Reach me at a@b.com",2026-09-03,Unknown Dept',
    ]);
    const batch = await csvImportService.importCsv({ orgId: "org1", createdBy: "u1", filename: "f.csv", buffer, resolveDepartmentIds });

    expect(Feedback.insertMany).toHaveBeenCalledTimes(1);
    const inserted = Feedback.insertMany.mock.calls[0][0];
    expect(inserted).toHaveLength(1);
    expect(inserted[0].comment).toBe("The team is excellent");
    expect(inserted[0]).not.toHaveProperty("userId");
    expect(batch.valid).toBe(1);
    expect(batch.invalid).toBe(2);
    expect(batch.errors.map((e) => e.message).join(" ")).toMatch(/missing comment/);
  });

  it("masks PII within CSV comments before storing them", async () => {
    ImportBatch.create.mockResolvedValue({ _id: "b1", save: jest.fn() });
    let stored;
    Feedback.insertMany.mockImplementation(async (docs) => { stored = docs; return docs.map((d, i) => ({ _id: `f${i}`, ...d })); });
    const buffer = csv(['1,"contact a@b.com now",2026-09-01,Development']);
    await csvImportService.importCsv({ orgId: "org1", createdBy: "u1", filename: "f.csv", buffer, resolveDepartmentIds });
    expect(stored[0].comment).toBe("contact [email] now");
  });

  it("enqueues analysis for every successfully imported row", async () => {
    ImportBatch.create.mockResolvedValue({ _id: "b1", save: jest.fn() });
    Feedback.insertMany.mockResolvedValue([{ _id: "f1" }, { _id: "f2" }]);
    const buffer = csv([
      '1,"Great team",2026-09-01,Development',
      '2,"Bad management",2026-09-02,Development',
    ]);
    await csvImportService.importCsv({ orgId: "org1", createdBy: "u1", filename: "f.csv", buffer, resolveDepartmentIds });
    expect(analysisClient.enqueue).toHaveBeenCalledTimes(2);
  });
});
