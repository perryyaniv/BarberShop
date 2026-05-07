import { Scissors } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-charcoal flex flex-col items-center justify-center z-50 gap-8">
      <div className="relative flex items-center justify-center">
        {/* Outer slow ping */}
        <div className="absolute w-36 h-36 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '2.4s' }} />
        {/* Inner ping ring */}
        <div className="absolute w-28 h-28 rounded-full border-2 border-gold/40 animate-ping" style={{ animationDuration: '1.8s' }} />
        {/* Radial glow */}
        <div
          className="absolute w-24 h-24 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0) 70%)',
            animationDuration: '1.5s',
          }}
        />
        {/* Scissors */}
        <div className="scissors-snip relative z-10">
          <Scissors
            className="w-14 h-14 text-gold"
            style={{ filter: 'drop-shadow(0 0 18px rgba(212,175,55,1)) drop-shadow(0 0 36px rgba(212,175,55,0.55))' }}
          />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-white font-bold text-lg tracking-wide">
          HairStyles <span className="text-gold">RP</span>
        </p>
        <p className="text-white/40 text-sm">טוען</p>
      </div>
    </div>
  )
}
