// Database types for supabase-js. Hand-written to match supabase/migrations.
// Keep in sync when the schema changes. (Can later be replaced by
// `npx supabase gen types typescript --project-id <id>`.)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamp = string; // ISO 8601 from Postgres timestamptz
type DateString = string; // YYYY-MM-DD

export type CardKind = "term" | "question";
export type SetVisibility = "private" | "unlisted" | "public";
export type StudyMode = "flashcards" | "quiz" | "practice" | "game";
export type QuestionType = "mc" | "tf" | "id" | "flash";
export type SessionStatus = "active" | "completed" | "abandoned";
export type ItemCategory = "hair" | "shirt" | "pants" | "accessory" | "furniture" | "decor" | "wall" | "floor";
export type XpSource = "answer" | "session" | "game" | "mastery" | "achievement" | "purchase" | "adjustment";
export type ThemePreference = "system" | "light" | "dark";
export type RoomKey = "dorm" | "library";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13" };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string;
          onboarding_step: number;
          timezone: string;
          theme: ThemePreference;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: never; // created by the signup trigger
        Update: {
          username?: string | null;
          display_name?: string;
          onboarding_step?: number;
          timezone?: string;
          theme?: ThemePreference;
        };
        Relationships: [];
      };
      player_stats: {
        Row: {
          user_id: string;
          xp_total: number;
          level: number;
          coins: number;
          daily_goal: number;
          updated_at: Timestamp;
        };
        Insert: never;
        Update: { daily_goal?: number };
        Relationships: [];
      };
      avatars: {
        Row: {
          user_id: string;
          skin_tone: string;
          hair_color: string;
          hair_style: string;
          shirt: string;
          pants: string;
          accessory: string | null;
          updated_at: Timestamp;
        };
        Insert: never;
        Update: {
          skin_tone?: string;
          hair_color?: string;
          hair_style?: string;
          shirt?: string;
          pants?: string;
          accessory?: string | null;
        };
        Relationships: [];
      };
      items: {
        Row: {
          key: string;
          name: string;
          category: ItemCategory;
          price: number;
          unlock_level: number;
          sprite_key: string;
          footprint_w: number;
          footprint_h: number;
          sort: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      inventory: {
        Row: { user_id: string; item_key: string; acquired_at: Timestamp };
        Insert: never; // buy_item RPC
        Update: never;
        Relationships: [];
      };
      room_placements: {
        Row: {
          id: string;
          user_id: string;
          room_key: RoomKey;
          item_key: string;
          x: number;
          y: number;
          layer: number;
          flipped: boolean;
          created_at: Timestamp;
        };
        Insert: {
          room_key?: RoomKey;
          item_key: string;
          x: number;
          y: number;
          layer?: number;
          flipped?: boolean;
        };
        Update: { x?: number; y?: number; layer?: number; flipped?: boolean };
        Relationships: [];
      };
      study_sets: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          subject: string | null;
          description: string | null;
          color_key: string;
          visibility: SetVisibility;
          card_count: number;
          last_studied_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          title: string;
          subject?: string | null;
          description?: string | null;
          color_key?: string;
        };
        Update: {
          title?: string;
          subject?: string | null;
          description?: string | null;
          color_key?: string;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          set_id: string;
          owner_id: string;
          position: number;
          kind: CardKind;
          prompt: string;
          answer: string;
          explanation: string | null;
          distractors: string[] | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          set_id: string;
          position?: number;
          kind?: CardKind;
          prompt: string;
          answer: string;
          explanation?: string | null;
          distractors?: string[] | null;
        };
        Update: {
          position?: number;
          kind?: CardKind;
          prompt?: string;
          answer?: string;
          explanation?: string | null;
          distractors?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "cards_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: false;
            referencedRelation: "study_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      card_progress: {
        Row: {
          user_id: string;
          card_id: string;
          set_id: string;
          box: number;
          times_correct: number;
          times_wrong: number;
          recent_wrong: number;
          last_seen_at: Timestamp | null;
          due_at: Timestamp | null;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "card_progress_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
        ];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          set_id: string;
          mode: StudyMode;
          game_key: string | null;
          status: SessionStatus;
          correct: number;
          incorrect: number;
          xp_earned: number;
          coins_earned: number;
          started_at: Timestamp;
          ended_at: Timestamp | null;
        };
        Insert: never; // start_session RPC
        Update: never;
        Relationships: [
          {
            foreignKeyName: "study_sessions_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: false;
            referencedRelation: "study_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      answers: {
        Row: {
          id: number;
          session_id: string;
          user_id: string;
          card_id: string;
          question_type: QuestionType;
          given: string;
          is_correct: boolean;
          response_ms: number;
          xp_awarded: number;
          created_at: Timestamp;
        };
        Insert: never; // submit_answer RPC
        Update: never;
        Relationships: [
          {
            foreignKeyName: "answers_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
        ];
      };
      xp_events: {
        Row: {
          id: number;
          user_id: string;
          session_id: string | null;
          source: XpSource;
          xp: number;
          coins: number;
          meta: Json;
          created_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      daily_activity: {
        Row: {
          user_id: string;
          day: DateString;
          cards_reviewed: number;
          xp: number;
          goal_met: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      set_masteries: {
        Row: { user_id: string; set_id: string; mastered_at: Timestamp };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      achievements: {
        Row: {
          key: string;
          name: string;
          description: string;
          icon_key: string;
          xp_reward: number;
          coin_reward: number;
          sort: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      user_achievements: {
        Row: { user_id: string; achievement_key: string; earned_at: Timestamp };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_key_fkey";
            columns: ["achievement_key"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["key"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      start_session: {
        Args: { p_set_id: string; p_mode: StudyMode; p_game_key?: string | null };
        Returns: string;
      };
      submit_answer: {
        Args: {
          p_session_id: string;
          p_card_id: string;
          p_question_type: QuestionType;
          p_given: string;
          p_response_ms: number;
          p_shown_answer?: string | null;
        };
        Returns: Json; // see SubmitAnswerResult
      };
      finish_session: {
        Args: { p_session_id: string };
        Returns: Json; // see FinishSessionResult
      };
      buy_item: {
        Args: { p_item_key: string };
        Returns: Json; // see BuyItemResult
      };
      create_starter_deck: {
        Args: Record<string, never>;
        Returns: string;
      };
      save_deck: {
        Args: {
          p_deck_id: string | null;
          p_title: string;
          p_subject: string;
          p_description: string;
          p_color_key: string;
          p_cards: Json; // SaveDeckCard[]
        };
        Returns: string;
      };
      deck_dust: {
        Args: Record<string, never>;
        Returns: { set_id: string; due_count: number; new_count: number; next_due_at: Timestamp | null }[];
      };
    };
    Enums: {
      card_kind: CardKind;
      set_visibility: SetVisibility;
      study_mode: StudyMode;
      question_type: QuestionType;
      session_status: SessionStatus;
      item_category: ItemCategory;
      xp_source: XpSource;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

// Shapes of the jsonb returned by the RPCs in 0002_functions.sql.
export type SubmitAnswerResult = {
  isCorrect: boolean;
  expected: string;
  explanation: string | null;
  pickedPrompt: string | null;
  xp: number;
  box: number;
  masteredNow: boolean;
  levelBefore: number;
  levelAfter: number;
};

export type FinishSessionResult = {
  sessionId: string;
  mode: StudyMode;
  correct: number;
  incorrect: number;
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  sessionBonus: number;
  won: boolean;
  masteredSet: boolean;
  xpTotal: number;
  level: number;
  coins: number;
};

export type BuyItemResult = { itemKey: string; coins: number };

/** Error codes raised by the RPCs (Postgres error message). */
export type RpcErrorCode =
  | "not_authenticated"
  | "not_found"
  | "not_active"
  | "no_cards"
  | "invalid_input"
  | "level_locked"
  | "already_owned"
  | "insufficient_coins"
  | "not_owned"
  | "set_full";
