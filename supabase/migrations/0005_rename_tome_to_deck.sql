-- =============================================================================
-- Kwest · 0005_rename_tome_to_deck.sql
-- The app now says "deck" instead of "tome". Rename the two functions to match.
-- Renaming keeps each function's code and permissions exactly as they were.
-- Older files (0004, seed.sql) still create the old names; this file renames them.
-- =============================================================================

alter function public.tome_dust() rename to deck_dust;
alter function public.create_starter_tome() rename to create_starter_deck;
