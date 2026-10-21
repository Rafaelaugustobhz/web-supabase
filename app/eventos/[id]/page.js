'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function EventoDetalhesContent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventData) {
        setEvent(eventData);

        const { data: ticketsData } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', id)
          .order('price', { ascending: false });

        if (ticketsData) {
          setTicketTypes(ticketsData);
          if (ticketsData.length > 0) {
            setSelectedTicket(ticketsData[0]);
          }
        }
      }
      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p className="animate-pulse text-neutral-400">A carregar detalhes do evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-red-500 mb-2">Evento não encontrado</h1>
          <Link href="/" className="text-sm underline text-neutral-400">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 max-w-2xl mx-auto space-y-6 py-8">
      <Link href="/" className="text-xs text-neutral-400 hover:text-white transition">
        ← Voltar para lista de eventos
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold">{event.title || event.name}</h1>
        <p className="text-sm text-neutral-400">{event.location} • {event.date}</p>
      </div>

      <p className="text-sm text-neutral-300 leading-relaxed">{event.description}</p>

      <hr className="border-neutral-800" />

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Selecione sua categoria / ingresso</h2>
        
        <div className="grid gap-3">
          {ticketTypes.map((ticket) => {
            const isSelected = selectedTicket?.id === ticket.id;
            const nomeModalidade = ticket.name || ticket.title || ticket.modalidade || ticket.category_name || ticket.type || 'Inscrição Individual';

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-neutral-800 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{nomeModalidade}</span>
                    {(ticket.distance || ticket.distancia) && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                        {ticket.distance || ticket.distancia}
                      </span>
                    )}
                  </div>
                  {ticket.description && (
                    <p className="text-xs text-neutral-400">{ticket.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-400 text-lg">
                    R$ {Number(ticket.price).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTicket && (
        <div className="pt-4">
          <Link
            href={`/inscricao/${selectedTicket.id}`}
            className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-center text-sm shadow-lg shadow-emerald-500/20"
          >
            Avançar para Inscrição (R$ {Number(selectedTicket.price).toFixed(2)})
          </Link>
        </div>
      )}
    </main>
  );
}

export default function EventoDetalhes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">Carregando evento...</div>}>
      <EventoDetalhesContent />
    </Suspense>
  );
}