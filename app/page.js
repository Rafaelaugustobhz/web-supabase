'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase.from('events').select('*');
      if (!error) setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <header className="max-w-6xl mx-auto flex justify-between items-center pb-8 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black text-xl">VA</div>
          <h1 className="text-2xl font-bold tracking-tight">VipAcesso</h1>
        </div>
        <button className="bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition">
          Criar Evento
        </button>
      </header>

      <section className="max-w-6xl mx-auto py-12">
        <p className="text-emerald-400 font-semibold tracking-wider text-sm uppercase mb-2">Vitrine de Corridas & Provas</p>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">O seu próximo desafio começa aqui.</h2>
        <p className="text-neutral-400 max-w-xl text-lg mb-8">
          Garanta sua inscrição nas maiores provas de trail running e endurance com confirmação imediata.
        </p>

        <h3 className="text-2xl font-bold mb-6">Provas em Destaque</h3>

        {loading ? (
          <p className="text-neutral-500">Carregando eventos...</p>
        ) : events.length === 0 ? (
          <p className="text-neutral-500">Nenhum evento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div key={evt.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-emerald-500 transition flex flex-col">
                <img src={evt.banner_url} alt={evt.title} className="w-full h-48 object-cover" />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold mb-2">{evt.title}</h4>
                    <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{evt.description}</p>
                    <div className="text-xs text-neutral-400 space-y-1 mb-6">
                      <p>📍 {evt.location}</p>
                      <p>📅 {new Date(evt.event_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/eventos/${evt.id}`}
                    className="w-full text-center bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition block"
                  >
                    Inscrever-se / Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}