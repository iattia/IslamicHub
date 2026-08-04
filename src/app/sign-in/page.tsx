import Link from "next/link";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

const authEnabled = Boolean(
  process.env.DATABASE_URL &&
  process.env.AUTH_SECRET &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET,
);

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <div className="rounded-3xl border border-line bg-panel p-8">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-accent">
          Your IslamicHub
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {authEnabled ? "Keep your study in sync." : "Your study stays local."}
        </h1>
        <p className="mt-3 leading-7 text-muted">
          {authEnabled
            ? "Sign in to save notes, collections, highlights, and reading progress across devices."
            : "Account synchronization is not enabled on this deployment. Reading preferences and Study progress remain saved on this device."}
        </p>
        {authEnabled ? (
          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <Button className="w-full">Continue with GitHub</Button>
          </form>
        ) : (
          <Link href="/">
            <Button className="mt-8 w-full">Return home</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
