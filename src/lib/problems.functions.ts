// Data access functions ” plain async functions using the browser Supabase client.
// Previously these used createServerFn (TanStack Start SSR). Now they run entirely
// in the browser against the public anon key.

import { supabase } from "./supabase";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ProblemSummary = {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string | null;
  display_order: number;
};

export type ProblemDetail = ProblemSummary & {
  description: string;
  starter_code: string | null;
  language: string;
  solution_code: string | null;
  solution_explanation: string | null;
  resources: ResourceItem[] | null;
};

export type ResourceItem = {
  type?: string;
  title: string;
  url: string;
};

// â”€â”€â”€ Public Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Fetch all published problems for the list view. */
export async function listProblems(): Promise<ProblemSummary[]> {
  const { data, error } = await supabase
    .from("problems")
    .select("id, slug, title, difficulty, topic, display_order")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProblemSummary[];
}

/** Fetch a single published problem by its URL slug. Returns null if not found. */
export async function getProblemBySlug(slug: string): Promise<ProblemDetail | null> {
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProblemDetail | null;
}
