// Figma: circular badge rendered inline with H1 text
// variant="lime" → lime (#d2ff37) bg, dark icon  (⚡ on line 1)
// variant="gray" → light gray bg, muted icon     (🌐 on line 2)

interface IconBadgeProps {
  children: React.ReactNode;
  variant?: "lime" | "gray";
  sizeEm?: number;
}

export default function IconBadge({
  children,
  variant = "lime",
  sizeEm = 0.52,
}: IconBadgeProps) {
  const bg = variant === "lime" ? "#d2ff37" : "#e2e2e2";

  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{
        width: `${sizeEm}em`,
        height: `${sizeEm}em`,
        fontSize: `${sizeEm * 0.46}em`,
        background: bg,
        verticalAlign: "middle",
        marginBottom: "0.08em",
      }}
    >
      {children}
    </span>
  );
}
