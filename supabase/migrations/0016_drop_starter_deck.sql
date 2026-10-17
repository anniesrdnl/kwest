-- =============================================================================
-- Kwest · 0016_drop_starter_deck.sql
-- The ready-made starter deck is gone from the app, so its function is removed.
-- (0005 renamed it to create_starter_deck. Older copies of seed.sql may also have
-- put back create_starter_tome, so both names are dropped.)
-- Decks that players already added are their own decks and stay.
-- Safe to run again.
-- =============================================================================

drop function if exists public.create_starter_deck();
drop function if exists public.create_starter_tome();
