import type { Metadata, Viewport } from "next";
import { Poppins, Tiny5 } from "next/font/google";
import "./globals.css";

// Body and heading font.
const sans = Poppins({
  variable: "--font-sans-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Pixel font for button text, the logo and pixel art only. Picked for clear digits
// (Pixelify Sans drew "2" like "8").
const pixel = Tiny5({
  variable: "--font-pixel-face",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Kwest",
    template: "%s · Kwest",
  },
  description: "Turn your notes into flashcard decks and study a little every day.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffe6ed" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${pixel.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
