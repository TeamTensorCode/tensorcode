import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProblemBySlug } from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/problems/$slug")({
  component: ProblemPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">{(error as Error).message}</div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Problem not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Back to problems
        </Link>
      </div>
    </div>
  ),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract a YouTube embed URL from any YouTube link format. */
function ytEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    return null;
  } catch {
    return null;
  }
}

type Resource = { type?: string; title: string; url: string };

// ─── Main component ───────────────────────────────────────────────────────────

function ProblemPage() {
  const { slug } = Route.useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => getProblemBySlug(slug),
  });

  const [revealed, setRevealed] = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-secondary" />
          <div className="h-96 animate-pulse rounded-lg bg-card" />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-8 text-sm text-destructive">{(error as Error).message}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-xl font-semibold">Problem not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary underline">
            Back to problems
          </Link>
        </div>
      </div>
    );
  }

  const resources = (data.resources as Resource[]) ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">

        {/* Breadcrumb */}
        <div className="mb-5 text-xs">
          <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
            ← All problems
          </Link>
        </div>

        {/* Problem card */}
        <section className="rounded-lg border border-border bg-card p-6 sm:p-8">

          {/* Title + badge */}
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="min-w-0 break-words text-xl font-semibold tracking-tight sm:text-2xl">
              {data.title}
            </h1>
            <DifficultyBadge value={data.difficulty} />
          </div>

          {data.topic && (
            <div className="mb-5 text-xs text-muted-foreground">{data.topic}</div>
          )}

          {/* Description */}
          <div className="min-w-0 overflow-x-auto">
            <Markdown>{data.description}</Markdown>
          </div>

          {/* Check Solution button */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Button
              id="btn-check-solution"
              variant={revealed ? "outline" : "default"}
              onClick={() => {
                if (revealed) {
                  setRevealed(false);
                  setConfirmReveal(false);
                } else {
                  setConfirmReveal((v) => !v);
                }
              }}
            >
              {revealed ? "Hide Solution" : "Check Solution"}
            </Button>
          </div>

          {/* Confirmation warning */}
          {confirmReveal && !revealed && (
            <div className="mt-4 rounded-lg border border-medium/40 bg-medium/10 px-4 py-4">
              <p className="text-sm font-medium text-foreground">
                Are you sure you want to see the solution?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                You'll learn more by working through it yourself first. Only
                check the solution after giving it a genuine attempt.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  id="btn-confirm-reveal"
                  size="sm"
                  onClick={() => {
                    setRevealed(true);
                    setConfirmReveal(false);
                  }}
                >
                  Yes, show solution
                </Button>
                <Button
                  id="btn-cancel-reveal"
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmReveal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Solution reveal */}
          {revealed && (
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <div className="border-b border-border bg-secondary/60 px-4 py-2 text-xs font-mono text-muted-foreground">
                solution.{data.language === "python" ? "py" : "js"}
              </div>
              <pre className="overflow-x-auto bg-[var(--code-bg)] p-4 text-sm leading-relaxed">
                <code>{data.solution_code ?? "// No solution provided yet."}</code>
              </pre>
              {data.solution_explanation && (
                <div className="min-w-0 overflow-x-auto border-t border-border px-4 py-4">
                  <Markdown>{data.solution_explanation}</Markdown>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Resources / videos */}
        {resources.length > 0 && (
          <section className="mt-6 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resources
            </h2>
            <div className="space-y-5">
              {resources.map((r, i) => {
                const embed = ytEmbed(r.url);
                return (
                  <div key={i} className="min-w-0">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-words text-sm font-medium text-primary hover:underline"
                    >
                      {r.title}
                    </a>
                    {embed && (
                      <div className="mt-2 aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
                        <iframe
                          src={embed}
                          title={r.title}
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
