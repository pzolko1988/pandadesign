import { createClient } from "@supabase/supabase-js";

// VITE_* értékekkel környezetenként felülírható.
// A fallback projekt URL és publishable key szándékosan publikus klienskonfiguráció;
// az adathozzáférést továbbra is a Supabase RLS szabályai védik.
const DEFAULT_SUPABASE_URL = "https://scurjdvqlnypnhqhevki.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_N5YvcM4hHnhWlWP2ZT6bAw_6QxToUs8";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_URL;

const supabasePublishableKey =
  (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  )?.trim() || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
