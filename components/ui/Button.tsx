// Figma hero buttons — exact match
// primary:   dark #222 bg, white text, template grid icon
// secondary: white bg, dark text, "?" question mark icon

import Link from "next/link";

interface ButtonProps {
  href?: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  href = "#",
  variant = "primary",
  children,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-3 font-semibold text-[15px] tracking-[-0.2px] px-5 py-[13px] rounded-[14px] transition-all duration-150 shrink-0";

  const styles =
    variant === "primary"
      ? "bg-[#222] text-white hover:bg-[#111]"
      : "bg-white text-[#222] shadow-[0_0_0_1.5px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1.5px_rgba(0,0,0,0.18)]";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {variant === "primary" ? (
        /* Figma: template/grid icon — 3 white rectangles */
        <span className="w-7 h-7 rounded-[8px] bg-white/12 flex items-center justify-center shrink-0">
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
            <rect x="0" y="0" width="14" height="3.5" rx="1" fill="white" />
            <rect x="0" y="5" width="6" height="8" rx="1" fill="white" />
            <rect x="8" y="5" width="6" height="3.5" rx="1" fill="white" />
          </svg>
        </span>
      ) : (
        /* Figma: "?" icon — small circle with question mark */
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black text-[11px]"
          style={{ background: "#d2ff37", color: "#222" }}
        >
          ?
        </span>
      )}
      {children}
    </Link>
  );
}
