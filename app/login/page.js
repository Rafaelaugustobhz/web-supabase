'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert('Erro ao fazer login: ' + error.message);
      return;
    }

    router.push('/');
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) {
      alert('Erro ao autenticar com o Google: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold text-lg">VipAcesso Pro</span>
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto px-6 py-10">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Entrar na Conta</h1>
            <p className="text-sm text-neutral-400">Aceda aos seus ingressos e eventos</p>
          </div>

          {/* BOTÃO GOOGLE LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.6C3.5 19.4 7.4 22 12 22z"/>
            </svg>
            Continuar com o Google
          </button>

          <div className="flex items-center gap-4 text-xs text-neutral-600 uppercase tracking-widest">
            <div className="h-px bg-neutral-800 flex-1"></div>
            ou por e-mail
            <div className="h-px bg-neutral-800 flex-1"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
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
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 mt-2"
            >
              {loading ? 'A entrar...' : 'Entrar na Conta'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
            Ainda não tem conta? <Link href="/cadastro" className="text-emerald-400 font-bold hover:underline">Registe-se aqui</Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 py-6 text-center text-neutral-500 text-xs">
        <p>© 2026 VipAcesso - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-bold">A carregar...</div>}>
      <LoginContent />
    </Suspense>
  );
}