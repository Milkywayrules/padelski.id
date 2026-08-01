import { Resend } from "resend";
import { z } from "zod";

export const emailConfigSchema = z.object({
  apiKey: z.string().min(1),
  from: z.string().min(3),
});

export type EmailConfig = z.infer<typeof emailConfigSchema>;

export function createEmailClient(config: EmailConfig) {
  const parsed = emailConfigSchema.parse(config);
  const resend = new Resend(parsed.apiKey);

  return {
    async sendStub(to: string, subject: string) {
      return resend.emails.send({
        from: parsed.from,
        to,
        subject,
        text: "Padelski email stub — not implemented",
      });
    },
    async sendVerificationEmail(to: string, verificationUrl: string, name?: string | null) {
      const displayName = name?.trim() || "there";
      return resend.emails.send({
        from: parsed.from,
        to,
        subject: "Verify your Padelski email",
        text: `Hi ${displayName},\n\nVerify your email: ${verificationUrl}\n\nThis link expires in 1 hour.`,
      });
    },
  };
}

export type EmailClient = ReturnType<typeof createEmailClient>;
