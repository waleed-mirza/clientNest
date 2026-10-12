import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email.");
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");
export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your name.")
  .max(80, "Use 80 characters or fewer.");
export const workspaceNameSchema = z
  .string()
  .trim()
  .min(2, "Enter a workspace name.")
  .max(80, "Use 80 characters or fewer.");

export const signUpSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export const createWorkspaceSchema = z.object({
  name: workspaceNameSchema,
});

export const workspaceThemePresetSchema = z.enum(["harbor", "slate", "clay", "ink"]);

export const updateWorkspaceSchema = z.object({
  name: workspaceNameSchema,
  preset: workspaceThemePresetSchema,
});

export const inviteRoleSchema = z.enum(["manager", "member", "client"]);

export const createInviteSchema = z.object({
  email: emailSchema,
  role: inviteRoleSchema,
});

export const inviteTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9]{32,80}$/);
