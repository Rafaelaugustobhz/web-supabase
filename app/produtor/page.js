'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProducerDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [producer, setProducer] = useState({
    companyName: 'Minha Produtora',
    email: ''
  });

  const fetchData = async () => {
    // 1. Obtém o utilizador autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push('/produtor/login');
      return;
    }

    // 2. Busca o perfil do produtor na tabela profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setProducer({
        companyName: profile.company_name || profile.full_name || 'Minha Produtora',
        email: user.email
      });
    } else {
      setProducer({ companyName: 'Minha Produtora', email: user.email });
    }

    // 3. Busca APENAS os eventos pertencentes a este produtor
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    const producerEvents = eventsData || [];
    setEvents(producerEvents);

    // 4. Busca ordens/inscrições apenas para os eventos deste produtor
    if (producerEvents.length > 0) {
      const eventIds = producerEvents.map(ev => ev.id);
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .in('event_id', eventIds);

      if (ordersData) setOrders(ordersData);
    } else {
      setOrders([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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

  // Cálculo de Métricas e Faturamento exclusivo do produtor
  const totalEvents = events.length;
  const totalInscritos = orders.length;
  const faturamentoTotal = orders.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex font-sans">
      
      {/* MENU LATERAL */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold text-lg">VipAcesso Pro</span>
          </div>
          <nav className="space-y-1">
            <Link href="/produtor" className="block px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold text-sm">Dashboard</Link>
            <Link href="/produtor/empresa" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dados da Empresa</Link>
            <Link href="/produtor/cupons" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Cupons de Desconto</Link>
            <Link href="/produtor/novo" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Criar Evento</Link>
          </nav>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="font-bold text-sm truncate">{producer.companyName}</p>
          <p className="text-xs text-neutral-500 truncate">{producer.email}</p>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-black">Dashboard & Faturamento</h1>
            <p className="text-sm text-neutral-400">Visão geral financeira e operacional dos seus eventos desportivos.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/produtor/empresa" className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
              🏢 Empresa
            </Link>
            <Link href="/produtor/novo" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
              + Criar Evento
            </Link>
          </div>
        </header>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 text-2xl opacity-20">💰</div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Faturamento Total</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-2">
              {faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">Soma das inscrições dos seus eventos</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 text-2xl opacity-20">🏃</div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total de Atletas</p>
            <h3 className="text-3xl font-black text-white mt-2">{totalInscritos}</h3>
            <p className="text-[11px] text-neutral-500 mt-1">Inscrições nos seus eventos</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 text-2xl opacity-20">📅</div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Seus Eventos Ativos</p>
            <h3 className="text-3xl font-black text-white mt-2">{totalEvents}</h3>
            <p className="text-[11px] text-neutral-500 mt-1">Eventos geridos por si</p>
          </div>
        </div>

        {/* TABELA DE EVENTOS DO PRODUTOR */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Meus Eventos</h2>
            <Link href="/produtor/novo" className="text-xs font-bold text-emerald-400 hover:underline">
              Novo evento →
            </Link>
          </div>
          
          {loading ? (
            <p className="text-neutral-500 text-sm py-8 text-center animate-pulse">A carregar dados do painel...</p>
          ) : events.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-neutral-400 text-sm">Ainda não tem nenhum evento cadastrado.</p>
              <Link href="/produtor/novo" className="inline-block px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors">
                Criar meu primeiro evento
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
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
                        <Link href={`/produtor/inscritos/${event.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-semibold">Inscritos</Link>
                        <Link href={`/produtor/produtos/${event.id}`} className="text-amber-400 hover:text-amber-300 text-xs font-semibold">Loja</Link>
                        <Link href={`/produtor/editar/${event.id}`} className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold">Editar</Link>
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