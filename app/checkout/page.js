'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    paymentMethod: 'pix'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('vipAcesso_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.push('/carrinho');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!cart) return;
    setLoading(true);

    try {
      // Grava o pedido na tabela orders do Supabase
      const { data, error } = await supabase.from('orders').insert([
        {
          event_id: cart.event?.id || null,
          buyer_name: formData.fullName,
          buyer_email: formData.email,
          buyer_phone: formData.phone,   // <--- Alterado para buyer_phone
          buyer_cpf: formData.cpf,       // <--- Alterado para buyer_cpf
          payment_method: formData.paymentMethod,
          total_amount: cart.finalTotal !== undefined ? cart.finalTotal : cart.total,
          discount_amount: cart.discount || 0,
          items: cart.items,
          status: 'pending'
        }
      ]).select();

      if (error) throw error;

      // Limpa o carrinho e redireciona para a página de sucesso
      localStorage.removeItem('vipAcesso_cart');
      const orderId = data && data[0] ? data[0].id : '123';
      router.push(`/sucesso?orderId=${orderId}`);
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      alert('Ocorreu um erro ao processar o seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between">
      <header className="border-b border-neutral-800 bg-neutral-900/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold">VipAcesso</span>
          </Link>
          <span className="text-xs text-neutral-400 font-medium">Pagamento Seguro</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
        <h1 className="text-3xl font-extrabold mb-8">Finalizar Inscrição</h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DADOS DO COMPRADOR */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Dados do Participante / Comprador</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ex: Rafael Silva"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 font-medium block mb-1">E-mail</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 font-medium block mb-1">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      name="phone" 
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(47) 99999-9999"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">CPF</label>
                  <input 
                    type="text" 
                    name="cpf" 
                    required
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* MÉTODO DE PAGAMENTO */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Método de Pagamento</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <label className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${formData.paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="pix" 
                    checked={formData.paymentMethod === 'pix'} 
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-xl">💠</span>
                  <span className="text-xs font-bold">PIX (Aprovação Imediata)</span>
                </label>

                <label className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${formData.paymentMethod === 'credit_card' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="credit_card" 
                    checked={formData.paymentMethod === 'credit_card'} 
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-xl">💳</span>
                  <span className="text-xs font-bold">Cartão de Crédito</span>
                </label>
              </div>
            </div>
          </div>

          {/* RESUMO DO VALOR E AÇÃO */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-6 space-y-5 shadow-xl sticky top-28">
              <h2 className="text-sm font-bold border-b border-neutral-800 pb-3">Resumo da Compra</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Itens ({cart.items.length})</span>
                  <span>{cart.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto</span>
                    <span>- {cart.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-neutral-800">
                  <span>Total Final</span>
                  <span>{(cart.finalTotal !== undefined ? cart.finalTotal : cart.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm disabled:opacity-50"
              >
                {loading ? 'A processar...' : 'Confirmar e Pagar'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 mt-20 py-8 px-6 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()} VipAcesso - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}