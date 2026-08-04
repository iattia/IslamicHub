import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IslamicHub",
    short_name: "IslamicHub",
    description:
      "Read and study the Quran and Hadith, maintain daily Azkaar, and follow prayer times.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#40382f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
