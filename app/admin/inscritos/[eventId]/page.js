'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function InscritosContent() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!eventId) return;

      // 1. Buscar os dados do evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single();
      
      if (eventData) setEvent(eventData);

      // 2. Buscar TODOS os bilhetes deste evento para depois encontrar as orders (inscrições) associadas
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('id, name')
        .eq('event_id', eventId);

      if (ticketsData && ticketsData.length > 0) {
        const ticketIds = ticketsData.map(t => t.id);

        // 3. Buscar as inscrições (orders) que têm os ticket_ids deste evento
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .in('ticket_id', ticketIds)
          .order('created_at', { ascending: false });

        if (ordersData) {
           // Adiciona o nome do ingresso à order para ficar mais fácil ler na tabela
           const enrichedOrders = ordersData.map(order => {
             const ticket = ticketsData.find(t => t.id === order.ticket_id);
             return { ...order, ticket_name: ticket ? ticket.name : 'Desconhecido' };
           });
           setOrders(enrichedOrders);
        }
      }

      setLoading(false);
    }
    fetchData();
  }, [eventId]);

  // Filtra as ordens de acordo com o que o produtor digitar na pesquisa (Nome, CPF ou Email)
  const filteredOrders = orders.filter(order => 
    (order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.buyer_cpf?.includes(searchTerm))
  );

  const exportToCSV = () => {
    // Cria o cabeçalho do ficheiro Excel (CSV)
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nome,Email,CPF,Telefone,Ingresso,Tamanho Camisa,Equipa,Contato Emergencia\n";

    filteredOrders.forEach(order => {
      const row = [
        `"${order.buyer_name || ''}"`,
        `"${order.buyer_email || ''}"`,
        `"${order.buyer_cpf || ''}"`,
        `"${order.buyer_phone || ''}"`,
        `"${order.ticket_name || ''}"`,
        `"${order.shirt_size || 'N/A'}"`,
        `"${order.team_name || 'N/A'}"`,
        `"${order.emergency_contact_phone || 'N/A'}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inscritos_${event?.title || 'evento'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* MENU LATERAL */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold text-lg">VipAcesso Pro</span>
          </div>
          <nav className="space-y-1">
            <Link href="/admin" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dashboard</Link>
            <Link href="/admin/empresa" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dados da Empresa</Link>
          </nav>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
              <Link href="/admin" className="hover:text-emerald-400">Dashboard</Link> <span>/</span> <span>Gestão de Inscritos</span>
            </div>
            <h1 className="text-2xl font-black">{event?.title || 'A carregar evento...'}</h1>
            <p className="text-sm text-neutral-400 mt-1">Gira os atletas inscritos, pesquise por participantes e exporte a lista para o dia do evento.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              disabled={filteredOrders.length === 0}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              📥 Exportar Excel (CSV)
            </button>
          </div>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          {/* BARRA DE PESQUISA E RESUMO */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-96 relative">
               <span className="absolute left-4 top-3.5 text-neutral-500">🔍</span>
               <input 
                 type="text" 
                 placeholder="Pesquisar por nome, CPF ou E-mail..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none"
               />
            </div>
            <div className="bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800">
               <span className="text-xs font-bold text-neutral-400 uppercase">Total Encontrado: </span>
               <span className="text-emerald-400 font-black">{filteredOrders.length}</span>
            </div>
          </div>

          {/* TABELA DE INSCRITOS */}
          {loading ? (
            <p className="text-neutral-500 text-sm py-12 text-center animate-pulse">A carregar lista de atletas...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-neutral-950 rounded-xl border border-neutral-800 border-dashed">
              <p className="text-neutral-400 text-sm">Não há nenhum inscrito correspondente a esta pesquisa para este evento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold px-4">Atleta</th>
                    <th className="pb-3 font-semibold px-4">Contactos</th>
                    <th className="pb-3 font-semibold px-4">Ingresso</th>
                    <th className="pb-3 font-semibold px-4 text-center">Camisa</th>
                    <th className="pb-3 font-semibold px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-sm">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-white text-sm">{order.buyer_name}</p>
                        <p className="text-xs text-neutral-500">CPF: {order.buyer_cpf}</p>
                        {order.team_name && <p className="text-[10px] text-emerald-500 font-semibold mt-1">Equipa: {order.team_name}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs text-neutral-300">{order.buyer_email}</p>
                        <p className="text-xs text-neutral-400">{order.buyer_phone}</p>
                      </td>
                      <td className="py-4 px-4 text-neutral-300 font-medium text-xs">
                         {order.ticket_name}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {order.shirt_size ? (
                           <span className="inline-block bg-neutral-800 text-white text-xs font-bold px-2.5 py-1 rounded-md border border-neutral-700">
                             {order.shirt_size}
                           </span>
                        ) : (
                          <span className="text-neutral-600 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {order.status === 'pending_pix' ? (
                           <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase">Aguardando Pag.</span>
                        ) : order.status === 'paid' ? (
                           <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Aprovado</span>
                        ) : (
                           <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 uppercase">{order.status || 'Em Proc.'}</span>
                        )}
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

export default function InscritosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">A carregar gestão...</div>}>
      <InscritosContent />
    </Suspense>
  );
}