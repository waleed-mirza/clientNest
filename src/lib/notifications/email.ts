export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type EmailSendResult =
  | { ok: true; skipped: true; reason: "not_configured" }
  | { ok: true; skipped: false }
  | { ok: false; skipped: false; message: string };

const resendEndpoint = "https://api.resend.com/emails";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function notificationFromAddress(): string {
  return process.env.RESEND_FROM?.trim() || "ClientNest <onboarding@resend.dev>";
}

export async function sendNotificationEmail(message: EmailMessage): Promise<EmailSendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: true, skipped: true, reason: "not_configured" };

  try {
    const response = await fetch(resendEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: notificationFromAddress(),
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!response.ok) return { ok: false, skipped: false, message: "Email could not be sent." };
    return { ok: true, skipped: false };
  } catch {
    return { ok: false, skipped: false, message: "Email could not be sent." };
  }
}
