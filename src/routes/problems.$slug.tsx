import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { getProblemBySlug } from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";

const problemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["problem", slug],
    queryFn: () => getProblemBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/problems/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(problemQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — TensorCode` },
          { name: "description", content: `${loaderData.difficulty} • ${loaderData.topic ?? "AI/ML"} problem on TensorCode.` },
          { property: "og:title", content: `${loaderData.title} — TensorCode` },
          { property: "og:description", content: `${loaderData.difficulty} • ${loaderData.topic ?? "AI/ML"} problem on TensorCode.` },
        ]
      : [{ title: "Problem — TensorCode" }],
  }),
  component: ProblemPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">{error.message}</div>
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

type Resource = { type?: string; title: string; url: string };

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

function ProblemPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(problemQuery(slug));
  const [code, setCode] = useState(data?.starter_code ?? "");
  const [revealed, setRevealed] = useState(false);

  if (!data) return null;
  const resources = (data.resources as Resource[]) ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 text-xs">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            ← All problems
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: prompt */}
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">{data.title}</h1>
              <DifficultyBadge value={data.difficulty} />
            </div>
            {data.topic && (
              <div className="mb-4 text-xs text-muted-foreground">{data.topic}</div>
            )}
            <Markdown>{data.description}</Markdown>

            {resources.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Resources
                </h2>
                <div className="space-y-4">
                  {resources.map((r, i) => {
                    const embed = ytEmbed(r.url);
                    return (
                      <div key={i}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
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
              </div>
            )}
          </section>

          {/* Right: editor */}
          <section className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-4 py-2 text-xs">
                <span className="font-mono text-muted-foreground">
                  {data.language || "python"}
                </span>
                <span className="text-muted-foreground">Write your attempt</span>
              </div>
              <textarea
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block min-h-[320px] w-full resize-y bg-[var(--code-bg)] p-4 font-mono text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={revealed ? "outline" : "default"}
                onClick={() => setRevealed((v) => !v)}
              >
                {revealed ? "Hide solution" : "Reveal solution"}
              </Button>
              <Button variant="ghost" onClick={() => setCode(data.starter_code ?? "")}>
                Reset
              </Button>
            </div>

            {revealed && (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="border-b border-border bg-secondary/60 px-4 py-2 text-xs font-mono text-muted-foreground">
                  solution.{data.language === "python" ? "py" : "js"}
                </div>
                <pre className="overflow-x-auto bg-[var(--code-bg)] p-4 text-sm">
                  <code>{data.solution_code ?? "// No solution provided yet."}</code>
                </pre>
                {data.solution_explanation && (
                  <div className="border-t border-border px-4 py-3 text-sm text-foreground/90">
                    {data.solution_explanation}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
