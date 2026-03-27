export default function LoadingSpinner({ className = '', label = 'Carregando...' }: { className?: string; label?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-3 border-brand-100" />
        <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-brand-600 animate-spin" />
      </div>
      {label && <p className="text-sm text-neutral-400 font-medium">{label}</p>}
    </div>
  )
}
