-- =============================================================================
-- Kwest · 0008_shop_categories.sql
-- New item types for the clean coin shop. Run this ON ITS OWN, before 0009:
-- Postgres can't use a new enum value in the same run that adds it.
-- =============================================================================

alter type public.item_category add value if not exists 'avatar_icon';
alter type public.item_category add value if not exists 'avatar_color';
alter type public.item_category add value if not exists 'avatar_frame';
