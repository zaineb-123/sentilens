jest.mock("../src/models/Survey");
jest.mock("../src/models/Participation");
const Survey = require("../src/models/Survey");
const Participation = require("../src/models/Participation");
const surveyService = require("../src/services/surveyService");

beforeEach(() => jest.clearAllMocks());

describe("lifecycle transitions", () => {
  it("cannot publish a survey with no questions", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "draft", questions: [] });
    await expect(surveyService.publish("org1", "s1")).rejects.toMatchObject({ status: 422, code: "EMPTY_SURVEY" });
  });

  it("publishes a draft survey with questions", async () => {
    const survey = { orgId: "org1", status: "draft", questions: [{}], save: jest.fn() };
    Survey.findById.mockResolvedValue(survey);
    await surveyService.publish("org1", "s1");
    expect(survey.status).toBe("published");
    expect(survey.save).toHaveBeenCalled();
  });

  it("cannot publish an already-published survey", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "published", questions: [{}] });
    await expect(surveyService.publish("org1", "s1")).rejects.toMatchObject({ status: 409, code: "INVALID_TRANSITION" });
  });

  it("cannot close a draft survey", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "draft" });
    await expect(surveyService.close("org1", "s1")).rejects.toMatchObject({ status: 409, code: "INVALID_TRANSITION" });
  });

  it("closes a published survey", async () => {
    const survey = { orgId: "org1", status: "published", save: jest.fn() };
    Survey.findById.mockResolvedValue(survey);
    await surveyService.close("org1", "s1");
    expect(survey.status).toBe("closed");
  });

  it("cannot edit a published survey", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "published" });
    await expect(surveyService.update("org1", "s1", { title: { en: "x" } })).rejects.toMatchObject({ status: 409, code: "SURVEY_NOT_EDITABLE" });
  });

  it("404s when the survey belongs to a different org (never leaks cross-tenant existence)", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org-OTHER", status: "draft" });
    await expect(surveyService.get("org1", "s1")).rejects.toMatchObject({ status: 404 });
  });
});

describe("employee visibility rules", () => {
  it("hides an unpublished survey from employees", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "draft", targetDepartmentIds: [] });
    await expect(surveyService.getForEmployee("org1", "s1", "dept1")).rejects.toMatchObject({ status: 404 });
  });

  it("rejects a department-targeted survey for an employee in a different department", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "published", targetDepartmentIds: ["dept-OTHER"] });
    await expect(surveyService.getForEmployee("org1", "s1", "dept1")).rejects.toMatchObject({ status: 403 });
  });

  it("allows a survey targeted at the employee\\u2019s department", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "published", targetDepartmentIds: ["dept1"] });
    await expect(surveyService.getForEmployee("org1", "s1", "dept1")).resolves.toBeTruthy();
  });

  it("allows an org-wide survey (empty targetDepartmentIds) for anyone", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "published", targetDepartmentIds: [] });
    await expect(surveyService.getForEmployee("org1", "s1", "dept-anything")).resolves.toBeTruthy();
  });
});

describe("participation (no double submission, no content stored)", () => {
  it("records a first participation", async () => {
    Participation.create.mockResolvedValue({});
    await surveyService.recordParticipation("s1", "u1");
    expect(Participation.create).toHaveBeenCalledWith({ surveyId: "s1", userId: "u1" });
  });

  it("rejects a duplicate participation as a 409 (translated from the unique-index error)", async () => {
    Participation.create.mockRejectedValue(Object.assign(new Error("dup"), { code: 11000 }));
    await expect(surveyService.recordParticipation("s1", "u1")).rejects.toMatchObject({ status: 409, code: "ALREADY_PARTICIPATED" });
  });

  it("participation stats only ever return a count, never a list of users", async () => {
    Survey.findById.mockResolvedValue({ orgId: "org1", status: "published" });
    Participation.countDocuments.mockResolvedValue(42);
    const stats = await surveyService.participationStats("org1", "s1");
    expect(stats).toEqual({ surveyId: "s1", totalParticipants: 42, status: "published" });
  });
});
