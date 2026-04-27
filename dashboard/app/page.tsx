'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Terminal, MessageSquare, BookOpen, Key, Activity, Zap, Layers, Network, ShieldCheck, ChevronRight, BarChart2 } from 'lucide-react'
import PiMark from '@/components/PiMark'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeModel, setActiveModel] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Chat Playground State
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', content: 'You are an AI assistant connected via ReadyPi Gateway.' },
    { role: 'user', content: 'What is the fastest model available?' },
    { role: 'assistant', content: 'Currently, Groq Llama 3 70B offers the lowest latency, while Gemini Flash provides an excellent balance of speed and massive 1M context window.' }
  ])

  useEffect(() => {
    setMounted(true)
    
    // Animated graph
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    
    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = 'rgba(200, 56, 26, 0.05)'
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }
      
      ctx.strokeStyle = '#ff6b4a'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let x = 0; x < canvas.width / 2; x += 5) {
        const y = 80 + Math.sin((x + frame) * 0.02) * 30 + Math.cos((x + frame) * 0.03) * 20
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      
      ctx.shadowBlur = 15
      ctx.shadowColor = '#ff6b4a'
      ctx.stroke()
      ctx.shadowBlur = 0
      
      frame += 1.5
      requestAnimationFrame(animate)
    }
    
    animate()
  }, [])

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setChatMessages([...chatMessages, { role: 'user', content: chatInput }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'ReadyPi abstracts all provider APIs into one standard format. Sign up to make live requests!' }])
    }, 600)
  }

  const modelsList = [
    { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Groq', context: '8K', promptPrice: '৳0.50', completionPrice: '৳0.60', latency: '0.2s', isFree: true },
    { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', context: '1M', promptPrice: '৳0.15', completionPrice: '৳0.30', latency: '0.4s', isFree: true },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', context: '64K', promptPrice: '৳0.20', completionPrice: '৳0.40', latency: '0.4s', isFree: true },
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: '128K', promptPrice: '৳5.00', completionPrice: '৳15.00', latency: '0.6s', isFree: false },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: '200K', promptPrice: '৳3.00', completionPrice: '৳15.00', latency: '0.5s', isFree: false },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', context: '128K', promptPrice: '৳0.15', completionPrice: '৳0.60', latency: '0.3s', isFree: false },
    { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', context: '32K', promptPrice: '৳2.00', completionPrice: '৳6.00', latency: '0.5s', isFree: false },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', context: '200K', promptPrice: '৳0.25', completionPrice: '৳1.25', latency: '0.3s', isFree: false },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-300 font-mono">
      
      {/* Top Navigation Bar - OpenRouter Style */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center" aria-label="ReadyPi home">
              <PiMark variant="logo" withWordmark />
            </Link>
            
            <div className="hidden lg:flex items-center gap-6 text-sm">
              <Link href="/models" className="flex items-center gap-2 hover:text-white transition-colors"><Layers size={16} /> Models</Link>
              <Link href="/playground" className="flex items-center gap-2 hover:text-white transition-colors"><Terminal size={16} /> Chat</Link>
              <Link href="/docs" className="flex items-center gap-2 hover:text-white transition-colors"><BookOpen size={16} /> Docs</Link>
              <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition-colors"><Activity size={16} /> Dashboard</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search 50+ models..." 
                className="bg-[#0d1117] border border-gray-800 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#ff6b4a] w-64 transition-all"
              />
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
              <Link href="/signup" className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(200,56,26,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,56,26,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', animation: 'gridMove 20s linear infinite' }}></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Text */}
          <div className="flex-1 animate-fade-in-up">
            <div className="inline-block border border-[#ff6b4a]/30 bg-[#ff6b4a]/10 text-[#ff6b4a] px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-8 font-semibold">
              Bangladesh's Premier AI Gateway
            </div>
            
            <h1 className="text-5xl md:text-7xl font-fraunces font-black leading-[1.1] mb-6 text-white tracking-tight">
              A unified interface to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] to-[#c8381a] italic">all AI models.</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl leading-relaxed mb-10">
              ReadyPi provides a standardized API to access GPT-4o, Claude 3.5, Gemini 1.5, Llama 3, and 50+ more models. Find the lowest prices, best latency, and pay locally with <strong className="text-white">bKash or Nagad.</strong>
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/signup" className="flex items-center gap-2 bg-[#ff6b4a] text-white px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:shadow-[0_0_20px_rgba(255,107,74,0.4)] transition-all">
                <Key size={18} /> Get API Key
              </Link>
              <Link href="/docs" className="flex items-center gap-2 border border-gray-700 bg-[#0d1117] text-white px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:border-gray-500 transition-all">
                <Terminal size={18} /> Documentation
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Lowest Latency Routing</div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> Standardized OpenAI Format</div>
            </div>
          </div>

          {/* Right: π identity — the brand mark */}
          <div className="flex-1 w-full flex items-center justify-center animate-fade-in">
            <PiMark variant="hero" size={520} />
          </div>
        </div>
      </section>

      {/* Model Rankings / Table Section */}
      <section className="py-24 bg-[#0d1117] border-y border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-fraunces font-bold text-white mb-2">Supported Models</h2>
              <p className="text-gray-500 text-sm">Access the world's best models via a single API endpoint. Prices in BDT per 1M tokens.</p>
            </div>
            <Link href="/models" className="text-[#ff6b4a] hover:underline text-sm font-semibold flex items-center gap-1">View all 50+ models <ChevronRight size={16} /></Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-4 font-semibold">Model ID</th>
                  <th className="py-4 px-4 font-semibold">Provider</th>
                  <th className="py-4 px-4 font-semibold">Context</th>
                  <th className="py-4 px-4 font-semibold text-right">Prompt ৳</th>
                  <th className="py-4 px-4 font-semibold text-right">Completion ৳</th>
                  <th className="py-4 px-4 font-semibold">Latency</th>
                  <th className="py-4 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {modelsList.map((model, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {model.id}
                    </td>
                    <td className="py-4 px-4 text-gray-400">{model.provider}</td>
                    <td className="py-4 px-4">{model.context}</td>
                    <td className="py-4 px-4 text-right text-gray-300">{model.promptPrice}</td>
                    <td className="py-4 px-4 text-right text-gray-300">{model.completionPrice}</td>
                    <td className="py-4 px-4 text-gray-400">{model.latency}</td>
                    <td className="py-4 px-4 text-center">
                      {model.isFree 
                        ? <span className="bg-[#ff6b4a]/20 text-[#ff6b4a] text-[10px] px-2 py-1 rounded-sm uppercase tracking-wide font-bold border border-[#ff6b4a]/30">Free Tier</span>
                        : <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-1 rounded-sm uppercase tracking-wide font-bold">Premium</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Code Integration & Routing */}
      <section className="py-24 relative">
        <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-fraunces font-bold text-white mb-6">Drop-in OpenAI Compatibility</h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              Don't rewrite your code. ReadyPi uses the exact same API format as OpenAI. Just change your base URL and API key, and you instantly have access to the entire AI ecosystem.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-[#ff6b4a]/10 flex items-center justify-center text-[#ff6b4a] shrink-0"><Network size={16} /></div>
                <div>
                  <h3 className="text-white font-bold mb-1">Intelligent Fallbacks</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Specify a list of fallback models. If Anthropic is down, we automatically route your request to OpenAI or Gemini with zero downtime.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-[#ff6b4a]/10 flex items-center justify-center text-[#ff6b4a] shrink-0"><BarChart2 size={16} /></div>
                <div>
                  <h3 className="text-white font-bold mb-1">Standardized Logging</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Every request, regardless of provider, is logged and priced natively in BDT so you can manage your true cloud costs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-6 shadow-2xl">
            <div className="flex gap-2 mb-4 border-b border-gray-800 pb-4">
              <button className="text-[#ff6b4a] text-xs font-semibold uppercase tracking-wider border-b border-[#ff6b4a] pb-1">Python</button>
              <button className="text-gray-500 text-xs font-semibold uppercase tracking-wider hover:text-gray-300 pb-1 px-4">Node.js</button>
              <button className="text-gray-500 text-xs font-semibold uppercase tracking-wider hover:text-gray-300 pb-1 px-4">cURL</button>
            </div>
            <pre className="text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
{`from openai import OpenAI

client = OpenAI(
  base_url="https://api.readypi.io/v1",
  api_key="rpi_live_*******************"
)

completion = client.chat.completions.create(
  model="anthropic/claude-3.5-sonnet", # Access any provider!
  messages=[
    {"role": "user", "content": "Write a high-performance HTTP server"}
  ]
)

print(completion.choices[0].message.content)`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050508] border-t border-gray-900 pt-16 pb-8 px-6 text-sm">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center mb-6" aria-label="ReadyPi home">
              <PiMark variant="logo" withWordmark />
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed">
              The unified gateway for AI models. Built by Rareware Studio in Bangladesh, designed for developers globally.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-gray-500 text-xs">
              <li><Link href="/models" className="hover:text-white transition-colors">Models & Pricing</Link></li>
              <li><Link href="/playground" className="hover:text-white transition-colors">Chat Playground</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/api-keys" className="hover:text-white transition-colors">API Keys</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-gray-500 text-xs">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/docs/quickstart" className="hover:text-white transition-colors">Quickstart Guide</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/discord" className="hover:text-white transition-colors">Discord Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-gray-500 text-xs">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div>© 2026 ReadyPi Inc. · A Rareware Studio Product · Sylhet, Bangladesh 🇧🇩</div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> All Systems Operational</span>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        @keyframes gridMove { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out 0.2s both; }
      `}</style>
    </main>
  )
}
