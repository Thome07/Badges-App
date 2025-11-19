'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Command } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast({ variant: "destructive", title: "Access Denied", description: error.message });
    } else {
      router.push('/'); 
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
       {/* Matrix Grid Background */}
       <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
       
       {/* Glow effect */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>

      <Card className="w-full max-w-[380px] relative z-10 border-slate-800 bg-[#0b101e]/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-slate-800/50">
          <div className="mx-auto w-12 h-12 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-indigo-500 mb-2">
            <Command className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-mono font-bold text-slate-100"> System Login </CardTitle>
          <CardDescription className="text-xs font-mono text-slate-500"> Insira as credenciais para acessar. </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">User Email</label>
                <Input 
                    type="email" 
                    placeholder="dev@caldeira.org" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="bg-slate-950 border-slate-800 focus:border-indigo-500"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Password key</label>
                <Input 
                    type="password" 
                    placeholder="••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus:border-indigo-500" 
                />
            </div>
            <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs uppercase tracking-widest border border-indigo-500/50 mt-2" disabled={loading}>
              {loading ? 'Authenticating...' : '> Connect'}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs font-mono text-slate-600">
            Novo Usuario?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 underline decoration-dashed underline-offset-4">
              Cadastrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}