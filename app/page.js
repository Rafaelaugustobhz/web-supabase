'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  // Lógica de filtragem
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = event.title?.toLowerCase().includes(searchLower);
    const typeMatch = event.event_type?.toLowerCase().includes(searchLower);
    const locationMatch = event.location?.toLowerCase().includes(searchLower);
    return titleMatch || typeMatch || locationMatch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      
      {/* CABEÇALHO / HEADER CORRIGIDO */}
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50 transition-all">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg shadow-lg shadow-emerald-500/20">VA</span>
          <span className="font-bold text-lg hidden sm:block tracking-wide">VipAcesso</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-neutral-300 hover:text-emerald-400 transition-colors px-4 py-2">
            Entrar
          </Link>
          <Link href="/login" className="text-sm font-bold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-5 py-2.5 rounded-xl transition-all shadow-md">
            Área do Produtor
          </Link>
        </div>
      </header>

      {/* ÁREA PRINCIPAL (HERO & PESQUISA) */}
      <main className="flex-1 w-full">
        
        {/* Banner Hero Redesenhado */}
        <section className="relative w-full bg-neutral-950 pt-28 pb-24 px-6 overflow-hidden">
          {/* Efeito de Luz / Glow de Fundo */}
          <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            
            {/* Badge Flutuante */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-medium shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Acesso rápido, fácil e seguro
            </div>

            {/* Título com Gradiente */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              O seu próximo <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                grande momento
              </span> começa aqui.
            </h1>

            {/* Texto de Apoio */}
            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Encontre, garanta o seu lugar e viva experiências inesquecíveis. Os melhores eventos a um clique de distância.
            </p>

            {/* Barra de Pesquisa Destacada */}
            <div className="w-full max-w-2xl mx-auto pt-6">
              <div className="relative group flex items-center shadow-2xl">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por eventos, locais ou categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-900 border-2 border-neutral-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-full py-5 pl-16 pr-32 text-base text-white placeholder-neutral-400 outline-none transition-all"
                />
                <button className="absolute right-2.5 top-2.5 bottom-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 md:px-8 rounded-full transition-colors text-sm shadow-lg shadow-emerald-500/20">
                  Buscar
                </button>
              </div>
            </div>

            {/* Filtros por Categoria Cadastradas */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-neutral-400">
              <span className="hidden sm:inline">Filtrar por:</span>
              <button onClick={() => setSearchTerm('esporte')} className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 hover:border-emerald-500 hover:text-emerald-400 transition-colors">🏃 Esportes</button>
              <button onClick={() => setSearchTerm('show')} className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 hover:border-emerald-500 hover:text-emerald-400 transition-colors">🎵 Shows</button>
              <button onClick={() => setSearchTerm('online')} className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 hover:border-emerald-500 hover:text-emerald-400 transition-colors">💻 Online</button>
              <button onClick={() => setSearchTerm('congresso')} className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 hover:border-emerald-500 hover:text-emerald-400 transition-colors">🏛️ Congressos</button>
              <button onClick={() => setSearchTerm('')} className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 hover:border-red-500 hover:text-red-400 transition-colors">✕ Limpar</button>
            </div>

          </div>
        </section>

        {/* LISTAGEM DE EVENTOS */}
        <section className="max-w-7xl mx-auto px-6 py-12 min-h-[40vh]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Eventos em Destaque</h2>
            <span className="text-sm font-bold text-neutral-500 bg-neutral-900 px-3 py-1 rounded-lg">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-neutral-800 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-neutral-500 font-medium">A procurar os melhores eventos...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-24 bg-neutral-900/50 rounded-3xl border border-neutral-800 border-dashed">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Nenhum evento encontrado</h3>
              <p className="text-neutral-500">Não encontrámos resultados para "{searchTerm}". Tente usar outros termos de pesquisa.</p>
              <button onClick={() => setSearchTerm('')} className="mt-6 text-emerald-400 font-bold hover:underline">Limpar pesquisa</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => {
                const imageToDisplay = event.thumbnail_url || event.banner_url;
                
                return (
                  <Link href={`/eventos/${event.id}`} key={event.id} className="group flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300">
                    
                    {/* Imagem do Card */}
                    <div className="h-48 bg-neutral-800 relative overflow-hidden">
                      {imageToDisplay ? (
                        <img src={imageToDisplay} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 bg-neutral-800">
                           <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           <span className="text-xs uppercase tracking-widest font-bold">Sem Imagem</span>
                        </div>
                      )}
                      
                      {/* Badge da Categoria */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-neutral-700/50 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                        {event.event_type || 'Evento'}
                      </div>
                      
                      {/* Badge Esgotado (Se aplicável) */}
                      {event.is_sold_out && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                          ESGOTADO
                        </div>
                      )}
                    </div>
                    
                    {/* Corpo do Card */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">{event.title}</h3>
                        
                        <div className="space-y-2 mt-4 text-xs font-medium text-neutral-400">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center text-emerald-500">
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <span className="truncate">{event.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : 'Data a definir'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center text-emerald-500">
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <span className="truncate">{event.location || 'Local a definir'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* SECÇÃO INFO (SOBRE A PLATAFORMA) */}
        <section className="bg-neutral-900 border-y border-neutral-800 mt-12 py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center md:text-left space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
              </div>
              <h3 className="text-xl font-bold">Compra Segura</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Os seus ingressos são digitais e ficam guardados na sua conta. Garantia de segurança e facilidade no acesso ao evento, sem filas.</p>
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold">Acesso Rápido</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Apresente o QR Code no telemóvel na entrada do evento. O processo de check-in é rápido, ecológico e sem complicações.</p>
            </div>

            <div className="text-center md:text-left space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold">Área do Produtor</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">É organizador? Crie o seu evento em minutos, gira vendas em tempo real e utilize a nossa app para validar os ingressos na porta.</p>
            </div>
          </div>
        </section>

      </main>
      
      {/* RODAPÉ COMPLETO */}
      <footer className="bg-neutral-950 pt-16 pb-8 border-t border-neutral-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Coluna 1 - Marca */}
            <div className="md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <span className="bg-emerald-500 text-black font-black px-2.5 py-1 rounded-lg text-sm">VA</span>
                <span className="font-bold text-lg">VipAcesso Pro</span>
              </Link>
              <p className="text-xs text-neutral-500 leading-relaxed pr-4">
                A plataforma líder em gestão de eventos e bilhética online. Conectamos organizadores e participantes através de tecnologia simples e segura.
              </p>
            </div>

            {/* Coluna 2 - Links Úteis */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-neutral-300">Para Participantes</h4>
              <ul className="space-y-3 text-sm text-neutral-500">
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Meus Ingressos</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Como Comprar</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Dúvidas Frequentes</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Política de Reembolso</Link></li>
              </ul>
            </div>

            {/* Coluna 3 - Produtores */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-neutral-300">Para Organizadores</h4>
              <ul className="space-y-3 text-sm text-neutral-500">
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Área do Produtor</Link></li>
                <li><Link href="/admin/novo" className="hover:text-emerald-400 transition-colors">Criar Evento</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Preços e Taxas</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Equipamentos e Validação</Link></li>
              </ul>
            </div>

            {/* Coluna 4 - Contactos */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-neutral-300">Fale Connosco</h4>
              <ul className="space-y-3 text-sm text-neutral-500">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  suporte@vipacesso.pt
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  +351 912 345 678
                </li>
                <li className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-800">
                  <Link href="#" className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-colors">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </Link>
                  <Link href="#" className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-colors">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </Link>
                </li>
              </ul>
            </div>
            
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-neutral-900 text-xs text-neutral-600">
            <p>© {new Date().getFullYear()} VipAcesso Pro. Todos os direitos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-neutral-400">Termos de Uso</Link>
              <Link href="#" className="hover:text-neutral-400">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}