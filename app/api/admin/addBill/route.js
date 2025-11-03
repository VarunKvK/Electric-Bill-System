import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  const { data: roleData } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleData?.role !== "admin")
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });

  const body = await request.json();
  const { consumer_id, total_amount, due_date, user_id } = body;
    console.log("Request body:", body);
  const { data, error } = await supabase
    .from("bills")
    .insert([{ consumer_id, bill_amount:total_amount, due_date, user_id }])
    .select();
  console.log("Authenticated user:", user);
  console.log("Role data:", roleData);

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  return new Response(JSON.stringify({ bill: data }), { status: 200 });
}
