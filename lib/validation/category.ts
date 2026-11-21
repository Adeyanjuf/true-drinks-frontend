import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(60, "Category name must be 60 characters or fewer"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
