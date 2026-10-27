import { Bitmap } from "./pixel";

/**
 * Larger two-tone pictures for the main navigation, 16 cells wide.
 * "#" is the outline (text color), "o" the fill, "a" the blush detail.
 */
const NAV_ICONS = {
  home: [
    ".......##.......",
    "......#aa#......",
    ".....#aaaa#.....",
    "....#aaaaaa#....",
    "...#aaaaaaaa#...",
    "..#aaaaaaaaaa#..",
    ".#aaaaaaaaaaaa#.",
    "################",
    ".#oooooooooooo#.",
    ".#oooooooooooo#.",
    ".#oooo####oooo#.",
    ".#oooo#aa#oooo#.",
    ".#oooo#aa#oooo#.",
    ".#oooo#aa#oooo#.",
    "################",
  ],
  decks: [
    "....##########..",
    "....#oooooooo#..",
    "....#oooooooo#..",
    ".##########oo#..",
    ".#aaaaaaaa#oo#..",
    ".#aaaaaaaa#oo#..",
    ".##########oo#..",
    ".#oooooooo#oo#..",
    ".#o######o#oo#..",
    ".#oooooooo####..",
    ".#oooooooo#.....",
    ".#o######o#.....",
    ".#o####oo#......",
    ".#oooooooo#.....",
    ".##########.....",
  ],
  study: [
    ".######..######.",
    "#oooooo##oooooo#",
    "#o####o##o####o#",
    "#oooooo##oooooo#",
    "#oaaaao##oaaaao#",
    "#oooooo##oooooo#",
    "#o####o##o####o#",
    "#oooooo##oooooo#",
    "#oooooo##oooooo#",
    "################",
    ".#aaaaaaaaaaaa#.",
    "..############..",
  ],
  shop: [
    "......####......",
    ".....#....#.....",
    ".....#....#.....",
    "..############..",
    "..#aaaaaaaaaa#..",
    "..#aaaaaaaaaa#..",
    "..############..",
    "..#oooooooooo#..",
    "..#oooo##oooo#..",
    "..#oooo##oooo#..",
    "..#oooooooooo#..",
    "..#oooooooooo#..",
    "..############..",
  ],
  profile: [
    ".....######.....",
    "....#aaaaaa#....",
    "...#aaaaaaaa#...",
    "...#aaaaaaaa#...",
    "...#oooooooo#...",
    "...#oooooooo#...",
    "...#oooooooo#...",
    "....#oooooo#....",
    ".....######.....",
    "....########....",
    "..##oooooooo##..",
    ".#oooooooooooo#.",
    ".#oooooooooooo#.",
    "################",
  ],
} as const;

export type NavIconName = keyof typeof NAV_ICONS;

const PALETTE = { "#": "currentColor", o: "var(--surface)", a: "var(--accent)" };

/** A navigation picture. `scale` is the size of one pixel in screen pixels (2 makes it 32px wide). */
export function NavIcon({ name, scale = 2, className }: { name: NavIconName; scale?: number; className?: string }) {
  return <Bitmap rows={NAV_ICONS[name]} palette={PALETTE} scale={scale} className={className} />;
}
