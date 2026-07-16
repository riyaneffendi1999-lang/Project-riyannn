import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, access, status, new_password, failed_login_count, role } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId wajib diisi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Build user_metadata patch
    const metaPatch: Record<string, unknown> = {};
    if (access !== undefined) metaPatch.access = access;
    if (role !== undefined) metaPatch.role = role;
    if (status !== undefined) metaPatch.status = status;
    if (failed_login_count !== undefined) metaPatch.failed_login_count = failed_login_count;

    // Build top-level patch
    const patch: Record<string, unknown> = {};
    if (Object.keys(metaPatch).length > 0) patch.user_metadata = metaPatch;
    if (new_password) patch.password = new_password;
    // Ban/unban at the auth level so sessions are invalidated/restored
    if (status === 'inactive') patch.ban_duration = '876600h'; // ~100 years
    if (status === 'active') patch.ban_duration = 'none';     // unban

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, patch);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
