'use client';

/**
 * PiMark — ReadyPi canonical brand identity.
 *
 * Variants:
 *   - "logo"  : compact π for navbar/footer (no orbits, no labels)
 *   - "hero"  : large π with glow + orbital dots, intended as the dominant
 *               identity element on hero / authentication pages.
 *
 * No floating data labels (API, GPT-4o, ৳499, bKash, BD, 50+) — the symbol
 * itself is the identity.
 */

import { CSSProperties } from 'react';

type Variant = 'logo' | 'hero';

interface PiMarkProps {
  variant?: Variant;
  size?: number; // px — only used for "hero"; "logo" uses Tailwind text size
  className?: string;
  withWordmark?: boolean; // logo variant only — render "ReadyPi" text next to π
  glow?: boolean;
}

export default function PiMark({
  variant = 'logo',
  size,
  className = '',
  withWordmark = false,
  glow = true,
}: PiMarkProps) {
  if (variant === 'logo') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span
          aria-label="ReadyPi"
          className="relative font-fraunces font-black text-[#ff6b4a] leading-none text-3xl"
          style={
            glow
              ? { textShadow: '0 0 18px rgba(255,107,74,0.55)' }
              : undefined
          }
        >
          π
        </span>
        {withWordmark && (
          <span className="font-fraunces font-bold text-white text-lg tracking-tight">
            ReadyPi
          </span>
        )}
      </span>
    );
  }

  // hero variant
  const px = size ?? 480;
  const fontPx = Math.round(px * 0.46);
  const containerStyle: CSSProperties = { width: px, height: px };

  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={containerStyle}
      aria-hidden="true"
    >
      {/* Radial halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,107,74,0.22) 0%, rgba(255,107,74,0.06) 35%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />

      {/* Concentric orbit rings */}
      <div
        className="absolute inset-[8%] rounded-full border"
        style={{ borderColor: 'rgba(255,107,74,0.18)' }}
      />
      <div
        className="absolute inset-[18%] rounded-full border"
        style={{ borderColor: 'rgba(255,107,74,0.10)' }}
      />

      {/* Orbital dots */}
      <span
        className="absolute w-2.5 h-2.5 rounded-full bg-[#ff6b4a]"
        style={{
          top: '6%',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 10px rgba(255,107,74,0.9)',
        }}
      />
      <span
        className="absolute w-2 h-2 rounded-full"
        style={{
          top: '28%',
          right: '8%',
          background: 'rgba(255,107,74,0.75)',
          boxShadow: '0 0 8px rgba(255,107,74,0.6)',
        }}
      />
      <span
        className="absolute w-2 h-2 rounded-full"
        style={{
          bottom: '24%',
          left: '6%',
          background: 'rgba(255,107,74,0.8)',
          boxShadow: '0 0 8px rgba(255,107,74,0.6)',
        }}
      />
      <span
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{
          bottom: '8%',
          right: '28%',
          background: 'rgba(255,107,74,0.6)',
        }}
      />
      <span
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{
          top: '40%',
          left: '4%',
          background: 'rgba(255,107,74,0.5)',
        }}
      />

      {/* Pi glyph — gradient + drop shadow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-fraunces font-black leading-none"
          style={{
            fontSize: fontPx,
            background:
              'linear-gradient(135deg, #ff8a6a 0%, #ff6b4a 40%, #c8381a 75%, #8a2510 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 32px rgba(255,107,74,0.55))',
          }}
        >
          π
        </span>
      </div>
    </div>
  );
}
