import type { ReactNode } from "react";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b-${index}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={`${keyPrefix}-c-${index}`} className="font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = link[2];
        const external = href.startsWith("http://") || href.startsWith("https://");
        nodes.push(
          <a
            key={`${keyPrefix}-a-${index}`}
            href={href}
            className="text-accent underline-offset-2 hover:underline"
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {link[1]}
          </a>,
        );
      }
    }
    last = match.index + token.length;
    index += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isFence(line: string): boolean {
  return line.startsWith("```");
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let block = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (isFence(line)) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !isFence(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push(
        <pre
          key={`code-${block}`}
          className="overflow-x-auto bg-surface-2 p-4 text-sm"
          data-lang={lang || undefined}
        >
          <code className="font-mono">{code.join("\n")}</code>
        </pre>,
      );
      block += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${block}`} className="font-serif text-4xl font-semibold text-balance">
          {line.slice(2)}
        </h1>,
      );
      i += 1;
      block += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${block}`} className="mt-2 text-2xl font-medium">
          {line.slice(3)}
        </h2>,
      );
      i += 1;
      block += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${block}`} className="text-xl font-medium">
          {line.slice(4)}
        </h3>,
      );
      i += 1;
      block += 1;
      continue;
    }

    if (line.trim() === "---") {
      blocks.push(<hr key={`hr-${block}`} className="border-border" />);
      i += 1;
      block += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = splitTableRow(lines[i]);
        if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
        i += 1;
      }
      const header = rows[0] ?? [];
      const body = rows.slice(1);
      blocks.push(
        <div key={`table-${block}`} className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {header.map((cell) => (
                  <th key={cell} className="px-3 py-2 font-medium">
                    {inline(cell, `th-${block}-${cell}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={`r-${rowIndex}`} className="border-b border-border">
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top">
                      {inline(cell, `td-${block}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      block += 1;
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${block}`} className="grid list-disc gap-2 pl-5 text-sm text-muted">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="text-foreground">
              {inline(item, `ul-${block}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      );
      block += 1;
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${block}`} className="grid list-decimal gap-2 pl-5 text-sm">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inline(item, `ol-${block}-${itemIndex}`)}</li>
          ))}
        </ol>,
      );
      block += 1;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("|") &&
      !isFence(lines[i]) &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      lines[i].trim() !== "---"
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={`p-${block}`} className="text-muted text-pretty">
        {inline(para.join(" "), `p-${block}`)}
      </p>,
    );
    block += 1;
  }

  return <div className="grid gap-5">{blocks}</div>;
}
