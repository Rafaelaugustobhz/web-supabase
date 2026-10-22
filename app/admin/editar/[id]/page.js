'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EditarEvento() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'esporte',
    date: '',
    location: '',
    description: '',
    rules: '',
    imageTerms: '',
    requireImageTerms: true,
  });

  // Estado para os ingressos do evento
  const [tickets, setTickets] = useState([]);

  // Carrega os dados do evento e os ingressos associados
  useEffect(() => {
    async function fetchEventData() {
      if (!id) return;
      
      const [eventRes, ticketsRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('tickets').select('*').eq('event_id', id)
      ]);

      if (eventRes.error) {
        alert('Erro ao carregar dados do evento.');
        router.push('/admin');
      } else if (eventRes.data) {
        const ev = eventRes.data;
        setFormData({
          title: ev.title || '',
          eventType: ev.event_type || 'esporte',
          date: ev.event_date ? ev.event_date.split('T')[0] : '',
          location: ev.location || '',
          description: ev.description || '',
          rules: ev.rules || '',
          imageTerms: ev.image_terms || '',
          requireImageTerms: ev.require_image_terms ?? true,
        });
      }

      if (ticketsRes.data) {
        setTickets(ticketsRes.data.map(t => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quantity: t.quantity || 100,
          hasHalfPrice: t.has_half_price || false,
          category: t.category || 'Geral'
        })));
      }

      setLoading(false);
    }
    fetchEventData();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addTicket = () => setTickets([...tickets, { id: Date.now(), name: '', price: '', quantity: 100, hasHalfPrice: false, category: 'Geral' }]);
  const updateTicket = (ticketId, field, value) => setTickets(tickets.map(t => t.id === ticketId ? { ...t, [field]: value } : t));
  const removeTicket = (ticketId) => { if(tickets.length > 1) setTickets(tickets.filter(t => t.id !== ticketId)); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isOnline = formData.eventType === 'online';

    // 1. Atualiza as informações principais do evento
    const { error: eventError } = await supabase
      .from('events')
      .update({
        title: formData.title,
        description: formData.description,
        event_date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        location: isOnline ? 'Evento 100% Digital' : formData.location,
        event_type: formData.eventType,
        is_online: isOnline,
        rules: formData.rules,
        image_terms: formData.imageTerms,
        require_image_terms: formData.requireImageTerms,
      })
      .eq('id', id);

    if (eventError) {
      alert('Erro ao atualizar o evento: ' + eventError.message);
      setIsSubmitting(false);
      return;
    }

    // 2. Atualiza os ingressos: estratégia limpa de apagar os antigos e inserir os atuais atualizados
    await supabase.from('tickets').delete().eq('event_id', id);

    if (tickets.length > 0) {
      const ticketsToInsert = tickets.map(t => ({
        event_id: id,
        name: t.name,
        price: parseFloat(t.price) || 0,
        quantity: parseInt(t.quantity) || 0,
        has_half_price: t.hasHalfPrice,
        category: t.category
      }));

      const { error: ticketsError } = await supabase.from('tickets').insert(ticketsToInsert);
      if (ticketsError) {
        alert('Evento atualizado, mas houve erro ao salvar os ingressos: ' + ticketsError.message);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    alert('Evento e ingressos atualizados com sucesso!');
    router.push('/admin');
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold">A carregar dados para edição...</div>;
  }

  const isOnline = formData.eventType === 'online';

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 lg:px-10 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center">←</Link>
          <h1 className="text-xl font-bold">Editar Evento</h1>
        </div>
        <button onClick={handleUpdate} disabled={isSubmitting} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm">
          {isSubmitting ? 'A guardar...' : 'Salvar Alterações'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <form className="space-y-8" onSubmit={handleUpdate}>
          
          {/* INFORMAÇÕES BÁSICAS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h2 className="text-lg font-bold border-b border-neutral-800 pb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-400 mb-2">Nome do Evento *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Categoria *</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white">
                  <option value="esporte">🏃 Esportes e Corridas</option>
                  <option value="show">🎵 Festas e Shows</option>
                  <option value="online">💻 Eventos Online</option>
                  <option value="congresso">🏛️ Congressos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Data do Evento *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white" required />
              </div>
            </div>
            {!isOnline && (
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Localização *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white" required={!isOnline} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Descrição Detalhada *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white resize-none" required></textarea>
            </div>
          </div>

          {/* INGRESSOS E QUANTIDADES */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-lg font-bold">Inscrições / Ingressos disponíveis</h2>
              <button type="button" onClick={addTicket} className="text-emerald-400 text-sm font-bold hover:underline">+ Adicionar Ingresso</button>
            </div>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-neutral-500 mb-1">Nome/Categoria</label>
                    <input type="text" value={ticket.name} onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500" required />
                  </div>
                  <div className="w-full md:w-28">
                    <label className="block text-xs text-neutral-500 mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" value={ticket.price} onChange={(e) => updateTicket(ticket.id, 'price', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500" required />
                  </div>
                  <div className="w-full md:w-28">
                    <label className="block text-xs text-neutral-500 mb-1">Qtd. Vagas</label>
                    <input type="number" value={ticket.quantity} onChange={(e) => updateTicket(ticket.id, 'quantity', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500" required />
                  </div>
                  <div className="w-full md:w-36 flex items-center h-10">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-300">
                      <input type="checkbox" checked={ticket.hasHalfPrice} onChange={(e) => updateTicket(ticket.id, 'hasHalfPrice', e.target.checked)} className="w-4 h-4 accent-emerald-500" /> Meia-Entrada
                    </label>
                  </div>
                  <button type="button" onClick={() => removeTicket(ticket.id)} className="h-10 px-3 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold">X</button>
                </div>
              ))}
            </div>
          </div>

          {/* REGULAMENTO E TERMOS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h2 className="text-lg font-bold border-b border-neutral-800 pb-4">Regulamento e Termos para o Comprador</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Texto do Regulamento Geral</label>
              <textarea name="rules" value={formData.rules} onChange={handleChange} rows="4" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white resize-none"></textarea>
            </div>
            <div className="pt-4 border-t border-neutral-800">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-neutral-950 rounded-xl border border-neutral-800 mb-4">
                <input type="checkbox" name="requireImageTerms" checked={formData.requireImageTerms} onChange={handleChange} className="w-5 h-5 accent-emerald-500" />
                <span className="text-sm font-medium">Exigir aceite do Termo de Uso de Imagem e Comunicação no Checkout</span>
              </label>
              {formData.requireImageTerms && (
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Texto do Termo de Uso de Imagem (Opcional)</label>
                  <textarea name="imageTerms" value={formData.imageTerms} onChange={handleChange} rows="3" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white resize-none text-sm"></textarea>
                </div>
              )}
            </div>
          </div>

          {/* MÍDIAS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold border-b border-neutral-800 pb-4">Mídias do Evento</h2>
            <div className="w-full h-32 bg-neutral-950 border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all text-center">
              <span className="text-2xl mb-1">📸</span>
              <p className="text-sm font-semibold text-neutral-400">Banner Principal</p>
              <p className="text-xs text-neutral-600 mt-1">1200 x 600px recomendado</p>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}