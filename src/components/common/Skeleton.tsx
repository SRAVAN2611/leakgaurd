export function Skeleton({ className='' }: { className?:string }){
  return <div className={`animate-pulse bg-slate-200 dark:bg-[#1e2e42] rounded ${className}`} />
}
export function CardSkeleton(){
  return (
    <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5 space-y-3">
      <Skeleton className="h-4 w-24"/>
      <Skeleton className="h-8 w-20"/>
      <Skeleton className="h-3 w-40"/>
    </div>
  )
}
