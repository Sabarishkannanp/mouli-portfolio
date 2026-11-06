export type Project = {
  slug: string;
  title: string;
  short: string;
  summary: string;
  tags: string[];
  tools: string[];
  cover: string;
  /** colours used by the eyedropper cursor loupe (left → right across the image) */
  palette: string[];
  accent: string;
  role: string;
  timeline: string;
  problem: string;
  process: { title: string; text: string }[];
  gallery: string[];
  outcome: string;
};

export const work: Project[] = [
  {
    slug: "perfume-brand",
    title: "Perfume Brand Identity & Creative Campaign",
    short: "Perfume Brand",
    summary: "Brand identity, perfume ad posters and brochures — a premium campaign built around mood, light and typography.",
    tags: ["Branding", "Poster", "Print"],
    tools: ["Photoshop"],
    cover: "/work/perfume.jpg",
    palette: ["#3A1F5C", "#7C5CFF", "#C04FD8", "#FF4FD8", "#1A1226"],
    accent: "#FF4FD8",
    role: "Brand & graphic designer",
    timeline: "TODO: e.g. 4 weeks",
    problem: "TODO: What did the brand need? Who is the audience, and what made the brief tricky?",
    process: [
      { title: "Research", text: "TODO: moodboards, competitor shelves, references." },
      { title: "Identity", text: "TODO: logo, type and colour system for the label." },
      { title: "Campaign", text: "TODO: poster concepts, image manipulation, retouching." },
      { title: "Print", text: "TODO: brochure layout and print-ready files." },
    ],
    gallery: ["/work/perfume-1.jpg", "/work/perfume-2.jpg", "/work/perfume-3.jpg"],
    outcome: "TODO: results, feedback and what you learned.",
  },
  {
    slug: "muthiah-trust",
    title: "Muthiah Trust — Complete Visual Identity",
    short: "Muthiah Trust",
    summary: "Logo, ID cards, visiting cards, certificates, brochures, booklets, website creatives, T-shirt and 3D house mockups.",
    tags: ["Identity", "Illustration", "Stationery"],
    tools: ["Illustrator"],
    cover: "/work/muthiah-trust.jpg",
    palette: ["#1B2A6B", "#3C6EFF", "#7C5CFF", "#FFC83C", "#0E0B18"],
    accent: "#3C6EFF",
    role: "Identity designer & illustrator",
    timeline: "TODO",
    problem: "TODO: the trust needed one consistent identity across print, web and merchandise.",
    process: [
      { title: "Discovery", text: "TODO" },
      { title: "Logo", text: "TODO" },
      { title: "Stationery", text: "TODO" },
      { title: "Mockups", text: "TODO" },
    ],
    gallery: ["/work/muthiah-trust-1.jpg", "/work/muthiah-trust-2.jpg", "/work/muthiah-trust-3.jpg"],
    outcome: "TODO",
  },
  {
    slug: "gym-app",
    title: "Gym Training Mobile App — UI/UX Case Study",
    short: "Gym App",
    summary: "Discover workout plans, track progress and stay consistent. Research → user flow → wireframes → hi-fi UI → interactive prototype.",
    tags: ["Mobile app", "UX research", "Prototype"],
    tools: ["Figma"],
    cover: "/work/gym-app.jpg",
    palette: ["#140F24", "#7C5CFF", "#5A8CFF", "#3DF5FF", "#08070D"],
    accent: "#7C5CFF",
    role: "UI/UX designer (end-to-end)",
    timeline: "TODO",
    problem: "TODO: people start gym routines but drop off — plans are confusing and progress is invisible.",
    process: [
      { title: "Research", text: "TODO: interviews, survey, competitor audit." },
      { title: "User flow", text: "TODO: onboarding → plan → workout → progress." },
      { title: "Wireframes", text: "TODO: low-fi layouts and iterations." },
      { title: "UI & prototype", text: "TODO: hi-fi screens and Figma prototype." },
    ],
    gallery: ["/work/gym-app-1.jpg", "/work/gym-app-2.jpg", "/work/gym-app-3.jpg"],
    outcome: "TODO",
  },
];

export const getProject = (slug: string) => work.find((p) => p.slug === slug);
