// Hero section — exact Figma replica (node 4:1188)
// Frame: 2383 × 916px  |  BG: #f5f5f5  |  Font: Outfit
//
// H1 line 1: "You need a " [⚡ badge] [LIME "powerful"]
// H1 line 2: [🌐 badge] [DARK "website"] " template."
// All inline — br forces the break between lines

import IconBadge from "@/components/ui/IconBadge";
import HighlightWord from "@/components/ui/HighlightWord";
import AvatarStack from "@/components/ui/AvatarStack";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";

// Responsive font size matching Figma at ~1400px wide
const FS = "clamp(56px, 8.5vw, 120px)";

export default function Hero() {
  return (
    <section className="w-full bg-[#f5f5f5] pt-[120px] pb-[100px] px-9">
      <div className="max-w-[1400px] mx-auto">

        {/* Pre-label */}
        <div className="flex items-baseline gap-2 mb-7">
          <span className="font-bold text-[20px] tracking-[-0.6px] text-[#222]">
            You don&apos;t need
          </span>
          <span className="font-medium text-[20px] tracking-[-0.6px] text-[#222]/40">
            a teafu
          </span>
        </div>

        {/* H1 */}
        <h1
          className="font-black tracking-[-0.045em] text-[#222] mb-10 leading-[1.05]"
          style={{ fontSize: FS }}
        >
          {/* Line 1: "You need a" + lime ⚡ badge + lime tilted "powerful" */}
          <span className="inline-block whitespace-nowrap mr-[0.18em]">You need a</span>
          <IconBadge variant="lime">⚡</IconBadge>
          <span className="inline-block w-[0.12em]" />
          <HighlightWord variant="lime">powerful</HighlightWord>
          <br />
          {/* Line 2: gray 🌐 badge + gray tilted "website" + plain "template." */}
          <IconBadge variant="gray">🌐</IconBadge>
          <span className="inline-block w-[0.12em]" />
          <HighlightWord variant="gray">website</HighlightWord>
          <span> template.</span>
        </h1>

        {/* Description + Social proof */}
        <div className="flex flex-wrap items-center gap-10 mb-10">
          <p
            className="font-normal leading-[1.65] text-[#222]/55 max-w-[320px]"
            style={{ fontSize: "clamp(15px, 1.15vw, 17px)" }}
          >
            Launch a stunning website that looks like you hired a top design
            agency. In days.
          </p>
          <div className="flex items-center gap-3">
            <AvatarStack size={38} />
            <StarRating />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="primary" href="#templates">
            Browse Templates
          </Button>
          <Button variant="secondary" href="#how">
            Learn How It Works
          </Button>
        </div>

      </div>
    </section>
  );
}
