'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Wallet, CreditCard, ChevronLeft, ChevronRight, BellRing, Download, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { creditsAPI } from '@/lib/api'

export default function BillingPage() {
  const { user } = useAuth()
  const [topupAmount, setTopupAmount] = useState('500')
  const [loading, setLoading] = useState(false)
  const [autoRecharge, setAutoRecharge] = useState(true)

  const handleCheckout = useCallback(async () => {
    try {
      setLoading(true)
      let packageId = 'small'
      const amt = parseInt(topupAmount)
      if (amt < 300) packageId = 'micro'
      else if (amt < 700) packageId = 'small'
      else if (amt < 1500) packageId = 'medium'
      else if (amt < 3000) packageId = 'large'
      else packageId = 'xl'

      const { data } = await creditsAPI.createPayment(packageId, 'bkash')
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
    } catch (err) {
      console.error('Checkout failed', err)
      alert('Failed to initialize payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [topupAmount])

  const transactions = [
    { id: 'TRX-8921A', date: '2026-04-24', amount: '৳1,000.00', method: 'bKash', status: 'Completed' },
    { id: 'TRX-7742B', date: '2026-04-10', amount: '৳500.00', method: 'Nagad', status: 'Completed' },
    { id: 'TRX-6190C', date: '2026-03-28', amount: '৳2,000.00', method: 'SSLCommerz (Card)', status: 'Completed' }
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-gray-300 font-mono">
      <nav className="h-16 bg-[#0a0a0f] border-b border-gray-800 flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Back
          </Link>
          <div className="h-4 w-[1px] bg-gray-800"></div>
          <div className="flex items-center gap-2 text-white font-semibold">
            <Wallet size={18} className="text-[#00ff9d]" /> Billing & Wallet
          </div>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Left Column: Wallet Stats & Top-up */}
          <div className="md:col-span-3 space-y-8">
            
            {/* Balance Card */}
            <div className="bg-[#0a0a0f] border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff9d] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10">
                <div className="text-gray-500 text-sm uppercase tracking-widest font-semibold mb-2">Available Credit Balance</div>
                <div className="text-5xl md:text-6xl font-fraunces font-black text-white mb-6">
                  ৳{user?.credits?.balance?.toLocaleString() || '0'}<span className="text-gray-500 text-3xl">.00</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-800 pt-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setAutoRecharge(!autoRecharge)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${autoRecharge ? 'bg-[#00ff9d]' : 'bg-gray-700'}`}
                    >
                      <div className={`w-3 h-3 bg-black rounded-full absolute top-1 transition-transform ${autoRecharge ? 'translate-x-6' : 'translate-x-1'}`}></div>
                    </button>
                    <div className="text-xs text-gray-400"><strong className="text-white">Auto-Alerts On</strong> (Low balance warnings)</div>
                  </div>
                  <BellRing size={16} className={autoRecharge ? 'text-[#00ff9d]' : 'text-gray-600'} />
                </div>
              </div>
            </div>

            {/* Top-up Interface */}
            <div className="bg-[#0a0a0f] border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-fraunces font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-[#00ff9d]" /> Add Credits
              </h2>
              
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Select Amount (BDT)</label>
                <div className="grid grid-cols-4 gap-3">
                  {['500', '1000', '2500', '5000'].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setTopupAmount(amt)}
                      className={`py-3 rounded font-bold transition-colors border ${topupAmount === amt ? 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30' : 'bg-black text-gray-400 border-gray-800 hover:border-gray-600'}`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Or Enter Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                  <input 
                    type="number" 
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded pl-8 pr-4 py-3 text-white font-bold focus:outline-none focus:border-[#00ff9d]/50 transition-colors"
                  />
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#00ff9d] text-[#050508] py-4 rounded font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={18} /> INITIALIZING GATEWAY...</>
                ) : (
                  <>
                    Proceed to Checkout <ChevronRight size={16} />
                  </>
                )}
              </button>
              
              <div className="mt-4 flex justify-center gap-4 opacity-50 grayscale">
                {/* Placeholder for local PG logos */}
                <span className="text-xs font-bold border border-gray-700 px-2 py-1 rounded">bKash</span>
                <span className="text-xs font-bold border border-gray-700 px-2 py-1 rounded">Nagad</span>
                <span className="text-xs font-bold border border-gray-700 px-2 py-1 rounded">VISA / MC</span>
              </div>
            </div>
          </div>

          {/* Right Column: Invoicing */}
          <div className="md:col-span-2">
            <div className="bg-[#0a0a0f] border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="font-fraunces font-bold text-white">Billing History</h3>
                <p className="text-xs text-gray-500 mt-1">Past receipts & invoices.</p>
              </div>
              <div className="divide-y divide-gray-800">
                {transactions.map(trx => (
                  <div key={trx.id} className="p-6 hover:bg-[#12161e] transition-colors flex justify-between items-center group">
                    <div>
                      <div className="text-white font-bold mb-1">{trx.amount}</div>
                      <div className="text-xs text-gray-500 font-mono">{trx.date} • {trx.method}</div>
                    </div>
                    <button className="text-gray-600 group-hover:text-[#00ff9d] transition-colors p-2" title="Download PDF">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#0d1117] text-center border-t border-gray-800">
                <button className="text-xs text-[#00ff9d] uppercase tracking-wider font-semibold hover:underline">View All Records</button>
              </div>
            </div>
            
            <div className="mt-6 p-6 border border-[#00ff9d]/20 bg-[#00ff9d]/5 rounded-xl">
              <h4 className="text-[#00ff9d] text-sm font-bold flex items-center gap-2 mb-2"><CheckCircle2 size={16} /> No Hidden Fees</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                You only pay for exactly the tokens you use. Credits never expire. Read our full <Link href="/terms" className="underline hover:text-white">pricing policy</Link>.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
