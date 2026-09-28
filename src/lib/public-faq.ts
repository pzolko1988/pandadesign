import { supabase } from "@/lib/supabase/client";
import type { FaqEntry } from "@/lib/marketing-content";

export type FaqCategory = "general" | "pricing";

/**
 * Aktív GYIK-elemek egy kategóriából. A `category` oszlopot a
 * 20260928120000 migráció vezeti be; előtte minden elem "general".
 * Üres eredménynél a hívó a saját kódbeli tartalékát használja.
 */
export async function fetchFaqByCategory(
  category: FaqCategory,
): Promise<FaqEntry[]> {
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as Record<string, unknown>[])
    .filter(
      (item) =>
        (typeof item.category === "string" ? item.category : "general") ===
        category,
    )
    .map((item) => ({
      question: typeof item.question === "string" ? item.question : "",
      answer: typeof item.answer === "string" ? item.answer : "",
    }))
    .filter((item) => item.question && item.answer);
}
