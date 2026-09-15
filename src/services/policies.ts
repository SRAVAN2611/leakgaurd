import { api, isMockMode } from '../lib/api'
import { mockPolicies } from '../mocks/data'
import { loadPoliciesSeed, savePolicies } from '../lib/persistence'

export type Policy = typeof mockPolicies[number] & { description: string }

function getStore(): Policy[] {
  return loadPoliciesSeed(mockPolicies as any) as Policy[]
}

export async function getPolicies(): Promise<Policy[]>{
  if(isMockMode()) return getStore() as Policy[]
  const { data } = await api.get('/policies')
  return data
}
export async function createPolicy(p: Partial<Policy>): Promise<Policy>{
  if(isMockMode()){
    const store = getStore()
    const np: Policy = { id: 'pol_'+Math.random().toString(36).slice(2,6), name: p.name||'New Policy', category: (p.category as any)||'General', action: (p.action as any)||'WARN', severity: (p.severity as any)||'Medium', enabled: p.enabled ?? true, updatedAt: new Date().toISOString(), description: p.description||'' } as Policy
    const next = [np, ...store]
    savePolicies(next as any)
    return np
  }
  const { data } = await api.post('/policies', p)
  return data
}
export async function updatePolicy(id: string, patch: Partial<Policy>): Promise<Policy>{
  if(isMockMode()){
    const store = getStore()
    const next = store.map(x=> x.id===id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x)
    savePolicies(next as any)
    return next.find(x=>x.id===id) as Policy
  }
  const { data } = await api.put(`/policies/${id}`, patch)
  return data
}
export async function deletePolicy(id: string): Promise<void>{
  if(isMockMode()){ 
    const store = getStore()
    const next = store.filter(x=>x.id!==id)
    savePolicies(next as any)
    return 
  }
  await api.delete(`/policies/${id}`)
}

export async function togglePolicy(id: string, enabled: boolean): Promise<Policy>{
  return updatePolicy(id, { enabled } as any)
}
