jest.mock("../src/models/Notification");
jest.mock("../src/services/mailerService");
const Notification = require("../src/models/Notification");
const mailer = require("../src/services/mailerService");
const notificationService = require("../src/services/notificationService");

beforeEach(() => jest.clearAllMocks());

describe("create", () => {
  it("always creates the in-app notification", async () => {
    Notification.create.mockResolvedValue({ _id: "n1", save: jest.fn() });
    await notificationService.create({ orgId: "org1", recipientUserId: "u1", type: "alert", title: "Workload trend" });
    expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ orgId: "org1", recipientUserId: "u1", type: "alert", title: "Workload trend" }));
    expect(mailer.sendEmail).not.toHaveBeenCalled();
  });

  it("also sends an email when one is supplied, and stamps emailSentAt on success", async () => {
    const doc = { _id: "n1", save: jest.fn() };
    Notification.create.mockResolvedValue(doc);
    mailer.sendEmail.mockResolvedValue({ sent: true });
    await notificationService.create({ orgId: "org1", recipientUserId: "u1", type: "alert", title: "t", email: "hr@acme.com" });
    expect(mailer.sendEmail).toHaveBeenCalledWith({ to: "hr@acme.com", subject: "t", text: "" });
    expect(doc.emailSentAt).toBeInstanceOf(Date);
    expect(doc.save).toHaveBeenCalled();
  });

  it("does not stamp emailSentAt when the email fails to send", async () => {
    const doc = { _id: "n1", save: jest.fn() };
    Notification.create.mockResolvedValue(doc);
    mailer.sendEmail.mockResolvedValue({ sent: false, error: "smtp down" });
    await notificationService.create({ orgId: "org1", recipientUserId: "u1", type: "alert", title: "t", email: "hr@acme.com" });
    expect(doc.emailSentAt).toBeUndefined();
    expect(doc.save).not.toHaveBeenCalled();
  });
});

describe("listForUser / markRead / unreadCount are always scoped to org + recipient", () => {
  it("listForUser scopes by orgId and recipientUserId", async () => {
    Notification.find.mockReturnValue({ sort: () => ({ limit: () => Promise.resolve([]) }) });
    await notificationService.listForUser("org1", "u1", {});
    expect(Notification.find).toHaveBeenCalledWith({ orgId: "org1", recipientUserId: "u1" });
  });

  it("listForUser filters to unread when asked", async () => {
    Notification.find.mockReturnValue({ sort: () => ({ limit: () => Promise.resolve([]) }) });
    await notificationService.listForUser("org1", "u1", { unreadOnly: true });
    expect(Notification.find).toHaveBeenCalledWith({ orgId: "org1", recipientUserId: "u1", read: false });
  });

  it("markRead cannot mark another user's notification (scoped filter)", async () => {
    Notification.findOneAndUpdate.mockResolvedValue(null);
    const result = await notificationService.markRead("org1", "u1", "n-belongs-to-someone-else");
    expect(Notification.findOneAndUpdate).toHaveBeenCalledWith({ _id: "n-belongs-to-someone-else", orgId: "org1", recipientUserId: "u1" }, { read: true }, { new: true });
    expect(result).toBeNull();
  });

  it("unreadCount is scoped and counts only unread", async () => {
    Notification.countDocuments.mockResolvedValue(3);
    const count = await notificationService.unreadCount("org1", "u1");
    expect(Notification.countDocuments).toHaveBeenCalledWith({ orgId: "org1", recipientUserId: "u1", read: false });
    expect(count).toBe(3);
  });
});
