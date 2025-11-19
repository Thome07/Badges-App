import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET: Listar Momentos
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Traz momentos + dados do usuário (join)
  const { data, error } = await supabase
    .from('spark_moments')
    .select('*, user:users(name, avatar_url)')
    .order('date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: Agendar
export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { date, description } = body;
  
  const scheduledDate = new Date(date);
  // Ajuste de fuso horário para validar o dia da semana corretamente
  const dayOfWeek = scheduledDate.getUTCDay(); // 0=Dom, 2=Ter, 4=Qui...

  if (dayOfWeek !== 2 && dayOfWeek !== 4) {
    return NextResponse.json({ error: 'O Momento Faísca só ocorre às Terças e Quintas!' }, { status: 400 });
  }

  const { count } = await supabase
    .from('spark_moments')
    .select('*', { count: 'exact', head: true })
    .eq('date', date);

  if (count && count >= 2) {
    return NextResponse.json({ error: 'Este dia já está cheio! Escolha outro.' }, { status: 400 });
  }

  const { data: newMoment, error } = await supabase
    .from('spark_moments')
    .insert([{ user_id: user.id, date, description }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(newMoment);
}

// DELETE: Remover Momento (NOVO)
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const authHeader = req.headers.get('Authorization');

  if (!id || !authHeader) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  // Cliente autenticado para respeitar o RLS (Só dono deleta)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { error } = await supabase
    .from('spark_moments')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}