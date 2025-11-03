import { createClient } from "@supabase/supabase-js";

export async function DELETE(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await supabase.auth.getUser(token);
  const { data: roleData } = await supabase.from('roles').select('role').eq('user_id', user.id).single();
  if (roleData?.role !== 'admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase.from('bills').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}