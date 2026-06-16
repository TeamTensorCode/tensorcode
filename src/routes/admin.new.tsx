import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProblemForm, emptyProblem, type ProblemFormValue } from "@/components/ProblemForm";
import { getAdminPassword } from "@/lib/admin-auth";
import { adminUpsertProblem } from "@/lib/problems.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/new")({
  head: () => ({ meta: [{ title: "New problem — TensorCode" }, { name: "robots", content: "noindex" }] }),
  component: NewProblem,
});

function NewProblem() {
  const navigate = useNavigate();
  const [pw, setPw] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = getAdminPassword();
    if (!p) navigate({ to: "/admin" });
    else setPw(p);
  }, [navigate]);

  if (!pw) return null;

  async function save(v: ProblemFormValue) {
    setBusy(true);
    try {
      await adminUpsertProblem({
        data: {
          password: pw!,
          problem: {
            ...v,
            topic: v.topic || null,
            starter_code: v.starter_code || null,
            solution_code: v.solution_code || null,
            solution_explanation: v.solution_explanation || null,
          },
        },
      });
      toast.success("Problem created");
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">New problem</h1>
        <ProblemForm initial={emptyProblem} submitting={busy} onSubmit={save} submitLabel="Create" />
      </main>
    </div>
  );
}
