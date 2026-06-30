import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getProblemBySlug } from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabase";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/problems/$slug")({
  component: ProblemPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">
      {(error as Error).message}
    </div>
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

async function fetchText(path: string) {
  const { data, error } = await supabase.storage
    .from("data")
    .download(path);

  if (error) throw error;

  return await data.text();
}

function ProblemPage() {
  const { slug } = Route.useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => getProblemBySlug(slug),
  });

  const [file, setFile] = useState<File | null>(null);
  const [revealed, setRevealed] = useState(false);

  const [statement, setStatement] = useState("");
  const [solution, setSolution] = useState("");
  const [explanation, setExplanation] = useState("");

  const [trainingUrl, setTrainingUrl] = useState("");
  const [testingUrl, setTestingUrl] = useState("");

  const [expectedOutput, setExpectedOutput] = useState("");

  useEffect(() => {
    if (!data) return;

    (async () => {
      setStatement(await fetchText(data.statement));

      setSolution(await fetchText(data.solution));

      setExplanation(await fetchText(data.explanation));

      const { data: train } = supabase.storage
        .from("data")
        .getPublicUrl(data.training_data);

      const { data: test } = supabase.storage
        .from("data")
        .getPublicUrl(data.testing_data);

      setTrainingUrl(train.publicUrl);

      setTestingUrl(test.publicUrl);

      const expected = await fetchText(data.expected_output);

      setExpectedOutput(expected);
    })();
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-secondary" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-lg bg-card" />
            <div className="h-96 animate-pulse rounded-lg bg-card" />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-8 text-sm text-destructive">
          {(error as Error).message}
        </div>
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

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-4 text-xs">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All problems
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT: Problem */}
          <section className="h-fit self-start rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                {data.name}
              </h1>
              <DifficultyBadge value={data.difficulty} />
            </div>

            {data.topic && (
              <div className="mb-4 text-xs text-muted-foreground">
                {data.topic}
              </div>
            )}

            <Markdown>{statement}</Markdown>

            {resources.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-sm font-semibold uppercase text-muted-foreground">
                  Resources
                </h2>

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
                        <div className="mt-2 aspect-video overflow-hidden rounded-md border border-border bg-black">
                          <iframe
                            src={embed}
                            title={r.title}
                            allowFullScreen
                            className="h-full w-full"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT: Upload + Submit */}
          <section className="flex min-w-0 flex-col gap-4">

            {/* CSV Upload */}
            <section className="h-fit rounded-lg border border-border bg-card p-4">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Upload Results</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file containing your test results.
                  </p>
                </div>

                <label
                  htmlFor="csv-upload"
                  className="
                    flex cursor-pointer flex-col items-center justify-center
                    rounded-lg border border-dashed border-border
                    px-6 py-8 text-center transition-colors
                    hover:border-primary
                  "
                >
                  <span className="font-medium">Click to upload CSV</span>
                  <span className="mt-1 text-sm text-muted-foreground">
                    Only .csv files are supported
                  </span>

                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) setFile(selected);
                    }}
                  />
                </label>

                {file && (
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                disabled={!file}
                onClick={() => {
                  // TODO: submit CSV to backend / supabase
                  console.log("Submitting file:", file);
                }}
              >
                Submit
              </button>

              <button
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
                onClick={() => setFile(null)}
              >
                Reset
              </button>

              <button
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
                onClick={() => setRevealed((v) => !v)}
              >
                {revealed ? "Hide solution" : "Reveal solution"}
              </button>

            </div>

            {/* Solution */}
            {revealed && (
              <div className="rounded-lg border border-border bg-card">
                <pre className="overflow-x-auto p-4 text-sm">
                  <code>
                    {data.solution?.replace(/\\n/g, "\n").replace(/\\t/g, "\t") ?? "// No solution provided yet."}
                  </code>
                </pre>

                {data.explanation && (
                  <div className="border-t border-border px-4 py-3">
                    <Markdown>{data.explanation}</Markdown>
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