// Figma: overlapping circular avatars (photos)
// Uses gradient placeholder circles since no real photos

const AVATARS = [
  { bg: "#c8b8a2", initials: "A" },
  { bg: "#a0b4c8", initials: "B" },
  { bg: "#b8c8a0", initials: "C" },
  { bg: "#c8a0b4", initials: "D" },
];

interface AvatarStackProps {
  size?: number;
}

export default function AvatarStack({ size = 40 }: AvatarStackProps) {
  return (
    <div className="flex items-center" style={{ gap: 0 }}>
      {AVATARS.map(({ bg, initials }, i) => (
        <div
          key={i}
          className="rounded-full border-[2.5px] border-[#f5f5f5] flex items-center justify-center font-semibold text-[#444] shrink-0"
          style={{
            width: size,
            height: size,
            background: bg,
            fontSize: size * 0.35,
            marginLeft: i === 0 ? 0 : -(size * 0.3),
            zIndex: AVATARS.length - i,
          }}
        >
          {initials}
        </div>
      ))}
    </div>
  );
}
