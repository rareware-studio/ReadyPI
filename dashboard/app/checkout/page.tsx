'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CheckoutPage() {
  const [selectedPack, setSelectedPack] = useState('small')
  const [paymentMethod, setPaymentMethod] = useState('bkash')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ transaction_id?: string; payment_url?: string } | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const packs = [
    { id: 'micro', name: 'Micro', price: '৳199', credits: '1,000' },
    { id: 'small', name: 'Small', price: '৳499', credits: '3,000' },
    { id: 'medium', name: 'Medium', price: '৳999', credits: '7,000' },
    { id: 'large', name: 'Large', price: '৳1,999', credits: '18,000' },
    { id: 'xl', name: 'XL', price: '৳4,999', credits: '50,000' },
  ]

  const methods = [
    { id: 'bkash', name: 'bKash', icon: '📱' },
    { id: 'nagad', name: 'Nagad', icon: '📲' },
    { id: 'rocket', name: 'Rocket', icon: '🚀' },
    { id: 'card', name: 'Card', icon: '💳' },
    { id: 'usdt', name: 'USDT', icon: '🪙' },
    { id: 'btc', name: 'BTC', icon: '₿' },
  ]

  useEffect(() => {
    if (!token) window.location.href = '/login'
  }, [])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/payment/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: selectedPack, payment_method: paymentMethod }),
      })
      const data = await res.json()
      if (res.ok) setResult(data)
    } catch { /* network error */ }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-fraunces font-black text-[#00ff88]">π</span>
            <span className="text-lg font-fraunces font-bold text-white">ReadyPi</span>
          </Link>
          <Link href="/dashboard" className="text-xs font-mono text-gray-500 hover:text-[#00ff88] transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-fraunces font-black text-white mb-2 uppercase tracking-tighter">Secure <span className="text-[#00ff88]">Checkout</span></h1>
        <p className="text-sm font-mono text-gray-500 mb-10">Credits never expire · Instant delivery to your account</p>

        {result ? (
          <div className="bg-[#0d1117] border border-[#00ff88]/30 rounded-2xl p-10 text-center glass">
            <div className="w-16 h-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-fraunces font-bold text-white mb-2">Order Initialized</h2>
            <p className="text-sm text-gray-400 font-mono mb-6">Transaction ID: <span className="text-[#00ff88]">{result.transaction_id}</span></p>
            <Link href="/dashboard" className="inline-block px-8 py-3 bg-[#00ff88] text-[#0a0a0f] font-mono text-xs font-bold uppercase rounded-lg hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all">Go to Dashboard</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Credit Packs */}
            <div>
              <label className="block text-[10px] font-mono text-[#00ff88] uppercase tracking-[3px] mb-4">Select Credit Package</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {packs.map(p => (
                  <button key={p.id} onClick={() => setSelectedPack(p.id)} className={`p-4 rounded-xl text-center transition-all ${selectedPack === p.id ? 'bg-[#00ff88]/10 border-2 border-[#00ff88]' : 'bg-[#0d1117] border border-gray-800 hover:border-gray-700'}`}>
                    <div className="text-[10px] font-mono text-gray-500 mb-1 uppercase">{p.name}</div>
                    <div className={`text-lg font-fraunces font-black ${selectedPack === p.id ? 'text-[#00ff88]' : 'text-white'}`}>{p.price}</div>
                    <div className="text-[9px] font-mono text-gray-600 uppercase mt-1">{p.credits} units</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-[10px] font-mono text-[#00ff88] uppercase tracking-[3px] mb-4">Choose Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {methods.map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`p-6 rounded-xl text-center transition-all flex flex-col items-center gap-2 ${paymentMethod === m.id ? 'bg-[#00ff88]/10 border-2 border-[#00ff88]' : 'bg-[#0d1117] border border-gray-800 hover:border-gray-700'}`}>
                    <div className="text-2xl">{m.icon}</div>
                    <div className={`text-[10px] font-mono font-bold uppercase ${paymentMethod === m.id ? 'text-[#00ff88]' : 'text-gray-500'}`}>{m.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={loading} 
              className="w-full py-5 bg-[#00ff88] text-[#0a0a0f] font-mono font-bold text-sm uppercase tracking-[2px] rounded-xl hover:shadow-[0_0_40px_rgba(0,255,136,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Transaction...' : `Complete Payment of ${packs.find(p => p.id === selectedPack)?.price}`}
            </button>
            
            <p className="text-center text-[10px] font-mono text-gray-600">
              By clicking complete, you agree to our Terms of Service. Secure encrypted transaction.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
