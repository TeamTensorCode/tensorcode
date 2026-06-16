import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProblemForm, emptyProblem, type ProblemFormValue, type ResourceItem } from "@/components/ProblemForm";
import { getAdminPassword } from "@/lib/admin-auth";
import { adminGetProblem, adminUpsertProblem } from "@/lib/problems.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/edit/$id")({
  head: () => ({ meta: [{ title: "Edit problem — TensorCode" }, { name: "robots", content: "noindex" }] }),
  component: EditProblem,
});

function EditProblem() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [pw, setPw] = useState<string | null>(null);
  const [initial, setInitial] = useState<ProblemFormValue | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = getAdminPassword();
    if (!p) {
      navigate({ to: "/admin" });
      return;
    }
    setPw(p);
    (async () => {
      try {
        const row = await adminGetProblem({ data: { password: p, id } });
        if (!row) {
          toast.error("Not found");
          navigate({ to: "/admin" });
          return;
        }
        setInitial({
          ...emptyProblem,
          ...row,
          difficulty: row.difficulty as ProblemFormValue["difficulty"],
          topic: row.topic ?? "",
          starter_code: row.starter_code ?? "",
          solution_code: row.solution_code ?? "",
          solution_explanation: row.solution_explanation ?? "",
          resources: (row.resources as ResourceItem[]) ?? [],
        });
      } catch (e) {
        toast.error((e as Error).message);
      }
    })();
  }, [id, navigate]);

  async function save(v: ProblemFormValue) {
    setBusy(true);
    try {
      await adminUpsertProblem({
        data: {
          password: pw!,
          id,
          problem: {
            ...v,
            topic: v.topic || null,
            starter_code: v.starter_code || null,
            solution_code: v.solution_code || null,
            solution_explanation: v.solution_explanation || null,
          },
        },
      });
      toast.success("Saved");
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!initial) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-8 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit problem</h1>
        <ProblemForm initial={initial} submitting={busy} onSubmit={save} submitLabel="Save" />
      </main>
    </div>
  );
}
