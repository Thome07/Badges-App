'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";
import { Terminal, Hash, Code2, ArrowRight, Command, Cpu } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (data?.role === 'admin') setIsAdmin(true);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Efeito de digitação simples para o título
  const [text] = useState("public static void main(String[] args) {");

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      
      {/* Header Técnico */}
      <div className="w-full max-w-5xl mb-12 flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
          <Terminal className="h-4 w-4" />
          <span>bash /home/caldeira/java-track</span>
        </div>
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Coluna Esquerda: Conteúdo Texto (Visual de Código) */}
        <div className="space-y-8">
            <div className="space-y-4">
                <p className="font-mono text-indigo-400 text-sm font-bold tracking-widest uppercase">
                    // Geração Caldeira • 2025
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                    <span className="text-slate-500">class</span> <span className="text-yellow-200">Developer</span> <span className="text-slate-500">extends</span> <span className="text-indigo-400">Student</span> <span className="text-white">{`{`}</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-mono pl-4 border-l-2 border-slate-800">
                    <span className="text-slate-600">01</span> Capture badges;<br/>
                    <span className="text-slate-600">02</span> Compartilhe conhecimento;<br/>
                    <span className="text-slate-600">03</span> Compile sua carreira;<br/>
                    <span className="text-slate-600">04</span> <span className="text-green-400">return "Sucesso";</span>
                </p>
                 <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{`}`}</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                    onClick={() => router.push(isLoggedIn ? '/me' : '/login')}
                    disabled={loading}
                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-sm uppercase tracking-wide border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                    {loading ? 'Loading...' : isLoggedIn ? '> Initialize Profile' : '> System.login()'}
                </Button>

                {isAdmin && (
                    <Link href="/admin">
                        <Button variant="outline" className="h-12 px-8 font-mono text-sm uppercase tracking-wide border-slate-700 hover:bg-slate-800 hover:text-white">
                            sudo admin
                        </Button>
                    </Link>
                )}
            </div>
        </div>

        {/* Coluna Direita: "Grid de Módulos" (Substitui os Cards Genéricos) */}
        <div className="grid gap-4">
            
            {/* Módulo Galeria */}
            <Link href="/galeria" className="group block">
                <div className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-lg transition-all duration-300 hover:bg-slate-900 group-hover:translate-x-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded text-indigo-400 group-hover:text-indigo-300">
                            <Hash className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-slate-200">Galeria.jar</h3>
                    <p className="text-sm text-slate-500 mt-1 font-mono">Visualizar coleção completa de artefatos.</p>
                </div>
            </Link>

            {/* Módulo Faísca */}
            <Link href="/momento-faisca" className="group block">
                <div className="bg-slate-900/50 border border-slate-800 hover:border-yellow-500/50 p-6 rounded-lg transition-all duration-300 hover:bg-slate-900 group-hover:translate-x-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded text-yellow-400 group-hover:text-yellow-300">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-slate-200">Faisca.exe</h3>
                    <p className="text-sm text-slate-500 mt-1 font-mono">Agendar talks e apresentações relâmpago.</p>
                </div>
            </Link>

            {/* Módulo Código (Alunos) */}
            <Link href="/perfis" className="group block">
                <div className="bg-slate-900/50 border border-slate-800 hover:border-green-500/50 p-6 rounded-lg transition-all duration-300 hover:bg-slate-900 group-hover:translate-x-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded text-green-400 group-hover:text-green-300">
                            <Code2 className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-slate-200">Users.class</h3>
                    <p className="text-sm text-slate-500 mt-1 font-mono">Diretório de desenvolvedores ativos.</p>
                </div>
            </Link>
        </div>
      </div>
      
      {/* Rodapé Técnico */}
      <div className="absolute bottom-4 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        v1.0.4 • Build 2025 • Geração Caldeira
      </div>
    </div>
  );
}