-- =============================================================================
-- Kwest · 0009_shop.sql
-- Clean coin shop: avatar icons, colors and frames. Run after 0008.
-- Buying uses the existing buy_item() RPC; free items unlock by level
-- (private.owns_item). Only the avatar choice is new.
-- =============================================================================

-- What the player has chosen to show. null = the default look.
alter table public.profiles
  add column if not exists avatar_icon  text references public.items (key),
  add column if not exists avatar_color text references public.items (key),
  add column if not exists avatar_frame text references public.items (key);

grant update (avatar_icon, avatar_color, avatar_frame) on public.profiles to authenticated;

-- Chosen items must be owned (or free at the player's level) and the right type.
create or replace function private.profiles_validate_avatar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_part record;
begin
  for v_part in
    select * from (values ('avatar_icon', new.avatar_icon),
                          ('avatar_color', new.avatar_color),
                          ('avatar_frame', new.avatar_frame)) as p(category, item_key)
    where p.item_key is not null
  loop
    if not exists (select 1 from public.items where key = v_part.item_key and category::text = v_part.category) then
      raise exception 'invalid_input' using errcode = '22023', detail = 'wrong item category';
    end if;
    if not private.owns_item(new.id, v_part.item_key) then
      raise exception 'not_owned' using errcode = 'P0001';
    end if;
  end loop;
  return new;
end;
$$;

revoke all on function private.profiles_validate_avatar() from public, anon, authenticated;

drop trigger if exists profiles_validate_avatar on public.profiles;
create trigger profiles_validate_avatar
  before update of avatar_icon, avatar_color, avatar_frame on public.profiles
  for each row execute function private.profiles_validate_avatar();

-- Catalog. sprite_key names what the app draws (an icon, a color, a frame style).
insert into public.items (key, name, category, price, unlock_level, sprite_key, sort) values
  -- Icons (default look = your first letter)
  ('icon-book',      'Book',           'avatar_icon',  0,   1,  'book',       500),
  ('icon-star',      'Star',           'avatar_icon',  0,   1,  'star',       501),
  ('icon-coffee',    'Coffee',         'avatar_icon',  40,  1,  'coffee',     502),
  ('icon-leaf',      'Leaf',           'avatar_icon',  40,  2,  'leaf',       503),
  ('icon-moon',      'Moon',           'avatar_icon',  60,  2,  'moon',       504),
  ('icon-headphones','Headphones',     'avatar_icon',  60,  3,  'headphones', 505),
  ('icon-rocket',    'Rocket',         'avatar_icon',  90,  3,  'rocket',     506),
  ('icon-brain',     'Brain',          'avatar_icon',  120, 4,  'brain',      507),
  ('icon-crown',     'Crown',          'avatar_icon',  250, 8,  'crown',      508),
  ('icon-scholar',   'Graduation Cap', 'avatar_icon',  0,   10, 'graduation', 509),
  -- Colors (default = butter)
  ('color-butter',   'Butter',         'avatar_color', 0,   1,  'butter',     600),
  ('color-sage',     'Sage',           'avatar_color', 0,   1,  'sage',       601),
  ('color-sky',      'Sky',            'avatar_color', 30,  1,  'sky',        602),
  ('color-blush',    'Blush',          'avatar_color', 30,  2,  'blush',      603),
  ('color-lilac',    'Lilac',          'avatar_color', 50,  3,  'lilac',      604),
  ('color-mint',     'Mint',           'avatar_color', 50,  3,  'mint',       605),
  ('color-espresso', 'Espresso',       'avatar_color', 150, 5,  'espresso',   606),
  -- Frames (default = none)
  ('frame-simple',   'Simple Ring',    'avatar_frame', 0,   1,  'simple',     700),
  ('frame-dashed',   'Dashed Ring',    'avatar_frame', 60,  2,  'dashed',     701),
  ('frame-gold',     'Gold Ring',      'avatar_frame', 150, 4,  'gold',       702),
  ('frame-double',   'Double Ring',    'avatar_frame', 200, 6,  'double',     703),
  ('frame-scholar',  'Scholar Ring',   'avatar_frame', 0,   20, 'scholar',    704)
on conflict (key) do update set
  name = excluded.name, category = excluded.category, price = excluded.price,
  unlock_level = excluded.unlock_level, sprite_key = excluded.sprite_key, sort = excluded.sort;
