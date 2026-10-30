'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function CuponsContent() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: '100'
  });

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('coupons').insert([{
      code: formData.code.toUpperCase().trim(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      max_uses: parseInt(formData.max_uses) || 100
    }]);

    if (error) {
      alert('Erro ao criar cupom (talvez o código já exista): ' + error.message);
    } else {
      alert('Cupom criado com sucesso!');
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '100' });
      fetchCoupons();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem a certeza que deseja eliminar este cupom?')) return;

    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      setCoupons(coupons.filter(c => c.id !== id));
      alert('Cupom eliminado.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* MENU LATERAL */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold text-lg">VipAcesso Pro</span>
          </div>
          <nav className="space-y-1">
            <Link href="/admin" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dashboard</Link>
            <Link href="/admin/empresa" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dados da Empresa</Link>
            <Link href="/admin/cupons" className="block px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold text-sm">Cupons de Desconto</Link>
          </nav>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-black">Gestão de Cupons de Desconto</h1>
            <p className="text-sm text-neutral-400">Crie códigos promocionais para impulsionar as inscrições nos seus eventos.</p>
          </div>
          <Link href="/admin" className="text-xs text-neutral-400 hover:text-white underline">
            Voltar ao Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORMULÁRIO DE CRIAÇÃO */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold mb-4 text-emerald-400">Novo Cupom</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Código do Cupom *</label>
                <input 
                  type="text" name="code" value={formData.code} onChange={handleChange} required
                  placeholder="EX: CORRIDA15" 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tipo de Desconto *</label>
                <select 
                  name="discount_type" value={formData.discount_type} onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="percentage">Percentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  {formData.discount_type === 'percentage' ? 'Valor da Percentagem (Ex: 15 para 15%)' : 'Valor em Reais (Ex: 30 para R$30)'} *
                </label>
                <input 
                  type="number" name="discount_value" value={formData.discount_value} onChange={handleChange} required
                  placeholder={formData.discount_type === 'percentage' ? '15' : '30'} 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Limite de Utilizações</label>
                <input 
                  type="number" name="max_uses" value={formData.max_uses} onChange={handleChange} required
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'A criar...' : 'Criar Cupom'}
              </button>
            </form>
          </div>

          {/* LISTAGEM DE CUPONS */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Cupons Ativos</h2>
            
            {loading ? (
              <p className="text-neutral-500 text-sm py-8 text-center animate-pulse">A carregar cupons...</p>
            ) : coupons.length === 0 ? (
              <p className="text-neutral-400 text-sm text-center py-12">Nenhum cupom criado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Código</th>
                      <th className="pb-3 font-semibold">Desconto</th>
                      <th className="pb-3 font-semibold">Utilizações</th>
                      <th className="pb-3 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-sm">
                    {coupons.map(coupon => (
                      <tr key={coupon.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4 font-black text-emerald-400 font-mono tracking-wider">{coupon.code}</td>
                        <td className="py-4 text-white font-bold">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                        </td>
                        <td className="py-4 text-neutral-400">
                          {coupon.times_used} / {coupon.max_uses}
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDelete(coupon.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CuponsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">A carregar...</div>}>
      <CuponsContent />
    </Suspense>
  );
}