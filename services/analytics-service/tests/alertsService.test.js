jest.mock("../src/models/DailyStat");
jest.mock("../src/models/Alert");
jest.mock("../src/services/authClient");
jest.mock("../src/services/notificationClient");
const DailyStat = require("../src/models/DailyStat");
const Alert = require("../src/models/Alert");
const authClient = require("../src/services/authClient");
const notificationClient = require("../src/services/notificationClient");
const alertsService = require("../src/services/alertsService");

const NOW = new Date("2026-06-15T00:00:00.000Z");
const DAY = 86400000;

function statRow(daysAgo, mentions, negative) {
  return { date: new Date(NOW.getTime() - daysAgo * DAY), aspects: { workload: { mentions, negative } } };
}

beforeEach(() => {
  jest.clearAllMocks();
  authClient.listHrUserIds.mockResolvedValue([]);
  notificationClient.notifyNewAlert.mockResolvedValue(undefined);
});

describe("detectForOrg: the 18%-increase example from the brief", () => {
  it("fires a warning alert when negative share rises by >= the configured threshold with enough sample", async () => {
    // current period (last 14d): 34 mentions, 30 negative -> ~88% negative share
    // previous period (14d before that): 30 mentions, 21 negative -> 70% negative share
    // change = +18 percentage points, sample size 34 (matches the brief's "34 responses analyzed")
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(
        q.date.$gte.getTime() === NOW.getTime() - 14 * DAY
          ? [statRow(1, 34, 30)]
          : [statRow(20, 30, 21)],
      ),
    }));
    Alert.findOne.mockResolvedValue(null);
    Alert.create.mockImplementation(async (doc) => doc);

    const alerts = await alertsService.detectForOrg("org1", { days: 14, now: NOW });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ aspectKey: "workload", sampleSize: 34, changePct: 18.2, severity: "warning" });
  });

  it("does not fire when the sample size is too small even if the change is large", async () => {
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(q.date.$gte.getTime() === NOW.getTime() - 14 * DAY ? [statRow(1, 3, 3)] : [statRow(20, 3, 0)]),
    }));
    const alerts = await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    expect(alerts).toHaveLength(0);
    expect(Alert.create).not.toHaveBeenCalled();
  });

  it("does not fire when the change is below the configured threshold", async () => {
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(q.date.$gte.getTime() === NOW.getTime() - 14 * DAY ? [statRow(1, 40, 20)] : [statRow(20, 40, 18)]), // 50% -> 45%, +5pp
    }));
    const alerts = await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    expect(alerts).toHaveLength(0);
  });

  it("marks severity critical for a very large increase", async () => {
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(q.date.$gte.getTime() === NOW.getTime() - 14 * DAY ? [statRow(1, 20, 20)] : [statRow(20, 20, 0)]), // 100% vs 0%
    }));
    Alert.findOne.mockResolvedValue(null);
    Alert.create.mockImplementation(async (doc) => doc);
    const alerts = await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    expect(alerts[0].severity).toBe("critical");
  });

  it("never mentions a cause - only the metric, the change, and the sample size", async () => {
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(q.date.$gte.getTime() === NOW.getTime() - 14 * DAY ? [statRow(1, 34, 30)] : [statRow(20, 30, 21)]),
    }));
    Alert.findOne.mockResolvedValue(null);
    Alert.create.mockImplementation(async (doc) => doc);
    const [alert] = await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    expect(Object.keys(alert)).not.toEqual(expect.arrayContaining(["cause", "reason"]));
  });

  it("updates an existing new/acknowledged alert in place instead of duplicating it", async () => {
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(q.date.$gte.getTime() === NOW.getTime() - 14 * DAY ? [statRow(1, 34, 30)] : [statRow(20, 30, 21)]),
    }));
    const existing = { status: "acknowledged", save: jest.fn().mockImplementation(function save() { return this; }) };
    Alert.findOne.mockResolvedValue(existing);
    const alerts = await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    expect(Alert.create).not.toHaveBeenCalled();
    expect(existing.save).toHaveBeenCalled();
    expect(existing.status).toBe("acknowledged"); // not reset to "new"
    expect(alerts[0].changePct).toBe(18.2);
  });

  it("re-opens a resolved alert as new when the trend recurs", async () => {
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(q.date.$gte.getTime() === NOW.getTime() - 14 * DAY ? [statRow(1, 34, 30)] : [statRow(20, 30, 21)]),
    }));
    Alert.findOne.mockResolvedValue({ status: "resolved" });
    Alert.create.mockImplementation(async (doc) => doc);
    const alerts = await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    expect(Alert.create).toHaveBeenCalledWith(expect.objectContaining({ status: "new" }));
  });
});

describe("list / acknowledge", () => {
  it("scopes listing to the org and optional status filter", async () => {
    Alert.find.mockReturnValue({ sort: () => Promise.resolve([]) });
    await alertsService.list("org1", { status: "new" });
    expect(Alert.find).toHaveBeenCalledWith({ orgId: "org1", status: "new" });
  });

  it("acknowledge is scoped to the org (cannot ack another org's alert)", async () => {
    Alert.findOneAndUpdate.mockResolvedValue({ _id: "a1", status: "acknowledged" });
    const r = await alertsService.acknowledge("org1", "a1");
    expect(Alert.findOneAndUpdate).toHaveBeenCalledWith({ _id: "a1", orgId: "org1" }, { status: "acknowledged" }, { new: true });
    expect(r.status).toBe("acknowledged");
  });
});


describe("HR notification on new alerts", () => {
  const NOW = new Date("2026-06-15T00:00:00.000Z");
  const DAY = 86400000;
  function statRow(daysAgo, mentions, negative) {
    return { date: new Date(NOW.getTime() - daysAgo * DAY), aspects: { workload: { mentions, negative } } };
  }
  function mockRows() {
    DailyStat.find.mockImplementation((q) => ({
      lean: () => Promise.resolve(q.date.$gte.getTime() === NOW.getTime() - 14 * DAY ? [statRow(1, 34, 30)] : [statRow(20, 30, 21)]),
    }));
  }

  it("notifies every HR user in the org when a brand-new alert is created", async () => {
    mockRows();
    Alert.findOne.mockResolvedValue(null);
    Alert.create.mockImplementation(async (doc) => ({ ...doc, _id: "a1" }));
    authClient.listHrUserIds.mockResolvedValue(["hr1", "hr2"]);

    await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    await new Promise((r) => setImmediate(r)); // let the fire-and-forget notify complete

    expect(authClient.listHrUserIds).toHaveBeenCalledWith("org1");
    expect(notificationClient.notifyNewAlert).toHaveBeenCalledTimes(2);
    expect(notificationClient.notifyNewAlert).toHaveBeenCalledWith(expect.objectContaining({ aspectKey: "workload" }), "hr1");
  });

  it("does NOT re-notify when updating an already new/acknowledged alert in place", async () => {
    mockRows();
    Alert.findOne.mockResolvedValue({ status: "acknowledged", save: jest.fn().mockImplementation(function save() { return this; }) });

    await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    await new Promise((r) => setImmediate(r));

    expect(authClient.listHrUserIds).not.toHaveBeenCalled();
    expect(notificationClient.notifyNewAlert).not.toHaveBeenCalled();
  });

  it("alert detection still succeeds even if notifying HR fails (best-effort)", async () => {
    mockRows();
    Alert.findOne.mockResolvedValue(null);
    Alert.create.mockImplementation(async (doc) => ({ ...doc, _id: "a1" }));
    authClient.listHrUserIds.mockRejectedValue(new Error("auth-service down"));

    const alerts = await alertsService.detectForOrg("org1", { days: 14, now: NOW });
    expect(alerts).toHaveLength(1); // detection itself is unaffected
  });
});
