'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('vipAcesso_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-5xl">🛒</div>
          <h1 className="text-2xl font-bold">O seu carrinho está vazio</h1>
          <p className="text-neutral-400 text-sm">Ainda não adicionou nenhum ingresso ou produto da loja.</p>
          <Link href="/" className="inline-block bg-emerald-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition">
            Explorar Eventos
          </Link>
        </div>
      </div>
    );
  }

  // Impede que a quantidade baixe de 1 pelo botão menos
  const handleQuantityChange = (index, delta) => {
    const updatedItems = [...cart.items];
    const newQty = updatedItems[index].quantity + delta;

    if (newQty < 1) {
      return; // Mantém no mínimo 1
    }

    updatedItems[index].quantity = newQty;

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const updatedCart = { ...cart, items: updatedItems, total: newTotal };
    
    setCart(updatedCart);
    localStorage.setItem('vipAcesso_cart', JSON.stringify(updatedCart));
  };

  // Função dedicada para remover o item se o utilizador clicar no botão de fechar (✕)
  const handleRemoveItem = (index) => {
    const updatedItems = [...cart.items];
    updatedItems.splice(index, 1);

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const updatedCart = { ...cart, items: updatedItems, total: newTotal };
    
    setCart(updatedCart);
    localStorage.setItem('vipAcesso_cart', JSON.stringify(updatedCart));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoading(true);
    setCouponMessage(null);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        setCouponMessage({ text: 'Cupão inválido ou expirado.', type: 'error' });
        setDiscount(0);
      } else {
        const discValue = data.discount_percent ? (cart.total * data.discount_percent) / 100 : (data.discount_amount || 0);
        setDiscount(discValue);
        setCouponMessage({ text: `Cupão aplicado com sucesso! Desconto de ${data.discount_percent ? data.discount_percent + '%' : 'R$ ' + discValue}`, type: 'success' });
      }
    } catch (err) {
      console.error('Erro ao aplicar cupão:', err);
      setCouponMessage({ text: 'Erro ao validar o cupão.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = Math.max(0, cart.total - discount);

  const proceedToCheckout = () => {
    const finalCart = { ...cart, discount, finalTotal };
    localStorage.setItem('vipAcesso_cart', JSON.stringify(finalCart));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between">
      <header className="border-b border-neutral-800 bg-neutral-900/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold">VipAcesso</span>
          </Link>
          <span className="text-xs text-neutral-400 font-medium">Checkout Seguro</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
        <h1 className="text-3xl font-extrabold mb-8">Resumo da Inscrição</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ITENS DO CARRINHO */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Itens Selecionados</h2>
              
              <div className="divide-y divide-neutral-800">
                {cart.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-white truncate">{item.name}</h3>
                      <p className="text-emerald-400 text-xs font-semibold mt-0.5">
                        {Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} un.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Controlo de Quantidade (Mínimo 1) */}
                      <div className="flex items-center gap-2 bg-neutral-950 rounded-lg p-1 border border-neutral-800">
                        <button type="button" onClick={() => handleQuantityChange(idx, -1)} className="w-6 h-6 font-bold text-neutral-400 hover:text-white flex items-center justify-center">−</button>
                        <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                        <button type="button" onClick={() => handleQuantityChange(idx, 1)} className="w-6 h-6 font-bold text-emerald-400 flex items-center justify-center">+</button>
                      </div>

                      <span className="text-sm font-bold w-20 text-right">
                        {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>

                      {/* Botão Dedicado para Remover o Item */}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(idx)}
                        className="text-neutral-500 hover:text-red-400 p-1 transition-colors text-xs font-bold"
                        title="Remover item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SUMÁRIO E CUPÃO */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-6 space-y-5 shadow-xl">
              <h2 className="text-sm font-bold border-b border-neutral-800 pb-3">Resumo do Pedido</h2>
              
              {/* CUPÃO DE DESCONTO */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 font-medium">Possui cupão de desconto?</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="CÓDIGO" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white uppercase flex-1 focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    type="button"
                    onClick={applyCoupon}
                    disabled={loading}
                    className="bg-neutral-800 hover:bg-neutral-700 text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Aplicar
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] font-medium ${couponMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-neutral-800 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span>{cart.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto</span>
                    <span>- {discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-neutral-800">
                  <span>Total</span>
                  <span>{finalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={proceedToCheckout}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm"
              >
                Avançar para Pagamento
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 mt-20 py-8 px-6 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()} VipAcesso - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}