'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function NovoEvento() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const producerData = {
    nome: 'KW Eventos',
    email: 'kweventos00@gmail.com',
    telefone: '(47) 99953-4242'
  };

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

  const [tickets, setTickets] = useState([
    { id: 1, name: 'Kit Básico - 1º Lote', price: '', quantity: 100, hasHalfPrice: true, requiresShirtSize: true, category: 'Geral' }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addTicket = () => setTickets([...tickets, { id: Date.now(), name: '', price: '', quantity: 100, hasHalfPrice: false, requiresShirtSize: formData.eventType === 'esporte', category: 'Geral' }]);
  const updateTicket = (id, field, value) => setTickets(tickets.map(t => t.id === id ? { ...t, [field]: value } : t));
  const removeTicket = (id) => { if(tickets.length > 1) setTickets(tickets.filter(t => t.id !== id)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isOnline = formData.eventType === 'online';

    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert([{
        title: formData.title,
        description: formData.description,
        event_date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        location: isOnline ? 'Evento 100% Digital' : formData.location,
        event_type: formData.eventType,
        rules: formData.rules,
        image_terms: formData.imageTerms,
        require_image_terms: formData.requireImageTerms,
        producer_name: producerData.nome,
        producer_email: producerData.email,
        producer_phone: producerData.telefone,
        banner_url: 'https://images.unsplash.com/photo-1541252874014-b498f395da78?q=80&w=1200'
      }])
      .select()
      .single();

    if (eventError) {
      alert(`Erro ao criar evento: ${eventError.message}`);
      setIsSubmitting(false);
      return;
    }

    if (newEvent && tickets.length > 0) {
      const ticketsToInsert = tickets.map(t => ({
        event_id: newEvent.id,
        name: t.name,
        price: parseFloat(t.price) || 0,
        quantity: parseInt(t.quantity) || 0,
        has_half_price: t.hasHalfPrice,
        requires_shirt_size: t.requiresShirtSize,
        category: t.category
      }));
      
      const { error: ticketsError } = await supabase.from('tickets').insert(ticketsToInsert);
      if (ticketsError) {
        alert(`Erro ao salvar os ingressos: ${ticketsError.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    alert('Evento e ingressos publicados com sucesso!');
    router.push('/admin');
  };

  const isOnline = formData.eventType === 'online';

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 lg:px-10 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center">←</Link>
          <h1 className="text-xl font-bold">Criar Novo Evento</h1>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm">
          {isSubmitting ? 'A guardar...' : 'Publicar Evento'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
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

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-lg font-bold">Inscrições / Ingressos disponíveis</h2>
              <button type="button" onClick={addTicket} className="text-emerald-400 text-sm font-bold hover:underline">+ Adicionar Ingresso</button>
            </div>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-neutral-500 mb-1">Nome/Categoria (Ex: Kit 8km, Camarote)</label>
                      <input type="text" value={ticket.name} onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" required />
                    </div>
                    <div className="w-full md:w-28">
                      <label className="block text-xs text-neutral-500 mb-1">Preço (R$)</label>
                      <input type="number" step="0.01" value={ticket.price} onChange={(e) => updateTicket(ticket.id, 'price', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" required />
                    </div>
                    <div className="w-full md:w-28">
                      <label className="block text-xs text-neutral-500 mb-1">Qtd. Vagas</label>
                      <input type="number" value={ticket.quantity} onChange={(e) => updateTicket(ticket.id, 'quantity', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" required />
                    </div>
                    <button type="button" onClick={() => removeTicket(ticket.id)} className="h-10 px-3 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold">X</button>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 pt-2 border-t border-neutral-800 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                      <input type="checkbox" checked={ticket.hasHalfPrice} onChange={(e) => updateTicket(ticket.id, 'hasHalfPrice', e.target.checked)} className="w-4 h-4 accent-emerald-500" /> 
                      Gerar opção de Meia-Entrada (-50%)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                      <input type="checkbox" checked={ticket.requiresShirtSize} onChange={(e) => updateTicket(ticket.id, 'requiresShirtSize', e.target.checked)} className="w-4 h-4 accent-emerald-500" /> 
                      Pedir Tamanho de Camisa (Kit Esportivo)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h2 className="text-lg font-bold border-b border-neutral-800 pb-4">Regulamento e Termos</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Texto do Regulamento Geral</label>
              <textarea name="rules" value={formData.rules} onChange={handleChange} rows="4" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white resize-none"></textarea>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}