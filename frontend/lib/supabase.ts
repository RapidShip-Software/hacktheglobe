import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Subscribe to real-time changes on a table.
 * Returns the channel so the caller can unsubscribe.
 */
export function subscribeToTable(
  table: string,
  filter: string | undefined,
  callback: (payload: Record<string, unknown>) => void,
) {
  const channelName = filter ? `${table}:${filter}` : table;
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      (payload) => callback(payload as unknown as Record<string, unknown>),
    )
    .subscribe();

  return channel;
}
