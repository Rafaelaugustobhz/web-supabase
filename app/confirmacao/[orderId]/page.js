'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmacaoContent() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (data) {
        setOrder(data);
        if (data.status === 'paid') setPaid(true);
      }
      setLoading(false);
    }

    loadOrder();

    // Inscreve no Realtime do Supabase para atualizar assim que for pago
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new.status === 'paid') {
            setPaid(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  async function handleSimularPagamentoPIX() {
    setLoading(true);

    // 1. Atualiza status no Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId);

    if (error) {
      alert('Erro ao simular pagamento: ' + error.message);
      setLoading(false);
      return;
    }

    setPaid(true);

    // 2. Dispara webhook no Make/n8n para envio do comprovativo
    try {
      await fetch('SEU_WEBHOOK_URL_AQUI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
          event_name: 'Sicoob Mons Ultra Trail 2026',
        }),
      });
      setEmailSent(true);
    } catch (err) {
      console.error('Erro ao chamar webhook:', err);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p className="animate-pulse text-neutral-400">A carregar detalhes do pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-red-500 mb-2">Pedido não encontrado</h1>
          <Link href="/" className="text-sm underline text-neutral-400">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-6">
        {!paid ? (
          <>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Pendente PIX
              </span>
              <h1 className="text-2xl font-bold mt-2">Aguardando Pagamento</h1>
              <p className="text-xs text-neutral-400">
                Escaneie o QR Code abaixo no app do seu banco para confirmar a inscrição.
              </p>
            </div>

            {/* Simulação de QR Code PIX */}
            <div className="bg-white p-4 rounded-xl inline-block mx-auto">
              <div className="w-48 h-48 bg-neutral-200 flex items-center justify-center text-black font-mono text-xs">
                [ QR Code PIX ]
              </div>
            </div>

            {/* Botão de Teste do Webhook */}
            <button
              onClick={handleSimularPagamentoPIX}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
            >
              ⚡ Simular Confirmação Instantânea (Webhook PIX)
            </button>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold">Pagamento Confirmado com Sucesso!</h2>
            <p className="text-neutral-400 text-sm">
              Sua vaga no <strong>Sicoob Mons Ultra Trail 2026</strong> está garantida.
            </p>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-left text-xs space-y-2 my-6">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {emailSent ? 'Comprovante Enviado por E-mail' : 'Enviando comprovante...'}
              </div>
              <p className="text-neutral-400">
                Enviamos os detalhes da inscrição e o termo de responsabilidade para <strong>{order.buyer_email}</strong>.
              </p>
            </div>

            <Link
              href="/"
              className="inline-block bg-white hover:bg-neutral-200 text-black font-bold py-3 px-8 rounded-xl transition text-sm"
            >
              Voltar ao Início
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ConfirmacaoPIX() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">Carregando...</div>}>
      <ConfirmacaoContent />
    </Suspense>
  );
}