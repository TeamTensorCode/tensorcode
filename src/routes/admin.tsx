import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  adminListProblems,
  adminDeleteProblem,
  verifyAdminPassword,
} from "@/lib/problems.functions";
import { SiteHeader, DifficultyBadge } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAdminPassword,
  setAdminPassword,
  clearAdminPassword,
} from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — TensorCode" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  topic: string | null;
  published: boolean;
};

function AdminPage() {
  const [pw, setPw] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const stored = getAdminPassword();
    if (!stored) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await verifyAdminPassword({ data: { password: stored } });
        setPw(stored);
      } catch {
        clearAdminPassword();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!pw) return;
    refresh(pw);
  }, [pw]);

  async function refresh(password: string) {
    try {
      const rows = await adminListProblems({ data: { password } });
      setProblems(rows as Problem[]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-8 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!pw) {
    return (
      <LoginScreen
        onAuth={(p) => {
          setAdminPassword(p);
          setPw(p);
        }}
      />
    );
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this problem?")) return;
    try {
      await adminDeleteProblem({ data: { password: pw!, id } });
      toast.success("Deleted");
      await refresh(pw!);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">
              Manage TensorCode problems, solutions, and resources.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/new">
              <Button>New problem</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                clearAdminPassword();
                setPw(null);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="grid grid-cols-[1fr_8rem_8rem_6rem_8rem] border-b border-border bg-secondary/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div>Title</div>
            <div>Topic</div>
            <div>Difficulty</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {problems.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No problems yet.
            </div>
          ) : (
            problems.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_8rem_8rem_6rem_8rem] items-center border-b border-border px-4 py-3 text-sm last:border-b-0"
              >
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="font-mono text-xs text-muted-foreground">{p.slug}</div>
                </div>
                <div className="text-muted-foreground">{p.topic ?? "—"}</div>
                <DifficultyBadge value={p.difficulty} />
                <div className="text-xs">
                  {p.published ? (
                    <span className="text-easy">Published</span>
                  ) : (
                    <span className="text-muted-foreground">Draft</span>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Link to="/admin/edit/$id" params={{ id: p.id }}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(p.id)}
                    className="text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function LoginScreen({ onAuth }: { onAuth: (pw: string) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await verifyAdminPassword({ data: { password: value } });
      onAuth(value);
      toast.success("Welcome back");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-sm flex-col px-4 py-16">
        <h1 className="text-xl font-semibold tracking-tight">Admin sign-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the admin password to manage TensorCode.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input
            autoFocus
            type="password"
            placeholder="Password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button type="submit" disabled={busy || !value} className="w-full">
            {busy ? "Checking…" : "Sign in"}
          </Button>
        </form>
      </main>
    </div>
  );
}
