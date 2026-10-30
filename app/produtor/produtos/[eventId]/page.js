'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function ProdutosLojaContent() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    image_url: ''
  });

  useEffect(() => {
    async function fetchData() {
      if (!eventId) return;

      // 1. Buscar dados do evento
      const { data: eventData } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single();
      
      if (eventData) setEvent(eventData);

      // 2. Buscar produtos extras já cadastrados para este evento
      const { data: productsData } = await supabase
        .from('event_products')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (productsData) setProducts(productsData);
      setLoading(false);
    }
    fetchData();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('event_products')
      .insert([{
        event_id: eventId,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        image_url: formData.image_url || null
      }])
      .select()
      .single();

    if (error) {
      alert('Erro ao cadastrar produto: ' + error.message);
    } else {
      setProducts([data, ...products]);
      setFormData({ name: '', price: '', stock_quantity: '', image_url: '' });
      alert('Produto adicionado à loja com sucesso!');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto da loja?')) return;

    const { error } = await supabase
      .from('event_products')
      .delete()
      .eq('id', id);

    if (!error) {
      setProducts(products.filter(p => p.id !== id));
      alert('Produto excluído.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* MENU LATERAL */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
            <span className="font-bold text-lg">VipAcesso Pro</span>
          </div>
          <nav className="space-y-1">
            <Link href="/admin" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dashboard</Link>
            <Link href="/admin/empresa" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Dados da Empresa</Link>
            <Link href="/admin/cupons" className="block px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm">Cupons de Desconto</Link>
          </nav>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
              <Link href="/admin" className="hover:text-emerald-400">Dashboard</Link> <span>/</span> <span>Loja de Produtos Extras</span>
            </div>
            <h1 className="text-2xl font-black">Loja Oficial: {event?.title || 'A carregar...'}</h1>
            <p className="text-sm text-neutral-400 mt-1">Cadastre acessórios, óculos, bonés ou camisas extras para venda casada no checkout.</p>
          </div>
          <Link href="/admin" className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-sm transition-colors">
            ← Voltar ao Painel
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULÁRIO DE CADASTRO */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold mb-4 text-emerald-400">Novo Item na Loja</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Nome do Produto *</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="Ex: Óculos de Sol Oficial / Boné Trucker" 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Preço (R$) *</label>
                <input 
                  type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required
                  placeholder="49.90" 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Stock Disponível *</label>
                <input 
                  type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required
                  placeholder="150" 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">URL da Imagem (Opcional)</label>
                <input 
                  type="url" name="image_url" value={formData.image_url} onChange={handleChange}
                  placeholder="https://exemplo.com/foto.jpg" 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'A guardar...' : 'Adicionar à Loja'}
              </button>
            </form>
          </div>

          {/* LISTA DE PRODUTOS CADASTRADOS */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Itens à Venda na Loja do Evento</h2>
            
            {loading ? (
              <p className="text-neutral-500 text-sm py-8 text-center animate-pulse">A carregar produtos...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-12 space-y-2 bg-neutral-950 rounded-xl border border-neutral-800 border-dashed">
                <p className="text-neutral-400 text-sm">Nenhum produto extra cadastrado para este evento.</p>
                <p className="text-xs text-neutral-500">Adicione bonés, óculos ou acessórios para aumentar o ticket médio das vendas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm">{product.name}</h3>
                        <p className="text-emerald-400 font-black text-base mt-1">
                          {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full font-semibold">
                        Stock: {product.stock_quantity} un.
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-neutral-900">
                      <span className="text-[11px] text-neutral-500">ID: {product.id.slice(0, 8)}...</span>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function ProdutosLojaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">A carregar...</div>}>
      <ProdutosLojaContent />
    </Suspense>
  );
}