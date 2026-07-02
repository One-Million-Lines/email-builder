import { z } from "zod";

const styleValue = z.union([z.string(), z.number(), z.boolean(), z.record(z.string(), z.any())]);
const styleSchema = z.record(z.string(), styleValue).optional();

const elementSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("text"),
    role: z.string().optional(),
    content: z.string(),
    style: styleSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("image"),
    src: z.string(),
    alt: z.string().optional(),
    link: z.string().optional(),
    style: styleSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("button"),
    label: z.string(),
    link: z.string(),
    style: styleSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("spacer"),
    height: z.number(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("divider"),
    style: styleSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("productGrid"),
    products: z.array(
      z.object({
        id: z.string(),
        image: z.string(),
        imageAlt: z.string().optional(),
        name: z.string(),
        oldPrice: z.string().optional(),
        finalPrice: z.string(),
        description: z.string().optional(),
        link: z.string().optional(),
        buttonLabel: z.string().optional(),
      })
    ),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    showOldPrice: z.boolean(),
    showButton: z.boolean(),
    showDescription: z.boolean(),
    buttonLabel: z.string().optional(),
    style: styleSchema,
  }),
]);

export const moduleSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  style: styleSchema,
  children: z.array(elementSchema),
  data: z.record(z.string(), z.any()).optional(),
});

export const themeSchema = z.object({
  id: z.string(),
  name: z.string(),
  tokens: z.object({
    colors: z.record(z.string(), z.string()),
    fonts: z.record(z.string(), z.string()),
    spacing: z.record(z.string(), z.number()),
    radius: z.record(z.string(), z.number()),
  }),
});

export const documentSchema = z.object({
  version: z.string(),
  meta: z.object({ name: z.string(), previewText: z.string() }),
  theme: themeSchema,
  settings: z.object({
    width: z.number(),
    backgroundColor: z.string(),
    contentBackgroundColor: z.string(),
  }),
  modules: z.array(moduleSchema),
});

export type ValidatedDocument = z.infer<typeof documentSchema>;
