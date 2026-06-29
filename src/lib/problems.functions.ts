// Data access functions ” plain async functions using the browser Supabase client.
// Previously these used createServerFn (TanStack Start SSR). Now they run entirely
// in the browser against the public anon key.

import { supabase } from "./supabase";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ProblemSummary = {
  id: string;
  name: string;
  topic: string;
  difficulty: string;
};

export type ProblemDetail = ProblemSummary & {
  statement: string;
  starter_code: string | null;
  training_data: string;
  testing_data: string;
  expected_ouput: string;
  solution: string;
  explanation: string;
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
    .select("id, name, topic, difficulty")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProblemSummary[];
}

/** Fetch a single published problem by its URL slug. Returns null if not found. */
export async function getProblemBySlug(slug: string): Promise<ProblemDetail | null> {
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProblemDetail | null;
}
