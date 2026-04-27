'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import PiMark from './PiMark'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/docs', label: 'Docs' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/playground', label: 'Playground' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-900 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group" aria-label="ReadyPi home">
          <PiMark variant="logo" withWordmark className="group-hover:drop-shadow-[0_0_12px_rgba(255,107,74,0.8)] transition-all" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`font-mono text-xs uppercase tracking-wider transition-colors ${pathname === l.href ? 'text-[#ff6b4a]' : 'text-gray-400 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors px-4 py-2">
            Login
          </Link>
          <Link href="/signup" className="font-mono text-xs uppercase tracking-wider bg-[#ff6b4a] text-white px-5 py-2 rounded hover:shadow-[0_0_20px_rgba(255,107,74,0.4)] transition-all">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-5 h-0.5 bg-current mb-1"></div>
          <div className="w-5 h-0.5 bg-current mb-1"></div>
          <div className="w-5 h-0.5 bg-current"></div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1117] border-t border-gray-800 px-6 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-[#ff6b4a]" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="font-mono text-xs uppercase tracking-wider text-gray-400" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link href="/signup" className="font-mono text-xs uppercase tracking-wider bg-[#ff6b4a] text-white px-4 py-2 rounded text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  )
}
