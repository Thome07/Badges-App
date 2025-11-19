'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Calendar as CalendarIcon, User, Trash2, Loader2, ArrowLeft, Flame } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function SparkMomentPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [desc, setDesc] = useState('');
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  const fetchMoments = async () => {
    const res = await fetch('/api/sparks');
    if (res.ok) {
        const data = await res.json();
        setMoments(data);
    }
  };

  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };
    getUser();
    fetchMoments();
    
    const channel = supabase
      .channel('sparks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spark_moments' }, () => fetchMoments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSchedule = async () => {
    if (!date || !desc) {
        toast({ variant: "destructive", title: "Input Error", description: "Data e descrição obrigatórios." });
        return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if(!session) {
        toast({ variant: "destructive", title: "Access Denied", description: "Login required." });
        setLoading(false);
        return;
    }

    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    const dateString = adjustedDate.toISOString().split('T')[0];

    const res = await fetch('/api/sparks', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ date: dateString, description: desc })
    });

    const data = await res.json();

    if (res.ok) {
        toast({ title: "Deploy Success! 🔥", description: "Apresentação agendada." });
        setDesc('');
        fetchMoments();
    } else {
        toast({ variant: "destructive", title: "Error", description: data.error });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm cancellation?")) return;

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/sparks?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
    });

    if (res.ok) {
        toast({ title: "Terminated" });
        fetchMoments();
    } else {
        toast({ variant: "destructive", title: "Error" });
    }
  };

  const isDayDisabled = (date: Date) => {
    const day = date.getDay();
    return day !== 2 && day !== 4; 
  };

  return (
    <div className="min-h-screen pb-20">
        <div className="container mx-auto p-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <Flame className="h-6 w-6 text-amber-500" /> Module: Faísca
                    </h1>
                    <p className="text-slate-500 mt-1 font-mono text-xs">
                        Lightning talks de 5 min (Tue/Thu).
                    </p>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
            
            {/* AGENDAMENTO (Esquerda) */}
            <div className="md:col-span-5 space-y-6">
                <Card className="border-amber-900/30 bg-[#0f0a05] shadow-lg">
                    <CardHeader className="pb-2 border-b border-amber-900/20">
                        <CardTitle className="text-amber-500 font-mono text-lg">Schedule Event</CardTitle>
                        <CardDescription className="text-slate-500 text-xs">Selecione um slot disponível.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex justify-center bg-black/20 rounded border border-amber-900/20 p-4">
                            <Calendar
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => isDayDisabled(date) || date < new Date()}
                                locale={ptBR}
                                className="rounded-md text-amber-100"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-amber-700 uppercase">Topic Description</label>
                            <Input 
                                placeholder="Ex: VIM shortcuts..." 
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                maxLength={50}
                                className="bg-black/20 border-amber-900/30 text-amber-100 placeholder:text-amber-900/50 focus:border-amber-600"
                            />
                        </div>

                        <Button onClick={handleSchedule} disabled={loading} className="w-full h-10 text-sm font-mono bg-amber-700 hover:bg-amber-600 text-amber-100 border border-amber-600/50">
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : '> Confirm Schedule'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* LISTA (Direita) */}
            <div className="md:col-span-7 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300 mb-4 font-mono">
                    <CalendarIcon className="h-4 w-4 text-slate-500" /> Upcoming_Events[]
                </h2>
                
                {moments.length === 0 ? (
                    <div className="text-center py-16 bg-[#0b101e] rounded border border-dashed border-slate-800">
                        <p className="text-slate-600 font-mono text-sm">Array is empty. Be the first index.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {moments.map((moment) => {
                            const momentDate = new Date(moment.date);
                            const displayDate = new Date(momentDate.getUTCFullYear(), momentDate.getUTCMonth(), momentDate.getUTCDate());
                            const isOwner = currentUser?.id === moment.user_id;

                            return (
                                <div key={moment.id} className="bg-[#0b101e] p-4 rounded border border-slate-800 hover:border-amber-800/50 transition-all flex items-center gap-4 group">
                                    {/* Data Box */}
                                    <div className="flex flex-col items-center justify-center bg-amber-950/30 text-amber-500 w-14 h-14 rounded border border-amber-900/30 shrink-0 font-mono">
                                        <span className="text-[10px] uppercase opacity-70">
                                            {displayDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')}
                                        </span>
                                        <span className="text-xl font-bold leading-none">
                                            {displayDate.getDate()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base text-slate-200 truncate font-mono">{moment.description}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-700 overflow-hidden">
                                                {moment.user?.avatar_url ? (
                                                    <img src={moment.user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    moment.user?.name?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <span className="font-mono text-indigo-400">{moment.user?.name || 'Unknown_User'}</span>
                                        </div>
                                    </div>

                                    {/* Botão Excluir */}
                                    {isOwner && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-slate-600 hover:text-red-500 hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDelete(moment.id)}
                                            title="rm -rf moment"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        </div>
    </div>
  );
}