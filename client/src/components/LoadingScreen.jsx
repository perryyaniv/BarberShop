import { Scissors } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-charcoal flex flex-col items-center justify-center z-50 gap-8">
      <div className="relative flex items-center justify-center">
        {/* Outer ping ring */}
        <div className="absolute w-28 h-28 rounded-full border border-gold/30 animate-ping" style={{ animationDuration: '1.8s' }} />
        {/* Inner glow */}
        <div className="absolute w-20 h-20 rounded-full bg-gold/10 animate-pulse" />
        {/* Scissors */}
        <div className="scissors-snip relative z-10">
          <Scissors className="w-14 h-14 text-gold drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-white font-bold text-lg tracking-wide">
          HairStyles <span className="text-gold">RP</span>
        </p>
        <p className="text-white/40 text-sm loading-dots">טוען</p>
      </div>
    </div>
  )
}
