'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicUserProfile() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      // 1. Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error(userError);
        setLoading(false);
        return;
      }

      setProfile(userData);

      // 2. Buscar badges do usuário
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', userId);
      
      if (badgesData) setBadges(badgesData);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;
  if (!profile) return <div className="p-8 text-center">Usuário não encontrado.</div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Link href="/perfis">
        <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Button>
      </Link>

      {/* Cabeçalho do Perfil */}
      <Card className="mb-8">
        <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-32 h-32 shrink-0 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="object-cover w-full h-full" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-3xl font-bold">
                        {profile.name?.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            
            <div className="text-center md:text-left space-y-2 w-full">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <div className="flex items-center justify-center md:justify-start text-gray-500 gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                </div>
                <p className="text-gray-700 mt-4 max-w-2xl">{profile.bio || "Este aluno ainda não escreveu uma bio."}</p>
                <div className="pt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {badges.length} {badges.length === 1 ? 'Conquista' : 'Conquistas'}
                    </span>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Grid de Badges */}
      <h2 className="text-2xl font-bold mb-6">Coleção de Badges</h2>
      
      {badges.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">Este aluno ainda não possui badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {badges.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                     <div className="h-40 relative bg-gray-50 p-4 flex items-center justify-center">
                        <img 
                            src={item.badge.image_url} 
                            alt={item.badge.title} 
                            className="object-contain w-full h-full drop-shadow-sm" 
                        />
                     </div>
                     <CardHeader className="pb-2 pt-4">
                         <CardTitle className="text-center text-lg leading-tight">{item.badge.title}</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-center text-xs text-gray-500 line-clamp-3">{item.badge.description}</p>
                         <p className="text-center text-[10px] text-gray-400 mt-3 uppercase tracking-wider">
                            Conquistado em {new Date(item.created_at).toLocaleDateString()}
                         </p>
                     </CardContent>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}