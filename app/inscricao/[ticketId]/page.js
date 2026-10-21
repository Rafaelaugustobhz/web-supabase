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
    name: '',
    email: ''
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

    // Cria o pedido na tabela orders do Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ticket_id: ticketId,
        buyer_name: formData.name,
        buyer_email: formData.email,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      alert('Erro ao gerar inscrição: ' + error.message);
      setSubmitting(false);
      return;
    }

    // Redireciona para a tela do PIX que já está pronta
    router.push(`/confirmacao/${data.id}`);
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">A carregar formulário...</div>;
  }

  if (!ticket) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center text-red-500">Ingresso não encontrado.</div>;
  }

  const nomeModalidade = ticket.name || ticket.title || ticket.modalidade || ticket.category_name || ticket.type || 'Inscrição Individual';

  return (
    <main className="min-h-screen bg-black text-white p-4 flex justify-center items-center">
      <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl">
        <h1 className="text-2xl font-extrabold mb-2">Finalizar Inscrição</h1>
        <p className="text-sm text-neutral-400 mb-6">
          A adquirir: <strong className="text-emerald-400">{nomeModalidade}</strong> por R$ {Number(ticket.price).toFixed(2)}
        </p>

        <form onSubmit={handleFinalizar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-neutral-300">Nome Completo</label>
            <input 
              required 
              type="text" 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none transition"
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="Introduza o seu nome"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-neutral-300">E-mail</label>
            <input 
              required 
              type="email" 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none transition"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="Introduza o seu e-mail principal"
            />
          </div>

          <button 
            disabled={submitting} 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-xl transition text-sm mt-4 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
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