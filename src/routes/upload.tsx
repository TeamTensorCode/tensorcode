import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";
export const Route = createFileRoute("/upload")({
  component: NewProblemPage,
});

function NewProblemPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        navigate({ to: "/admin" });
      }
    };

    checkSession();
  }, [navigate]);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    difficulty: "Easy",
  });

  const [files, setFiles] = useState({
    statement: null as File | null,
    training: null as File | null,
    testing: null as File | null,
    expected: null as File | null,
    solution: null as File | null,
    explanation: null as File | null,
  });

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const updateFile = (
    key: keyof typeof files,
    file: File | null
  ) => {
    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      topic: "",
      difficulty: "Easy",
    });

    setFiles({
      statement: null,
      training: null,
      testing: null,
      expected: null,
      solution: null,
      explanation: null,
    });
  };

  const slug = (title: string) =>
    title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const uploadFile = async (
    problemId: string,
    filename: string,
    file: File
  ) => {
    const path = `${problemId}/${filename}`;

    const { error } = await supabase.storage
      .from("data")
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;

    return path;
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.topic ||
      !files.statement ||
      !files.training ||
      !files.testing ||
      !files.expected ||
      !files.solution ||
      !files.explanation
    ) {
      alert("Please complete every field.");
      return;
    }

    setLoading(true);

    const id = crypto.randomUUID();

    try {
      const [
        statement,
        training,
        testing,
        expected,
        solution,
        explanation,
      ] = await Promise.all([
        uploadFile(id, "statement.md", files.statement),
        uploadFile(id, "training.csv", files.training),
        uploadFile(id, "testing.csv", files.testing),
        uploadFile(id, "expected_output.csv", files.expected),
        uploadFile(id, "solution.py", files.solution),
        uploadFile(id, "explanation.md", files.explanation),
      ]);

      const { error } = await supabase
        .from("problems")
        .insert({
          id,
          slug: slug(form.title),

          name: form.title,
          topic: form.topic,

          statement,
          training_data: training,
          testing_data: testing,
          expected_output: expected,

          solution,
          explanation,

          difficulty: form.difficulty,
        });

      if (error) throw error;

      alert("Problem published!");

      resetForm();
    } catch (err: any) {
      console.error(err);

      await supabase.storage.from("data").remove([
        `${id}/statement.md`,
        `${id}/training.csv`,
        `${id}/testing.csv`,
        `${id}/expected_output.csv`,
        `${id}/solution.py`,
        `${id}/explanation.md`,
      ]);

      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold">
            Add New Problem
          </h1>

          <p className="mb-8 text-muted-foreground">
            Create a new TensorCode challenge.
          </p>

          <div className="space-y-6">

            {/* Problem Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Problem Title *
              </label>

              <input
                name="title"
                value={form.title}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background px-4 py-2 outline-none focus:border-primary"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Problem Topic *
              </label>

              <input
                name="topic"
                value={form.topic}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background px-4 py-2 outline-none focus:border-primary"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background px-4 py-2"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            {/* Statement */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Problem Statement *
              </label>

              <textarea
                name="statement"
                rows={8}
                value={form.statement}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background p-3 outline-none focus:border-primary"
              />
            </div>

            {/* Training Data */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Training Data
              </label>

              <textarea
                name="training_data"
                rows={6}
                value={form.training_data}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background p-3 outline-none focus:border-primary"
              />
            </div>

            {/* Testing Data */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Testing Data
              </label>

              <textarea
                name="testing_data"
                rows={6}
                value={form.testing_data}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background p-3 outline-none focus:border-primary"
              />
            </div>

            {/* Expected Output */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Expected Output
              </label>

              <textarea
                name="expected_output"
                rows={6}
                value={form.expected_output}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background p-3 outline-none focus:border-primary"
              />
            </div>

            {/* Solution */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Solution *
              </label>

              <textarea
                name="solution"
                rows={8}
                value={form.solution}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background p-3 font-mono outline-none focus:border-primary"
              />
            </div>

            {/* Explanation */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Explanation
              </label>

              <textarea
                name="explanation"
                rows={8}
                value={form.explanation}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background p-3 outline-none focus:border-primary"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Problem"}
              </button>

              <button
                onClick={resetForm}
                disabled={loading}
                className="rounded-md border border-border px-5 py-2 transition hover:bg-secondary"
              >
                Reset
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}