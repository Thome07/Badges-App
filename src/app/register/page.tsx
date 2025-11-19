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

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
        toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos." });
        return;
    }
    
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name }
      }
    });

    if (error) {
      toast({ variant: "destructive", title: "Erro ao cadastrar", description: error.message });
      setLoading(false);
      return;
    }

    if (data.user) {
        await supabase
            .from('users')
            .update({ name: name })
            .eq('id', data.user.id);

        toast({ 
            title: "Conta criada! 🚀", 
            description: "Bem-vindo ao time!" 
        });
        router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>

      <Card className="w-full max-w-[400px] relative z-10 border-slate-800 bg-[#0b101e]/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-slate-800/50">
           <div className="mx-auto w-12 h-12 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-purple-500 mb-2">
            <Command className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-mono font-bold text-slate-100"> Iniciar Cadastro </CardTitle>
          <CardDescription className="text-xs font-mono text-slate-500"> Crie seu perfil de desenvolvedor. </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Nome Completo</label>
                <Input 
                    type="text" 
                    placeholder="Nome Hash" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="bg-slate-950 border-slate-800 focus:border-purple-500"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Email</label>
                <Input 
                    type="email" 
                    placeholder="dev@mainframe.net" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="bg-slate-950 border-slate-800 focus:border-purple-500"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Senha</label>
                <Input 
                    type="password" 
                    placeholder="••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="bg-slate-950 border-slate-800 focus:border-purple-500"
                />
            </div>
            <Button type="submit" className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs uppercase tracking-widest border border-purple-500/50 mt-2" disabled={loading}>
              {loading ? 'Processing...' : '> Deploy User'}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs font-mono text-slate-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 underline decoration-dashed underline-offset-4">
              ::login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}