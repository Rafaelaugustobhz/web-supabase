'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function ProducerLoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert('Erro ao fazer login: ' + error.message);
    } else {
      router.push('/produtor');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between font-sans">
      
      {/* CABEÇALHO */}
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold text-lg">VipAcesso Pro - Produtores</span>
        </Link>
      </header>

      {/* CONTEÚDO DO LOGIN */}
      <main className="max-w-md w-full mx-auto px-6 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide">
              Área Exclusiva
            </span>
            <h1 className="text-2xl font-black mt-2">Login do Produtor</h1>
            <p className="text-xs text-neutral-400">
              Aceda ao seu dashboard de vendas e bilheteira
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="produtor@seuemail.com" 
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
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 mt-2 disabled:opacity-50"
            >
              {loading ? 'A entrar...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400 space-y-2">
            <p>
              Ainda não tem conta de produtor?{' '}
              <Link 
                href="/cadastro?role=producer" 
                className="text-emerald-400 font-bold hover:underline ml-1"
              >
                Criar conta gratuita
              </Link>
            </p>
            <div>
              <Link href="/" className="text-neutral-500 hover:text-neutral-300 underline">
                ← Voltar ao site principal
              </Link>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 py-6 text-center text-neutral-500 text-xs">
        <p>© 2026 VipAcesso Pro - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default function ProducerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-emerald-500">A carregar...</div>}>
      <ProducerLoginContent />
    </Suspense>
  );
}