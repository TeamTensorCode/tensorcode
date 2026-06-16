import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — TensorCode" },
      {
        name: "description",
        content: "TensorCode is LeetCode for AI engineers — curated ML problems with video explanations.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">About TensorCode</h1>
        <div className="prose mt-4 max-w-none text-sm text-muted-foreground">
          <p>
            TensorCode is a focused practice platform for AI/ML engineering interviews and
            day-to-day fluency. Each problem ships with a clean reference solution and a
            short video walkthrough.
          </p>
          <p>
            Everything is free right now — we're testing demand. If this is useful to you,
            tell a friend.
          </p>
          <p>
            Questions, feedback, or problem suggestions? Email us at{" "}
            <a
              href="mailto:teamtensorcode@gmail.com"
              className="text-primary underline hover:opacity-80"
            >
              teamtensorcode@gmail.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
