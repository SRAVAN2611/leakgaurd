export const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
export const fmtTimeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime())/1000
  if(d<60) return 'just now'
  if(d<3600) return Math.floor(d/60)+'m ago'
  if(d<86400) return Math.floor(d/3600)+'h ago'
  return Math.floor(d/86400)+'d ago'
}
export const shortId = (id: string) => id.slice(0,8).toUpperCase()
