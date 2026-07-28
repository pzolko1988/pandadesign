import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("Hiányzik a VITE_SUPABASE_URL változó a .env.local fájlból.");
}

if (!supabasePublishableKey) {
  throw new Error(
    "Hiányzik a VITE_SUPABASE_PUBLISHABLE_KEY változó a .env.local fájlból.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
