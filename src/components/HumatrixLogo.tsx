'use client'

export function HumatrixLogo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="84" height="84" rx="24" fill="rgba(20,184,196,0.12)" stroke="rgba(20,184,196,0.30)" />
        <path d="M50 20 L68 30 L72 52 L62 72 L50 80 L38 72 L28 52 L32 30 Z"
          stroke="rgba(20,184,196,0.9)" strokeWidth="2" fill="none"/>
        <circle cx="50" cy="33" r="3.5" fill="#14B8C4"/>
        <circle cx="37" cy="43" r="3" fill="#14B8C4" opacity="0.8"/>
        <circle cx="63" cy="43" r="3" fill="#14B8C4" opacity="0.8"/>
        <circle cx="34" cy="58" r="3" fill="#14B8C4" opacity="0.65"/>
        <circle cx="66" cy="58" r="3" fill="#14B8C4" opacity="0.65"/>
        <circle cx="50" cy="52" r="4" fill="#14B8C4"/>
        <circle cx="42" cy="66" r="2.8" fill="#14B8C4" opacity="0.6"/>
        <circle cx="58" cy="66" r="2.8" fill="#14B8C4" opacity="0.6"/>
        <line x1="50" y1="33" x2="37" y2="43" stroke="#14B8C4" strokeWidth="1.6" opacity="0.55"/>
        <line x1="50" y1="33" x2="63" y2="43" stroke="#14B8C4" strokeWidth="1.6" opacity="0.55"/>
        <line x1="37" y1="43" x2="50" y2="52" stroke="#14B8C4" strokeWidth="1.6" opacity="0.55"/>
        <line x1="63" y1="43" x2="50" y2="52" stroke="#14B8C4" strokeWidth="1.6" opacity="0.55"/>
        <line x1="34" y1="58" x2="50" y2="52" stroke="#14B8C4" strokeWidth="1.4" opacity="0.45"/>
        <line x1="66" y1="58" x2="50" y2="52" stroke="#14B8C4" strokeWidth="1.4" opacity="0.45"/>
        <line x1="42" y1="66" x2="50" y2="52" stroke="#14B8C4" strokeWidth="1.4" opacity="0.45"/>
        <line x1="58" y1="66" x2="50" y2="52" stroke="#14B8C4" strokeWidth="1.4" opacity="0.45"/>
      </svg>
      {showText && (
        <div>
          <div className="text-xl font-black tracking-tight leading-none">
            <span style={{ color: '#14B8C4' }}>HUMA</span><span style={{ color: '#0f172a' }}>TRIX</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.30em] leading-none mt-1" style={{ color: '#64748b' }}>
            The Mind Club Company
          </div>
        </div>
      )}
    </div>
  )
}
