import { Card } from "@/components/ui";

export function PlaceholderScreen({
  code,
  title,
  note,
}: {
  code: string;
  title: string;
  note: string;
}) {
  return (
    <Card className="border-dashed">
      <p className="label-upper mb-1">{code}</p>
      <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <p className="mt-1 text-[12px] text-mute">{note}</p>
    </Card>
  );
}
