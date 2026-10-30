'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function CadastroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState('customer'); // Usamos 'customer' para alinhar com o enum do Supabase

  // Atualiza o tipo de conta automaticamente com base no URL (?role=producer ou ?type=producer)
  useEffect(() => {
    const roleParam = searchParams.get('role') || searchParams.get('type');
    if (roleParam === 'producer') {
      setRole('producer');
    } else {
      setRole('customer');
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    address: '',
    cpfCnpj: '',
    acceptTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (role === 'producer' && !formData.acceptTerms) {
      alert('Para se cadastrar como Produtor, é obrigatório aceitar os Termos de Responsabilidade.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: role,
          phone: formData.phone,
          company_name: role === 'producer' ? formData.companyName : null,
          address: role === 'producer' ? formData.address : null,
          cpf_cnpj: role === 'producer' ? formData.cpfCnpj : null,
          accepted_terms: role === 'producer' ? formData.acceptTerms : false
        }
      }
    });

    setIsSubmitting(false);

    if (error) {
      alert('Erro ao criar conta: ' + error.message);
      return;
    }

    alert('Conta criada com sucesso!');
    if (role === 'producer') {
      router.push('/produtor/login');
    } else {
      router.push('/login');
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
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between font-sans">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold text-lg">VipAcesso Pro</span>
        </Link>
      </header>

      <main className="max-w-xl w-full mx-auto px-6 py-10">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Criar Nova Conta</h1>
            <p className="text-sm text-neutral-400">
              {role === 'producer' ? 'Registe-se como Produtor para criar e gerir eventos' : 'Registe-se como Participante para comprar ingressos'}
            </p>
          </div>

          {/* SELETOR DE TIPO DE CONTA */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${role === 'customer' ? 'bg-emerald-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              👤 Participante
            </button>
            <button
              type="button"
              onClick={() => setRole('producer')}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${role === 'producer' ? 'bg-emerald-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              🏢 Produtor de Eventos
            </button>
          </div>

          {/* BOTÃO GOOGLE LOGIN (EXIBIDO APENAS PARA PARTICIPANTE) */}
          {role === 'customer' && (
            <>
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
            </>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Rafael Silva"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">E-mail de Acesso</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Palavra-passe</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(47) 99999-9999"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  required 
                />
              </div>
            </div>

            {/* CAMPOS ESPECÍFICOS PARA PRODUTORES */}
            {role === 'producer' && (
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Dados Empresariais e de Contato (Exibidos no Evento)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Nome da Empresa / Produtora</label>
                    <input 
                      type="text" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="KW Eventos Ltda"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                      required={role === 'producer'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">CPF ou CNPJ</label>
                    <input 
                      type="text" 
                      name="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={handleChange}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                      required={role === 'producer'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Endereço Comercial / Sede</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rua Exemplo, 123 - Itapema, SC"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    required={role === 'producer'}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                    <input 
                      type="checkbox" 
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="w-4 h-4 accent-emerald-500 mt-0.5 cursor-pointer"
                      required={role === 'producer'}
                    />
                    <span className="text-xs text-neutral-300 leading-relaxed">
                      Concordo com os <strong className="text-white">Termos de Responsabilidade do Produtor</strong>, assumindo total autoria, veracidade e segurança jurídica sobre os eventos e ingressos publicados na VipAcesso Pro.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 mt-4 disabled:opacity-50"
            >
              {isSubmitting ? 'A criar conta...' : 'Registar Conta'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
            Já tem conta?{' '}
            <Link 
              href={role === 'producer' ? '/produtor/login' : '/login'} 
              className="text-emerald-400 font-bold hover:underline"
            >
              Faça login aqui
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 py-6 text-center text-neutral-500 text-xs">
        <p>© {new Date().getFullYear()} VipAcesso - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-bold">A carregar...</div>}>
      <CadastroContent />
    </Suspense>
  );
}