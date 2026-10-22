'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 1. Todo o nosso código da página passa a ser este componente interno
function EventContent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState(false);
  
  // Estado para o carrinho
  const [tickets, setTickets] = useState({
    opcao1: 0,
    opcao2: 0,
  });

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar evento:', error);
        // MOCK DE DADOS PARA TESTE VISUAL
        setEvent({
          id: id,
          title: "Sicoob Mons Ultra Trail 2026",
          description: "A Grande Final do Mundial de Endurance Trail Running! Estrutura completa, pontos de hidratação e resgate. Prepare-se para o maior desafio da sua vida nas montanhas.",
          event_date: "2026-11-10T05:00:00",
          location: "Nova Trento, SC",
          event_type: "esporte",
          banner_url: "https://images.unsplash.com/photo-1541252874014-b498f395da78?q=80&w=1200",
          producer_name: "Corre Brasil",
          has_sectors: false,
          is_recurring: false,
          is_online: false,
          current_batch: "2º Lote"
        });
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [id]);

  const handleTicketChange = (type, operation) => {
    setTickets(prev => {
      const current = prev[type];
      if (operation === 'add') return { ...prev, [type]: current + 1 };
      if (operation === 'sub' && current > 0) return { ...prev, [type]: current - 1 };
      return prev;
    });
  };

  const prices = { opcao1: 250, opcao2: 380 };
  const subtotal = (tickets.opcao1 * prices.opcao1) + (tickets.opcao2 * prices.opcao2);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-emerald-500 font-bold text-xl">A carregar detalhes...</div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* CABEÇALHO GLOBAL */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">VipAcesso</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/carrinho" className="relative p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-sm font-medium transition-colors flex items-center gap-2">
              🛒 <span className="hidden md:inline">Carrinho</span>
              {subtotal > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">!</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO DO EVENTO */}
      <section className="relative w-full bg-neutral-900 border-b border-neutral-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl"
          style={{ backgroundImage: `url(${event.banner_url})` }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {event.event_type}
              </span>
              {!event.is_recurring && event.current_batch && (
                <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  🎟️ {event.current_batch}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6">{event.title}</h1>
            
            <div className="space-y-3 text-neutral-300">
              {!event.is_recurring && (
                <p className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <span>{new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
              )}
              <p className="flex items-center gap-3">
                <span className="text-xl">{event.is_online ? '💻' : '📍'}</span>
                <span>{event.is_online ? 'Evento 100% Digital' : event.location}</span>
              </p>
            </div>
          </div>

          <div className="w-full lg:w-[450px] h-64 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl">
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* CORPO DA PÁGINA */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full flex flex-col lg:flex-row gap-12">
        
        {/* COLUNA ESQUERDA */}
        <div className="flex-1 space-y-12">
          
          {/* Descrição */}
          <div>
            <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Detalhes do Evento</h2>
            <div className={`text-neutral-400 leading-relaxed space-y-4 ${expandedDesc ? '' : 'line-clamp-4'}`}>
              <p>{event.description}</p>
              <p>Recomendamos a leitura atenta do regulamento. Acesso mediante apresentação de documento oficial com foto e QR Code do ingresso.</p>
            </div>
            <button 
              onClick={() => setExpandedDesc(!expandedDesc)}
              className="mt-4 text-emerald-400 font-semibold text-sm hover:text-emerald-300"
            >
              {expandedDesc ? '↑ Ocultar detalhes' : '↓ Ler descrição completa'}
            </button>
          </div>

          {/* RENDERIZAÇÃO CONDICIONAL: Mapa de Setores */}
          {event.has_sectors && (
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Mapa de Setores</h2>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <div className="w-full h-48 bg-neutral-800 rounded-xl flex items-center justify-center">
                  <span className="text-neutral-500">🗺️ Imagem do Mapa do Produtor</span>
                </div>
              </div>
            </div>
          )}

          {/* RENDERIZAÇÃO CONDICIONAL: Localização Física */}
          {!event.is_online && (
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Localização</h2>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-6">
                <div className="w-16 h-16 bg-neutral-800 rounded-xl flex items-center justify-center text-2xl border border-neutral-700">📍</div>
                <div>
                  <h3 className="font-bold text-white mb-1">{event.location}</h3>
                  <a href={`https://maps.google.com/?q=${event.location}`} target="_blank" className="text-emerald-400 text-sm font-semibold hover:underline">
                    Ver rotas no Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA (COMPRA) */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-28 space-y-6">
            
            {/* RENDERIZAÇÃO CONDICIONAL: Calendário */}
            {event.is_recurring && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-sm font-bold text-neutral-400 mb-3">Selecione a data da visita</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <button className="flex-shrink-0 bg-emerald-500 text-black rounded-xl p-3 min-w-[80px]">
                    <p className="text-xl font-black">22</p>
                    <p className="text-[10px] font-bold uppercase">Out</p>
                  </button>
                  <button className="flex-shrink-0 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-xl p-3 min-w-[80px]">
                    <p className="text-xl font-black">23</p>
                    <p className="text-[10px] font-bold uppercase">Out</p>
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Ingressos/Kits */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-bold border-b border-neutral-800 pb-3">Opções disponíveis</h3>

              {/* Opção 1 */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-800/50">
                <div>
                  <h4 className="font-bold text-white">{event.event_type === 'esporte' ? 'Kit Básico' : 'Ingresso Inteira'}</h4>
                  <p className="text-neutral-400 text-sm">R$ {prices.opcao1},00</p>
                </div>
                <div className="flex items-center gap-3 bg-neutral-800 rounded-lg p-1 border border-neutral-700">
                  <button onClick={() => handleTicketChange('opcao1', 'sub')} className="w-8 h-8 text-neutral-400 hover:text-white font-bold">−</button>
                  <span className="w-4 text-center font-bold">{tickets.opcao1}</span>
                  <button onClick={() => handleTicketChange('opcao1', 'add')} className="w-8 h-8 text-emerald-400 font-bold">+</button>
                </div>
              </div>

              {/* Opção 2 */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-800/50">
                <div>
                  <h4 className="font-bold text-white">{event.event_type === 'esporte' ? 'Kit VIP (Com Camisa)' : 'Meia-Entrada'}</h4>
                  <p className="text-neutral-400 text-sm">R$ {prices.opcao2},00</p>
                </div>
                <div className="flex items-center gap-3 bg-neutral-800 rounded-lg p-1 border border-neutral-700">
                  <button onClick={() => handleTicketChange('opcao2', 'sub')} className="w-8 h-8 text-neutral-400 hover:text-white font-bold">−</button>
                  <span className="w-4 text-center font-bold">{tickets.opcao2}</span>
                  <button onClick={() => handleTicketChange('opcao2', 'add')} className="w-8 h-8 text-emerald-400 font-bold">+</button>
                </div>
              </div>

              {/* Resumo */}
              <div className="mt-4 pt-4 border-t border-neutral-700">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-neutral-400 font-medium">Subtotal</span>
                  <span className="text-2xl font-black text-white">
                    {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                
                <button 
                  disabled={subtotal === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                    subtotal > 0 ? 'bg-emerald-500 text-black shadow-emerald-500/25' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="mt-auto border-t border-neutral-800 bg-neutral-950 py-8 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-black font-black px-2 py-1 rounded-lg text-sm">VA</span>
            <span className="font-bold tracking-tight">VipAcesso</span>
          </div>
          <p className="text-neutral-500 text-sm">VipAcesso: O passaporte oficial para as suas melhores experiências.</p>
        </div>
      </footer>
    </div>
  );
}

// 2. O Export Default agora é o Suspense que engloba a página, evitando o erro da Vercel
export default function EventDetails() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-emerald-500 font-bold text-xl">A preparar a experiência...</div>
      </main>
    }>
      <EventContent />
    </Suspense>
  );
}