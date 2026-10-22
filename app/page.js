'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  // Lógica de filtragem
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = event.title?.toLowerCase().includes(searchLower);
    const typeMatch = event.event_type?.toLowerCase().includes(searchLower);
    return titleMatch || typeMatch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      
      {/* Cabeçalho */}
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold text-lg hidden sm:block">VipAcesso</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-semibold hover:text-emerald-400 transition-colors px-4 py-2">
            Entrar
          </Link>
          <Link href="/login" className="text-sm font-bold bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg transition-colors">
            Área do Produtor
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        
        {/* Título Principal */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-black">O seu próximo grande momento começa aqui.</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">Encontre os melhores eventos, shows e congressos perto de si.</p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="w-full max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nome do evento ou tipo (ex: Esporte, Show)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all shadow-xl"
            />
          </div>
        </div>

        {/* Lista de Eventos Filtrada */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 font-bold">A carregar eventos...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">Nenhum evento encontrado para "{searchTerm}".</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-emerald-500 transition-colors group flex flex-col">
                <div className="h-48 bg-neutral-800 relative overflow-hidden">
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs uppercase tracking-widest">Sem Imagem</div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {event.event_type || 'Evento'}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-neutral-400 line-clamp-2">{event.description}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-neutral-300">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>{event.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR') : 'Data a definir'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>{event.location || 'Local a definir'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Acesso Corrigido para /eventos/ */}
                  <Link 
                    href={`/eventos/${event.id}`} 
                    className="block w-full py-3 mt-6 text-center bg-neutral-800 hover:bg-emerald-500 text-white hover:text-black font-bold rounded-xl transition-colors"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="border-t border-neutral-800 bg-neutral-900 py-8 mt-auto">
        <div className="text-center text-neutral-500 text-xs">
          <p>© 2026 VipAcesso - Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}