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
      navigate({ to: "/" });
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

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Problem Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background px-4 py-2"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Problem Topic
              </label>

              <input
                name="topic"
                value={form.topic}
                onChange={updateField}
                className="w-full rounded-md border border-border bg-background px-4 py-2"
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
            <FilePicker
              title="Problem Statement (.md)"
              accept=".md,text/markdown"
              file={files.statement}
              onChange={(f) => updateFile("statement", f)}
            />

            {/* Training */}
            <FilePicker
              title="Training Data (.csv)"
              accept=".csv,text/csv"
              file={files.training}
              onChange={(f) => updateFile("training", f)}
            />

            {/* Testing */}
            <FilePicker
              title="Testing Data (.csv)"
              accept=".csv,text/csv"
              file={files.testing}
              onChange={(f) => updateFile("testing", f)}
            />

            {/* Expected Output */}
            <FilePicker
              title="Expected Output (.csv)"
              accept=".csv,text/csv"
              file={files.expected}
              onChange={(f) => updateFile("expected", f)}
            />

            {/* Solution */}
            <FilePicker
              title="Solution (.py)"
              accept=".py,text/x-python"
              file={files.solution}
              onChange={(f) => updateFile("solution", f)}
            />

            {/* Explanation */}
            <FilePicker
              title="Explanation (.md)"
              accept=".md,text/markdown"
              file={files.explanation}
              onChange={(f) => updateFile("explanation", f)}
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Problem"}
              </button>

              <button
                onClick={resetForm}
                disabled={loading}
                className="rounded-md border border-border px-5 py-2 hover:bg-secondary"
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

  type PickerProps = {
    title: string;
    accept: string;
    file: File | null;
    onChange: (file: File | null) => void;
  };

  function FilePicker({
    title,
    accept,
    file,
    onChange,
  }: PickerProps) {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium">
          {title}
        </label>

        <label
          className="
            flex cursor-pointer items-center justify-center
            rounded-lg border border-dashed border-border
            bg-background px-6 py-6 transition
            hover:border-primary
          "
        >
          <div className="text-center">
            <div className="font-medium">
              {file ? file.name : "Choose File"}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              Click to browse
            </div>
          </div>

          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) =>
              onChange(e.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>
    );
  }