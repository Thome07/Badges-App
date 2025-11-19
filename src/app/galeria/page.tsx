import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid } from 'lucide-react';

export default async function GaleriaPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: badges } = await supabase.from('badges').select('*').order('created_at', { ascending: false });

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-6 animate-in slide-in-from-top-4 duration-500">
            <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 font-mono">
                    <Grid className="h-6 w-6 text-pink-500" /> Artifact Repository
                </h1>
                <p className="text-slate-500 mt-1 font-mono text-xs">Visualizar coleção global de conquistas.</p>
            </div>
        </div>

        {/* Grid de Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges?.map((badge) => (
            <Card key={badge.id} className="overflow-hidden hover:border-pink-500/50 transition-all duration-300 bg-[#0b101e] group border-slate-800 shadow-lg">
              {/* Fundo da imagem ajustado para ser quase preto, mas não transparente total */}
              <div className="relative h-48 w-full bg-[#020617] p-6 flex items-center justify-center border-b border-slate-800/50">
                 {badge.image_url && (
                   <img 
                      src={badge.image_url} 
                      alt={badge.title} 
                      className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(236,72,153,0.15)] group-hover:scale-110 transition-transform duration-300" 
                   />
                 )}
              </div>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-mono font-bold text-slate-200">{badge.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-mono">{badge.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {badges?.length === 0 && (
             <div className="text-center py-20 text-slate-600 font-mono text-sm">
                 <p>404 - No artifacts found.</p>
             </div>
        )}
      </div>
    </div>
  );
}