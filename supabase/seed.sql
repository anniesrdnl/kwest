-- =============================================================================
-- Kwest · seed.sql
-- Catalog data (items, achievements).
-- Safe to re-run: upserts by key.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Items. price 0 = free once unlock_level is reached (no purchase needed).
-- footprint is in room tiles (room = 10 × 6).
-- -----------------------------------------------------------------------------
insert into public.items (key, name, category, price, unlock_level, sprite_key, footprint_w, footprint_h, sort) values
  -- Hair
  ('hair-short',        'Short Crop',        'hair',      0,   1, 'hair-short',        1, 1, 10),
  ('hair-long',         'Long & Straight',   'hair',      0,   1, 'hair-long',         1, 1, 11),
  ('hair-curly',        'Curls',             'hair',      0,   1, 'hair-curly',        1, 1, 12),
  ('hair-bun',          'Top Bun',           'hair',      0,   1, 'hair-bun',          1, 1, 13),
  ('hair-buzz',         'Buzz Cut',          'hair',      0,   1, 'hair-buzz',         1, 1, 14),
  ('hair-ponytail',     'Ponytail',          'hair',      60,  3, 'hair-ponytail',     1, 1, 15),
  -- Shirts
  ('shirt-tee',         'Plain Tee',         'shirt',     0,   1, 'shirt-tee',         1, 1, 20),
  ('shirt-hoodie',      'Hoodie',            'shirt',     0,   1, 'shirt-hoodie',      1, 1, 21),
  ('shirt-sweater',     'Knit Sweater',      'shirt',     80,  2, 'shirt-sweater',     1, 1, 22),
  ('shirt-cardigan',    'Cardigan',          'shirt',     120, 4, 'shirt-cardigan',    1, 1, 23),
  ('shirt-scholar-robe','Scholar Robe',      'shirt',     0,   20,'shirt-scholar-robe',1, 1, 24),
  -- Pants
  ('pants-jeans',       'Jeans',             'pants',     0,   1, 'pants-jeans',       1, 1, 30),
  ('pants-shorts',      'Shorts',            'pants',     0,   1, 'pants-shorts',      1, 1, 31),
  ('pants-skirt',       'Pleated Skirt',     'pants',     0,   1, 'pants-skirt',       1, 1, 32),
  ('pants-cargo',       'Cargo Pants',       'pants',     60,  3, 'pants-cargo',       1, 1, 33),
  -- Accessories
  ('acc-glasses',       'Glasses',           'accessory', 0,   1, 'acc-glasses',       1, 1, 40),
  ('acc-round-glasses', 'Round Glasses',     'accessory', 50,  2, 'acc-round-glasses', 1, 1, 41),
  ('acc-beanie',        'Beanie',            'accessory', 80,  2, 'acc-beanie',        1, 1, 42),
  ('acc-headphones',    'Headphones',        'accessory', 100, 3, 'acc-headphones',    1, 1, 43),
  ('acc-scarf',         'Scarf',             'accessory', 120, 6, 'acc-scarf',         1, 1, 44),
  ('acc-grad-cap',      'Graduation Cap',    'accessory', 0,   10,'acc-grad-cap',      1, 1, 45),
  -- Furniture (starter set is free)
  ('bookshelf',         'Bookshelf',         'furniture', 0,   1, 'bookshelf',         2, 3, 100),
  ('bed',               'Bed',               'furniture', 0,   1, 'bed',               3, 2, 101),
  ('desk',              'Desk',              'furniture', 0,   1, 'desk',              2, 2, 102),
  ('chair',             'Chair',             'furniture', 0,   1, 'chair',             1, 1, 103),
  ('armchair',          'Armchair',          'furniture', 220, 7, 'armchair',          2, 2, 104),
  ('bookshelf-tall',    'Tall Bookshelf',    'furniture', 300, 10,'bookshelf-tall',    2, 4, 105),
  -- Decor
  ('lamp-desk',         'Desk Lamp',         'decor',     30,  1, 'lamp-desk',         1, 1, 200),
  ('mug',               'Cocoa Mug',         'decor',     30,  1, 'mug',               1, 1, 201),
  ('plant-small',       'Succulent',         'decor',     40,  1, 'plant-small',       1, 1, 202),
  ('plant-tall',        'Fiddle Leaf Fig',   'decor',     90,  3, 'plant-tall',        1, 2, 203),
  ('globe',             'Desk Globe',        'decor',     120, 5, 'globe',             1, 1, 204),
  ('computer',          'Old Computer',      'decor',     200, 4, 'computer',          1, 1, 205),
  ('cat-bed',           'Cat Bed',           'decor',     250, 8, 'cat-bed',           2, 1, 206),
  -- Wall
  ('poster-map',        'World Map Poster',  'wall',      50,  2, 'poster-map',        2, 1, 300),
  ('clock',             'Wall Clock',        'wall',      70,  3, 'clock',             1, 1, 301),
  ('poster-stars',      'Star Chart',        'wall',      80,  4, 'poster-stars',      2, 1, 302),
  ('lantern-string',    'String Lanterns',   'wall',      160, 6, 'lantern-string',    4, 1, 303),
  ('plant-hanging',     'Hanging Plant',     'wall',      110, 6, 'plant-hanging',     1, 2, 304),
  -- Floor
  ('rug-round',         'Round Rug',         'floor',     60,  2, 'rug-round',         3, 1, 400),
  ('rug-woven',         'Woven Rug',         'floor',     150, 5, 'rug-woven',         4, 1, 401)
on conflict (key) do update set
  name = excluded.name, category = excluded.category, price = excluded.price,
  unlock_level = excluded.unlock_level, sprite_key = excluded.sprite_key,
  footprint_w = excluded.footprint_w, footprint_h = excluded.footprint_h, sort = excluded.sort;

-- -----------------------------------------------------------------------------
-- Achievements
-- -----------------------------------------------------------------------------
insert into public.achievements (key, name, description, icon_key, xp_reward, coin_reward, sort) values
  ('first_tome',    'First Tome',     'Write or add your first tome.',                      'badge-tome',     20, 10, 1),
  ('first_session', 'First Steps',    'Finish your first study session.',                   'badge-steps',    20, 10, 2),
  ('perfect_quiz',  'Flawless',       'Finish a quiz of 10+ questions with no mistakes.',   'badge-star',     40, 20, 3),
  ('dust_buster',   'Dust Buster',    'Win a Dust Duel.',                                   'badge-broom',    30, 20, 4),
  ('first_mastery', 'Gold Trim',      'Master a whole tome.',                               'badge-gold',     50, 30, 5),
  ('rival',         'Friendly Rival', 'Have a friend play your challenge link.',            'badge-rival',    30, 20, 6),
  ('level_5',       'Study Explorer', 'Reach level 5.',                                     'badge-compass',  0,  50, 7),
  ('cards_100',     'Hundred Cards',  'Review 100 cards.',                                  'badge-stack',    50, 30, 8),
  ('lantern_7',     'Lamplighter',    'Meet your daily goal on 7 different days.',          'badge-lantern',  60, 40, 9)
on conflict (key) do update set
  name = excluded.name, description = excluded.description, icon_key = excluded.icon_key,
  xp_reward = excluded.xp_reward, coin_reward = excluded.coin_reward, sort = excluded.sort;
