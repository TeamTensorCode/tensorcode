import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/upload")({
  component: NewProblemPage,
});

async function secure() {
  const navigate = useNavigate()
  const session = await supabase.auth.getSession();  

  if (!session.data.session) {
      navigate({to: "/admin"});
  }
}

function NewProblemPage() {
  secure()
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    statement: "",
    training_data: "",
    testing_data: "",
    expected_output: "",
    solution: "",
    explanation: "",
    difficulty: "Easy",
  });

  const updateField = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      topic: "",
      statement: "",
      training_data: "",
      testing_data: "",
      expected_output: "",
      solution: "",
      explanation: "",
      difficulty: "Easy",
    });
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.topic ||
      !form.statement ||
      !form.solution
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("problems").insert({
      name: form.title,
      topic: form.topic,
      statement: form.statement,
      training_data: form.training_data,
      testing_data: form.testing_data,
      expected_output: form.expected_output,
      solution: form.solution,
      explanation: form.explanation,
      difficulty: form.difficulty,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Problem published successfully!");

    resetForm();
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