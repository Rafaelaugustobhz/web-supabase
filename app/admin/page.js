'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setOrders(data || []);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  // Métricas
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Filtragem
  const filteredOrders = orders.filter(
    (o) =>
      o.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyer_cpf?.includes(searchTerm) ||
      o.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Exportar para CSV (Excel)
  const exportToCSV = () => {
    const headers = 'Nome,CPF,Email,Data Nasc,Genero,Camiseta,Equipe,Contato Emergencia,Telefone,Valor,Status\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.buyer_name}","${o.buyer_cpf}","${o.buyer_email}","${o.birth_date}","${o.gender}","${o.shirt_size}","${o.team_name || ''}","${o.emergency_contact_name}","${o.emergency_contact_phone}","${o.total_amount}","${o.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscritos_mons_ultra_trail.csv`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-neutral-800">
          <div>
            <Link href="/" className="text-xs text-neutral-400 hover:text-white block mb-2">← Voltar para o site</Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Painel do Organizador</h1>
            <p className="text-neutral-400 text-sm">Gestão de Inscritos — Sicoob Mons Ultra Trail 2026</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-xl transition text-sm flex items-center gap-2"
          >
            📥 Exportar Lista (CSV/Excel)
          </button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Total Arrecadado</p>
            <p className="text-3xl font-extrabold text-emerald-400">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Inscrições Confirmadas</p>
            <p className="text-3xl font-extrabold text-white">{paidOrders.length}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Aguardando PIX</p>
            <p className="text-3xl font-extrabold text-amber-400">{orders.length - paidOrders.length}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="flex justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou e-mail do atleta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white"
          />
        </div>

        {/* Tabela de Inscritos */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-neutral-500">Carregando inscritos...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="p-8 text-center text-neutral-500">Nenhuma inscrição encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs border-b border-neutral-800">
                  <tr>
                    <th className="p-4">Atleta</th>
                    <th className="p-4">CPF</th>
                    <th className="p-4">Camiseta</th>
                    <th className="p-4">Equipe / Assessoria</th>
                    <th className="p-4">Contato Emergência</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-800/50 transition">
                      <td className="p-4 font-semibold text-white">
                        {order.buyer_name}
                        <span className="block text-xs font-normal text-neutral-400">{order.buyer_email}</span>
                      </td>
                      <td className="p-4 text-xs font-mono">{order.buyer_cpf}</td>
                      <td className="p-4 font-bold text-emerald-400">{order.shirt_size}</td>
                      <td className="p-4 text-xs text-neutral-400">{order.team_name || '-'}</td>
                      <td className="p-4 text-xs">
                        {order.emergency_contact_name}
                        <span className="block text-neutral-400">{order.emergency_contact_phone}</span>
                      </td>
                      <td className="p-4 font-bold">R$ {Number(order.total_amount).toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {order.status === 'paid' ? 'Pago' : 'Pendente PIX'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}