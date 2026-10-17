import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kwest",
    short_name: "Kwest",
    description: "Turn your notes into flashcard decks and study a little every day.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#ffe6ed",
    theme_color: "#ffe6ed",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
