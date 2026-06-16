import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span
            className="grid h-7 w-7 place-items-center rounded-md font-mono text-sm text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
            aria-hidden
          >
            T
          </span>
          <span className="text-[15px]">
            Tensor<span className="brand-gradient-text">Code</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md px-3 py-1.5 bg-secondary text-foreground" }}
          >
            Problems
          </Link>
          <Link
            to="/about"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 bg-secondary text-foreground" }}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function DifficultyBadge({ value }: { value: string }) {
  const color =
    value === "Easy"
      ? "text-easy border-easy/30 bg-easy/10"
      : value === "Medium"
        ? "text-medium border-medium/30 bg-medium/10"
        : "text-hard border-hard/30 bg-hard/10";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}
    >
      {value}
    </span>
  );
}
