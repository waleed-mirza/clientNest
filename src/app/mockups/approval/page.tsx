import { MockupShell, StatusPill } from "@/components/mockups/shell";
import { primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import { comments } from "@/lib/demo-data";

export const metadata = { title: "Deliverable approval mockup" };

export default function ApprovalMockup() {
  return (
    <MockupShell title="Homepage hero v3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StatusPill>Awaiting approval</StatusPill>
        <span className="text-muted">Pine & Oak Coffee · Seasonal menu site</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-surface p-4">
          <p className="text-sm text-muted">Preview (static)</p>
          <div className="mt-3 overflow-hidden rounded-md border border-border bg-background">
            <div className="px-6 py-10">
              <p className="text-xs uppercase tracking-wide text-accent">Autumn menu</p>
              <p className="mt-2 text-3xl font-medium">
                Warm drinks, new pastry case, same neighborhood counter.
              </p>
              <p className="mt-3 max-w-md text-sm text-muted">
                Order ahead for the week. Allergen notes sit under every item — this line is what
                the client asked to enlarge.
              </p>
              <span className="mt-6 inline-block rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
                View the menu
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium">Conversation</h2>
          <ol className="mt-3 grid gap-3">
            {comments.map((item) => (
              <li key={`${item.author}-${item.time}`} className="bg-surface p-4">
                <p className="text-sm font-medium">
                  {item.author} <span className="font-normal text-muted">· {item.role}</span>
                </p>
                <p className="mt-2 text-sm">{item.body}</p>
                <p className="mt-2 text-xs text-muted">{item.time}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className={primaryButtonClass}>
              Approve
            </button>
            <button type="button" className={secondaryButtonClass}>
              Request changes
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Buttons are visual only. Approval will write an immutable record in v1.
          </p>
        </section>
      </div>
    </MockupShell>
  );
}
