'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert('Erro ao entrar: ' + authError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    setIsSubmitting(false);

    if (profileError || !profileData) {
      router.push('/');
      return;
    }

    const userRole = profileData.role;
    if (userRole === 'admin' || userRole === 'producer') {
      router.push('/admin');
    } else {
      router.push('/');
    }
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

      <main className="max-w-md w-full mx-auto px-6 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Acessar a Plataforma</h1>
            <p className="text-sm text-neutral-400">Entre com sua conta de Participante ou Produtor</p>
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
            Entrar com o Google
          </button>

          <div className="flex items-center gap-4 text-xs text-neutral-600 uppercase tracking-widest">
            <div className="h-px bg-neutral-800 flex-1"></div>
            ou por e-mail
            <div className="h-px bg-neutral-800 flex-1"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">E-mail</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Palavra-passe</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 mt-2"
            >
              {isSubmitting ? 'A entrar...' : 'Entrar na Conta'}
            </button>
          </form>

          {/* LINK CORRETO PARA A PÁGINA DE CADASTRO QUE CRIÁMOS */}
          <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
            Ainda não tem conta? <Link href="/cadastro" className="text-emerald-400 font-bold hover:underline">Registe-se aqui</Link>
          </div>

        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 py-6 text-center text-neutral-500 text-xs">
        <p>© {new Date().getFullYear()} VipAcesso - Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}