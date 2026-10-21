'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState(false);
  
  // Estado para o carrinho (quantidade de bilhetes selecionados)
  const [tickets, setTickets] = useState({
    inteira: 0,
    meia: 0,
    vip: 0
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
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [id]);

  // Função para adicionar/remover bilhetes
  const handleTicketChange = (type, operation) => {
    setTickets(prev => {
      const current = prev[type];
      if (operation === 'add') return { ...prev, [type]: current + 1 };
      if (operation === 'sub' && current > 0) return { ...prev, [type]: current - 1 };
      return prev;
    });
  };

  // Cálculo do subtotal (Valores simulados para o exemplo)
  const prices = { inteira: 120, meia: 60, vip: 250 };
  const subtotal = (tickets.inteira * prices.inteira) + (tickets.meia * prices.meia) + (tickets.vip * prices.vip);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-emerald-500 font-bold text-xl">A carregar detalhes da experiência...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Evento não encontrado</h1>
        <Link href="/" className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
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
            <Link href="/auth/login" className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-2 transition-colors">Entrar</Link>
          </div>
        </div>
      </header>

      {/* HERO DO EVENTO (CABEÇALHO) */}
      <section className="relative w-full bg-neutral-900 border-b border-neutral-800">
        {/* Fundo borrado usando a própria imagem do evento */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl"
          style={{ backgroundImage: `url(${event.banner_url || 'https://via.placeholder.com/1200x400'})` }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16 flex flex-col lg:flex-row gap-8 items-center">
          {/* Informações da Esquerda */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {event.event_type || 'Geral'}
              </span>
              <span className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                💳 Parcele em até 12x
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6">{event.title}</h1>
            
            <div className="space-y-3 text-neutral-300">
              <p className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <span>{new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} às 22h00</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span>{event.location}</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <span>Fale com o produtor: <strong>VipAcesso Oficial</strong></span>
              </p>
            </div>
          </div>

          {/* Galeria de Fotos (Até 3 fotos rotativas simuladas) */}
          <div className="w-full lg:w-[500px] h-64 lg:h-80 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl relative group">
            <img 
              src={event.banner_url || 'https://via.placeholder.com/800x600'} 
              alt="Banner do Evento" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Indicador de Galeria */}
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CORPO DA PÁGINA (2 COLUNAS NO DESKTOP) */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full flex flex-col lg:flex-row gap-12 relative">
        
        {/* COLUNA ESQUERDA (DESCRIÇÃO E INFORMAÇÕES) */}
        <div className="flex-1 space-y-12">
          
          {/* Descrição do Evento */}
          <div>
            <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Descrição do evento</h2>
            <div className={`text-neutral-400 leading-relaxed space-y-4 ${expandedDesc ? '' : 'line-clamp-6'}`}>
              <p className="font-semibold text-white">OBSERVAÇÕES GERAIS:</p>
              <p>A INSCRIÇÃO NESTE EVENTO ESTÁ VINCULADA AS REGRAS DO REGULAMENTO GERAL. {event.description}</p>
              <p>Prepare-se para uma experiência inesquecível. Estrutura completa com praça de alimentação, segurança reforçada e estacionamento no local. Recomendamos chegar com pelo menos 1 hora de antecedência para evitar filas no check-in.</p>
              <p>Acesso permitido apenas para maiores de 18 anos, mediante apresentação de documento oficial com foto. Meia-entrada válida conforme legislação em vigor.</p>
            </div>
            <button 
              onClick={() => setExpandedDesc(!expandedDesc)}
              className="mt-4 text-emerald-400 font-semibold text-sm flex items-center gap-2 hover:text-emerald-300 transition-colors"
            >
              {expandedDesc ? '↑ Mostrar menos' : '↓ Ler mais sobre o evento'}
            </button>
          </div>

          {/* Mapa de Setores (Opcional - Exemplo para Shows) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Mapa do Evento / Setores</h2>
            <div className="w-full h-48 bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-700">
              <span className="text-neutral-500">🗺️ Imagem do Mapa de Setores do Produtor</span>
            </div>
          </div>

          {/* Localização e Mapa GPS */}
          <div>
            <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Onde será?</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2 h-48 bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
                <span className="text-neutral-500">📍 Integração Google Maps</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white mb-2">{event.location}</h3>
                <p className="text-neutral-400 text-sm mb-4">Rua Exemplo, 123 - Bairro Centro, Cidade - Estado, CEP 00000-000</p>
                <a href={`https://maps.google.com/?q=${event.location}`} target="_blank" className="text-emerald-400 text-sm font-semibold hover:underline">
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Políticas do Evento e Documentos */}
          <div>
            <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Política do evento</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-1">Cancelamento de pedidos pagos</h3>
                <p className="text-neutral-400 text-sm">Cancelamentos de pedidos serão aceitos até 7 dias após a compra, desde que a solicitação seja enviada até 48 horas antes do início do evento.</p>
                <button className="text-emerald-400 text-sm mt-1">Saiba mais sobre o cancelamento</button>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Edição de participantes</h3>
                <p className="text-neutral-400 text-sm">Você poderá editar o participante de um ingresso apenas uma vez. Essa opção ficará disponível até 24 horas antes do início do evento.</p>
              </div>
              <div className="pt-4 border-t border-neutral-800/50">
                <h3 className="font-bold text-lg mb-3">Documentos Importantes</h3>
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors border border-neutral-700">
                  📄 Baixar Regulamento PDF
                </a>
              </div>
            </div>
          </div>

          {/* Sobre o Produtor */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-neutral-800 rounded-full flex-shrink-0 border-2 border-neutral-700 flex items-center justify-center text-3xl">
              🏢
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-1">Sobre o produtor</h3>
              <h2 className="text-xl font-bold text-white mb-4">Produtora VipAcesso</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <button className="px-4 py-2 bg-emerald-500 text-black font-bold text-sm rounded-lg hover:bg-emerald-400 transition-colors">
                  Seguir
                </button>
                <button className="px-4 py-2 bg-neutral-800 text-white font-semibold text-sm rounded-lg hover:bg-neutral-700 border border-neutral-700 transition-colors">
                  Fale com o produtor
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA (CARRINHO E INGRESSOS - STICKY) */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-28 space-y-6">
            
            {/* Seletor de Múltiplas Datas (Opcional p/ Parques/Atrações) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
              <h3 className="text-sm font-bold text-neutral-400 mb-3">Selecione uma data</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button className="flex-shrink-0 bg-emerald-500 text-black rounded-xl p-3 text-center min-w-[80px]">
                  <p className="text-xs font-medium">Qui</p>
                  <p className="text-xl font-black">22</p>
                  <p className="text-[10px] font-bold uppercase">Out</p>
                </button>
                <button className="flex-shrink-0 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-xl p-3 text-center min-w-[80px] hover:bg-neutral-700">
                  <p className="text-xs font-medium">Sex</p>
                  <p className="text-xl font-black text-white">23</p>
                  <p className="text-[10px] font-bold uppercase">Out</p>
                </button>
              </div>
            </div>

            {/* Lista de Ingressos */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-bold border-b border-neutral-800 pb-3">Ingressos disponíveis</h3>

              {/* Card Ingresso 1 */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-800/50">
                <div>
                  <h4 className="font-bold text-white">Ingresso Inteira</h4>
                  <p className="text-neutral-400 text-sm">R$ 120,00</p>
                  <p className="text-emerald-400 text-[10px] font-semibold uppercase mt-1">Lote 1</p>
                </div>
                <div className="flex items-center gap-3 bg-neutral-800 rounded-lg p-1 border border-neutral-700">
                  <button onClick={() => handleTicketChange('inteira', 'sub')} className="w-8 h-8 flex items-center justify-center text-xl font-bold text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-md transition-colors">−</button>
                  <span className="w-4 text-center font-bold">{tickets.inteira}</span>
                  <button onClick={() => handleTicketChange('inteira', 'add')} className="w-8 h-8 flex items-center justify-center text-xl font-bold text-emerald-400 hover:bg-neutral-700 rounded-md transition-colors">+</button>
                </div>
              </div>

              {/* Card Ingresso 2 */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-800/50">
                <div>
                  <h4 className="font-bold text-white">Meia-Entrada</h4>
                  <p className="text-neutral-400 text-sm">R$ 60,00</p>
                  <button className="text-neutral-500 hover:text-neutral-300 text-xs underline mt-1">Ver regras</button>
                </div>
                <div className="flex items-center gap-3 bg-neutral-800 rounded-lg p-1 border border-neutral-700">
                  <button onClick={() => handleTicketChange('meia', 'sub')} className="w-8 h-8 flex items-center justify-center text-xl font-bold text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-md transition-colors">−</button>
                  <span className="w-4 text-center font-bold">{tickets.meia}</span>
                  <button onClick={() => handleTicketChange('meia', 'add')} className="w-8 h-8 flex items-center justify-center text-xl font-bold text-emerald-400 hover:bg-neutral-700 rounded-md transition-colors">+</button>
                </div>
              </div>

              {/* Resumo e Botão de Compra */}
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
                    subtotal > 0 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25' 
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Comprar Ingressos
                </button>
              </div>
            </div>
            
            {/* Selos de Segurança */}
            <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="text-xs font-bold border border-neutral-700 px-2 py-1 rounded">💳 Compra Segura</span>
              <span className="text-xs font-bold border border-neutral-700 px-2 py-1 rounded">🔒 Criptografia SSL</span>
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
    </main>
  );
}