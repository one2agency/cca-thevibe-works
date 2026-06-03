// Figma: "4.9/5" + lime stars ★★★★★ + "Loved by 5,833+ creators"
// Stars are LIME (#d2ff37), not orange

interface StarRatingProps {
  score?: string;
  outOf?: string;
  count?: string;
}

export default function StarRating({
  score = "4.9",
  outOf = "5",
  count = "5 833+",
}: StarRatingProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-[14px] text-[#222] tracking-[-0.3px]">
          {score}
          <span className="font-normal text-[#999]">/{outOf}</span>
        </span>
        {/* Lime stars — Figma exact color */}
        <span style={{ color: "#d2ff37", fontSize: 14, letterSpacing: -1 }}>
          ★★★★★
        </span>
      </div>
      <p className="text-[12px] text-[#222]/45 mt-0.5 tracking-[-0.2px]">
        Loved by {count} creators
      </p>
    </div>
  );
}
