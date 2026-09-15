import { LucideIcon } from 'lucide-react'
export function EmptyState({ icon: Icon, title, description, actions }: { icon?: LucideIcon; title:string; description?:string; actions?: React.ReactNode }){
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#223041] bg-white/60 dark:bg-[#0f1720]/60 p-10 text-center">
      {Icon && <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center mx-auto"><Icon className="w-6 h-6"/></div>}
      <div className="text-[15px] font-semibold text-slate-900 dark:text-white mt-4">{title}</div>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{description}</p>}
      {actions && <div className="mt-5 flex justify-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
export function ErrorState({ message, onRetry }: { message:string; onRetry?:()=>void }){
  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-6 text-center">
      <div className="text-sm font-semibold text-red-700 dark:text-red-300">Something went wrong</div>
      <div className="text-sm text-red-600/80 dark:text-red-300/80 mt-1">{message}</div>
      {onRetry && <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Retry</button>}
    </div>
  )
}
export function DisconnectedState({ onRetry }: { onRetry?:()=>void }){
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-6 text-center">
      <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">API disconnected</div>
      <p className="text-sm text-amber-700/80 dark:text-amber-300/70 mt-1">We couldn't reach the security gateway. Check VITE_API_BASE_URL and try again. {import.meta.env.VITE_USE_MOCK_DATA!=='false' && 'Mock mode is enabled, so you can continue exploring.'}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Retry Connection</button>}
    </div>
  )
}
