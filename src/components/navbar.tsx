'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { Sparkles, Users, Image as ImageIcon, LogOut, Terminal, Command } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Função para destacar o link ativo
  const isActive = (path: string) => pathname === path ? "text-indigo-400 bg-slate-800" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50";

  return (
    <nav className="border-b border-slate-800 bg-[#030712]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold text-slate-100 hover:text-indigo-400 transition-colors">
            <Command className="h-4 w-4" />
            <span>GC_JAVA</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
             {[
               { href: '/galeria', icon: ImageIcon, label: 'Galeria' },
               { href: '/momento-faisca', icon: Sparkles, label: 'Faísca' },
               { href: '/perfis', icon: Users, label: 'Devs' },
             ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <button className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wide transition-all ${isActive(link.href)}`}>
                      <link.icon className="h-3 w-3" /> {link.label}
                  </button>
                </Link>
             ))}

             <div className="h-4 w-px bg-slate-800 mx-2"></div>

             {user ? (
                <div className="flex items-center gap-2">
                    <Link href="/me">
                         <Button size="sm" className="h-8 text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200">
                            ~/perfil
                         </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-slate-900">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
             ) : (
                <Link href="/login">
                  <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono border border-indigo-500">
                    ::login
                  </Button>
                </Link>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
}