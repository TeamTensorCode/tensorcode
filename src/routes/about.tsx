import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">About TensorCode</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            TensorCode is an AI learning and practice platform built to help students and professionals master AI/ML engineering skills through
            hands-on coding practice. 
            Our goal is to make AI education practical, accessible, and effective by providing real-world datasets, Olympiad-style problems,
            and competitions to everyone.
          </p>
          <p>
            TensorCode provides an environment where learning comes from building, experimenting, and solving problems. 
            Each problem ships with a clean reference solution and a short explanation.
            We believe that the best way to learn AI is by doing, and we are committed to providing a platform that makes this possible.
          </p>
          <p>
            Everything is free under the basic tier. The premium tier is currently under development. If this is useful to
            you, tell a friend.
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
