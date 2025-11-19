'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit2, Plus, Save, X, Loader2 } from 'lucide-react';

export function BadgesView() {
  const [badges, setBadges] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const fetchBadges = async () => {
    const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
    if (data) setBadges(data);
  };

  useEffect(() => {
    fetchBadges();
    // Realtime
    const channel = supabase
      .channel('realtime-badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'badges' }, () => { fetchBadges(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreate = async () => {
    if (!file || !title) {
        toast({ variant: "destructive", title: "Input Error", description: "Missing required fields." });
        return;
    }
    setLoading(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        // 1. Upload
        const { error: uploadError } = await supabase.storage.from('badges').upload(fileName, file);
        if (uploadError) throw uploadError;
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/badges/${fileName}`;

        // 2. Insert no Banco
        const res = await fetch('/api/badges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ title, description: desc, image_url: imageUrl })
        });

        if (!res.ok) throw new Error();
        
        toast({ title: "Success", description: "Badge created." });
        setTitle(''); setDesc(''); setFile(null); setIsCreating(false);
        fetchBadges(); // Atualiza a lista na hora
    } catch { 
        toast({ variant: "destructive", title: "Error" }); 
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Confirm delete?")) return;
    const { data: { session } } = await supabase.auth.getSession();
    
    await fetch(`/api/badges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
    });
    
    toast({ title: "Deleted", description: "Badge removed." });
    fetchBadges(); // Atualiza a lista na hora
  };

  const handleUpdate = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/badges/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ title, description: desc })
    });
    
    setEditingId(null);
    toast({ title: "Updated" });
    fetchBadges(); // Atualiza a lista na hora
  };

  const startEdit = (badge: any) => {
    setEditingId(badge.id); setTitle(badge.title); setDesc(badge.description);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[#0b101e] p-4 rounded border border-slate-800 shadow-sm">
        <div>
            <h2 className="text-xl font-mono font-bold text-slate-200">Badge_Catalog</h2>
            <p className="text-xs font-mono text-slate-500">Database of system artifacts.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "default"}>
            {isCreating ? <><X className="mr-2 h-4 w-4"/> Close</> : <><Plus className="mr-2 h-4 w-4"/> New Badge</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-indigo-900/50 bg-[#0b101e]">
            <CardContent className="p-6">
                <h3 className="font-mono font-bold mb-4 text-indigo-400">Create New Asset</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <label className="text-xs font-mono uppercase text-slate-500">Title</label>
                        <Input placeholder="Ex: Java Master" value={title} onChange={e => setTitle(e.target.value)} />
                        <label className="text-xs font-mono uppercase text-slate-500">Asset Image</label>
                        <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="space-y-3 flex flex-col">
                         <label className="text-xs font-mono uppercase text-slate-500">Description</label>
                        <Textarea placeholder="Details..." className="h-full" value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>
                </div>
                <Button onClick={handleCreate} disabled={loading} className="w-full mt-4 font-mono">
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {loading ? 'Processing...' : 'Commit Badge'}
                </Button>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <Card key={badge.id} className="overflow-hidden flex flex-col border-slate-800 bg-[#0b101e] hover:border-indigo-500/30 transition-colors">
            <div className="relative h-40 w-full bg-slate-950/50 flex items-center justify-center p-4 border-b border-slate-800">
                <img src={badge.image_url} alt={badge.title} className="max-h-full max-w-full object-contain drop-shadow-sm" />
            </div>
            
            {editingId === badge.id ? (
                <div className="p-4 space-y-2 flex-1 bg-indigo-900/10">
                    <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-xs" />
                    <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="text-xs" />
                </div>
            ) : (
                <CardContent className="pt-4 flex-1">
                    <h3 className="font-mono font-bold text-sm text-indigo-300 leading-tight">{badge.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3 font-mono">{badge.description}</p>
                </CardContent>
            )}

            <CardFooter className="bg-slate-900/30 p-2 flex justify-end gap-2 border-t border-slate-800">
                {editingId === badge.id ? (
                    <>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                        <Button size="sm" className="bg-green-700 hover:bg-green-600" onClick={() => handleUpdate(badge.id)}><Save className="h-3 w-3" /></Button>
                    </>
                ) : (
                    <>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-400" onClick={() => startEdit(badge)}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-red-400" onClick={() => handleDelete(badge.id)}><Trash2 className="h-4 w-4" /></Button>
                    </>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}