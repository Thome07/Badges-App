'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PublicProfilesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('name', { ascending: true });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // Realtime para atualizações de perfil
    const channel = supabase
      .channel('public-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchUsers())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Link href="/">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-6 w-6" /></Button>
            </Link>
            <h1 className="text-3xl font-bold">Alunos em Destaque</h1>
        </div>
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Pesquisar aluno..." 
                className="pl-9 bg-white" 
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((user) => (
            <Card key={user.id} className="text-center hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
              <CardHeader className="flex flex-col items-center pb-2">
                <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md group-hover:border-blue-100 transition-colors">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 text-2xl font-bold">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold truncate w-full text-slate-800">{user.name || 'Aluno'}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {user.bio || 'Sem biografia...'}
                </p>
                <Link href={`/perfil/${user.id}`}>
                  <Button className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600" variant="outline">
                    Ver Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}