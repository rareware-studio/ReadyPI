'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your ReadyPi Assistant. How can I help you scale your AI capabilities today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      // System prompt to guide the assistant
      const systemPrompt = "You are the ReadyPi Native AI Assistant. You help users navigate the ReadyPi platform, generate API snippets, and troubleshoot code. ReadyPi is a premium AI aggregation platform from Bangladesh supporting local payments. You are powered by Gemini 1.5 Flash. Keep your responses helpful, elite, and professional."
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/v1/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NATIVE_ASSISTANT_KEY || 'rpi_native_assistant_key'}` 
        },
        body: JSON.stringify({
          model: 'readypi/gemini-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            { role: 'user', content: userMsg }
          ],
          max_tokens: 512
        })
      })

      const data = await response.json()
      const assistantMsg = data.choices?.[0]?.message?.content || "I'm sorry, I'm having trouble connecting to my brain right now."
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please check your connection." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#00ff88] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.4)] z-[100] hover:scale-110 transition-transform"
      >
        <span className="text-2xl font-fraunces font-black text-[#0a0a0f]">π</span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden glass"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-[#161b22] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                <span className="font-fraunces font-bold text-sm">ReadyPi Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#00ff88]/10 border border-[#00ff88]/20 text-white' : 'bg-[#161b22] border border-gray-800 text-gray-300'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#161b22] border border-gray-800 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-[#00ff88] rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-[#00ff88] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-[#00ff88] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-[#0d1117]">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-[#161b22] border border-gray-800 rounded-full py-2 pl-4 pr-10 text-xs font-mono text-white outline-none focus:border-[#00ff88]"
                />
                <button
                  onClick={handleSend}
                  className="absolute right-2 top-1.5 text-[#00ff88] hover:scale-110 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
