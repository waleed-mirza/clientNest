import { z } from "zod";
import { approvalDecisions } from "@/lib/deliverables/status";
import { fileVisibilities } from "@/lib/files/rules";
import { parseMoneyToCents, parseQuantity } from "@/lib/invoices/money";
import { projectStatuses } from "@/lib/projects/status";
import { milestoneStatuses, taskStatuses } from "@/lib/projects/workflow";
import { uuidSchema } from "@/lib/validation/id";

const optionalText = (max: number) =>
  z
    .string()
    .transform((value) => value.trim())
    .transform((value) => (value.length === 0 ? null : value))
    .refine(
      (value) => value === null || value.length <= max,
      `Must be ${max} characters or fewer.`,
    );

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .refine(
    (value) => value === null || /^https?:\/\/[^\s]+$/i.test(value),
    "Use an http or https URL.",
  )
  .refine((value) => value === null || value.length <= 200, "URL must be 200 characters or fewer.");

const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use a valid date.");

export const clientNameSchema = z
  .string()
  .trim()
  .min(2, "Enter a company name.")
  .max(80, "Use 80 characters or fewer.");

export const createClientSchema = z.object({
  name: clientNameSchema,
  website: optionalUrl,
  notes: optionalText(2000),
});

export const updateClientSchema = createClientSchema.extend({
  id: uuidSchema,
});

export const archiveClientSchema = z.object({
  id: uuidSchema,
  archived: z.enum(["0", "1"]),
});

export const createContactSchema = z.object({
  clientId: uuidSchema,
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  title: optionalText(80),
});

export const deleteContactSchema = z.object({
  id: uuidSchema,
  clientId: uuidSchema,
});

export const createProjectSchema = z
  .object({
    clientId: uuidSchema,
    name: z.string().trim().min(2, "Enter a project name.").max(80, "Use 80 characters or fewer."),
    description: optionalText(2000),
    status: z.enum(projectStatuses),
    startDate: optionalDate,
    dueDate: optionalDate,
    memberIds: z.array(uuidSchema).default([]),
  })
  .refine((data) => !data.startDate || !data.dueDate || data.dueDate >= data.startDate, {
    message: "Due date cannot be before the start date.",
    path: ["dueDate"],
  });

export const updateProjectSchema = createProjectSchema.extend({
  id: uuidSchema,
});

export const archiveProjectSchema = z.object({
  id: uuidSchema,
  archived: z.enum(["0", "1"]),
});

const optionalUuid = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .refine(
    (value) => value === null || uuidSchema.safeParse(value).success,
    "Choose a valid option.",
  );

export const createMilestoneSchema = z.object({
  projectId: uuidSchema,
  name: z.string().trim().min(2).max(80),
  status: z.enum(milestoneStatuses),
  dueDate: optionalDate,
});

export const updateMilestoneSchema = createMilestoneSchema.extend({
  id: uuidSchema,
});

export const deleteProjectChildSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
});

export const moveProjectChildSchema = deleteProjectChildSchema.extend({
  direction: z.enum(["up", "down"]),
});

export const createTaskSchema = z.object({
  projectId: uuidSchema,
  name: z.string().trim().min(2).max(80),
  status: z.enum(taskStatuses),
  dueDate: optionalDate,
  milestoneId: optionalUuid,
  assigneeId: optionalUuid,
});

export const updateTaskSchema = createTaskSchema.extend({
  id: uuidSchema,
});

export const uploadFileMetaSchema = z.object({
  projectId: uuidSchema,
  visibility: z.enum(fileVisibilities),
});

const optionalNote = optionalText(2000).refine(
  (value) => value === null || value.length >= 2,
  "Use at least 2 characters.",
);

export const createDeliverableSchema = z.object({
  projectId: uuidSchema,
  title: z.string().trim().min(2).max(80),
  note: optionalNote,
  intent: z.enum(["draft", "request"]),
});

export const updateDeliverableSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  title: z.string().trim().min(2).max(80),
  note: optionalNote,
});

export const deliverableIdSchema = z.object({
  id: uuidSchema,
});

export const commentDeliverableSchema = z.object({
  id: uuidSchema,
  body: z.string().trim().min(2).max(2000),
});

export const decideDeliverableSchema = z
  .object({
    id: uuidSchema,
    decision: z.enum(approvalDecisions),
    note: optionalNote,
  })
  .superRefine((data, ctx) => {
    if (data.decision === "changes_requested" && !data.note) {
      ctx.addIssue({
        code: "custom",
        message: "Explain the changes you need.",
        path: ["note"],
      });
    }
  });

const quantityString = z
  .string()
  .trim()
  .refine((value) => parseQuantity(value) !== null, "Quantity must be greater than zero.");

const moneyString = z
  .string()
  .trim()
  .refine((value) => parseMoneyToCents(value) !== null, "Use a dollar amount like 1200.00.");

export const createInvoiceSchema = z
  .object({
    projectId: uuidSchema,
    issueDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date."),
    dueDate: optionalDate,
    notes: optionalText(2000),
    description: z.string().trim().min(2).max(80),
    quantity: quantityString,
    unitAmount: moneyString,
  })
  .refine((data) => !data.dueDate || data.dueDate >= data.issueDate, {
    message: "Due date cannot be before the issue date.",
    path: ["dueDate"],
  });

export const addInvoiceItemSchema = z.object({
  invoiceId: uuidSchema,
  description: z.string().trim().min(2).max(80),
  quantity: quantityString,
  unitAmount: moneyString,
});

export const invoiceIdSchema = z.object({
  id: uuidSchema,
});

export const deleteInvoiceItemSchema = z.object({
  id: uuidSchema,
  invoiceId: uuidSchema,
});

export const notificationIdSchema = z.object({
  id: uuidSchema,
});
