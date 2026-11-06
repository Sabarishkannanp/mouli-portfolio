/**
 * Solid-band marquee (same pattern as the Sabarish portfolio footer):
 * huge display text with ✦ separators, two copies looping with a CSS animation, pauses on hover.
 */
const ITEMS = [
  "UI/UX Design",
  "Branding",
  "Posters",
  "Figma",
  "Prototyping",
  "Visual Design",
  "Design Systems",
  "Illustration",
];

export default function MarqueeBand({ items = ITEMS }: { items?: string[] }) {
  const row = (
    <ul aria-hidden className="flex shrink-0 items-center">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center whitespace-nowrap font-display text-[clamp(2.25rem,6vw,5rem)] font-extrabold uppercase leading-none tracking-[-0.02em] text-white"
        >
          <span className="px-6">{item}</span>
          <span aria-hidden className="text-void/70">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden py-6" style={{ background: "linear-gradient(90deg,#7C5CFF,#FF4FD8)" }}>
      <p className="sr-only">Skills: {items.join(", ")}</p>
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
