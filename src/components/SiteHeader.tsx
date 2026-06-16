import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-mono text-sm">
            T
          </span>
          <span>
            Tensor<span className="text-primary">Code</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md px-3 py-1.5 bg-secondary text-foreground" }}
          >
            Problems
          </Link>
          <Link
            to="/about"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
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
      ? "text-easy"
      : value === "Medium"
        ? "text-medium"
        : "text-hard";
  return <span className={`text-xs font-semibold ${color}`}>{value}</span>;
}
