'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function SucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para o cabeçalho dinâmico
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function fetchData() {
      // 1. Verificar Sessão do Utilizador para o Cabeçalho
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || profile.company_name || user.email.split('@')[0]);
        } else {
          setUserName(user.email.split('@')[0]);
        }
      }

      // 2. Carregar Dados do Pedido (Supabase ou LocalStorage)
      if (orderId) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, events(*)')
          .eq('id', orderId)
          .single();

        if (data && !error) {
          setOrderData({
            event: data.events,
            items: data.items,
            total: data.total_amount,
            id: data.id
          });
          setLoading(false);
          return;
        }
      }

      // Fallback: Tenta carregar do localStorage se a query falhar ou não houver ID
      const savedCart = localStorage.getItem('vipAcesso_cart');
      if (savedCart) {
        setOrderData(JSON.parse(savedCart));
      }

      setLoading(false);
    }

    fetchData();
  }, [orderId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-emerald-500">
        A carregar os detalhes da inscrição...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between font-sans">
      <div>
        {/* CABEÇALHO DINÂMICO COMPLETO */}
        <header className="h-20 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg shadow-lg shadow-emerald-500/20">VA</span>
            <span className="font-bold text-lg hidden sm:block tracking-wide">VipAcesso Pro</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/meus-ingressos" 
                  className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl hover:bg-emerald-500/20 transition-colors"
                >
                  🎟️ Olá, {userName}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-semibold text-neutral-400 hover:text-white px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-semibold text-neutral-300 hover:text-emerald-400 transition-colors px-4 py-2">
                Entrar
              </Link>
            )}

            <Link href="/produtor/login" className="text-sm font-bold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-5 py-2.5 rounded-xl transition-all shadow-md hidden sm:block">
              Área do Produtor
            </Link>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="max-w-3xl mx-auto px-6 py-12">
          
          <div className="text-center space-y-3 mb-10">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/10">
              ✓
            </div>
            <h1 className="text-3xl font-black tracking-tight">Inscrição Confirmada!</h1>
            <p className="text-neutral-400 text-sm">O seu pedido foi processado com sucesso. O comprovativo e os detalhes foram registados.</p>
          </div>

          {orderData ? (
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                Oficial & Garantido
              </div>

              {/* Informações do Evento */}
              <div className="flex flex-col sm:flex-row gap-5 items-center pb-6 border-b border-neutral-800">
                <div className="w-24 h-24 bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 shrink-0">
                  {orderData.event?.banner_url || orderData.event?.thumbnail_url ? (
                    <img src={orderData.event.banner_url || orderData.event.thumbnail_url} alt="Evento" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">Sem Img</div>
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">
                    {orderData.event?.event_type || 'Evento'}
                  </span>
                  <h2 className="text-xl font-bold text-white truncate">{orderData.event?.title || 'Evento Especial'}</h2>
                  <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <span>📅</span> {orderData.event?.event_date ? new Date(orderData.event.event_date).toLocaleDateString('pt-BR') : 'Data a definir'}
                  </p>
                  <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5 truncate">
                    <span>📍</span> {orderData.event?.location || 'Local a definir'}
                  </p>
                </div>
              </div>

              {/* Itens Adquiridos */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Ingressos / Inscrições Selecionadas</h3>
                <div className="space-y-2">
                  {orderData.items?.map((item, idx) => (
                    <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-xs text-neutral-400">Quantidade: {item.quantity}x</span>
                      </div>
                      <span className="font-bold text-emerald-400">
                        {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Simulado para Entrada */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2v2h2v-2h-2zm-4 4h2v2h-2v-2zm4 2v2h2v-2h-2zm-8-6h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2z"/>
                  </svg>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-white text-sm">Credencial Digital / QR Code</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Apresente este código na portaria do evento para validação imediata da sua entrada. Também pode descarregar ou imprimir este comprovativo.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold pt-1">ID do Pedido: #VA-{orderId ? orderId.slice(0, 8) : '123456'}</p>
                </div>
              </div>

              {/* Total e Ações */}
              <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block">Total Pago</span>
                  <span className="text-2xl font-black text-white">
                    {orderData.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                
                {/* BOTÕES DE AÇÃO */}
                <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                  <button 
                    onClick={handlePrint} 
                    className="flex-1 sm:flex-none px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition-colors text-center"
                  >
                    Imprimir / PDF
                  </button>
                  <Link 
                    href="/meus-ingressos" 
                    className="flex-1 sm:flex-none px-4 py-3 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors text-center"
                  >
                    📦 Ver Minhas Compras
                  </Link>
                  <Link 
                    href="/" 
                    className="flex-1 sm:flex-none px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 text-center"
                  >
                    Voltar ao Início
                  </Link>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <p className="text-neutral-400 text-sm">Não foi possível carregar os dados deste pedido na base de dados.</p>
              <div className="flex justify-center gap-3 pt-2">
                <Link href="/meus-ingressos" className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 font-bold rounded-xl text-xs transition-colors">
                  Ver Minhas Compras
                </Link>
                <Link href="/" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20">
                  Voltar ao Início
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* RODAPÉ */}
      <footer className="border-t border-neutral-800 bg-neutral-900 mt-20 py-8 px-6 text-center text-neutral-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-black font-black px-2.5 py-1 rounded-lg text-xs">VA</span>
            <span className="font-bold text-white">VipAcesso Pro</span>
          </div>
          <p>© {new Date().getFullYear()} VipAcesso - Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-bold">A carregar comprovativo...</div>}>
      <SucessoContent />
    </Suspense>
  );
}