// Figma highlight:
// variant="lime" → #d2ff37 bg, dark text, ~-2deg tilt  ("powerful")
// variant="gray" → #e2e2e2 bg, dark text, ~-1.5deg tilt ("website")

interface HighlightWordProps {
  children: React.ReactNode;
  variant?: "lime" | "gray";
}

export default function HighlightWord({
  children,
  variant = "lime",
}: HighlightWordProps) {
  const isLime = variant === "lime";

  return (
    <span
      style={{
        background: isLime ? "#d2ff37" : "#e2e2e2",
        color: "#222222",
        padding: "2px 10px 6px",
        borderRadius: 6,
        display: "inline-block",
        transform: isLime ? "rotate(-2deg)" : "rotate(-1.5deg)",
        transformOrigin: "center center",
      }}
    >
      {children}
    </span>
  );
}
