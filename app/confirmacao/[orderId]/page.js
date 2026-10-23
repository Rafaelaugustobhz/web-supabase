'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ConfirmacaoContent() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [maxInstallmentsLimit, setMaxInstallmentsLimit] = useState(3); // Padrão seguro inicial
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  });

  useEffect(() => {
    async function loadOrder() {
      // 1. Lê primariamente do carrinho guardado no localStorage (onde o evento e as parcelas estão garantidos)
      const savedCart = localStorage.getItem('vipAcesso_cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        
        // Extrai o max_installments do evento associado ao carrinho
        const eventMax = cart.event?.max_installments || cart.max_installments;
        if (eventMax) {
          setMaxInstallmentsLimit(Number(eventMax));
        }

        if (orderId === 'order-mock-id') {
          setOrder({
            id: 'VA-TESTE-999',
            total_amount: cart.total || 150.00,
            buyer_name: cart.buyer?.fullName || 'Participante',
            shirt_size: cart.buyer?.shirt_size || 'M',
            ...cart.buyer
          });
          setLoading(false);
          return;
        }
      }

      // 2. Se for um pedido real no Supabase
      if (orderId && orderId !== 'order-mock-id') {
        const { data: orderRes } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderRes) {
          setOrder(orderRes);
          
          if (orderRes.ticket_id) {
            let eventId = null;

            // Busca na tabela 'tickets'
            const { data: ticketRes } = await supabase
              .from('tickets')
              .select('event_id')
              .eq('id', orderRes.ticket_id)
              .single();

            if (ticketRes?.event_id) {
              eventId = ticketRes.event_id;
            } else {
              // Busca na tabela 'ticket_types'
              const { data: typeRes } = await supabase
                .from('ticket_types')
                .select('event_id')
                .eq('id', orderRes.ticket_id)
                .single();
              if (typeRes?.event_id) {
                eventId = typeRes.event_id;
              }
            }

            if (eventId) {
              const { data: eventRes } = await supabase
                .from('events')
                .select('max_installments')
                .eq('id', eventId)
                .single();

              if (eventRes?.max_installments) {
                setMaxInstallmentsLimit(Number(eventRes.max_installments));
              }
            }
          }
        }
      }

      setLoading(false);
    }

    loadOrder();
  }, [orderId]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix...[VIPACESSO_TEST_PIX]');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimularPagamento = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (orderId !== 'order-mock-id') {
      await supabase
        .from('orders')
        .update({ status: 'approved' })
        .eq('id', orderId);
    }

    const savedCart = localStorage.getItem('vipAcesso_cart');
    const cart = savedCart ? JSON.parse(savedCart) : {};

    localStorage.setItem('vipAcesso_cart', JSON.stringify({
      ...cart,
      total: order?.total_amount || cart.total || 0,
    }));

    setTimeout(() => {
      router.push('/sucesso');
    }, 1500);
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold">A carregar detalhes do pagamento...</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center text-red-500">Pedido não encontrado.</div>;
  }

  const totalAmount = Number(order.total_amount || 0);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-4 flex justify-center items-center py-12">
      <div className="max-w-xl w-full bg-neutral-900 p-8 rounded-3xl border border-emerald-500/50 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2 pb-4 border-b border-neutral-800">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide">
            Checkout Profissional
          </span>
          <h1 className="text-2xl font-black mt-2">Escolha a Forma de Pagamento</h1>
          <p className="text-xs text-neutral-400">Total a pagar: <strong className="text-white text-base">R$ {totalAmount.toFixed(2)}</strong></p>
        </div>

        {/* Seletor de Método de Pagamento */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            type="button"
            onClick={() => setPaymentMethod('pix')}
            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${paymentMethod === 'pix' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
          >
            <span className="text-lg">💚</span> PIX Instantâneo
          </button>
          <button 
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${paymentMethod === 'card' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
          >
            <span className="text-lg">💳</span> Cartão de Crédito
          </button>
          <button 
            type="button"
            onClick={() => setPaymentMethod('boleto')}
            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${paymentMethod === 'boleto' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
          >
            <span className="text-lg">📄</span> Boleto Bancário
          </button>
        </div>

        {/* CONTEÚDO DO PIX */}
        {paymentMethod === 'pix' && (
          <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl text-center space-y-4">
            <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2v2h2v-2h-2zm-4 4h2v2h-2v-2zm4 2v2h2v-2h-2zm-8-6h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2z"/>
              </svg>
            </div>
            <p className="text-xs text-neutral-400">Aponte a câmara do seu telemóvel para pagar com PIX ou utilize o código abaixo:</p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value="00020126580014br.gov.bcb.pix...[VIPACESSO_TEST]" 
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 outline-none" 
              />
              <button 
                type="button" 
                onClick={handleCopyPix}
                className="bg-neutral-800 hover:bg-neutral-700 text-xs font-bold px-4 rounded-xl transition-colors shrink-0 text-emerald-400"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <button 
              disabled={processing}
              onClick={handleSimularPagamento}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-sm mt-4 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {processing ? 'A confirmar pagamento...' : 'Simular Pagamento PIX Aprovado'}
            </button>
          </div>
        )}

        {/* CONTEÚDO DO CARTÃO DE CRÉDITO COM PARCELAMENTO DINÂMICO E SEM JUROS */}
        {paymentMethod === 'card' && (
          <form onSubmit={handleSimularPagamento} className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-neutral-300">Número do Cartão</label>
              <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-neutral-300">Nome impresso no Cartão</label>
              <input required type="text" placeholder="NOME DO TITULAR" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500" value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">Validade</label>
                <input required type="text" placeholder="MM/AA" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-300">CVV</label>
                <input required type="text" placeholder="123" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} />
              </div>
            </div>

            {/* SELETOR DE PARCELAS DINÂMICO BASEADO NO LIMITE DO EVENTO */}
            <div>
              <label className="block text-xs font-bold mb-1 text-neutral-300">Opções de Parcelamento</label>
              <select 
                value={cardData.installments} 
                onChange={e => setCardData({...cardData, installments: e.target.value})}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 text-white"
              >
                {Array.from({ length: maxInstallmentsLimit }, (_, i) => i + 1).map(num => {
                  const installmentValue = (totalAmount / num).toFixed(2);
                  return (
                    <option key={num} value={num}>
                      {num}x de R$ {installmentValue} {num === 1 ? 'à vista' : '(sem juros)'}
                    </option>
                  );
                })}
              </select>
            </div>

            <button 
              disabled={processing}
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-sm mt-4 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {processing ? 'A processar pagamento...' : 'Pagar com Cartão'}
            </button>
          </form>
        )}

        {/* CONTEÚDO DO BOLETO */}
        {paymentMethod === 'boleto' && (
          <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl text-center space-y-4">
            <div className="text-3xl">📄</div>
            <h3 className="font-bold text-white text-sm">Boleto Bancário Gerado com Sucesso</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O boleto vence em 1 dia útil. Em ambiente de teste, pode simular a compensação instantânea do boleto clicando no botão abaixo.
            </p>
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-300">
              34191.79001 01043.510047 91020.150002 1 956800000{totalAmount.toFixed(0)}00
            </div>

            <button 
              disabled={processing}
              onClick={handleSimularPagamento}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-sm mt-4 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {processing ? 'A simular compensação...' : 'Simular Boleto Pago'}
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-400 underline">
            Cancelar e voltar ao início
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">A carregar...</div>}>
      <ConfirmacaoContent />
    </Suspense>
  );
}