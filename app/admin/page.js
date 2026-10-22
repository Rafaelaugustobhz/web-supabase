'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir o evento: ' + error.message);
    } else {
      setEvents(events.filter(ev => ev.id !== id));
      alert('Evento excluído com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      
      {/* MENU LATERAL */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold text-lg">VipAcesso Pro</span>
          </div>
          <nav className="space-y-1">
            <Link href="/admin" className="block px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold text-sm">Dashboard</Link>
            <Link href="/admin/novo" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Meus Eventos</Link>
          </nav>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="font-bold text-sm">KW Eventos</p>
          <p className="text-xs text-neutral-500">kweventos00@gmail.com</p>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black">Visão Geral</h1>
            <p className="text-sm text-neutral-400">Acompanhe as vendas e o desempenho dos seus eventos.</p>
          </div>
          <Link href="/admin/novo" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
            + Criar Evento
          </Link>
        </header>

        {/* TABELA DE EVENTOS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Eventos Recentes</h2>
          
          {loading ? (
            <p className="text-neutral-500 text-sm py-6 text-center animate-pulse">A carregar eventos...</p>
          ) : events.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-neutral-400 text-sm">Nenhum evento cadastrado na plataforma.</p>
              <Link href="/admin/novo" className="inline-block px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors">Criar meu primeiro evento</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Nome do Evento</th>
                    <th className="pb-3 font-semibold">Data</th>
                    <th className="pb-3 font-semibold">Categoria</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-sm">
                  {events.map(event => (
                    <tr key={event.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 font-bold text-white">
                        <Link href={`/eventos/${event.id}`} className="hover:text-emerald-400 transition-colors">
                          {event.title}
                        </Link>
                      </td>
                      <td className="py-4 text-neutral-400">
                        {event.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          {event.event_type}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-3">
                        <Link href={`/admin/editar/${event.id}`} className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold">Editar</Link>
                        <Link href={`/eventos/${event.id}`} className="text-neutral-400 hover:text-white text-xs font-semibold">Ver</Link>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}