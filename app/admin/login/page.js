'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function AdminLoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Se já estiver autenticado como super_admin, redireciona diretamente para /admin
  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'super_admin') {
          router.push('/admin');
        }
      }
    }
    checkSession();
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Erro ao fazer login: ' + error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (profile?.role === 'super_admin') {
      router.push('/admin');
    } else {
      await supabase.auth.signOut();
      alert('Acesso negado: Esta conta não possui privilégios de Super Admin.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between font-sans">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-red-500 text-white font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold text-lg">VipAcesso Pro - Administração</span>
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto px-6 py-12">
        <div className="bg-neutral-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs bg-red-500/10 text-red-400 font-semibold px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-wide">
              Painel de Controlo
            </span>
            <h1 className="text-2xl font-black mt-2">Login Super Admin</h1>
            <p className="text-xs text-neutral-400">Acesso restrito à gestão global da plataforma</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@vipacesso.com" 
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Palavra-passe</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 mt-2 disabled:opacity-50"
            >
              {loading ? 'A verificar privilégios...' : 'Entrar como Admin'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-neutral-800 text-xs">
            <Link href="/" className="text-neutral-500 hover:text-neutral-300 underline">
              ← Voltar ao site principal
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 py-6 text-center text-neutral-500 text-xs">
        <p>© 2026 VipAcesso Pro - Sistema de Administração</p>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-red-500">A carregar...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}