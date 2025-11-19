'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Loader2, Trophy, Users, Medal, TrendingUp, AlertTriangle, Star, ArrowDown, ArrowUp } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBadges: 0,
    totalAssignments: 0,
    popularBadges: [] as any[],
    rareBadges: [] as any[],
    topStudents: [] as any[],
    bottomStudents: [] as any[],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, badgesRes, assignmentsRes] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'student'),
        supabase.from('badges').select('*'),
        supabase.from('user_badges').select('*')
      ]);

      const users = usersRes.data || [];
      const badges = badgesRes.data || [];
      const assignments = assignmentsRes.data || [];

      const badgeCounts: Record<string, number> = {};
      badges.forEach(b => badgeCounts[b.id] = 0);
      assignments.forEach(a => { if (badgeCounts[a.badge_id] !== undefined) badgeCounts[a.badge_id]++; });

      const sortedBadges = badges.map(b => ({
        name: b.title,
        count: badgeCounts[b.id] || 0,
      })).sort((a, b) => b.count - a.count);

      const studentCounts: Record<string, number> = {};
      users.forEach(u => studentCounts[u.id] = 0);
      assignments.forEach(a => { if (studentCounts[a.user_id] !== undefined) studentCounts[a.user_id]++; });

      const sortedStudents = users.map(u => ({
        name: u.name || u.email.split('@')[0],
        count: studentCounts[u.id] || 0,
        email: u.email
      })).sort((a, b) => b.count - a.count);

      setStats({
        totalStudents: users.length,
        totalBadges: badges.length,
        totalAssignments: assignments.length,
        popularBadges: sortedBadges.slice(0, 5),
        rareBadges: [...sortedBadges].sort((a, b) => a.count - b.count).slice(0, 5), // Menos comuns primeiro
        topStudents: sortedStudents.slice(0, 10),
        bottomStudents: [...sortedStudents].sort((a, b) => a.count - b.count).slice(0, 10), // Menos badges primeiro
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-200">
      
      {/* 1. KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#0b101e] border-slate-800 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-indigo-500/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono text-slate-400 uppercase tracking-wider">Total Students</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">{stats.totalStudents}</div>
            <p className="text-xs text-slate-500 font-mono mt-1">Active developers</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b101e] border-slate-800 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-emerald-500/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono text-slate-400 uppercase tracking-wider">Artifacts</CardTitle>
            <Medal className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">{stats.totalBadges}</div>
            <p className="text-xs text-slate-500 font-mono mt-1">Unique badges available</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b101e] border-slate-800 border-l-4 border-l-amber-500 shadow-sm hover:shadow-amber-500/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono text-slate-400 uppercase tracking-wider">Total Grants</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">{stats.totalAssignments}</div>
            <p className="text-xs text-slate-500 font-mono mt-1">Achievements unlocked</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. GRÁFICOS */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#0b101e] border-slate-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold text-slate-300 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" /> Top 10 Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topStudents} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fill: '#64748b', fontFamily: 'monospace'}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '4px' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 2, 2, 0]} barSize={15}>
                    {stats.topStudents.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#f59e0b' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0b101e] border-slate-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Badge Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.popularBadges}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    stroke="none"
                  >
                    {stats.popularBadges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '4px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. LISTAS DETALHADAS */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Badges Raras */}
        <Card className="bg-[#0b101e] border-slate-800 shadow-md">
          <CardHeader className="border-b border-slate-800/50 pb-3">
            <CardTitle className="text-sm font-mono font-bold text-indigo-300 flex items-center gap-2">
                <Medal className="h-4 w-4" /> Badges Mais Raras
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stats.rareBadges.map((badge, i) => (
                <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-600">#{i+1}</span>
                        <span className="text-sm text-slate-300 group-hover:text-indigo-400 transition-colors">{badge.name}</span>
                    </div>
                    <span className="text-xs font-mono bg-slate-900 text-indigo-300 px-2 py-1 rounded border border-slate-800">
                        {badge.count}
                    </span>
                </div>
            ))}
          </CardContent>
        </Card>

        {/* Alunos Menos Engajados (Para o professor ajudar) */}
        <Card className="bg-[#0b101e] border-slate-800 shadow-md">
          <CardHeader className="border-b border-slate-800/50 pb-3">
            <CardTitle className="text-sm font-mono font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Alunos com menos Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stats.bottomStudents.map((student, i) => (
                <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                            {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                             <span className="text-sm text-slate-300">{student.name}</span>
                        </div>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded border ${student.count === 0 ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        {student.count} badges
                    </span>
                </div>
            ))}
            {stats.bottomStudents.length === 0 && <p className="text-xs text-slate-600 font-mono">No data.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}