'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CarrinhoPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState(null);
  
  // Perfil simulado do utilizador logado
  const loggedUser = {
    fullName: 'Rafael Augusto Silva Barbosa',
    email: 'kweventos00@gmail.com',
    phone: '(47) 99953-4242',
    cpf: '123.456.789-00'
  };

  const [targetPerson, setTargetPerson] = useState('self'); // 'self' ou 'other'

  const [buyerData, setBuyerData] = useState({
    fullName: loggedUser.fullName,
    email: loggedUser.email,
    phone: loggedUser.phone,
    cpf: loggedUser.cpf,
    acceptTerms: false
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('vipAcesso_cart');
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    }
  }, []);

  const handleTargetChange = (type) => {
    setTargetPerson(type);
    if (type === 'self') {
      setBuyerData(prev => ({
        ...prev,
        fullName: loggedUser.fullName,
        email: loggedUser.email,
        phone: loggedUser.phone,
        cpf: loggedUser.cpf
      }));
    } else {
      setBuyerData(prev => ({
        ...prev,
        fullName: '',
        email: '',
        phone: '',
        cpf: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBuyerData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!buyerData.acceptTerms) {
      alert('É necessário aceitar os termos de uso de imagem e comunicação.');
      return;
    }
    alert('Inscrição e dados do participante registados com sucesso! Redirecionando...');
    localStorage.removeItem('vipAcesso_cart');
    router.push('/');
  };

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">O carrinho está vazio</h1>
        <Link href="/" className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl text-sm">Ver Eventos</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 lg:px-10 justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
          <span className="font-bold">VipAcesso - Checkout</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6">
            <h2 className="text-lg font-bold border-b border-neutral-800 pb-4">Dados do Participante</h2>
            
            {/* Seletor "Eu mesmo" ou "Outra pessoa" */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTargetChange('self')}
                className={`py-3 px-4 rounded-xl font-bold text-sm border transition-all ${targetPerson === 'self' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}
              >
                👤 Inscrição para Mim Mesmo
              </button>
              <button
                type="button"
                onClick={() => handleTargetChange('other')}
                className={`py-3 px-4 rounded-xl font-bold text-sm border transition-all ${targetPerson === 'other' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}
              >
                👥 Inscrição para Outra Pessoa
              </button>
            </div>

            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Nome Completo *</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={buyerData.fullName}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">E-mail *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={buyerData.email}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Telefone / WhatsApp *</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={buyerData.phone}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">CPF *</label>
                <input 
                  type="text" 
                  name="cpf"
                  value={buyerData.cpf}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <input 
                    type="checkbox" 
                    name="acceptTerms"
                    checked={buyerData.acceptTerms}
                    onChange={handleChange}
                    className="w-5 h-5 accent-emerald-500 mt-0.5 cursor-pointer"
                    required 
                  />
                  <div className="text-sm">
                    <span className="font-medium text-white">Aceito os Termos de Uso de Imagem e Comunicação</span>
                    <p className="text-xs text-neutral-500 mt-1">
                      {cartData.event.image_terms || "Autorizo a captação e utilização de minha imagem em fotos e vídeos oficiais do evento."}
                    </p>
                  </div>
                </label>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky top-28 space-y-6">
            <h3 className="text-lg font-bold border-b border-neutral-800 pb-3">Resumo da Inscrição</h3>
            <h4 className="font-bold text-white">{cartData.event.title}</h4>

            <div className="space-y-3 pt-2 text-sm">
              {cartData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="text-neutral-300">{item.quantity}x {item.name}</span>
                  <span className="font-bold">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-700 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-400">Total</span>
                <span className="text-2xl font-black text-white">{cartData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <button type="submit" form="checkout-form" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/20 text-center">
                Finalizar Inscrição
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}