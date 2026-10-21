'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ConfirmacaoPIX() {
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

      if (!error && data) {
        setOrder(data);
        if (data.status === 'paid') setPaid(true);
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  // Simulação de confirmação do webhook do PIX
  const handleSimularPagamentoPIX = async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId);

    if (!error) {
      setPaid(true);
      setTimeout(() => {
        setEmailSent(true);
      }, 1200);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-white p-12 text-center">Carregando dados da inscrição...</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-neutral-950 text-white p-12 text-center">Inscrição não encontrada.</div>;
  }

  const mockPixCode = `00020126580014BR.GOV.BCB.PIX0136vipacesso-mons-2026-520400005303986540${Number(order.total_amount).toFixed(2)}5802BR5920VIPACESSO EVENTOS6009NOVA TRENTO62070503***6304E2B1`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">
        
        {!paid ? (
          <>
            <div className="text-center mb-6">
              <span className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                Aguardando Pagamento PIX
              </span>
              <h1 className="text-3xl font-extrabold mt-3">Finalize sua Inscrição</h1>
              <p className="text-neutral-400 text-sm mt-1">Escaneie o QR Code ou copie o código PIX abaixo</p>
            </div>

            {/* QR Code Simulado */}
            <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mockPixCode)}`} 
                alt="QR Code PIX" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Valor e Resumo */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Atleta:</span>
                <span className="font-semibold">{order.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Camiseta:</span>
                <span className="font-semibold">{order.shirt_size}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-800 pt-2 text-base font-bold">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400">R$ {Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Código Copia e Cola */}
            <div className="mb-6">
              <label className="block text-xs text-neutral-400 mb-1">PIX Copia e Cola:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={mockPixCode} 
                  className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-400 w-full truncate outline-none"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(mockPixCode);
                    alert('Código PIX copiado!');
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-4 rounded-lg text-xs transition whitespace-nowrap"
                >
                  Copiar
                </button>
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
              Voltar para a Vitrine
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}