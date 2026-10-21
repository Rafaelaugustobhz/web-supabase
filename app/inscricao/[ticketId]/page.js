'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams, useRouter } from 'next/navigation';

function InscricaoContent() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_cpf: '',
    buyer_phone: '',
    birth_date: '',
    gender: '',
    shirt_size: '',
    team_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  useEffect(() => {
    if (!ticketId) return;

    async function loadTicket() {
      const { data } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (data) setTicket(data);
      setLoading(false);
    }

    loadTicket();
  }, [ticketId]);

  async function handleFinalizar(e) {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ticket_id: ticketId,
        buyer_name: formData.buyer_name,
        buyer_email: formData.buyer_email,
        buyer_cpf: formData.buyer_cpf,
        buyer_phone: formData.buyer_phone,
        birth_date: formData.birth_date,
        gender: formData.gender,
        shirt_size: formData.shirt_size,
        team_name: formData.team_name,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        total_amount: ticket.price,
        status: 'pending_pix'
      }])
      .select()
      .single();

    if (error) {
      alert('Erro ao guardar inscrição: ' + error.message);
      setSubmitting(false);
      return;
    }

    router.push(`/confirmacao/${data.id}`);
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">A carregar formulário...</div>;
  }

  if (!ticket) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center text-red-500">Ingresso não encontrado.</div>;
  }

  const nomeModalidade = ticket.name || ticket.title || ticket.category_name || 'Inscrição Individual';

  return (
    <main className="min-h-screen bg-black text-white p-4 flex justify-center items-center py-12">
      <div className="max-w-2xl w-full bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl">
        <h1 className="text-2xl font-extrabold mb-2">Dados do Atleta</h1>
        <p className="text-sm text-neutral-400 mb-8 pb-4 border-b border-neutral-800">
          A adquirir: <strong className="text-emerald-400">{nomeModalidade}</strong> por R$ {Number(ticket.price).toFixed(2)}
        </p>

        <form onSubmit={handleFinalizar} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-emerald-500 font-bold text-sm uppercase tracking-wider">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1 text-neutral-300">Nome Completo</label>
                <input required type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none" value={formData.buyer_name} onChange={e => setFormData({...formData, buyer_name: e.target.value})} placeholder="Nome completo" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">E-mail</label>
                <input required type="email" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none" value={formData.buyer_email} onChange={e => setFormData({...formData, buyer_email: e.target.value})} placeholder="O seu melhor e-mail" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">CPF</label>
                <input required type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none" value={formData.buyer_cpf} onChange={e => setFormData({...formData, buyer_cpf: e.target.value})} placeholder="Apenas números" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Telemóvel / WhatsApp</label>
                <input required type="tel" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none" value={formData.buyer_phone} onChange={e => setFormData({...formData, buyer_phone: e.target.value})} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Data de Nascimento</label>
                <input required type="date" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none text-neutral-300" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Género</label>
                <select required className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none text-neutral-300" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h2 className="text-emerald-500 font-bold text-sm uppercase tracking-wider">Logística da Prova</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Tamanho da Camisa</label>
                <select required className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none text-neutral-300" value={formData.shirt_size} onChange={e => setFormData({...formData, shirt_size: e.target.value})}>
                  <option value="">Selecione</option>
                  <option value="PP">PP</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                  <option value="XG">XG</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Equipa / Assessoria</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none" value={formData.team_name} onChange={e => setFormData({...formData, team_name: e.target.value})} placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Nome de Contacto de Emergência</label>
                <input required type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} placeholder="Nome do familiar/amigo" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Telefone de Emergência</label>
                <input required type="tel" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none" value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} placeholder="(00) 00000-0000" />
              </div>
            </div>
          </div>

          <button disabled={submitting} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-xl transition text-sm mt-8 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
            {submitting ? 'A processar...' : 'Ir para Pagamento (PIX)'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function InscricaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando...</div>}>
      <InscricaoContent />
    </Suspense>
  );
}