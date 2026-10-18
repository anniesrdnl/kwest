// Hover tints the box. Focus adds a hard blush shadow (red when invalid), like a pixel glow.
// The transparent outline only shows in Windows high-contrast mode.
// `inputBase` has no horizontal padding, so a search box with an icon can set its own.
// Lives in its own file (not a client component) so Server Components can use the string too.
export const inputBase =
  "w-full min-h-11 rounded-lg border border-border-strong bg-surface py-2 text-base text-text " +
  "placeholder:text-text-muted/70 transition-[background-color,box-shadow,border-color] duration-150 " +
  "hover:bg-surface-2 focus-visible:bg-surface focus-visible:shadow-[4px_4px_0_0_var(--accent)] " +
  "focus-visible:outline-2 focus-visible:outline-transparent " +
  "aria-invalid:border-wrong aria-invalid:focus-visible:shadow-[4px_4px_0_0_var(--wrong)]";
