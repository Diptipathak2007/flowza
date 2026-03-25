import Link from "next/link";

export default function SubaccountUnauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-6">
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground max-w-sm">
        You don&apos;t have permission to access this subaccount. Please contact
        your agency owner if you believe this is a mistake.
      </p>
      <Link
        href="/agency"
        className="mt-4 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 transition"
      >
        Go to Agency Dashboard
      </Link>
    </div>
  );
}
