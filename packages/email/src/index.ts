import { Resend } from "resend";
import { z } from "zod";

export const emailConfigSchema = z.object({
  apiKey: z.string().min(1),
  from: z.string().email().default("Padelski.id - Noreply <noreply@email.padelski.id>"),
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
  };
}

export type EmailClient = ReturnType<typeof createEmailClient>;
