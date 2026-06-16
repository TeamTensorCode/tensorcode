import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const resourceSchema = z.object({
  type: z.enum(["video", "article", "link"]).default("video"),
  title: z.string().min(1),
  url: z.string().url(),
});

const problemInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  title: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.string().nullable().optional(),
  description: z.string().min(1),
  starter_code: z.string().nullable().optional(),
  language: z.string().default("python"),
  solution_code: z.string().nullable().optional(),
  solution_explanation: z.string().nullable().optional(),
  resources: z.array(resourceSchema).default([]),
  published: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

function checkAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Admin password is not configured on the server.");
  if (password !== expected) throw new Error("Invalid admin password.");
}

async function getPublicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const listProblems = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicClient();
  const { data, error } = await supabase
    .from("problems")
    .select("id, slug, title, difficulty, topic, display_order")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProblemBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: row, error } = await supabase
      .from("problems")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    return { ok: true };
  });

export const adminListProblems = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const supabase = await getAdminClient();
    const { data: rows, error } = await supabase
      .from("problems")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetProblem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string(), id: z.string() }))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const supabase = await getAdminClient();
    const { data: row, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpsertProblem = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),
      id: z.string().optional(),
      problem: problemInputSchema,
    }),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const supabase = await getAdminClient();
    if (data.id) {
      const { data: row, error } = await supabase
        .from("problems")
        .update(data.problem)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await supabase
      .from("problems")
      .insert(data.problem)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteProblem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string(), id: z.string() }))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const supabase = await getAdminClient();
    const { error } = await supabase.from("problems").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
