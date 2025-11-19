'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, ArrowLeft, Code2, Terminal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminManageUser() {
  const { toast } = useToast();
  const params = useParams();
  const userId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;

  const [user, setUser] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!userId) return;
    try {
        const { data: u, error: uError } = await supabase.from('users').select('*').eq('id', userId).single();
        if (uError) throw uError;
        setUser(u);

        const { data: ub, error: ubError } = await supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', userId);
        if (ubError) throw ubError;
        setUserBadges(ub || []);

        const { data: ab, error: abError } = await supabase.from('badges').select('*');
        if (abError) throw abError;
        setAllBadges(ab || []);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load data." });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const availableBadges = allBadges.filter(b => !userBadges.some(ub => ub.badge?.id === b.id));

  const handleAction = async (action: 'assign' | 'revoke', badgeId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const endpoint = action === 'assign' ? '/api/assign' : '/api/revoke';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ user_id: userId, badge_id: badgeId })
        });
        if (res.ok) {
            toast({ title: "Success", description: action === 'assign' ? "Badge granted." : "Badge revoked." });
            fetchData();
        } else { throw new Error(); }
    } catch { toast({ variant: "destructive", title: "Error", description: "Operation failed." }); }
  };

  if (loading) return <div className="p-8 flex justify-center font-mono text-indigo-400">Loading...</div>;
  if (!user && !loading) return <div className="p-8 text-center text-slate-500 font-mono">User not found.</div>;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
           <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-800 hover:text-indigo-400">
                  <ArrowLeft className="h-6 w-6" />
              </Button>
          </Link>
          <div className="flex items-center gap-4">
               <div className="relative w-12 h-12 rounded border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="object-cover w-full h-full" />
                    ) : (
                      <Code2 className="h-6 w-6 text-slate-600" />
                    )}
              </div>
              <div>
                  <h1 className="text-xl font-bold font-mono">{user.name || 'Unknown_User'}</h1>
                  <p className="text-slate-500 text-xs font-mono">{user.email}</p>
              </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna Esquerda: Badges Conquistadas */}
          <Card className="bg-[#0b101e] border-emerald-900/30">
              <CardHeader className="border-b border-slate-800/50 pb-3">
                  <CardTitle className="text-emerald-500 font-mono text-sm flex items-center gap-2">
                      <Terminal className="h-4 w-4" /> Current_Inventory ({userBadges.length})
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                  {userBadges.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-800 hover:border-emerald-500/30 transition-colors group">
                          <div className="flex items-center gap-3">
                              {item.badge?.image_url && (
                                  <img src={item.badge.image_url} className="w-8 h-8 object-contain" alt="" />
                              )}
                              <span className="font-mono text-sm text-slate-300">{item.badge?.title}</span>
                          </div>
                          <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleAction('revoke', item.badge.id)}
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  ))}
                  {userBadges.length === 0 && <p className="text-xs text-slate-600 font-mono text-center py-4">Array is empty.</p>}
              </CardContent>
          </Card>

          {/* Coluna Direita: Disponíveis */}
          <Card className="bg-[#0b101e] border-slate-800">
              <CardHeader className="border-b border-slate-800/50 pb-3">
                  <CardTitle className="text-slate-400 font-mono text-sm">Available_Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                  {availableBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-800">
                          <div className="flex items-center gap-3 opacity-60">
                              {badge.image_url && (
                                  <img src={badge.image_url} className="w-8 h-8 object-contain grayscale" alt="" />
                              )}
                              <span className="font-mono text-sm text-slate-400">{badge.title}</span>
                          </div>
                          <Button 
                              size="sm"
                              className="h-7 text-xs font-mono bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30"
                              onClick={() => handleAction('assign', badge.id)}
                          >
                              <Plus className="h-3 w-3 mr-1" /> Add
                          </Button>
                      </div>
                  ))}
                  {availableBadges.length === 0 && <p className="text-xs text-slate-600 font-mono text-center py-4">No assets available.</p>}
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}