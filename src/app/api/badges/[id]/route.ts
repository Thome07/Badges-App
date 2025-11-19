import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// DELETE: Excluir Badge
export async function DELETE(
  req: Request,
  // Correção: Tipar params como Promise e usar await
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { data: userData } = await supabase.from('users').select('role').eq('id', user?.id).single();
  if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Correção aqui: Await nos params antes de ler o ID
  const { id } = await params;

  const { error } = await supabase.from('badges').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH: Editar Badge (Título/Descrição)
export async function PATCH(
  req: Request,
  // Correção: Tipar params como Promise e usar await
  { params }: { params: Promise<{ id: string }> }
) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );
  
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userData } = await supabase.from('users').select('role').eq('id', user?.id).single();
    if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
    const body = await req.json();

    // Correção aqui: Await nos params antes de ler o ID
    const { id } = await params;

    const { error } = await supabase.from('badges').update(body).eq('id', id);
  
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}