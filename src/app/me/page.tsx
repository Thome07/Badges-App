'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Code2, Terminal } from 'lucide-react';

export default function MyProfile() {
  // ... (MANTENHA TODA A LÓGICA E O COMEÇO IGUAL AO ANTERIOR ...)
  const [profile, setProfile] = useState<User | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || '');
        setBio(profileData.bio || '');
      }

      const { data: badgesData } = await supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id);
      if (badgesData) setBadges(badgesData);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleUpdate = async () => {
    if (!profile) return;
    setLoading(true);
    await supabase.from('users').update({ name, bio }).eq('id', profile.id);
    alert('Perfil atualizado!');
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('profiles').upload(fileName, file);
    if (!error) {
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/${fileName}`;
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setProfile({ ...profile, avatar_url: publicUrl });
    }
    setUploading(false);
  };

  if (loading) return <div className="p-8 flex justify-center font-mono text-indigo-400">Loading user_data...</div>;

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-4 border-b border-slate-800 pb-6">
            <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Terminal className="h-6 w-6 text-indigo-500" /> System.User.Profile</h1>
                <p className="text-slate-500 font-mono text-xs mt-1">Configurações de conta e inventário.</p>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 h-fit border-slate-800 bg-[#0b101e]">
            <CardHeader><CardTitle className="text-slate-200">Dados do Desenvolvedor</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-center">
                    <div className="relative w-32 h-32 rounded border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-900/50 group shrink-0">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 group-hover:text-indigo-400 transition-colors"><Code2 className="h-8 w-8 mb-2" /><span className="text-xs font-mono">NO_IMG</span></div>
                        )}
                    </div>
                </div>
                <div className="space-y-2"><label className="text-xs font-mono text-indigo-400 uppercase">Upload Avatar</label><Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} /></div>
                <div className="space-y-2"><label className="text-xs font-mono text-indigo-400 uppercase">Nome de Exibição</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-xs font-mono text-indigo-400 uppercase">Bio / Stack</label><Textarea value={bio} onChange={e => setBio(e.target.value)} className="min-h-[100px]" /></div>
                <Button onClick={handleUpdate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-mono border border-indigo-500/50" disabled={loading}>Save Changes</Button>
                {profile?.role === 'admin' && (<Button asChild variant="destructive" className="w-full mt-4 font-mono"><Link href="/admin">sudo access_admin</Link></Button>)}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <h2 className="text-xl font-bold text-slate-200">Inventário de Badges</h2>
                <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Count: {badges.length}</span>
             </div>

            {badges.length === 0 ? (
                <div className="bg-[#0b101e]/50 p-12 rounded border border-dashed border-slate-800 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded bg-slate-900 flex items-center justify-center mb-4 text-slate-600"><Code2 className="h-6 w-6" /></div>
                    <p className="text-slate-400 font-mono text-sm">Array de conquistas vazio.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((item) => (
                        <Card key={item.id} className="hover:border-indigo-500/50 transition-colors group bg-[#0b101e] border-slate-800">
                            {/* AQUI É O FUNDO ESCURO DA BADGE */}
                            <div className="h-40 relative bg-[#020617] p-4 flex items-center justify-center border-b border-slate-800/50">
                                <img src={item.badge.image_url} alt={item.badge.title} className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:scale-110 transition-transform" />
                            </div>
                            <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-mono text-indigo-300">{item.badge.title}</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.badge.description}</p>
                                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider border-t border-slate-800/50 pt-2">Acquired: {new Date(item.created_at).toLocaleDateString()}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}