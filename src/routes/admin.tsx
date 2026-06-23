import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    // TODO: Supabase OTP

    setOtpSent(true);
  };

  const handleVerify = async () => {
    // TODO: Verify OTP
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Admin{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                Access
              </span>
            </h1>

            <p className="mt-4 text-zinc-400 text-lg">
              Secure login for authorized administrators.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-8">
            <div className="space-y-6">
              <div>
                <label>Email</label>
                <Input placeholder="admin@example.com" />
              </div>

              <div>
                <label>One-Time Password</label>
                <Input placeholder="123456" />
              </div>

              <Button>
                Verify Login
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
