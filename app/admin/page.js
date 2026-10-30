'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducers: 0,
    totalEvents: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    async function checkAdminAccess() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'super_admin') {
        router.push('/admin/login');
        return;
      }

      // Carregar estatísticas globais
      const { count: producersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'producer');

      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalProducers: producersCount || 0,
        totalEvents: eventsCount || 0,
        totalOrders: ordersCount || 0,
      });

      setLoading(false);
    }

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-red-500">
        A verificar credenciais de Administrador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      <header className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            Painel Geral da Plataforma
          </span>
          <h1 className="text-3xl font-black mt-2">Super Admin - VipAcesso Pro</h1>
        </div>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/admin/login');
          }}
          className="text-xs font-bold bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors"
        >
          Sair do Painel
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Total de Produtores</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{stats.totalProducers}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Total de Eventos na Plataforma</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{stats.totalEvents}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Total de Inscrições Geradas</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{stats.totalOrders}</p>
        </div>
      </main>
    </div>
  );
}