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
  const [activeTab, setActiveTab] = useState('users'); // 'dashboard' | 'users' | 'events'
  
  const [profiles, setProfiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Carregar todos os dados da plataforma
  const loadAdminData = async () => {
    setLoading(true);

    // 1. Validar sessão do Super Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (currentProfile?.role !== 'super_admin') {
      router.push('/admin/login');
      return;
    }

    // 2. Procurar todos os perfis de utilizadores
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // 3. Procurar todos os eventos
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    setProfiles(profilesData || []);
    setEvents(eventsData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, [router]);

  // --- AÇÕES DE UTILIZADORES ---
  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Erro ao alterar cargo: ' + error.message);
    } else {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
      alert('Nível de acesso atualizado com sucesso!');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Tem certeza que deseja apagar o perfil de ${userEmail}?`)) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      alert('Erro ao apagar utilizador: ' + error.message);
    } else {
      setProfiles(profiles.filter(p => p.id !== userId));
      alert('Perfil apagado com sucesso!');
    }
  };

  // --- AÇÕES DE EVENTOS ---
  const handleTransferEvent = async (eventId, newProducerId) => {
    if (!newProducerId) return;

    const { error } = await supabase
      .from('events')
      .update({ user_id: newProducerId })
      .eq('id', eventId);

    if (error) {
      alert('Erro ao transferir evento: ' + error.message);
    } else {
      setEvents(events.map(ev => ev.id === eventId ? { ...ev, user_id: newProducerId } : ev));
      alert('Evento transferido para o novo produtor com sucesso!');
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!confirm(`Tem certeza que deseja apagar o evento "${eventTitle}"?`)) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      alert('Erro ao apagar evento: ' + error.message);
    } else {
      setEvents(events.filter(ev => ev.id !== eventId));
      alert('Evento apagado com sucesso!');
    }
  };

  // Lista de produtores disponíveis para transferência
  const producersList = profiles.filter(p => p.role === 'producer' || p.role === 'super_admin');

  // Filtro de pesquisa rápida
  const filteredProfiles = profiles.filter(p => 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-red-500">
        A carregar controlo total de Administrador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex font-sans">
      
      {/* MENU LATERAL ADMIN */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white font-black px-3 py-1.5 rounded-xl text-lg shadow-lg shadow-red-600/30">VA</span>
            <span className="font-bold text-lg">Admin Central</span>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === 'dashboard' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              📊 Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === 'users' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              👥 Utilizadores e Permissões
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === 'events' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              🎪 Gestão de Eventos
            </button>
          </nav>
        </div>

        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/admin/login');
          }}
          className="w-full py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          Sair do Painel
        </button>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        
        {/* CABEÇALHO */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-black bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">
              Acesso Total Super Admin
            </span>
            <h1 className="text-3xl font-black mt-1">Gestão Global da Plataforma</h1>
          </div>

          <input 
            type="text" 
            placeholder="Pesquisar por nome, email ou evento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 bg-neutral-900 border border-neutral-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
          />
        </header>

        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total de Utilizadores</p>
              <h3 className="text-3xl font-black text-white mt-2">{profiles.length}</h3>
              <p className="text-[11px] text-neutral-500 mt-1">Cadastrados no sistema</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total de Produtores</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-2">
                {profiles.filter(p => p.role === 'producer').length}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">Empresas e organizadores</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total de Eventos</p>
              <h3 className="text-3xl font-black text-red-400 mt-2">{events.length}</h3>
              <p className="text-[11px] text-neutral-500 mt-1">Publicados na vitrine</p>
            </div>
          </div>
        )}

        {/* TAB 2: UTILIZADORES E PRODUTORES */}
        {activeTab === 'users' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Todos os Utilizadores ({filteredProfiles.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Nome / Empresa</th>
                    <th className="pb-3 font-semibold">E-mail</th>
                    <th className="pb-3 font-semibold">Telefone</th>
                    <th className="pb-3 font-semibold">Perfil / Cargo</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {filteredProfiles.map(profile => (
                    <tr key={profile.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 font-bold text-white">
                        {profile.company_name || profile.full_name || 'Sem nome'}
                        {profile.cpf_cnpj && <span className="block text-[10px] text-neutral-500 font-normal">Doc: {profile.cpf_cnpj}</span>}
                      </td>
                      <td className="py-4 text-neutral-300">{profile.email}</td>
                      <td className="py-4 text-neutral-400">{profile.phone || '-'}</td>
                      <td className="py-4">
                        {/* SELECT DE ALTERAÇÃO DE PERFIL / ROLE */}
                        <select
                          value={profile.role || 'customer'}
                          onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg font-bold border text-xs outline-none cursor-pointer ${
                            profile.role === 'super_admin' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                            profile.role === 'producer' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                            'bg-neutral-800 border-neutral-700 text-neutral-300'
                          }`}
                        >
                          <option value="customer" className="bg-neutral-900 text-white">👤 Participante</option>
                          <option value="producer" className="bg-neutral-900 text-white">🏢 Produtor</option>
                          <option value="super_admin" className="bg-neutral-900 text-white">👑 Super Admin</option>
                        </select>
                      </td>
                      <td className="py-4 text-right space-x-3">
                        <button 
                          onClick={() => handleDeleteUser(profile.id, profile.email)}
                          className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GESTÃO E TRANSFERÊNCIA DE EVENTOS */}
        {activeTab === 'events' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Todos os Eventos ({filteredEvents.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Evento</th>
                    <th className="pb-3 font-semibold">Data</th>
                    <th className="pb-3 font-semibold">Produtor Atual</th>
                    <th className="pb-3 font-semibold">Transferir Proprietário</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {filteredEvents.map(event => {
                    const currentOwner = profiles.find(p => p.id === event.user_id);

                    return (
                      <tr key={event.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4 font-bold text-white">
                          <Link href={`/eventos/${event.id}`} className="hover:text-red-400 transition-colors">
                            {event.title}
                          </Link>
                          <span className="block text-[10px] text-neutral-500 font-normal">{event.location || 'Sem local'}</span>
                        </td>
                        <td className="py-4 text-neutral-400">
                          {event.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-4 text-emerald-400 font-medium">
                          {currentOwner?.company_name || currentOwner?.full_name || currentOwner?.email || 'Sem proprietário'}
                        </td>
                        <td className="py-4">
                          {/* DROPDOWN PARA TRANSFERIR O EVENTO PARA OUTRO PRODUTOR */}
                          <select
                            value={event.user_id || ''}
                            onChange={(e) => handleTransferEvent(event.id, e.target.value)}
                            className="bg-neutral-950 border border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-red-500"
                          >
                            <option value="" disabled>Selecionar Produtor...</option>
                            {producersList.map(prod => (
                              <option key={prod.id} value={prod.id} className="bg-neutral-900">
                                {prod.company_name || prod.full_name || prod.email}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 text-right space-x-3">
                          <Link href={`/eventos/${event.id}`} className="text-neutral-400 hover:text-white font-semibold">Ver</Link>
                          <button 
                            onClick={() => handleDeleteEvent(event.id, event.title)}
                            className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}