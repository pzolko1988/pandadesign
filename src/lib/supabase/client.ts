import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error("Hiányzik a VITE_SUPABASE_URL változó a .env.local fájlból.");
}

if (!supabaseKey) {
  throw new Error(
    "Hiányzik a VITE_SUPABASE_KEY vagy VITE_SUPABASE_PUBLISHABLE_KEY változó.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
