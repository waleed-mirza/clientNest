import Link from "next/link";
import { MockupShell, StatusPill } from "@/components/mockups/shell";
import { activity, agency, projects, stats } from "@/lib/demo-data";

export const metadata = { title: "Agency dashboard mockup" };

export default function DashboardMockup() {
  return (
    <MockupShell title={`Good afternoon, ${agency.owner.split(" ")[0]}`}>
      <p className="text-muted">
        Harbor Studio’s week at a glance. Clients only ever see their own projects.
      </p>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {stats.map((item) => (
          <li key={item.label}>
            <span className="text-muted">{item.label}</span>{" "}
            <span className="font-medium tabular-nums">{item.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <h2 className="text-xl font-medium">Projects</h2>
          <ul className="mt-3 divide-y divide-border bg-surface">
            {projects.map((item) => (
              <li
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <Link href={item.href} className="font-medium hover:text-accent">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted">{item.client}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill>{item.status}</StatusPill>
                  <span className="text-sm text-muted">Due {item.due}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-medium">Activity</h2>
          <ol className="mt-3 divide-y divide-border bg-surface">
            {activity.map((item) => (
              <li key={item.text} className="grid gap-1 px-4 py-3">
                <p className="text-sm">{item.text}</p>
                <p className="text-xs text-muted">{item.time}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </MockupShell>
  );
}
