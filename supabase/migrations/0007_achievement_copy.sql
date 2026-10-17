-- =============================================================================
-- Kwest · 0007_achievement_copy.sql
-- Plain-language names and descriptions for achievements (the app says "deck"
-- and "daily goal" now). Text only: keys, icons and rewards are unchanged.
-- =============================================================================

update public.achievements as a
   set name = v.name, description = v.description
  from (values
    ('first_tome',    'First Deck',     'Make or add your first deck.'),
    ('first_session', 'First Steps',    'Finish your first study session.'),
    ('perfect_quiz',  'Flawless',       'Finish a quiz of 10 or more questions with no mistakes.'),
    ('dust_buster',   'Game Winner',    'Win a study game.'),
    ('first_mastery', 'Deck Master',    'Master a whole deck.'),
    ('decorator',     'Decorator',      'Place 5 items you bought in your room.'),
    ('level_5',       'Study Explorer', 'Reach level 5.'),
    ('cards_100',     'Hundred Cards',  'Review 100 cards.'),
    ('lantern_7',     'Goal Getter',    'Reach your daily goal on 7 different days.')
  ) as v(key, name, description)
 where a.key = v.key;
