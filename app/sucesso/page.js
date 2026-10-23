'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function SucessoContent() {
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('vipAcesso_cart');
    if (savedCart) {
      setOrderData(JSON.parse(savedCart));
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between font-sans">
      <div>
        {/* CABEÇALHO */}
        <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
              <span className="font-bold">VipAcesso Pro</span>
            </Link>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="max-w-3xl mx-auto px-6 py-12">
          
          <div className="text-center space-y-3 mb-10">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/10">
              ✓
            </div>
            <h1 className="text-3xl font-black tracking-tight">Inscrição Confirmada!</h1>
            <p className="text-neutral-400 text-sm">O seu pedido foi processado com sucesso. O comprovativo e os detalhes foram registados.</p>
          </div>

          {orderData && (
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                Oficial & Garantido
              </div>

              {/* Informações do Evento */}
              <div className="flex flex-col sm:flex-row gap-5 items-center pb-6 border-b border-neutral-800">
                <div className="w-24 h-24 bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 shrink-0">
                  {orderData.event?.banner_url ? (
                    <img src={orderData.event.banner_url} alt="Evento" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">Sem Img</div>
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">
                    {orderData.event?.event_type || 'Evento'}
                  </span>
                  <h2 className="text-xl font-bold text-white truncate">{orderData.event?.title}</h2>
                  <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <span>📅</span> {orderData.event?.event_date ? new Date(orderData.event.event_date).toLocaleDateString('pt-BR') : 'Data a definir'}
                  </p>
                  <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5 truncate">
                    <span>📍</span> {orderData.event?.location || 'Local a definir'}
                  </p>
                </div>
              </div>

              {/* Itens Adquiridos */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Ingressos / Inscrições Selecionadas</h3>
                <div className="space-y-2">
                  {orderData.items?.map((item, idx) => (
                    <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-xs text-neutral-400">Quantidade: {item.quantity}x</span>
                      </div>
                      <span className="font-bold text-emerald-400">
                        {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Simulado para Entrada */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  {/* SVG representando um QR Code */}
                  <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2v2h2v-2h-2zm-4 4h2v2h-2v-2zm4 2v2h2v-2h-2zm-8-6h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2z"/>
                  </svg>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-white text-sm">Credencial Digital / QR Code</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Apresente este código na portaria do evento para validação imediata da sua entrada. Também pode descarregar ou imprimir este comprovativo.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold pt-1">ID do Pedido: #VA-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
              </div>

              {/* Total e Ações */}
              <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block">Total Pago</span>
                  <span className="text-2xl font-black text-white">
                    {orderData.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handlePrint} 
                    className="flex-1 sm:flex-none px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-sm transition-colors text-center"
                  >
                    Imprimir / Guardar PDF
                  </button>
                  <Link 
                    href="/" 
                    className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 text-center"
                  >
                    Voltar ao Início
                  </Link>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* RODAPÉ */}
      <footer className="border-t border-neutral-800 bg-neutral-900 mt-20 py-8 px-6 text-center text-neutral-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-black font-black px-2.5 py-1 rounded-lg text-xs">VA</span>
            <span className="font-bold text-white">VipAcesso Pro</span>
          </div>
          <p>© {new Date().getFullYear()} VipAcesso - Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-bold">A carregar comprovativo...</div>}>
      <SucessoContent />
    </Suspense>
  );
}