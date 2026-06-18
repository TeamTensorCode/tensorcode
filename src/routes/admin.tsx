import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

/**
 * The admin panel relied on TanStack Start server functions to securely verify
 * a password and call the Supabase service-role API server-side. In a pure SPA
 * there is no server to run that logic, and exposing the service-role key
 * client-side would be a security risk.
 *
 * Use the Supabase dashboard directly to manage problems:
 * https://supabase.com/dashboard/project/whbtztxgqewdbtffdwbu/editor
 */
function AdminPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Problem management is done directly through the Supabase dashboard.
          The admin panel has been simplified since the app now runs as a pure
          client-side SPA without a server.
        </p>

        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card text-left">
          <div className="border-b border-border bg-secondary/60 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Where to manage problems
          </div>
          <div className="space-y-3 p-4 text-sm">
            <a
              href="https://supabase.com/dashboard/project/whbtztxgqewdbtffdwbu/editor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3 text-foreground transition-colors hover:bg-secondary"
            >
              <svg className="h-5 w-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.101 12.888.701 14.1 1.762 14.1h9.938l.2 8.864c.015.986 1.26 1.41 1.874.637l9.262-11.652c.663-.838.063-2.05-.998-2.05h-9.938l-.2-8.863z"/>
              </svg>
              <div>
                <div className="font-medium">Supabase Table Editor</div>
                <div className="text-xs text-muted-foreground">
                  supabase.com/dashboard/project/whbtztxgqewdbtffdwbu/editor
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="text-sm text-primary underline underline-offset-2 hover:opacity-80"
          >
            â† Back to problems
          </Link>
        </div>
      </main>
    </div>
  );
}
