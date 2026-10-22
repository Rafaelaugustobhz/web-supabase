// ajuste de suspense
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    event_type: 'esporte',
    banner_url: '',
    batch_name: '',
    is_sold_out: false
  });

  useEffect(() => {
    if (!id) return;
    async function fetchEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar evento:', error);
        alert('Erro ao carregar dados do evento.');
      } else if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          event_date: data.event_date ? data.event_date.split('T')[0] : '',
          location: data.location || '',
          event_type: data.event_type || 'esporte',
          banner_url: data.banner_url || '',
          batch_name: data.batch_name || '',
          is_sold_out: data.is_sold_out || false
        });
      }
      setLoading(false);
    }
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('events')
      .update({
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        location: formData.location,
        event_type: formData.event_type,
        banner_url: formData.banner_url,
        batch_name: formData.batch_name,
        is_sold_out: formData.is_sold_out
      })
      .eq('id', id);

    setIsSubmitting(false);

    if (error) {
      alert('Erro ao atualizar evento: ' + error.message);
      return;
    }

    alert('Evento atualizado com sucesso!');
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

      <main className="max-w-2xl w-full mx-auto px-6 py-10">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Editar Evento</h1>
            <p className="text-sm text-neutral-400">Atualize as informações do seu evento</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Título do Evento</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Descrição</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Data do Evento</label>
                <input 
                  type="date" 
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Localização</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Tipo de Evento</label>
                <select 
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Nome do Lote</label>
                <input 
                  type="text" 
                  name="batch_name"
                  value={formData.batch_name}
                  onChange={handleChange}
                  placeholder="Ex: 1º Lote VIP"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">URL do Banner</label>
              <input 
                type="url" 
                name="banner_url"
                value={formData.banner_url}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                <input 
                  type="checkbox" 
                  name="is_sold_out"
                  checked={formData.is_sold_out}
                  onChange={handleChange}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-neutral-300">
                  Marcar evento como <strong className="text-white">Esgotado</strong>
                </span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Link 
                href="/admin"
                className="w-1/2 py-4 bg-neutral-800 hover:bg-neutral-700 text-center text-white font-bold rounded-xl text-sm transition-all"
              >
                Cancelar
              </Link>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-1/2 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? 'A salvar...' : 'Salvar Alterações'}
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