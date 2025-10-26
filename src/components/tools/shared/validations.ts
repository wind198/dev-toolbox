import { z } from "zod";

export const schemas = {
  caseConverter: z.object({
    input: z.string().min(1, "Input is required").max(1000, "Input too long"),
  }),

  jsonFormatter: z.object({
    input: z
      .string()
      .min(1, "JSON input is required")
      .max(10000, "JSON input too long")
      .refine((val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, "Invalid JSON format"),
  }),

  urlEncoder: z.object({
    input: z.string().min(1, "Input is required").max(2000, "Input too long"),
  }),

  githubUrlConverter: z.object({
    input: z
      .string()
      .min(1, "GitHub URL is required")
      .url("Please enter a valid URL")
      .refine((val) => {
        // More flexible GitHub URL validation
        const githubWebRegex =
          /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/.*$/;
        const githubRawRegex =
          /^https:\/\/raw\.githubusercontent\.com\/[\w\-\.]+\/[\w\-\.]+\/.*$/;
        return githubWebRegex.test(val) || githubRawRegex.test(val);
      }, "Please enter a valid GitHub web URL or raw URL"),
  }),
};

export type CaseConverterForm = z.infer<typeof schemas.caseConverter>;
export type JsonFormatterForm = z.infer<typeof schemas.jsonFormatter>;
export type UrlEncoderForm = z.infer<typeof schemas.urlEncoder>;
export type GitHubUrlConverterForm = z.infer<typeof schemas.githubUrlConverter>;
