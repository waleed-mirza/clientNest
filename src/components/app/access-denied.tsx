import Link from "next/link";

export function AccessDenied({ title, message }: { title: string; message: string }) {
  return (
    <div>
      <h1 className="text-[1.75rem] font-medium">{title}</h1>
      <p className="mt-2 max-w-xl text-muted" role="status">
        {message}
      </p>
      <p className="mt-4">
        <Link href="/app" className="text-sm text-accent underline-offset-2 hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
