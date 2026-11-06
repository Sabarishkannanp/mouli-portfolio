export type PlaygroundItem = { src: string; alt: string; w: number; h: number; palette: string[] };

// Replace these with his real posters & creatives in /public/playground
const ratios: [number, number][] = [
  [900, 1200],
  [1000, 1000],
  [900, 1300],
  [1200, 900],
];
const labels = [
  "Movie poster",
  "Travel promo",
  "Perfume ad",
  "Brochure",
  "Logo sheet",
  "Event poster",
  "Social post",
  "Book cover",
  "Menu card",
  "Album art",
  "Festival poster",
  "Typography study",
];

export const playground: PlaygroundItem[] = labels.map((alt, i) => {
  const [w, h] = ratios[i % 4];
  return {
    src: `/playground/p${String(i + 1).padStart(2, "0")}.jpg`,
    alt,
    w,
    h,
    palette: ["#7C5CFF", "#B04FE8", "#FF4FD8", "#3DF5FF"],
  };
});
