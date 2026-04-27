'use client'

import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    { name: 'Free', price: '৳0', period: 'forever', tokens: '50K', features: ['3 free models', '10 req/min', 'Community support'], popular: false },
    { name: 'Starter', price: '৳499', period: '/month', tokens: '10M', features: ['All 8+ models', '60 req/min', 'Email support 48h', 'Usage analytics'], popular: true },
    { name: 'Pro', price: '৳999', period: '/month', tokens: '25M', features: ['Priority routing', '200 req/min', 'Email support 24h', 'Team (3 seats)'], popular: false },
    { name: 'Team', price: '৳2,999', period: '/month', tokens: '100M', features: ['Dedicated routing', '1000 req/min', 'WhatsApp support', '10 seats + admin'], popular: false },
  ]

  const creditPacks = [
    { name: 'Micro', price: '৳199', credits: '1,000', tokens: '1M' },
    { name: 'Small', price: '৳499', credits: '3,000', tokens: '3M' },
    { name: 'Medium', price: '৳999', credits: '7,000', tokens: '7M' },
    { name: 'Large', price: '৳1,999', credits: '18,000', tokens: '18M' },
    { name: 'XL', price: '৳4,999', credits: '50,000', tokens: '50M' },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-fraunces font-black text-[#00ff88]">π</span>
            <span className="text-lg font-fraunces font-bold text-white">ReadyPi</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/signup" className="px-4 py-2 bg-[#00ff88] text-[#0a0a0f] font-mono text-xs uppercase rounded hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all font-bold">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="font-mono text-[10px] uppercase tracking-[4px] text-[#00ff88] mb-4">Elite Infrastructure</div>
          <h1 className="text-5xl md:text-6xl font-fraunces font-black text-white mb-4">Scale with <span className="text-[#00ff88] italic">Confidence</span></h1>
          <p className="text-gray-400 max-w-xl mx-auto font-mono text-sm">Pay in BDT via bKash, Nagad or Rocket. No international card required.</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-4 gap-4 mb-20">
          {plans.map((plan, i) => (
            <div key={i} className={`relative bg-[#0d1117] border rounded-xl p-8 transition-all ${plan.popular ? 'border-[#00ff88] shadow-[0_0_40px_rgba(0,255,136,0.15)] scale-[1.02] z-10' : 'border-gray-800 hover:border-[#00ff88]/50'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00ff88] text-[#0a0a0f] text-[10px] font-mono uppercase tracking-wider rounded-full font-bold">Most Popular</div>}
              <div className="text-center">
                <div className="font-fraunces text-lg font-bold text-white mb-3 uppercase tracking-tighter">{plan.name}</div>
                <div className={`text-4xl font-fraunces font-black mb-1 ${plan.popular ? 'text-[#00ff88]' : 'text-white'}`}>{plan.price}</div>
                <div className="text-xs font-mono text-gray-500 mb-2">{plan.period}</div>
                <div className="text-sm text-[#00ff88] font-mono mb-6 bg-[#00ff88]/5 py-1 rounded-full">{plan.tokens} tokens</div>
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((f, j) => <li key={j} className="text-xs text-gray-400 font-mono flex items-start gap-2"><span className="text-[#00ff88] mt-0.5">»</span>{f}</li>)}
                </ul>
                <Link href="/signup" className={`block w-full py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all font-bold ${plan.popular ? 'bg-[#00ff88] text-[#0a0a0f] hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]' : 'border border-gray-700 text-gray-400 hover:border-[#00ff88] hover:text-[#00ff88]'}`}>Get Started</Link>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="text-center mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[4px] text-[#00ff88] mb-4">Pay As You Go</div>
          <h2 className="text-3xl font-fraunces font-black text-white">Credit Packs</h2>
          <p className="text-sm text-gray-500 mt-2 font-mono">Credits never expire. Instant top-up via local gateways.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {creditPacks.map((p, i) => (
            <div key={i} className="bg-[#0d1117] border border-gray-800 rounded-xl p-6 text-center hover:border-[#00ff88]/50 transition-all group">
              <div className="text-xs font-mono text-gray-500 mb-2 group-hover:text-white transition-colors uppercase">{p.name}</div>
              <div className="text-2xl font-fraunces font-black text-[#00ff88] mb-1">{p.price}</div>
              <div className="text-[10px] font-mono text-gray-600">{p.credits} credits</div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-20 p-8 border border-gray-800 rounded-2xl bg-[#0d1117]/50 backdrop-blur-sm text-center">
          <div className="font-mono text-[10px] uppercase tracking-[3px] text-gray-500 mb-6">Secured Global & Local Payment Gateways</div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-xs font-mono text-gray-400">
            <span className="hover:text-[#00ff88] cursor-default transition-colors">bKash</span>
            <span className="hover:text-[#00ff88] cursor-default transition-colors">Nagad</span>
            <span className="hover:text-[#00ff88] cursor-default transition-colors">Rocket</span>
            <span className="hover:text-[#00ff88] cursor-default transition-colors">USDT (TRC20)</span>
            <span className="hover:text-[#00ff88] cursor-default transition-colors">Bitcoin</span>
            <span className="hover:text-[#00ff88] cursor-default transition-colors">Visa/Mastercard</span>
          </div>
        </div>
      </div>
    </main>
  )
}
