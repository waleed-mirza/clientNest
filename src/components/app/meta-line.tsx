export function MetaLine({ items }: { items: { label: string; value: string }[] }) {
  const visible = items.filter((item) => item.value && item.value !== "—");
  if (visible.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {visible.map((item) => (
        <li key={item.label}>
          <span className="text-muted">{item.label}</span>{" "}
          <span className="font-medium tabular-nums">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
