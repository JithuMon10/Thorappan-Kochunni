import { getSupabaseServerClient, isSupabaseConfigured } from "./supabaseServer";

// In-memory fallback if Supabase is not connected or before migration table is created
let localDevSiteClosed = false;

export async function isSiteClosed(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return localDevSiteClosed;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "site_closed")
      .maybeSingle();

    if (error || !data) {
      return localDevSiteClosed;
    }

    return data.value === "true";
  } catch (err) {
    console.error("Error reading site_closed setting:", err);
    return localDevSiteClosed;
  }
}

export async function setSiteClosed(closed: boolean): Promise<boolean> {
  localDevSiteClosed = closed;

  if (!isSupabaseConfigured()) {
    return true;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert({
        key: "site_closed",
        value: closed ? "true" : "false",
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn("Could not upsert into app_settings (table might need creation):", error.message);
      return true; // Still keep in-memory active
    }

    return true;
  } catch (err) {
    console.error("Error setting site_closed:", err);
    return true;
  }
}
