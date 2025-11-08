import { z } from "zod";

export const createLinkSchema = z.object({
  original_url: z.string().url(),
  short_code: z.string().optional(),
});
