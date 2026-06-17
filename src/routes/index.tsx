import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProblems } from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";

const problemsQuery = queryOptions({
  queryKey: ["problems"],
  queryFn: () => listProblems(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TensorCode — LeetCode for AI/ML Engineers" },
      {
        name: "description",
        content:
          "Practice machine learning and AI coding problems with video explanations and clean reference solutions. Free.",
      },
      { property: "og:title", content: "TensorCode — LeetCode for AI/ML Engineers" },
      {
        property: "og:description",
        content:
          "Practice ML coding problems with video explanations and clean reference solutions.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(problemsQuery),
  component: HomePage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-8">Not found.</div>,
});

const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;
type Diff = (typeof DIFFS)[number];

function HomePage() {
  const { data: problems } = useSuspenseQuery(problemsQuery);
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<Diff>("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return problems.filter((p) => {
      if (diff !== "All" && p.difficulty !== diff) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        (p.topic ?? "").toLowerCase().includes(needle)
      );
    });
  }, [problems, q, diff]);

  const counts = useMemo(() => {
    const c = { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>;
    for (const p of problems) c[p.difficulty] = (c[p.difficulty] ?? 0) + 1;
    return c;
  }, [problems]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <div className="relative hero-glow">
        <main className="mx-auto max-w-6xl px-4 pt-16 pb-10">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              Free for a limited time
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              Coding practice for <span className="brand-gradient-text">AI engineers.</span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Hand-picked machine learning coding problems with video walkthroughs and clean
              reference solutions. Practice the math, the models, and the production patterns
              that actually show up in interviews.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span><span className="font-mono text-foreground">{problems.length}</span> problems</span>
              <span><span className="font-mono text-easy">{counts.Easy ?? 0}</span> Easy</span>
              <span><span className="font-mono text-medium">{counts.Medium ?? 0}</span> Medium</span>
              <span><span className="font-mono text-hard">{counts.Hard ?? 0}</span> Hard</span>
            </div>
          </div>
        </main>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        {/* Filter bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {DIFFS.map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  diff === d
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <Input
            placeholder="Search problems or topics…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[3rem_1fr_8rem_7rem] border-b border-border bg-secondary/60 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>#</div>
            <div>Title</div>
            <div>Topic</div>
            <div>Difficulty</div>
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-muted-foreground">
              No problems match.
            </div>
          ) : (
            filtered.map((p, i) => (
              <Link
                key={p.id}
                to="/problems/$slug"
                params={{ slug: p.slug }}
                className="group grid grid-cols-[3rem_1fr_8rem_7rem] items-center border-b border-border px-4 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]"
              >
                <div className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-medium text-foreground group-hover:text-primary">
                  {p.title}
                </div>
                <div className="text-xs text-muted-foreground">{p.topic ?? "—"}</div>
                <DifficultyBadge value={p.difficulty} />
              </Link>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
