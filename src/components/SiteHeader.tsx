import { Link } from "@tanstack/react-router";

// â”€â”€â”€ Site Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo + brand name */}
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <img
            src="/logo.png"
            alt="TensorCode logo"
            className="h-8 w-auto"
            loading="eager"
          />
          <span className="text-[15px]">
            Tensor<span className="brand-gradient-text">Code</span>
          </span>
        </Link>

        {/* Navigation */}
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

// â”€â”€â”€ Difficulty Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Difficulty = "Easy" | "Medium" | "Hard" | string;

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "text-easy border-easy/30 bg-easy/10",
  Medium: "text-medium border-medium/30 bg-medium/10",
  Hard: "text-hard border-hard/30 bg-hard/10",
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  const style = DIFFICULTY_STYLES[value] ?? "text-muted-foreground border-border bg-secondary";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style}`}
    >
      {value}
    </span>
  );
}
