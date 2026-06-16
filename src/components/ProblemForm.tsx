import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ResourceItem = { type: "video" | "article" | "link"; title: string; url: string };

export type ProblemFormValue = {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  description: string;
  starter_code: string;
  language: string;
  solution_code: string;
  solution_explanation: string;
  resources: ResourceItem[];
  published: boolean;
  display_order: number;
};

export const emptyProblem: ProblemFormValue = {
  slug: "",
  title: "",
  difficulty: "Easy",
  topic: "",
  description: "",
  starter_code: "",
  language: "python",
  solution_code: "",
  solution_explanation: "",
  resources: [],
  published: true,
  display_order: 0,
};

export function ProblemForm({
  initial,
  submitting,
  onSubmit,
  submitLabel = "Save",
}: {
  initial: ProblemFormValue;
  submitting?: boolean;
  onSubmit: (v: ProblemFormValue) => void;
  submitLabel?: string;
}) {
  const [v, setV] = useState<ProblemFormValue>(initial);

  function update<K extends keyof ProblemFormValue>(key: K, value: ProblemFormValue[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function addResource() {
    update("resources", [...v.resources, { type: "video", title: "", url: "" }]);
  }
  function updateResource(i: number, patch: Partial<ResourceItem>) {
    update(
      "resources",
      v.resources.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }
  function removeResource(i: number) {
    update(
      "resources",
      v.resources.filter((_, idx) => idx !== i),
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={v.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={v.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="lowercase-with-dashes"
            required
          />
        </div>
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            value={v.topic}
            onChange={(e) => update("topic", e.target.value)}
            placeholder="Transformers, Loss, etc."
          />
        </div>
        <div>
          <Label>Difficulty</Label>
          <Select
            value={v.difficulty}
            onValueChange={(val) => update("difficulty", val as ProblemFormValue["difficulty"])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            value={v.language}
            onChange={(e) => update("language", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="order">Display order</Label>
          <Input
            id="order"
            type="number"
            value={v.display_order}
            onChange={(e) => update("display_order", Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (markdown OK)</Label>
        <Textarea
          id="description"
          rows={8}
          value={v.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="starter">Starter code</Label>
        <Textarea
          id="starter"
          rows={6}
          value={v.starter_code}
          onChange={(e) => update("starter_code", e.target.value)}
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="solution">Solution code</Label>
        <Textarea
          id="solution"
          rows={8}
          value={v.solution_code}
          onChange={(e) => update("solution_code", e.target.value)}
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="explain">Solution explanation</Label>
        <Textarea
          id="explain"
          rows={4}
          value={v.solution_explanation}
          onChange={(e) => update("solution_explanation", e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Resources (videos, articles)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addResource}>
            Add resource
          </Button>
        </div>
        <div className="space-y-3">
          {v.resources.length === 0 && (
            <p className="text-xs text-muted-foreground">No resources yet.</p>
          )}
          {v.resources.map((r, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="grid gap-2 md:grid-cols-[8rem_1fr_2fr_4rem]">
                <Select
                  value={r.type}
                  onValueChange={(val) => updateResource(i, { type: val as ResourceItem["type"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Title"
                  value={r.title}
                  onChange={(e) => updateResource(i, { title: e.target.value })}
                />
                <Input
                  placeholder="https://youtube.com/..."
                  value={r.url}
                  onChange={(e) => updateResource(i, { url: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(i)}
                  className="text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          type="checkbox"
          checked={v.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        <Label htmlFor="published" className="!mb-0">Published</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
