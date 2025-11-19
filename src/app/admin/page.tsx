'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BadgeCheck, Home, BarChart3, Terminal } from 'lucide-react';
import { BadgesView } from '@/components/admin/badges-view';
import { UsersView } from '@/components/admin/users-view';
import { AnalyticsView } from '@/components/admin/analytics-view'; 

export default function AdminSinglePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'badges' | 'users' | 'stats'>('dashboard');

  return (
    <div className="min-h-screen bg-[#030712]"> {/* Fundo Dark Puro */}
      {/* Header Fixo */}
      <header className="bg-[#0b101e]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-400 hover:bg-slate-800 font-mono text-xs">
                    <Home className="mr-2 h-4 w-4" /> /home
                </Button>
            </Link>
            <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block"></div>
            <h1 className="text-sm font-mono font-bold text-slate-200 hidden md:flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-500" />
                root@caldeira-admin:~#
            </h1>
        </div>
        
        {/* Menu de Navegação (Abas) */}
        <div className="flex bg-slate-900 p-1 rounded border border-slate-800 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 text-xs font-mono font-medium rounded transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-[#0b101e] border border-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-1.5 text-xs font-mono font-medium rounded transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-[#0b101e] border border-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Estatísticas
            </button>
            <button 
                onClick={() => setActiveTab('badges')}
                className={`px-4 py-1.5 text-xs font-mono font-medium rounded transition-all whitespace-nowrap ${activeTab === 'badges' ? 'bg-[#0b101e] border border-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Badges
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-1.5 text-xs font-mono font-medium rounded transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-[#0b101e] border border-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Users
            </button>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-6xl">
        
        {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* AQUI ESTAVA O ERRO: '>', agora corrigido para '&gt;' */}
                <h2 className="text-xl font-mono font-bold mb-6 text-slate-200">&gt; Welcome_Admin</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card 
                        className="hover:border-indigo-500/50 transition-all cursor-pointer border-slate-800 bg-[#0b101e] group" 
                        onClick={() => setActiveTab('stats')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-mono font-medium text-indigo-400">System_Metrics</CardTitle>
                            <BarChart3 className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100 mb-1">Analytics</div>
                            <p className="text-xs font-mono text-slate-500">Visualize dados e engajamento.</p>
                        </CardContent>
                    </Card>

                    <Card 
                        className="hover:border-indigo-500/50 transition-all cursor-pointer border-slate-800 bg-[#0b101e] group" 
                        onClick={() => setActiveTab('badges')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-mono font-medium text-indigo-400">Badge_Control</CardTitle>
                            <BadgeCheck className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100 mb-1">Catálogo</div>
                            <p className="text-xs font-mono text-slate-500">CRUD de conquistas do sistema.</p>
                        </CardContent>
                    </Card>

                    <Card 
                        className="hover:border-indigo-500/50 transition-all cursor-pointer border-slate-800 bg-[#0b101e] group" 
                        onClick={() => setActiveTab('users')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-mono font-medium text-indigo-400">User_Management</CardTitle>
                            <Users className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100 mb-1">Atribuição</div>
                            <p className="text-xs font-mono text-slate-500">Distribuir badges em massa.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}

        {/* Renderização das Views */}
        {activeTab === 'stats' && <AnalyticsView />}
        {activeTab === 'badges' && <BadgesView />}
        {activeTab === 'users' && <UsersView />}

      </main>
    </div>
  );
}