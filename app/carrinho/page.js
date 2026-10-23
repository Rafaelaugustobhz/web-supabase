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
    confirmEmail: loggedUser.email,
    phone: loggedUser.phone,
    cpf: loggedUser.cpf,
    city: '',
    state: '',
    gender: '',
    ageGroup: '',
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
        confirmEmail: loggedUser.email,
        phone: loggedUser.phone,
        cpf: loggedUser.cpf
      }));
    } else {
      setBuyerData(prev => ({
        ...prev,
        fullName: '',
        email: '',
        confirmEmail: '',
        phone: '',
        cpf: '',
        city: '',
        state: '',
        gender: '',
        ageGroup: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBuyerData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (buyerData.email !== buyerData.confirmEmail) {
      alert('Os e-mails informados não coincidem. Por favor, verifique e confirme o e-mail corretamente.');
      return;
    }

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

  const eventImage = cartData.event?.thumbnail_url || cartData.event?.banner_url;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20 font-sans">
      <header className="h-20 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 lg:px-10 justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg shadow-lg shadow-emerald-500/20">VA</span>
          <span className="font-bold tracking-wide">VipAcesso - Checkout</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl">
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Nome Completo *</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={buyerData.fullName}
                  onChange={handleChange}
                  placeholder="Nome completo do participante"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                  required
                />
              </div>

              {/* E-mail e Confirmação de E-mail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">E-mail *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={buyerData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Confirmar E-mail *</label>
                  <input 
                    type="email" 
                    name="confirmEmail"
                    value={buyerData.confirmEmail}
                    onChange={handleChange}
                    placeholder="Confirme o seu e-mail"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Telefone e CPF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Telefone / WhatsApp *</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={buyerData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">CPF *</label>
                  <input 
                    type="text" 
                    name="cpf"
                    value={buyerData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Cidade *</label>
                  <input 
                    type="text" 
                    name="city"
                    value={buyerData.city}
                    onChange={handleChange}
                    placeholder="Ex: Itapema"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Estado *</label>
                  <input 
                    type="text" 
                    name="state"
                    value={buyerData.state}
                    onChange={handleChange}
                    placeholder="Ex: SC"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Género e Faixa Etária */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Género *</label>
                  <select
                    name="gender"
                    value={buyerData.gender}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Faixa Etária *</label>
                  <select
                    name="ageGroup"
                    value={buyerData.ageGroup}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Até 17 anos">Até 17 anos</option>
                    <option value="18 a 24 anos">18 a 24 anos</option>
                    <option value="25 a 34 anos">25 a 34 anos</option>
                    <option value="35 a 44 anos">35 a 44 anos</option>
                    <option value="45 a 59 anos">45 a 59 anos</option>
                    <option value="60 ou mais">60 ou mais</option>
                  </select>
                </div>
              </div>

              {/* Termos */}
              <div className="pt-4 border-t border-neutral-800">
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <input 
                    type="checkbox" 
                    name="acceptTerms"
                    checked={buyerData.acceptTerms}
                    onChange={handleChange}
                    className="w-5 h-5 accent-emerald-500 mt-0.5 cursor-pointer"
                    required 
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-white">Aceito os Termos de Uso de Imagem e Comunicação</span>
                    <p className="text-xs text-neutral-400 mt-1">
                      {cartData.event.image_terms || "Autorizo a captação e utilização de minha imagem em fotos e vídeos oficiais do evento."}
                    </p>
                  </div>
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Resumo da Inscrição com Mini-Card do Evento */}
        <div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky top-28 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold border-b border-neutral-800 pb-3">Resumo da Inscrição</h3>
            
            {/* Mini Card do Evento */}
            <div className="space-y-3">
              <div className="h-36 bg-neutral-800 rounded-xl overflow-hidden relative border border-neutral-800 shadow-md">
                {eventImage ? (
                  <img src={eventImage} alt={cartData.event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-bold uppercase tracking-widest">Sem Imagem</div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-black font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">
                  {cartData.event.event_type || 'Evento'}
                </div>
              </div>
              <h4 className="font-bold text-white text-base leading-snug">{cartData.event.title}</h4>
            </div>

            <div className="space-y-3 pt-2 text-sm border-t border-neutral-800">
              {cartData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-neutral-800/60 pb-2.5">
                  <span className="text-neutral-300">{item.quantity}x {item.name}</span>
                  <span className="font-bold">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-700 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-400">Total</span>
                <span className="text-2xl font-black text-emerald-400">{cartData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <button type="submit" form="checkout-form" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-base transition-all shadow-lg shadow-emerald-500/20 text-center">
                Finalizar Inscrição
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}