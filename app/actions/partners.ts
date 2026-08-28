"use server";

import { z } from "zod";

const submissionSchema = z.object({
  company: z.string().min(1, "Tell us the company name.").max(120),
  email: z.email("That does not look like an email address."),
  offer: z.string().min(20, "Describe the offer in a sentence or two.").max(2000),
  url: z.url("Link the official program page."),
});

export type PartnerFormState = {
  status: "idle" | "sent" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Partner submissions are a message to us, never a write into the catalog:
 * every listing is added by hand after someone checks the vendor page.
 */
export async function submitPartnerDeal(
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const parsed = submissionSchema.safeParse({
    company: formData.get("company"),
    email: formData.get("email"),
    offer: formData.get("offer"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Check the highlighted fields.", fieldErrors };
  }

  const submission = { ...parsed.data, receivedAt: new Date().toISOString() };

  try {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.EMAIL_FROM ?? "FoundersBee <onboarding@resend.dev>",
        to: process.env.PARTNER_INBOX ?? "partners@foundersbee.com",
        subject: `Partner submission — ${submission.company}`,
        text: [
          `Company: ${submission.company}`,
          `Contact: ${submission.email}`,
          `Program page: ${submission.url}`,
          "",
          submission.offer,
        ].join("\n"),
      });
    } else {
      const { appendFile, mkdir } = await import("node:fs/promises");
      await mkdir(".data", { recursive: true });
      await appendFile(
        ".data/partner-submissions.jsonl",
        `${JSON.stringify(submission)}\n`,
        "utf8",
      );
      console.info("[partners] submission recorded locally:", submission.company);
    }
  } catch (error) {
    console.error("[partners] could not record submission:", error);
    return {
      status: "error",
      message: "Something broke on our side. Email partners@foundersbee.com instead.",
    };
  }

  return {
    status: "sent",
    message: "Got it. We read every submission and check the program page before listing it.",
  };
}
