'use client';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

function TicketItem({ ticket, selections, handleQuantityChange }) {
  const [shirt, setShirt] = useState(ticket.requires_shirt_size ? 'M' : '');

  return (
    <div className="pb-3 border-b border-neutral-800/80 last:border-0 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-white text-xs">{ticket.name}</h4>
          <p className="text-emerald-400 font-bold text-xs">R$ {ticket.price.toFixed(2)}</p>
        </div>
        <span className="text-[10px] text-neutral-500">Vagas: {ticket.quantity}</span>
      </div>
      
      {/* Inteira */}
      <div className="flex justify-between items-center bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
        <div>
          <span className="text-xs font-medium text-neutral-300">Inteira</span>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
          <button 
            type="button"
            onClick={() => handleQuantityChange(ticket, 'Inteira', ticket.requires_shirt_size ? shirt : null, -1)}
            className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white"
          >-</button>
          <span className="w-4 text-center font-bold text-xs">
            {selections[ticket.id + '_Inteira_' + (ticket.requires_shirt_size ? shirt : '')]?.quantity || 0}
          </span>
          <button 
            type="button"
            onClick={() => handleQuantityChange(ticket, 'Inteira', ticket.requires_shirt_size ? shirt : null, 1)}
            className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white"
          >+</button>
        </div>
      </div>

      {ticket.has_half_price && (
        <div className="flex justify-between items-center bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
          <div>
            <span className="text-xs font-medium text-neutral-300">Meia-Entrada</span>
            <span className="text-[10px] text-neutral-500 ml-1">(R$ {(ticket.price / 2).toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
            <button 
              type="button"
              onClick={() => handleQuantityChange(ticket, 'Meia', ticket.requires_shirt_size ? shirt : null, -1)}
              className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white"
            >-</button>
            <span className="w-4 text-center font-bold text-xs">
              {selections[ticket.id + '_Meia_' + (ticket.requires_shirt_size ? shirt : '')]?.quantity || 0}
            </span>
            <button 
              type="button"
              onClick={() => handleQuantityChange(ticket, 'Meia', ticket.requires_shirt_size ? shirt : null, 1)}
              className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white"
            >+</button>
          </div>
        </div>
      )}
    </div>
  );
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function EventContent() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSelections, setProductSelections] = useState({});
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [expandedRules, setExpandedRules] = useState(false);
  const [selections, setSelections] = useState({});

  const handleProductQuantityChange = (product, delta) => {
    setProductSelections(prev => {
      const current = prev[product.id]?.quantity || 0;
      const nextQty = Math.max(0, current + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }
      return {
        ...prev,
        [product.id]: { product, quantity: nextQty }
      };
    });
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      try {
        const eventRes = await supabase.from('events').select('*').eq('id', id).single();
        
        if (eventRes.data) {
          setEvent(eventRes.data);
          const eventUuid = eventRes.data.id;

          const [ticketsRes, productsRes] = await Promise.all([
            supabase.from('tickets').select('*').eq('event_id', eventUuid),
            supabase.from('event_products').select('*').eq('event_id', eventUuid)
          ]);

          if (ticketsRes.data) setTicketsData(ticketsRes.data);
          if (productsRes.data) setProductsData(productsRes.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleQuantityChange = (ticket, type, shirtSize, delta) => {
    const key = ticket.id + '_' + type + '_' + (shirtSize || 'none');
    setSelections(prev => {
      const currentObj = prev[key] || { quantity: 0, ticket, type, shirtSize };
      const newQty = Math.max(0, currentObj.quantity + delta);
      
      if (delta > 0 && totalSelectedForTicket(ticket.id) >= ticket.quantity) {
        alert('Limite de vagas disponíveis atingido para este lote.');
        return prev;
      }
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: { ...currentObj, quantity: newQty } };
    });
  };

  const totalSelectedForTicket = (ticketId) => {
    return Object.values(selections)
      .filter(item => item.ticket.id === ticketId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const subtotalTickets = Object.values(selections).reduce((sum, item) => {
    const unitPrice = item.type === 'Meia' ? item.ticket.price / 2 : item.ticket.price;
    return sum + (unitPrice * item.quantity);
  }, 0);

  const subtotalProducts = Object.values(productSelections).reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const subtotal = subtotalTickets + subtotalProducts;

  const handleContinuar = () => {
    const cartItems = Object.values(selections).map(item => ({
      id: item.ticket.id + '_' + item.type + '_' + (item.shirtSize || 'none'),
      ticket_id: item.ticket.id,
      name: item.ticket.name + ' (' + item.type + ')' + (item.shirtSize ? ' - Camisa: ' + item.shirtSize : ''),
      price: item.type === 'Meia' ? item.ticket.price / 2 : item.ticket.price,
      quantity: item.quantity,
      shirtSize: item.shirtSize || null,
      type: item.type
    }));

    const cartProducts = Object.values(productSelections).map(item => ({
      id: 'prod_' + item.product.id,
      product_id: item.product.id,
      name: '📦 [Loja] ' + item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    localStorage.setItem('vipAcesso_cart', JSON.stringify({
      event,
      items: [...cartItems, ...cartProducts],
      total: subtotal
    }));
    router.push('/carrinho');
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-bold">A carregar experiência...</div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between font-sans">
      <div>
        {/* CABEÇALHO */}
        <header className="border-b border-neutral-800 bg-neutral-900/85 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
              <span className="font-bold">VipAcesso</span>
            </Link>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-medium flex items-center gap-2">
              🛒 <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </header>

        {/* BANNER DO EVENTO */}
        <section className="relative w-full bg-neutral-900 border-b border-neutral-800">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl" style={{ backgroundImage: 'url(' + event.banner_url + ')' }}></div>
          <div className="relative max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{event.event_type}</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6">{event.title}</h1>
              <div className="space-y-3 text-neutral-300">
                <p className="flex items-center gap-3"><span className="text-xl">📅</span><span>{new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p className="flex items-center gap-3"><span className="text-xl">{event.is_online ? '💻' : '📍'}</span><span>{event.location}</span></p>
              </div>
            </div>
            <div className="w-full lg:w-[450px] h-64 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl">
              <img src={event.banner_url} alt="Banner" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* CORPO DA PÁGINA */}
        <section className="max-w-7xl mx-auto px-6 py-12 w-full flex flex-col lg:flex-row gap-12">
          {/* COLUNA ESQUERDA */}
          <div className="flex-1 space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-4 border-b border-neutral-800 pb-3">Detalhes do Evento</h2>
              <div className={'text-neutral-400 whitespace-pre-line leading-relaxed ' + (expandedDesc ? '' : 'line-clamp-4')}>
                {event.description}
              </div>
              <button type="button" onClick={() => setExpandedDesc(!expandedDesc)} className="mt-3 text-emerald-400 text-sm font-bold hover:underline">
                Ler {expandedDesc ? 'menos' : 'mais'}
              </button>
            </div>

            {event.rules && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b border-neutral-800 pb-3">Regulamento</h2>
                <div className={'text-neutral-400 text-sm whitespace-pre-line p-6 bg-neutral-900 border border-neutral-800 rounded-xl leading-relaxed ' + (expandedRules ? '' : 'line-clamp-3')}>
                  {event.rules}
                </div>
                <button type="button" onClick={() => setExpandedRules(!expandedRules)} className="mt-3 text-emerald-400 text-sm font-bold hover:underline">
                  Ver regulamento {expandedRules ? 'resumido' : 'completo'}
                </button>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: INGRESSOS E LOJA */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-4 lg:p-5 sticky top-28 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold border-b border-neutral-800 pb-2.5">Ingressos e Inscrições</h3>
              
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                <div className="w-16 h-14 bg-neutral-800 rounded-lg overflow-hidden relative border border-neutral-800 shrink-0">
                  {(event.thumbnail_url || event.banner_url) ? (
                    <img src={event.thumbnail_url || event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[9px] font-bold uppercase">Sem Img</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Inscrição para</span>
                  <h4 className="font-bold text-white text-xs leading-tight truncate">{event.title}</h4>
                </div>
              </div>

              {ticketsData.length === 0 ? (
                <p className="text-neutral-500 text-xs text-center py-4">Nenhum ingresso disponível no momento.</p>
              ) : (
                <div className="space-y-3">
                  {ticketsData.map(ticket => (
                    <TicketItem key={ticket.id} ticket={ticket} selections={selections} handleQuantityChange={handleQuantityChange} />
                  ))}
                </div>
              )}

              {/* LOJA DE PRODUTOS EXTRAS */}
              {productsData.length > 0 && (
                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400">Loja Oficial do Evento</h3>
                  <div className="space-y-2">
                    {productsData.map(product => {
                      const qty = productSelections[product.id]?.quantity || 0;
                      return (
                        <div key={product.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-white text-xs">{product.name}</h4>
                            <p className="text-emerald-400 font-black text-xs mt-0.5">
                              {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1 border border-neutral-700">
                            <button type="button" onClick={() => handleProductQuantityChange(product, -1)} className="w-6 h-6 font-bold text-neutral-400 hover:text-white">−</button>
                            <span className="w-4 text-center font-bold text-xs">{qty}</span>
                            <button type="button" onClick={() => handleProductQuantityChange(product, 1)} className="w-6 h-6 font-bold text-emerald-400">+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-neutral-400 font-medium">Subtotal</span>
                  <span className="text-xl font-black text-white">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <button 
                  type="button"
                  onClick={handleContinuar} 
                  disabled={subtotal === 0} 
                  className={'w-full py-3 rounded-xl font-bold text-sm transition-all ' + (subtotal > 0 ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed')}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </section>
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

export default function EventDetails() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-bold">A carregar...</div>}>
      <EventContent />
    </Suspense>
  );
}