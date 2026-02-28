const SUPABASE_URL = "https://ydrcwahxucotegzewzqj.supabase.co";
const SUPABASE_KEY = "sb_publishable_2Re28ix5_9kiunhi1VDiaw_rYf5UcAy";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

export default supabaseClient;