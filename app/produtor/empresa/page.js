'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function EmpresaContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'KW Eventos',
    documentId: '',
    email: 'kweventos00@gmail.com',
    phone: '(47) 99953-4242',
    pixKey: '',
    logoUrl: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('vipAcesso_producer');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    localStorage.setItem('vipAcesso_producer', JSON.stringify(formData));

    setTimeout(() => {
      setLoading(false);
      alert('Dados da empresa atualizados com sucesso!');
      router.push('/admin');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* MENU LATERAL */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold text-lg">VipAcesso Pro</span>
          </div>
          <nav className="space-y-1">
            <Link href="/admin" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dashboard</Link>
            <Link href="/admin/empresa" className="block px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold text-sm">Dados da Empresa</Link>
            <Link href="/admin/novo" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Meus Eventos</Link>
          </nav>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="font-bold text-sm">{formData.companyName}</p>
          <p className="text-xs text-neutral-500">{formData.email}</p>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-black">Cadastro da Empresa</h1>
            <p className="text-sm text-neutral-400">Gerencie as informações corporativas e chave PIX para recebimentos.</p>
          </div>
          <Link href="/admin" className="text-xs text-neutral-400 hover:text-white underline">
            Voltar ao Dashboard
          </Link>
        </header>

        <div className="max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Nome da Empresa / Produtor *</label>
              <input 
                type="text" name="companyName" value={formData.companyName} onChange={handleChange} required 
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">CNPJ ou CPF *</label>
                <input 
                  type="text" name="documentId" value={formData.documentId} onChange={handleChange} required 
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">E-mail Comercial *</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Telefone / WhatsApp *</label>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleChange} required 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Chave PIX *</label>
                <input 
                  type="text" name="pixKey" value={formData.pixKey} onChange={handleChange} required 
                  placeholder="CNPJ, E-mail ou Chave"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">URL do Logótipo (Opcional)</label>
              <input 
                type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} 
                placeholder="https://exemplo.com/logo.png"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-4"
            >
              {loading ? 'Salvando...' : 'Salvar Dados da Empresa'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function EmpresaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Carregando...</div>}>
      <EmpresaContent />
    </Suspense>
  );
}