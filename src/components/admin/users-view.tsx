'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Badge as BadgeIcon, Loader2, Search, Trash2, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
      const { data: u } = await supabase.from('users').select('*').eq('role', 'student').order('name');
      const { data: b } = await supabase.from('badges').select('*');
      if (u) setUsers(u);
      if (b) setBadges(b);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) setSelectedUsers([]);
    else setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const handleBulkAction = async (action: 'assign' | 'revoke') => {
    if (!selectedBadge || selectedUsers.length === 0) {
        toast({ variant: "destructive", title: "Erro de Entrada", description: "Selecione usuários e um artefato." });
        return;
    }
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const endpoint = action === 'assign' ? '/api/assign' : '/api/revoke';

    try {
        const promises = selectedUsers.map(userId => 
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ user_id: userId, badge_id: selectedBadge })
            })
        );
        await Promise.all(promises);
        toast({ title: "Sucesso", description: `Operação concluída para ${selectedUsers.length} usuários.` });
        setSelectedUsers([]);
    } catch { 
        toast({ variant: "destructive", title: "Erro na Operação" }); 
    } finally { 
        setLoading(false); 
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#0b101e] p-4 rounded border border-slate-800 shadow-sm">
        <h2 className="text-xl font-mono font-bold mb-4 text-slate-200">Operações_Bulk</h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3 space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Artefato Alvo</label>
                <Select onValueChange={setSelectedBadge} value={selectedBadge}>
                    <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue placeholder="Selecionar artefato..." /></SelectTrigger>
                    <SelectContent>
                        {badges.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={() => handleBulkAction('assign')} disabled={loading || selectedUsers.length === 0} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 font-mono text-xs">
                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <BadgeIcon className="mr-2 h-4 w-4" />} Conceder
                </Button>
                <Button onClick={() => handleBulkAction('revoke')} disabled={loading || selectedUsers.length === 0} variant="destructive" className="flex-1 md:flex-none font-mono text-xs">
                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />} Revogar
                </Button>
            </div>
        </div>
        {selectedUsers.length > 0 && <p className="text-xs text-indigo-400 mt-2 font-mono"> {selectedUsers.length} alvos selecionados</p>}
      </div>

      <div className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input placeholder="Buscar usuário..." className="pl-9 bg-[#0b101e] border-slate-800" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="border border-slate-800 rounded bg-[#0b101e] overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/50">
                        <TableHead className="w-[50px]"><Checkbox checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length} onCheckedChange={toggleAll} /></TableHead>
                        <TableHead className="text-slate-400 font-mono text-xs">Nome</TableHead>
                        <TableHead className="text-slate-400 font-mono text-xs">Email / ID</TableHead>
                        <TableHead className="text-right text-slate-400 font-mono text-xs">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => (
                        <TableRow key={user.id} className={`${selectedUsers.includes(user.id) ? "bg-indigo-900/20" : ""} border-slate-800 hover:bg-slate-800/50`}>
                            <TableCell><Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleUser(user.id)} /></TableCell>
                            <TableCell className="font-medium text-slate-200">{user.name || 'Desconhecido'}</TableCell>
                            <TableCell className="text-slate-500 font-mono text-xs">{user.email}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/admin/users/${user.id}`}>
                                    <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 font-mono text-xs">
                                        <UserCog className="h-3 w-3 mr-2" /> Config
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-slate-600 font-mono text-xs">
                                Nenhum aluno encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}