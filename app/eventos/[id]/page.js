'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function EventoDetalhes() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_cpf: '',
    buyer_email: '',
    birth_date: '',
    gender: 'Masculino',
    shirt_size: 'M',
    team_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', id).single();
      const { data: ticketsData } = await supabase.from('ticket_types').select('*').eq('event_id', id);

      setEvent(eventData);
      setTicketTypes(ticketsData || []);
      if (ticketsData && ticketsData.length > 0) {
        setSelectedTicket(ticketsData[0]);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  // Função atualizada para enviar os dados e redirecionar direto para o PIX
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          ...formData,
          total_amount: selectedTicket.price,
          status: 'pending_pix',
        }
      ])
      .select()
      .single();

    if (!error && data) {
      window.location.href = `/confirmacao/${data.id}`;
    } else {
      alert('Erro ao registrar inscrição: ' + (error?.message || 'Tente novamente'));
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white p-12 text-center">Carregando dados da prova...</div>;
  if (!event) return <div className="min-h-screen bg-neutral-950 text-white p-12 text-center">Evento não encontrado.</div>;

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-neutral-400 hover:text-white mb-6 inline-block">← Voltar para todos os eventos</Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden mb-8">
          <img src={event.banner_url} alt={event.title} className="w-full h-64 object-cover" />
          <div className="p-6">
            <h1 className="text-3xl font-extrabold mb-2">{event.title}</h1>
            <p className="text-neutral-400 mb-4">📍 {event.location} | 📅 {new Date(event.event_date).toLocaleDateString('pt-BR')}</p>
            <p className="text-neutral-300 leading-relaxed">{event.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-emerald-400 border-b border-neutral-800 pb-3">1. Selecione a Modalidade / Distância</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                  selectedTicket?.id === ticket.id
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div>
                  <p className="font-bold">{ticket.name}</p>
                  <p className="text-xs text-neutral-400">Vagas disponíveis: {ticket.total_quantity - ticket.sold_quantity}</p>
                </div>
                <p className="font-bold text-emerald-400">R$ {Number(ticket.price).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-emerald-400 border-b border-neutral-800 pb-3 pt-4">2. Ficha de Inscrição do Atleta</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.buyer_name}
                onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">CPF *</label>
              <input
                type="text"
                required
                value={formData.buyer_cpf}
                onChange={(e) => setFormData({...formData, buyer_cpf: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">E-mail *</label>
              <input
                type="email"
                required
                value={formData.buyer_email}
                onChange={(e) => setFormData({...formData, buyer_email: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Data de Nascimento *</label>
              <input
                type="date"
                required
                value={formData.birth_date}
                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Gênero *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Tamanho da Camiseta *</label>
              <select
                value={formData.shirt_size}
                onChange={(e) => setFormData({...formData, shirt_size: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
                <option value="Baby Look P">Baby Look P</option>
                <option value="Baby Look M">Baby Look M</option>
                <option value="Baby Look G">Baby Look G</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Assessoria / Equipe (Opcional)</label>
              <input
                type="text"
                value={formData.team_name}
                onChange={(e) => setFormData({...formData, team_name: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Contato de Emergência (Nome) *</label>
              <input
                type="text"
                required
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-neutral-300">Telefone de Emergência *</label>
              <input
                type="text"
                required
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-neutral-400">Total a Pagar:</p>
              <p className="text-3xl font-extrabold text-emerald-400">
                R$ {selectedTicket ? Number(selectedTicket.price).toFixed(2) : '0,00'}
              </p>
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 px-8 rounded-xl transition"
            >
              Ir para Pagamento (PIX)
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}