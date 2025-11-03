import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  console.log('Authenticated user:', user);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Get consumer_id from query
  const { searchParams } = new URL(request.url);
  const consumer_id = searchParams.get('consumer_id');

  console.log('Querying for:', consumer_id, 'with user_id:', user.id);

  if (!consumer_id) {
    return new Response(JSON.stringify({ error: 'Missing consumer_id' }), { status: 400 });
  }

  // Check user role
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const isAdmin = roleData?.role === 'admin';

  // Build query
  let query = supabase
    .from('bills')
    .select('consumer_id, bill_amount, due_date')
    .eq('consumer_id', consumer_id);

  if (!isAdmin) {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query.single();

  console.log('Bill query result:', data, error);

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Bill not found or access denied' }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ bill: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}