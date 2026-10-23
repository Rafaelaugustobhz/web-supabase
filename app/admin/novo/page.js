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
  
  // No futuro, os dados do produtor virão da sessão (auth)
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
    thumbnailUrl: '',
    bannerUrl: '',
    documentUrl: '',
    batchName: '1º Lote'
  });

  const [tickets, setTickets] = useState([
    { id: 1, name: 'Ingresso Padrão', price: '', quantity: 100, hasHalfPrice: false, requiresShirtSize: false }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addTicket = () => setTickets([...tickets, { id: Date.now(), name: '', price: '', quantity: 100, hasHalfPrice: false, requiresShirtSize: formData.eventType === 'esporte' }]);
  const updateTicket = (id, field, value) => setTickets(tickets.map(t => t.id === id ? { ...t, [field]: value } : t));
  const removeTicket = (id) => { if(tickets.length > 1) setTickets(tickets.filter(t => t.id !== id)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isOnline = formData.eventType === 'online';

    // 1. Criar Evento
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert([{
        title: formData.title,
        description: formData.description,
        event_date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        location: isOnline ? 'Evento 100% Digital' : formData.location,
        event_type: formData.eventType,
        rules: formData.rules,
        producer_name: producerData.nome,
        producer_email: producerData.email,
        producer_phone: producerData.telefone,
        thumbnail_url: formData.thumbnailUrl,
        banner_url: formData.bannerUrl,
        document_url: formData.documentUrl,
        batch_name: formData.batchName,
        is_sold_out: false
      }])
      .select()
      .single();

    if (eventError) {
      alert(`Erro ao criar evento: ${eventError.message}`);
      setIsSubmitting(false);
      return;
    }

    // 2. Criar Ingressos do Evento
    if (newEvent && tickets.length > 0) {
      const ticketsToInsert = tickets.map(t => ({
        event_id: newEvent.id,
        name: t.name,
        price: parseFloat(t.price) || 0,
        quantity: parseInt(t.quantity) || 0,
        has_half_price: t.hasHalfPrice,
        requires_shirt_size: t.requiresShirtSize,
        category: 'Geral'
      }));
      
      const { error: ticketsError } = await supabase.from('tickets').insert(ticketsToInsert);
      if (ticketsError) {
        alert(`Aviso: O evento foi criado, mas ocorreu um erro ao salvar os ingressos: ${ticketsError.message}`);
      }
    }

    setIsSubmitting(false);
    alert('Evento e ingressos publicados com sucesso!');
    router.push('/admin');
  };

  const isOnline = formData.eventType === 'online';

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20">
      
      {/* CABEÇALHO */}
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 lg:px-10 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center transition-colors">←</Link>
          <h1 className="text-xl font-bold">Criar Novo Evento</h1>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
          {isSubmitting ? 'A guardar...' : 'Publicar Evento'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          {/* INFORMAÇÕES BÁSICAS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold border-b border-neutral-800 pb-4 text-emerald-400">1. Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Nome do Evento *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Maratona de Itapema 2026" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Categoria *</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none">
                  <option value="esporte">🏃 Esportes e Corridas</option>
                  <option value="show">🎵 Festas e Shows</option>
                  <option value="online">💻 Eventos Online</option>
                  <option value="congresso">🏛️ Congressos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Data do Evento *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none" required />
              </div>
            </div>

            {!isOnline && (
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Localização Física *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Ginásio Municipal de Porto Belo, SC" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none" required={!isOnline} />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Descrição Detalhada *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Descreva os detalhes incríveis do seu evento..." className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white resize-none outline-none" required></textarea>
            </div>
          </div>

          {/* MÍDIA E DOCUMENTOS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
             <h2 className="text-lg font-bold border-b border-neutral-800 pb-4 text-emerald-400">2. Imagens e Documentos</h2>
             
             <div className="space-y-6">
               <div>
                 <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Link da Miniatura (Card) *</label>
                 <p className="text-[10px] text-neutral-500 mb-2">Imagem quadrada para aparecer na página principal de busca.</p>
                 <input type="url" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="https://exemplo.com/miniatura.jpg" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none" required />
               </div>

               <div>
                 <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Link do Banner (Capa) *</label>
                 <p className="text-[10px] text-neutral-500 mb-2">Imagem retangular grande para aparecer no topo da página de detalhes do evento.</p>
                 <input type="url" name="bannerUrl" value={formData.bannerUrl} onChange={handleChange} placeholder="https://exemplo.com/capa_gigante.jpg" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none" required />
               </div>

               <div>
                 <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Link de Documentos (Opcional)</label>
                 <p className="text-[10px] text-neutral-500 mb-2">Link do Google Drive com Regulamentos, Percursos ou Termos de Responsabilidade em PDF.</p>
                 <input type="url" name="documentUrl" value={formData.documentUrl} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none" />
               </div>
             </div>
          </div>

          {/* INGRESSOS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
              <h2 className="text-lg font-bold text-emerald-400">3. Inscrições e Lotes</h2>
              <div className="flex gap-3 items-center">
                 <input type="text" name="batchName" value={formData.batchName} onChange={handleChange} placeholder="Nome do Lote Geral" className="bg-neutral-950 border border-neutral-800 focus:border-emerald-500 text-xs px-3 py-2 rounded-lg text-white outline-none" />
                 <button type="button" onClick={addTicket} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">+ Novo Ingresso</button>
              </div>
            </div>
            
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <div key={ticket.id} className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl flex flex-col gap-5 relative">
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-neutral-600">INGRESSO #{index + 1}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-6">
                      <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Nome / Categoria</label>
                      <input type="text" value={ticket.name} onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)} placeholder="Ex: Kit Premium" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500" required />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Preço (R$)</label>
                      <input type="number" step="0.01" min="0" value={ticket.price} onChange={(e) => updateTicket(ticket.id, 'price', e.target.value)} placeholder="0.00" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Vagas</label>
                      <input type="number" min="1" value={ticket.quantity} onChange={(e) => updateTicket(ticket.id, 'quantity', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500" required />
                    </div>
                    <div className="md:col-span-1 flex justify-end md:mt-6">
                      <button type="button" onClick={() => removeTicket(ticket.id)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-lg font-bold transition-colors">✕</button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 pt-3 border-t border-neutral-800/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={ticket.hasHalfPrice} onChange={(e) => updateTicket(ticket.id, 'hasHalfPrice', e.target.checked)} className="w-4 h-4 accent-emerald-500" /> 
                      <span className="text-xs text-neutral-400 font-medium">Permite Meia-Entrada</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={ticket.requiresShirtSize} onChange={(e) => updateTicket(ticket.id, 'requiresShirtSize', e.target.checked)} className="w-4 h-4 accent-emerald-500" /> 
                      <span className="text-xs text-neutral-400 font-medium">Exigir Tamanho de Camisa</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TERMOS E REGULAMENTO */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold border-b border-neutral-800 pb-4 text-emerald-400">4. Informações Legais</h2>
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Regulamento ou Termos (Opcional)</label>
              <p className="text-[10px] text-neutral-500 mb-2">Escreva avisos breves, restrições de idade ou políticas de reembolso.</p>
              <textarea name="rules" value={formData.rules} onChange={handleChange} rows="4" className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white resize-none outline-none"></textarea>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}