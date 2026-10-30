'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function EditarEventoContent() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para os dados do evento com max_installments incluído
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    event_type: 'esporte',
    banner_url: '',
    batch_name: '',
    is_sold_out: false,
    max_installments: '12'
  });

  // Estado para os bilhetes
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!id) return;
    async function fetchEventAndTickets() {
      const [eventRes, ticketsRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('tickets').select('*').eq('event_id', id)
      ]);

      if (eventRes.error) {
        console.error('Erro ao buscar evento:', eventRes.error);
        alert('Erro ao carregar dados do evento.');
      } else if (eventRes.data) {
        setFormData({
          title: eventRes.data.title || '',
          description: eventRes.data.description || '',
          event_date: eventRes.data.event_date ? eventRes.data.event_date.split('T')[0] : '',
          location: eventRes.data.location || '',
          event_type: eventRes.data.event_type || 'esporte',
          banner_url: eventRes.data.banner_url || '',
          batch_name: eventRes.data.batch_name || '',
          is_sold_out: eventRes.data.is_sold_out || false,
          max_installments: eventRes.data.max_installments || '12'
        });
      }

      if (ticketsRes.error) {
        console.error('Erro ao buscar bilhetes:', ticketsRes.error);
      } else if (ticketsRes.data) {
        setTickets(ticketsRes.data);
      }

      setLoading(false);
    }
    fetchEventAndTickets();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTicketChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedTickets = [...tickets];
    updatedTickets[index][name] = type === 'checkbox' ? checked : value;
    setTickets(updatedTickets);
  };

  const addTicket = () => {
    setTickets([
      ...tickets,
      { name: '', price: '', quantity: '', has_half_price: false, requires_shirt_size: false }
    ]);
  };

  const removeTicket = async (index) => {
    const ticketToRemove = tickets[index];

    if (ticketToRemove.id) {
       const confirmDelete = window.confirm("Tem a certeza que deseja eliminar este bilhete? Esta ação é irreversível.");
       if (!confirmDelete) return;

       const { error } = await supabase.from('tickets').delete().eq('id', ticketToRemove.id);
       if (error) {
            alert("Erro ao eliminar bilhete na base de dados: " + error.message);
            return;
       }
    }

    const updatedTickets = tickets.filter((_, i) => i !== index);
    setTickets(updatedTickets);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Atualizar os dados do Evento incluindo max_installments
    const { error: eventError } = await supabase
      .from('events')
      .update({
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        location: formData.location,
        event_type: formData.event_type,
        banner_url: formData.banner_url,
        batch_name: formData.batch_name,
        is_sold_out: formData.is_sold_out,
        max_installments: formData.max_installments
      })
      .eq('id', id);

    if (eventError) {
      alert('Erro ao atualizar evento: ' + eventError.message);
      setIsSubmitting(false);
      return;
    }

    // 2. Guardar/Atualizar Bilhetes
    const newTickets = tickets.filter(t => !t.id).map(t => ({
        ...t,
        event_id: id,
        price: parseFloat(t.price),
        quantity: parseInt(t.quantity)
    }));
    
    const existingTickets = tickets.filter(t => t.id).map(t => ({
        ...t,
        price: parseFloat(t.price),
        quantity: parseInt(t.quantity)
    }));

    if (newTickets.length > 0) {
        const { error: insertError } = await supabase.from('tickets').insert(newTickets);
        if (insertError) {
             console.error("Erro ao inserir novos bilhetes:", insertError);
             alert("Aviso: O evento foi atualizado, mas ocorreu um erro ao adicionar novos bilhetes.");
        }
    }

    for (const ticket of existingTickets) {
        const { error: updateError } = await supabase
            .from('tickets')
            .update({
                name: ticket.name,
                price: ticket.price,
                quantity: ticket.quantity,
                has_half_price: ticket.has_half_price,
                requires_shirt_size: ticket.requires_shirt_size
            })
            .eq('id', ticket.id);
        
        if (updateError) {
             console.error(`Erro ao atualizar bilhete ${ticket.id}:`, updateError);
        }
    }

    setIsSubmitting(false);
    alert('Evento e bilhetes atualizados com sucesso!');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">A carregar dados do evento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center px-6 lg:px-10">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold text-lg">Painel do Produtor - Editar Evento</span>
        </Link>
      </header>

      <main className="max-w-3xl w-full mx-auto px-6 py-10">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Editar Evento</h1>
            <p className="text-sm text-neutral-400">Atualize as informações do seu evento e os ingressos disponíveis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECÇÃO: DADOS DO EVENTO */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b border-neutral-800 pb-2 text-emerald-400">Informações Gerais</h2>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Título do Evento</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleChange} required 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Descrição</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleChange} rows="4" required 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Data do Evento</label>
                  <input 
                    type="date" name="event_date" value={formData.event_date} onChange={handleChange} required 
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Localização</label>
                  <input 
                    type="text" name="location" value={formData.location} onChange={handleChange} required 
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Tipo de Evento</label>
                  <select 
                    name="event_type" value={formData.event_type} onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="esporte">Esporte</option>
                    <option value="show">Festas e Shows</option>
                    <option value="online">Eventos Online</option>
                    <option value="congresso">Congressos e Palestras</option>
                    <option value="curso">Cursos e Workshops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Nome do Lote Atual</label>
                  <input 
                    type="text" name="batch_name" value={formData.batch_name} onChange={handleChange} placeholder="Ex: 1º Lote VIP"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Máximo de Parcelas</label>
                  <select 
                    name="max_installments" value={formData.max_installments} onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="1">À vista (1x)</option>
                    <option value="3">Até 3x sem juros</option>
                    <option value="6">Até 6x</option>
                    <option value="10">Até 10x</option>
                    <option value="12">Até 12x</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">URL do Banner</label>
                <input 
                  type="url" name="banner_url" value={formData.banner_url} onChange={handleChange} placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-emerald-500 transition-colors">
                  <input 
                    type="checkbox" name="is_sold_out" checked={formData.is_sold_out} onChange={handleChange}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-neutral-300">
                    Marcar evento como <strong className="text-white">Esgotado</strong> (Bloqueia novas vendas)
                  </span>
                </label>
              </div>
            </div>

            {/* SECÇÃO: GESTÃO DE INGRESSOS */}
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h2 className="text-lg font-bold text-emerald-400">Tipos de Ingressos</h2>
                <button 
                  type="button" 
                  onClick={addTicket}
                  className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Adicionar Ingresso
                </button>
              </div>

              {tickets.length === 0 ? (
                <p className="text-center text-neutral-500 text-sm py-4">Nenhum ingresso configurado para este evento.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket, index) => (
                    <div key={index} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 relative">
                      <button 
                        type="button" 
                        onClick={() => removeTicket(index)}
                        className="absolute top-4 right-4 text-neutral-500 hover:text-red-500 font-bold text-sm transition-colors"
                        title="Remover Ingresso"
                      >
                        ✕
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Nome do Ingresso</label>
                          <input 
                            type="text" name="name" value={ticket.name} onChange={(e) => handleTicketChange(index, e)} placeholder="Ex: Pista, Camarote" required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Preço (R$)</label>
                          <input 
                            type="number" step="0.01" min="0" name="price" value={ticket.price} onChange={(e) => handleTicketChange(index, e)} placeholder="0.00" required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Quantidade Disp.</label>
                          <input 
                            type="number" min="0" name="quantity" value={ticket.quantity} onChange={(e) => handleTicketChange(index, e)} placeholder="Ex: 100" required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 border-t border-neutral-800 pt-3">
                         <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="checkbox" name="has_half_price" checked={ticket.has_half_price} onChange={(e) => handleTicketChange(index, e)}
                             className="accent-emerald-500"
                           />
                           <span className="text-xs text-neutral-400">Oferece Meia-Entrada</span>
                         </label>
                         
                         <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="checkbox" name="requires_shirt_size" checked={ticket.requires_shirt_size} onChange={(e) => handleTicketChange(index, e)}
                             className="accent-emerald-500"
                           />
                           <span className="text-xs text-neutral-400">Exige Tamanho de Camisa (Kits)</span>
                         </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex gap-4 pt-6 border-t border-neutral-800">
              <Link 
                href="/admin"
                className="w-1/3 py-4 bg-neutral-800 hover:bg-neutral-700 text-center text-white font-bold rounded-xl text-sm transition-all"
              >
                Cancelar
              </Link>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-2/3 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? 'A salvar alterações...' : 'Salvar Evento e Ingressos'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 py-6 text-center text-neutral-500 text-xs">
        <p>© {new Date().getFullYear()} VipAcesso - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default function EditarEventoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-bold">A carregar editor...</div>}>
      <EditarEventoContent />
    </Suspense>
  );
}