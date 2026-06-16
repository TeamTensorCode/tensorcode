import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listProblems } from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";

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
          "Practice machine learning and AI coding problems with video explanations and clean solutions.",
      },
      { property: "og:title", content: "TensorCode — LeetCode for AI/ML Engineers" },
      {
        property: "og:description",
        content:
          "Practice machine learning and AI coding problems with video explanations and clean solutions.",
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

function HomePage() {
  const { data: problems } = useSuspenseQuery(problemsQuery);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            LeetCode for AI engineers.
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Curated machine learning coding problems with video walkthroughs and clean
            reference solutions. Free while we test the waters.
          </p>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="grid grid-cols-[3rem_1fr_8rem_8rem] border-b border-border bg-secondary/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div>#</div>
            <div>Title</div>
            <div>Topic</div>
            <div>Difficulty</div>
          </div>
          {problems.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No problems yet. Check back soon.
            </div>
          ) : (
            problems.map((p, i) => (
              <Link
                key={p.id}
                to="/problems/$slug"
                params={{ slug: p.slug }}
                className="grid grid-cols-[3rem_1fr_8rem_8rem] items-center border-b border-border px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-secondary/60"
              >
                <div className="font-mono text-muted-foreground">{i + 1}</div>
                <div className="font-medium">{p.title}</div>
                <div className="text-muted-foreground">{p.topic ?? "—"}</div>
                <DifficultyBadge value={p.difficulty} />
              </Link>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
