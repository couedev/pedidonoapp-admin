import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginAdminPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0d] px-5">
      <Suspense fallback={<div className="h-48 w-full max-w-sm animate-pulse rounded-lg bg-white/[0.06]" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
