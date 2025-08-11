export async function listDonations() {
    const res = await fetch('/api/donations')
    if (!res.ok) throw new Error('Failed to fetch donations')
    return res.json()
  }
  
  export async function createDonation(payload) {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.error || 'Failed to create donation')
    }
    return res.json()
  }
  
  export async function updateDonation(id, payload) {
    const res = await fetch(`/api/donations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.error || 'Failed to update donation')
    }
    return res.json()
  }
  
  export async function deleteDonation(id) {
    const res = await fetch(`/api/donations/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) {
      const err = await safeJson(res)
      throw new Error(err?.error || 'Failed to delete donation')
    }
  }
  
  async function safeJson(res){
    try { return await res.json() } catch { return null }
  }
  