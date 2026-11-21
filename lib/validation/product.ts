import { z } from "zod";
import { poundsToPence } from "@/lib/format";
import type { Product, ProductPayload } from "@/lib/api/types";

const wholeNumber = (label: string, min: number, max?: number) =>
  z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v), `${label} must be a whole number`)
    .refine((v) => Number(v) >= min, `${label} must be at least ${min}`)
    .refine((v) => max === undefined || Number(v) <= max, `${label} must be at most ${max}`);

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150, "Name must be 150 characters or fewer"),
  brand: z.string().trim().max(80, "Brand must be 80 characters or fewer"),
  description: z.string().trim().max(2000, "Description must be 2000 characters or fewer"),
  categoryId: z.string().min(1, "Choose a category"),
  price: z
    .string()
    .trim()
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a price like 12.99")
    .refine((v) => poundsToPence(v) >= 1, "Price must be at least 0.01"),
  discountPercent: wholeNumber("Discount", 0, 100),
  weightGrams: wholeNumber("Weight", 1),
  abv: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+(\.\d+)?$/.test(v) && Number(v) <= 100), "ABV must be between 0 and 100"),
  stock: wholeNumber("Stock", 0),
  lowStockThreshold: wholeNumber("Low stock threshold", 0),
  isAgeRestricted: z.boolean(),
  images: z
    .string()
    .refine((v) => splitImages(v).length <= 10, "At most 10 images")
    .refine((v) => splitImages(v).every(isUrl), "Each image must be a full URL, one per line"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

const splitImages = (text: string) =>
  text.split("\n").map((l) => l.trim()).filter(Boolean);

function isUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export const emptyProductForm: ProductFormValues = {
  name: "",
  brand: "",
  description: "",
  categoryId: "",
  price: "",
  discountPercent: "0",
  weightGrams: "",
  abv: "",
  stock: "0",
  lowStockThreshold: "5",
  isAgeRestricted: false,
  images: "",
};

export function productToForm(p: Product): ProductFormValues {
  return {
    name: p.name,
    brand: p.brand ?? "",
    description: p.description ?? "",
    categoryId: p.categoryId,
    price: (p.pricePence / 100).toFixed(2),
    discountPercent: String(p.discountPercent),
    weightGrams: String(p.weightGrams),
    abv: p.abv === null ? "" : String(p.abv),
    stock: String(p.stock),
    lowStockThreshold: String(p.lowStockThreshold),
    isAgeRestricted: p.isAgeRestricted,
    images: p.images.join("\n"),
  };
}

export function formToPayload(v: ProductFormValues): ProductPayload {
  return {
    name: v.name,
    brand: v.brand || undefined,
    description: v.description || undefined,
    categoryId: v.categoryId,
    pricePence: poundsToPence(v.price),
    discountPercent: Number(v.discountPercent),
    weightGrams: Number(v.weightGrams),
    abv: v.abv === "" ? undefined : Number(v.abv),
    stock: Number(v.stock),
    lowStockThreshold: Number(v.lowStockThreshold),
    isAgeRestricted: v.isAgeRestricted,
    images: splitImages(v.images),
  };
}
