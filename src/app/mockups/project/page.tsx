import Link from "next/link";
import { MockupShell, StatusPill } from "@/components/mockups/shell";
import { client, files, milestones, project, tasks } from "@/lib/demo-data";

export const metadata = { title: "Project workspace mockup" };

export default function ProjectMockup() {
  return (
    <MockupShell title={project.name}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StatusPill>{project.status}</StatusPill>
        <span className="text-muted">Due {project.due}</span>
        <span className="text-muted">Client {client.company}</span>
        <span className="text-muted">Contact {client.contact}</span>
      </div>
      <p className="mt-4 max-w-2xl text-muted">{project.summary}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium">Milestones</h2>
          <ul className="mt-3 divide-y divide-border bg-surface">
            {milestones.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>{item.name}</span>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <StatusPill>{item.status}</StatusPill>
                  {item.due}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium">Tasks</h2>
          <ul className="mt-3 divide-y divide-border bg-surface">
            {tasks.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm text-muted">{item.owner}</p>
                </div>
                <StatusPill>{item.status}</StatusPill>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Files</h2>
        <ul className="mt-3 divide-y divide-border bg-surface">
          {files.map((item) => (
            <li
              key={item.name}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-muted">{item.meta}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          Next in the story:{" "}
          <Link href="/mockups/approval" className="text-accent underline-offset-2 hover:underline">
            request approval on Homepage hero v3
          </Link>
          .
        </p>
      </section>
    </MockupShell>
  );
}
