import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProblems } from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";


const PROBLEMS_QUERY_KEY = ["problems"] as const;

export const Route = createFileRoute("/")({
  component: HomePage,
});


const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;
type Diff = (typeof DIFFS)[number];

function HomePage() {
  const {
    data: problems = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: PROBLEMS_QUERY_KEY,
    queryFn: listProblems,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Diff>("All");

  // Derived: filtered problem list
  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return problems.filter((p) => {
      if (difficulty !== "All" && p.difficulty !== difficulty) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        (p.topic ?? "").toLowerCase().includes(needle)
      );
    });
  }, [problems, searchQuery, difficulty]);

  // Derived: difficulty counts for the hero
  const counts = useMemo(() => {
    const c: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    for (const p of problems) c[p.difficulty] = (c[p.difficulty] ?? 0) + 1;
    return c;
  }, [problems]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* â”€â”€ Hero â”€â”€ */}
      <div className="hero-glow">
        <main className="mx-auto max-w-6xl px-4 pt-16 pb-10">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              Free for a limited time
            </span>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              Coding practice for{" "}
              <span className="brand-gradient-text">AI engineers.</span>
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground">
              Hand-picked machine learning coding problems with video walkthroughs and clean
              reference solutions. Practice the math, the models, and the production patterns
              that actually show up in interviews.
            </p>

            {/* Stats row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>
                <span className="font-mono text-foreground">{problems.length}</span> problems
              </span>
              <span>
                <span className="font-mono text-easy">{counts.Easy ?? 0}</span> Easy
              </span>
              <span>
                <span className="font-mono text-medium">{counts.Medium ?? 0}</span> Medium
              </span>
              <span>
                <span className="font-mono text-hard">{counts.Hard ?? 0}</span> Hard
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* â”€â”€ Problem List â”€â”€ */}
      <main className="mx-auto max-w-6xl px-4 pb-20">

        {/* Filter bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {DIFFS.map((d) => (
              <button
                key={d}
                id={`filter-${d.toLowerCase()}`}
                onClick={() => setDifficulty(d)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  difficulty === d
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <Input
            id="search-problems"
            placeholder="🔍  Search problems or topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Header row */}
          <div className="grid grid-cols-[2rem_1fr_5rem] gap-3 border-b border-border bg-secondary/60 px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:grid-cols-[3rem_1fr_10rem_7rem] sm:gap-0 sm:px-4">
            <div>#</div>
            <div>Title</div>
            <div className="hidden sm:block">Topic</div>
            <div className="text-right sm:text-left">Difficulty</div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[3rem_1fr_10rem_7rem] items-center border-b border-border px-4 py-3.5"
                >
                  <div className="h-3 w-6 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-48 animate-pulse rounded bg-secondary" />
                  <div className="hidden h-3 w-20 animate-pulse rounded bg-secondary sm:block" />
                  <div className="h-5 w-14 animate-pulse rounded-full bg-secondary" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="px-4 py-14 text-center text-sm text-destructive">
              Failed to load problems: {(error as Error).message}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="px-4 py-14 text-center text-sm text-muted-foreground">
              No problems match your search.
            </div>
          )}

          {/* Problem rows */}
          {!isLoading &&
            !isError &&
            filtered.map((p, i) => (
              <Link
                key={p.id}
                to="/problems/$slug"
                params={{ slug: p.slug }}
                className="group grid grid-cols-[2rem_1fr_5rem] items-center gap-3 border-b border-border px-3 py-3 text-sm transition-colors last:border-b-0 hover:bg-[var(--surface-hover)] sm:grid-cols-[3rem_1fr_10rem_7rem] sm:gap-0 sm:px-4 sm:py-3.5"
              >
                <div className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </div>
                  {/* Topic shown inline on mobile */}
                  <div className="mt-0.5 truncate text-xs text-muted-foreground sm:hidden">
                    {p.topic ?? "â€”"}
                  </div>
                </div>
                <div className="hidden truncate text-xs text-muted-foreground sm:block">
                  {p.topic ?? "â€”"}
                </div>
                <div className="flex justify-end sm:justify-start">
                  <DifficultyBadge value={p.difficulty} />
                </div>
              </Link>
            ))}
        </section>
      </main>
    </div>
  );
}
