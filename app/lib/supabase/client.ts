import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Configuração do Supabase não encontrada.");
  }

  supabaseClient ??= createClient(url, anonKey);

  return supabaseClient;
}
