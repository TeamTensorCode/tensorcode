import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getProblemBySlug } from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";
import { PROBLEM_TESTS } from "@/lib/problem-tests";
import { runUserCode, type RunOutcome } from "@/lib/pyodide-runner";

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


function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words text-foreground">
        {value}
      </pre>
    </div>
  );
}



function ProblemPage() {
  const { slug } = Route.useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => getProblemBySlug(slug),
  });

  // Editor state
  const [code, setCode] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "console">("results");
  const [submitted, setSubmitted] = useState(false);

  // Once data arrives, seed the editor with starter_code (only once)
  const editorCode = code ?? data?.starter_code ?? "";

  const tests = useMemo(
    () => (data ? PROBLEM_TESTS[data.slug] : undefined),
    [data],
  );

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

  // â”€â”€ Run / Submit â”€â”€
  async function execute(mode: "run" | "submit") {
    if (!tests) {
      setOutcome({
        stdout: "",
        stderr: "",
        results: [],
        compileError: "No tests defined for this problem yet.",
      });
      setActiveTab("results");
      return;
    }
    setRunning(true);
    setStatus("Starting");
    setActiveTab("results");
    setSubmitted(mode === "submit");
    try {
      const cases = mode === "run" ? tests.cases.slice(0, 1) : tests.cases;
      const res = await runUserCode(editorCode, cases, setStatus);
      setOutcome(res);
      setStatus("");
    } catch (e) {
      setOutcome({
        stdout: "",
        stderr: "",
        results: [],
        compileError: (e as Error).message,
      });
      setStatus("");
    } finally {
      setRunning(false);
    }
  }

  const passed = outcome?.results.filter((r) => r.ok).length ?? 0;
  const total = outcome?.results.length ?? 0;
  const allPassed = outcome && !outcome.compileError && total > 0 && passed === total;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-xs">
          <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
           ← All problems
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* â”€â”€ Left: Problem description â”€â”€ */}
          <section className="min-w-0 rounded-lg border border-border bg-card p-5 sm:p-6">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="min-w-0 break-words text-lg font-semibold tracking-tight sm:text-xl">
                {data.title}
              </h1>
              <DifficultyBadge value={data.difficulty} />
            </div>
            {data.topic && (
              <div className="mb-4 text-xs text-muted-foreground">{data.topic}</div>
            )}
            <div className="min-w-0 overflow-x-auto">
              <Markdown>{data.description}</Markdown>
            </div>

            {/* Resources / videos */}
            {resources.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Resources
                </h2>
                <div className="space-y-4">
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
              </div>
            )}
          </section>

          {/* â”€â”€ Right: Code editor + results â”€â”€ */}
          <section className="flex min-w-0 flex-col gap-4">

            {/* Code editor */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-4 py-2 text-xs">
                <span className="font-mono text-muted-foreground">
                  {data.language || "python"}
                </span>
                <span className="text-muted-foreground">Write your attempt</span>
              </div>
              <textarea
                id="code-editor"
                spellCheck={false}
                value={editorCode.replace(/\\n/g, "\n").replace(/\\t/g, "\t")}
                onChange={(e) => setCode(e.target.value)}
                className="block min-h-[320px] w-full resize-y bg-[var(--code-bg)] p-4 font-mono text-sm outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button id="btn-run" onClick={() => execute("run")} disabled={running}>
                {running ? "Running" : "Run Code"}
              </Button>
              <Button
                id="btn-submit"
                variant="secondary"
                onClick={() => execute("submit")}
                disabled={running}
              >
                Submit
              </Button>
              <Button
                id="btn-reveal"
                variant={revealed ? "outline" : "ghost"}
                onClick={() => setRevealed((v) => !v)}
              >
                {revealed ? "Hide solution" : "Reveal solution"}
              </Button>
              <Button
                id="btn-reset"
                variant="ghost"
                onClick={() => setCode(data.starter_code ?? "")}
              >
                Reset
              </Button>
              {status && (
                <span className="text-xs text-muted-foreground">{status}</span>
              )}
            </div>

            {/* Results / Console tabs */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-2 py-1.5 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    id="tab-results"
                    onClick={() => setActiveTab("results")}
                    className={`rounded px-2 py-1 transition-colors ${
                      activeTab === "results"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Test Results
                  </button>
                  <button
                    id="tab-console"
                    onClick={() => setActiveTab("console")}
                    className={`rounded px-2 py-1 transition-colors ${
                      activeTab === "console"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Console
                  </button>
                </div>
                {outcome && !outcome.compileError && total > 0 && (
                  <span
                    className={`px-2 font-mono text-xs ${allPassed ? "text-easy" : "text-hard"}`}
                  >
                    {passed}/{total} passed
                  </span>
                )}
              </div>

              {activeTab === "results" ? (
                <div className="max-h-[420px] overflow-auto p-3 text-sm">
                  {!outcome && (
                    <div className="px-1 py-6 text-center text-xs text-muted-foreground">
                      Run your code to see test results.
                    </div>
                  )}
                  {outcome?.compileError && (
                    <div className="rounded border border-destructive/40 bg-destructive/10 p-3">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">
                        Compile / Runtime error
                      </div>
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-destructive">
                        {outcome.compileError}
                      </pre>
                    </div>
                  )}
                  {outcome && !outcome.compileError && (
                    <>
                      {submitted && allPassed && (
                        <div className="mb-3 rounded border border-easy/40 bg-easy/10 px-3 py-2 text-sm font-medium text-easy">
                         Accepted all {total} test cases passed.
                        </div>
                      )}
                      <ul className="space-y-2">
                        {outcome.results.map((r, i) => (
                          <li
                            key={i}
                            className={`rounded border p-3 ${
                              r.ok
                                ? "border-easy/30 bg-easy/5"
                                : "border-hard/30 bg-hard/5"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-xs font-medium">
                                Case {i + 1}: {r.name}
                              </span>
                              <span
                                className={`font-mono text-xs ${r.ok ? "text-easy" : "text-hard"}`}
                              >
                                {r.ok ? "Passed" : "Failed"}
                              </span>
                            </div>
                            {!r.ok && (
                              <div className="space-y-1 font-mono text-[11px]">
                                <Row label="Input" value={r.call} />
                                {r.expected && <Row label="Expected" value={r.expected} />}
                                {r.actual && <Row label="Actual" value={r.actual} />}
                                {r.error && (
                                  <div>
                                    <div className="text-muted-foreground">Error</div>
                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-destructive">
                                      {r.error}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <div className="max-h-[420px] overflow-auto p-3">
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                    {outcome?.stdout || outcome?.stderr
                      ? `${outcome.stdout ?? ""}${outcome.stderr ? `\n[stderr]\n${outcome.stderr}` : ""}`
                      : "(no output)"}
                  </pre>
                </div>
              )}
            </div>

            {/* Solution reveal */}
            {revealed && (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="border-b border-border bg-secondary/60 px-4 py-2 text-xs font-mono text-muted-foreground">
                  solution.{data.language === "python" ? "py" : "js"}
                </div>
                <pre className="overflow-x-auto bg-[var(--code-bg)] p-4 text-sm">
                  <code>{data.solution_code ?? "// No solution provided yet."}</code>
                </pre>
                {data.solution_explanation && (
                  <div className="min-w-0 overflow-x-auto border-t border-border px-4 py-3">
                    <Markdown>{data.solution_explanation}</Markdown>
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
