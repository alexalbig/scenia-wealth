export function TitBar({
  segments,
}: {
  segments: Array<{ pct: number; color: string }>;
}) {
  return (
    <div className="tit-bar">
      {segments.map((s, i) => (
        <i key={i} style={{ width: `${s.pct}%`, background: s.color }} />
      ))}
    </div>
  );
}
