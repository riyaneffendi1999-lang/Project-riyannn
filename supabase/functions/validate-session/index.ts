import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { user_id, session_token } = await req.json();

    if (!user_id || !session_token) {
      return jsonResponse({ valid: false, error: "Missing params" }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (error || !data?.user) {
      return jsonResponse({ valid: false, error: "User not found" }, 404);
    }

    const storedToken = data.user.user_metadata?.session_token;

    if (storedToken && storedToken === session_token) {
      return jsonResponse({ valid: true });
    }

    return jsonResponse({ valid: false, error: "Session expired" });
  } catch (err) {
    return jsonResponse({ valid: false, error: (err as Error).message }, 500);
  }
});
