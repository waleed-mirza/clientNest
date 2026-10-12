import { describe, expect, it } from "vitest";
import {
  createClientSchema,
  createContactSchema,
  createDeliverableSchema,
  createInvoiceSchema,
  createMilestoneSchema,
  createProjectSchema,
  createTaskSchema,
  decideDeliverableSchema,
  uploadFileMetaSchema,
} from "./records";

describe("client validation", () => {
  it("accepts a company name", () => {
    const parsed = createClientSchema.safeParse({
      name: "Pine & Oak Coffee",
      website: "https://pineandoak.example",
      notes: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const parsed = createClientSchema.safeParse({ name: "A", website: "", notes: "" });
    expect(parsed.success).toBe(false);
  });

  it("rejects a website without a scheme", () => {
    const parsed = createClientSchema.safeParse({
      name: "Pine & Oak Coffee",
      website: "pineandoak.example",
      notes: "",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("contact validation", () => {
  it("normalizes email", () => {
    const parsed = createContactSchema.safeParse({
      clientId: "11111111-cccc-4111-8111-ccccccccccc1",
      name: "Alex Marin",
      email: "Alex.Marin@example.com",
      title: "Owner",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe("alex.marin@example.com");
  });
});

describe("project validation", () => {
  it("rejects a due date before start", () => {
    const parsed = createProjectSchema.safeParse({
      clientId: "11111111-cccc-4111-8111-ccccccccccc1",
      name: "Seasonal menu site",
      description: "",
      status: "planned",
      startDate: "2026-09-18",
      dueDate: "2026-09-01",
      memberIds: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts an open-ended due date", () => {
    const parsed = createProjectSchema.safeParse({
      clientId: "11111111-cccc-4111-8111-ccccccccccc1",
      name: "Seasonal menu site",
      description: "Layouts before print.",
      status: "in_progress",
      startDate: "2026-08-04",
      dueDate: "",
      memberIds: ["11111111-1111-4111-8111-111111111111"],
    });
    expect(parsed.success).toBe(true);
  });
});

describe("milestone validation", () => {
  it("accepts a named milestone", () => {
    const parsed = createMilestoneSchema.safeParse({
      projectId: "11111111-eeee-4111-8111-eeeeeeeeeee1",
      name: "Homepage & menu board",
      status: "in_review",
      dueDate: "2026-09-18",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("task validation", () => {
  it("allows an unassigned task", () => {
    const parsed = createTaskSchema.safeParse({
      projectId: "11111111-eeee-4111-8111-eeeeeeeeeee1",
      name: "Export print PDF",
      status: "todo",
      dueDate: "",
      milestoneId: "",
      assigneeId: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.assigneeId).toBeNull();
      expect(parsed.data.milestoneId).toBeNull();
    }
  });
});

describe("file meta validation", () => {
  it("rejects an unknown visibility", () => {
    const parsed = uploadFileMetaSchema.safeParse({
      projectId: "11111111-eeee-4111-8111-eeeeeeeeeee1",
      visibility: "public",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("deliverable validation", () => {
  it("accepts a draft with an optional note", () => {
    const parsed = createDeliverableSchema.safeParse({
      projectId: "11111111-eeee-4111-8111-eeeeeeeeeee1",
      title: "Homepage hero v3",
      note: "",
      intent: "draft",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires a note when requesting changes", () => {
    const parsed = decideDeliverableSchema.safeParse({
      id: "51111111-aaaa-4111-8111-aaaaaaaaaaa1",
      decision: "changes_requested",
      note: "",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("invoice validation", () => {
  it("accepts a first line item", () => {
    const parsed = createInvoiceSchema.safeParse({
      projectId: "11111111-eeee-4111-8111-eeeeeeeeeee1",
      issueDate: "2026-08-20",
      dueDate: "2026-09-03",
      notes: "",
      description: "Homepage design",
      quantity: "1",
      unitAmount: "1800.00",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a due date before issue", () => {
    const parsed = createInvoiceSchema.safeParse({
      projectId: "11111111-eeee-4111-8111-eeeeeeeeeee1",
      issueDate: "2026-09-03",
      dueDate: "2026-08-20",
      notes: "",
      description: "Homepage design",
      quantity: "1",
      unitAmount: "1800",
    });
    expect(parsed.success).toBe(false);
  });
});
