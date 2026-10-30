'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MeusIngressosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchUserDataAndOrders() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Buscar dados do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);

      // 2. Buscar pedidos de forma abrangente (por e-mail ou user_id se aplicável)
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*, events(*)')
        .or(`buyer_email.eq.${user.email},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        // Fallback simples caso a coluna user_id não exista na tabela orders
        const { data: fallbackData } = await supabase
          .from('orders')
          .select('*, events(*)')
          .eq('buyer_email', user.email)
          .order('created_at', { ascending: false });
        
        setOrders(fallbackData || []);
      } else {
        setOrders(ordersData || []);
      }

      setLoading(false);
    }

    fetchUserDataAndOrders();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-emerald-500">
        A carregar as suas compras...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between">
      
      {/* CABEÇALHO */}
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold text-lg hidden md:block">VipAcesso Pro</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-emerald-400">Área do Participante</p>
            <p className="text-[10px] text-neutral-400">{userProfile?.email || userProfile?.full_name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 lg:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Minhas Compras e Ingressos</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Consulte o estado dos seus pagamentos e emita os vouchers de acesso.
            </p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold rounded-xl transition-colors">
            ← Explorar Mais Eventos
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center shadow-xl space-y-4">
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="text-xl font-bold">Ainda não tem compras registadas</h2>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Explore a nossa vitrine de eventos e garanta o seu lugar nas melhores experiências.
            </p>
            <div className="pt-4">
              <Link href="/" className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
                Explorar Eventos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const event = order.events;
              const status = order.status || 'confirmed';

              return (
                <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl relative overflow-hidden">
                  
                  {/* BADGE DE ESTADO */}
                  <div className="absolute top-0 right-0 flex items-center">
                    <span className="bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-md">
                      ✓ Confirmado
                    </span>
                  </div>

                  {/* Informações do Evento */}
                  <div className="flex flex-col sm:flex-row gap-5 items-center pb-6 border-b border-neutral-800">
                    <div className="w-20 h-20 bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 shrink-0">
                      {event?.banner_url || event?.thumbnail_url ? (
                        <img src={event.banner_url || event.thumbnail_url} alt="Evento" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">Sem Img</div>
                      )}
                    </div>
                    <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">
                        {event?.event_type || 'Evento'}
                      </span>
                      <h2 className="text-lg font-bold text-white truncate">{event?.title || 'Evento Especial'}</h2>
                      <p className="text-xs text-neutral-400">
                        📅 {event?.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR') : 'Data a definir'} | 📍 {event?.location || 'Local a definir'}
                      </p>
                      <p className="text-[10px] text-neutral-500">ID do Pedido: #VA-{order.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Ingressos e Itens Adquiridos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white block">{item.name}</span>
                            <span className="text-neutral-400">Qtd: {item.quantity}x</span>
                          </div>
                          <span className="font-bold text-emerald-400">
                            {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rodapé */}
                  <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-neutral-400 block">Total Pago ({order.payment_method?.toUpperCase() || 'PIX'})</span>
                      <span className="text-lg font-black text-white">
                        {order.total_amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Link 
                        href={`/sucesso?orderId=${order.id}`}
                        className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 text-center"
                      >
                        🎟️ Emitir Voucher / QR Code
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 py-6 text-center text-neutral-500 text-xs mt-auto">
        <p>© 2026 VipAcesso Pro - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}