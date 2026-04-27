'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { keysAPI, creditsAPI } from '@/lib/api'
import { Activity, Key, BarChart3, Plus, Trash2, Copy, Check, TerminalSquare, ChevronLeft, Loader2, LogOut } from 'lucide-react'

interface APIKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  is_active: boolean
}

export default function UserDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  
  const [tab, setTab] = useState<'keys' | 'usage' | 'logs'>('keys')
  const [copied, setCopied] = useState<string | null>(null)
  const [keys, setKeys] = useState<APIKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [creatingKey, setCreatingKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  
  const [stats, setStats] = useState<any>(null)
  const [usage, setUsage] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingUsage, setLoadingUsage] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchKeys()
      fetchStats()
      fetchUsage()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const { data } = await creditsAPI.stats()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchUsage = async () => {
    try {
      setLoadingUsage(true)
      const { data } = await creditsAPI.usage()
      setUsage(data.usage || [])
    } catch (err) {
      console.error('Failed to fetch usage', err)
    } finally {
      setLoadingUsage(false)
    }
  }

  const fetchKeys = async () => {
    try {
      setLoadingKeys(true)
      const { data } = await keysAPI.list()
      setKeys(data.keys || [])
    } catch (err) {
      console.error('Failed to fetch keys', err)
    } finally {
      setLoadingKeys(false)
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    try {
      setCreatingKey(true)
      const { data } = await keysAPI.create(newKeyName.trim())
      setNewlyCreatedKey(data.api_key) // Show full key once
      setNewKeyName('')
      await fetchKeys()
    } catch (err) {
      console.error('Failed to create key', err)
    } finally {
      setCreatingKey(false)
    }
  }

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this key? Any applications using it will instantly fail.')) return
    
    try {
      await keysAPI.revoke(id)
      await fetchKeys()
    } catch (err) {
      console.error('Failed to revoke key', err)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF4500]" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e6e0e9] font-mono">
      <nav className="h-16 bg-[#0d1117] border-b border-[#262626] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[#948e9c] hover:text-[#FF4500] transition-colors">
            <ChevronLeft size={16} /> Back
          </Link>
          <div className="h-4 w-[1px] bg-[#262626]"></div>
          <div className="flex items-center gap-2 text-white font-semibold uppercase tracking-widest font-technical">
            <TerminalSquare size={18} className="text-[#FF4500]" /> Console Dashboard
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-technical text-[#948e9c]">
            {user.email}
          </div>
          <button 
            onClick={() => logout()} 
            className="p-2 text-[#948e9c] hover:text-[#FF4500] hover:bg-[#FF4500]/10 rounded transition-colors"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0d1117] border border-[#262626] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4500] opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
            <div className="text-[#948e9c] font-technical text-technical-label uppercase tracking-widest mb-2 flex items-center justify-between">
              Token Balance
              <Link href="/billing" className="text-[#FF4500] hover:underline normal-case tracking-normal text-xs">Top Up</Link>
            </div>
            <div className="text-4xl font-serif font-bold text-white">
              {user.credits?.balance?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-[#948e9c] mt-2 font-technical">AVAILABLE CREDITS</div>
          </div>

          <div className="bg-[#0d1117] border border-[#262626] rounded-xl p-6">
            <div className="text-[#948e9c] font-technical text-technical-label uppercase tracking-widest mb-2">
              Plan Tier
            </div>
            <div className="text-4xl font-serif font-bold text-white capitalize">
              {user.plan_tier || 'Free'}
            </div>
            <div className="text-xs text-[#948e9c] mt-2 font-technical">CURRENT SUBSCRIPTION</div>
          </div>

          <div className="bg-[#0d1117] border border-[#262626] rounded-xl p-6">
            <div className="text-[#948e9c] font-technical text-technical-label uppercase tracking-widest mb-2">
              Active Keys
            </div>
            <div className="text-4xl font-serif font-bold text-white">
              {user.api_key_count || 0}
            </div>
            <div className="text-xs text-[#948e9c] mt-2 font-technical">SECURITY CREDENTIALS</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#262626] mb-8">
          <button onClick={() => setTab('keys')} className={`px-6 py-3 font-technical text-technical-label uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${tab === 'keys' ? 'border-[#FF4500] text-[#FF4500]' : 'border-transparent text-[#948e9c] hover:text-white'}`}><Key size={16} /> Access Keys</button>
          <button onClick={() => setTab('usage')} className={`px-6 py-3 font-technical text-technical-label uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${tab === 'usage' ? 'border-[#FF4500] text-[#FF4500]' : 'border-transparent text-[#948e9c] hover:text-white'}`}><BarChart3 size={16} /> Analytics</button>
          <button onClick={() => setTab('logs')} className={`px-6 py-3 font-technical text-technical-label uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${tab === 'logs' ? 'border-[#FF4500] text-[#FF4500]' : 'border-transparent text-[#948e9c] hover:text-white'}`}><Activity size={16} /> Audit Logs</button>
        </div>

        {/* Tab Content: Keys */}
        {tab === 'keys' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-white uppercase tracking-wider">Gateway Credentials</h2>
              <button 
                onClick={() => setShowKeyModal(true)}
                className="bg-[#FF4500] text-white px-4 py-2 rounded font-technical text-technical-label uppercase tracking-widest flex items-center gap-2 hover:bg-[#D93B00] transition-colors"
              >
                <Plus size={16} /> Generate Key
              </button>
            </div>

            {/* Modal for creating key */}
            {showKeyModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0d1117] border border-[#262626] rounded-xl w-full max-w-md overflow-hidden animate-slide-up">
                  <div className="p-6 border-b border-[#262626]">
                    <h3 className="font-serif font-bold text-xl text-white">GENERATE ACCESS KEY</h3>
                  </div>
                  
                  {newlyCreatedKey ? (
                    <div className="p-6 space-y-4">
                      <div className="bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500] p-4 rounded text-sm font-technical">
                        Store this key immediately. You will not be able to see it again.
                      </div>
                      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#262626] p-3 rounded">
                        <code className="text-white flex-1 overflow-x-auto whitespace-nowrap">{newlyCreatedKey}</code>
                        <button 
                          onClick={() => handleCopy(newlyCreatedKey, 'new')}
                          className="p-2 text-[#948e9c] hover:text-white bg-[#141218] rounded"
                        >
                          {copied === 'new' ? <Check size={16} className="text-[#FF4500]" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          setNewlyCreatedKey(null)
                          setShowKeyModal(false)
                        }}
                        className="w-full bg-[#262626] text-white py-3 rounded font-technical text-technical-label uppercase hover:bg-[#36343a] transition-colors"
                      >
                        I HAVE STORED THE KEY
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateKey} className="p-6 space-y-6">
                      <div>
                        <label className="font-technical text-technical-label text-[#948e9c] block mb-2 uppercase">Key Designation</label>
                        <input 
                          type="text" 
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="e.g. Production Backend"
                          className="w-full bg-[#0A0A0A] border border-[#262626] text-white py-3 px-4 rounded outline-none focus:border-[#FF4500] font-technical transition-colors"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-3">
                        <button 
                          type="button" 
                          onClick={() => setShowKeyModal(false)}
                          className="flex-1 border border-[#262626] text-[#948e9c] py-3 rounded font-technical text-technical-label uppercase hover:text-white transition-colors"
                        >
                          CANCEL
                        </button>
                        <button 
                          type="submit" 
                          disabled={creatingKey || !newKeyName.trim()}
                          className="flex-1 bg-[#FF4500] text-white py-3 rounded font-technical text-technical-label uppercase hover:bg-[#D93B00] disabled:opacity-50 flex justify-center items-center gap-2 transition-colors"
                        >
                          {creatingKey ? <Loader2 size={16} className="animate-spin" /> : 'GENERATE'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            
            <div className="bg-[#0d1117] border border-[#262626] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#141218] border-b border-[#262626] font-technical text-technical-label text-[#948e9c]">
                  <tr>
                    <th className="py-4 px-6 font-normal">DESIGNATION</th>
                    <th className="py-4 px-6 font-normal">SECRET PREFIX</th>
                    <th className="py-4 px-6 font-normal">CREATED ON</th>
                    <th className="py-4 px-6 font-normal text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626] text-sm">
                  {loadingKeys ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#948e9c]">
                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                        Loading credentials...
                      </td>
                    </tr>
                  ) : keys.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#948e9c] font-technical">
                        No active credentials found. Generate a key to begin.
                      </td>
                    </tr>
                  ) : keys.map(k => (
                    <tr key={k.id} className="hover:bg-[#141218] transition-colors">
                      <td className="py-4 px-6 font-medium text-white">{k.name}</td>
                      <td className="py-4 px-6">
                        <code className="bg-[#0A0A0A] border border-[#262626] px-3 py-1.5 rounded text-[#948e9c] flex items-center gap-3 w-max font-technical">
                          {k.key_prefix}*******************
                          <button onClick={() => handleCopy(k.key_prefix, k.id)} className="text-[#494551] hover:text-[#FF4500] transition-colors">
                            {copied === k.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </code>
                      </td>
                      <td className="py-4 px-6 text-[#948e9c] font-technical">{new Date(k.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleRevokeKey(k.id)}
                          className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors" 
                          title="Revoke Key"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Analytics */}
        {tab === 'usage' && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0d1117] border border-[#262626] p-4 rounded-xl">
                <div className="text-[#948e9c] text-[10px] uppercase tracking-widest mb-1">Total Requests (30d)</div>
                <div className="text-2xl text-white font-bold">{stats?.last_30_days?.total_requests || 0}</div>
              </div>
              <div className="bg-[#0d1117] border border-[#262626] p-4 rounded-xl">
                <div className="text-[#948e9c] text-[10px] uppercase tracking-widest mb-1">Total Tokens (30d)</div>
                <div className="text-2xl text-white font-bold">{(stats?.last_30_days?.total_tokens / 1000).toFixed(1)}k</div>
              </div>
              <div className="bg-[#0d1117] border border-[#262626] p-4 rounded-xl">
                <div className="text-[#948e9c] text-[10px] uppercase tracking-widest mb-1">Avg Latency</div>
                <div className="text-2xl text-white font-bold">{Math.round(stats?.last_30_days?.avg_latency_ms || 0)}ms</div>
              </div>
              <div className="bg-[#0d1117] border border-[#262626] p-4 rounded-xl">
                <div className="text-[#948e9c] text-[10px] uppercase tracking-widest mb-1">Total Cost (30d)</div>
                <div className="text-2xl text-[#00ff9d] font-bold">৳{stats?.last_30_days?.total_cost_bdt?.toFixed(2) || '0.00'}</div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#262626] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#262626]">
                <h3 className="font-serif font-bold text-white uppercase">Model Distribution</h3>
              </div>
              <div className="p-6">
                {loadingStats ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#FF4500]" /></div>
                ) : stats?.model_breakdown?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.model_breakdown.map((m: any) => (
                      <div key={m.model} className="space-y-2">
                        <div className="flex justify-between text-xs font-technical uppercase">
                          <span>{m.model}</span>
                          <span>{m.requests} reqs</span>
                        </div>
                        <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#FF4500]" 
                            style={{ width: `${(m.requests / stats.last_30_days.total_requests) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#494551] font-technical">NO USAGE DATA DETECTED</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Logs */}
        {tab === 'logs' && (
          <div className="animate-fade-in bg-[#0d1117] border border-[#262626] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#262626] flex justify-between items-center">
              <h3 className="font-serif font-bold text-white uppercase">Real-time Traffic Firehose</h3>
              <button onClick={fetchUsage} className="text-xs text-[#FF4500] hover:underline font-technical uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#141218] border-b border-[#262626] font-technical text-[10px] text-[#948e9c] uppercase tracking-widest">
                  <tr>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Model</th>
                    <th className="py-4 px-6">Tokens</th>
                    <th className="py-4 px-6">Cost</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626] text-[11px] font-technical">
                  {loadingUsage ? (
                    <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4500]" /></td></tr>
                  ) : usage.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-[#494551]">AWAITING FIRST REQUEST...</td></tr>
                  ) : usage.map((u, i) => (
                    <tr key={i} className="hover:bg-[#141218] transition-colors">
                      <td className="py-3 px-6 text-[#948e9c]">{new Date(u.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-6 text-white uppercase">{u.model}</td>
                      <td className="py-3 px-6">{u.tokens}</td>
                      <td className="py-3 px-6">৳{u.cost_bdt.toFixed(4)}</td>
                      <td className="py-3 px-6 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
