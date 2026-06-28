import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const handleVerify = async () => {
    // TODO: Verify OTP
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Admin{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                Access
              </span>
            </h1>

            <p className="mt-4 text-lg text-zinc-400">
              Secure login for authorized administrators.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-8">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-zinc-800
                    bg-zinc-950
                    px-4
                    py-3
                    text-white
                    placeholder:text-zinc-500
                    focus:border-indigo-500
                    focus:outline-none
                  "
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Password
                </label>

                <input
                  type="text"
                  placeholder="********"
                  maxLength={6}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-zinc-800
                    bg-zinc-950
                    px-4
                    py-3
                    text-white
                    placeholder:text-zinc-500
                    focus:border-indigo-500
                    focus:outline-none
                  "
                />
              </div>

              <button
                onClick={handleVerify}
                className="
                  w-full
                  rounded-lg
                  bg-gradient-to-r
                  from-indigo-600
                  via-purple-600
                  to-orange-500
                  py-3
                  font-medium
                  text-white
                  transition-opacity
                  hover:opacity-90
                "
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
