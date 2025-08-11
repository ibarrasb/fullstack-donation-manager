import { useEffect, useMemo, useState } from 'react'
import { listDonations, createDonation, updateDonation, deleteDonation } from './api'

export default function App(){
  // Transient UI state only — backend is the source of truth
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state (transient)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    donor_name: '',
    donation_type: 'money',
    amount: '',
    donated_at: todayISODate(),
  })

  // Initial load + any reloads after CRUD
  async function reload(){
    setLoading(true)
    setError('')
    try{
      const data = await listDonations()
      setDonations(data)
    }catch(e){
      setError(e.message || 'Failed to load donations')
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  function onChange(e){
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'amount' ? value : value }))
  }

  function resetForm(){
    setEditingId(null)
    setForm({ donor_name: '', donation_type: 'money', amount: '', donated_at: todayISODate() })
  }

  function startEdit(row){
    setEditingId(row._id)
    setForm({
      donor_name: row.donor_name,
      donation_type: row.donation_type,
      amount: String(row.amount),
      donated_at: toDateInput(row.donated_at),
    })
  }

  async function onSubmit(e){
    e.preventDefault()

    // Minimal client validation (server still validates)
    if(!form.donor_name.trim()) return setError('Donor name is required')
    const amountNum = Number(form.amount)
    if(Number.isNaN(amountNum) || amountNum < 0) return setError('Amount must be a number ≥ 0')

    const payload = {
      donor_name: form.donor_name.trim(),
      donation_type: form.donation_type,
      amount: amountNum,
      donated_at: form.donated_at, // YYYY-MM-DD; server normalizes to Date
    }

    try{
      setError('')
      if(editingId){
        await updateDonation(editingId, payload)
      } else {
        await createDonation(payload)
      }
      resetForm()
      await reload()
    }catch(e){
      setError(e.message || 'Failed to save donation')
    }
  }

  async function onDelete(id){
    if(!confirm('Delete this donation?')) return
    try{
      await deleteDonation(id)
      await reload()
    }catch(e){ setError(e.message || 'Failed to delete donation') }
  }

  const empty = !loading && donations.length === 0
  const title = editingId ? 'Edit Donation' : 'Add Donation'

  return (
    <div className="container">
      <h1>Donation Inventory</h1>

      <section className="card">
        <h2>{title}</h2>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={onSubmit} className="form">
          <div className="row">
            <label>
              <span>Donor Name</span>
              <input name="donor_name" value={form.donor_name} onChange={onChange} required maxLength={200} />
            </label>
            <label>
              <span>Type</span>
              <select name="donation_type" value={form.donation_type} onChange={onChange} required>
                <option value="money">Money</option>
                <option value="food">Food</option>
                <option value="clothing">Clothing</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <div className="row">
            <label>
              <span>Amount / Quantity</span>
              <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={onChange} required />
            </label>
            <label>
              <span>Date</span>
              <input name="donated_at" type="date" value={form.donated_at} onChange={onChange} required />
            </label>
          </div>
          <div className="actions">
            <button type="submit">{editingId ? 'Update' : 'Save'}</button>
            <button type="button" className="secondary" onClick={resetForm}>Clear</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Recorded Donations</h2>
        {loading && <div className="muted">Loading…</div>}
        {empty && <div className="muted">No donations yet.</div>}
        {!loading && donations.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id}>
                  <td>{d.donor_name}</td>
                  <td>{d.donation_type}</td>
                  <td>{Number(d.amount).toLocaleString()}</td>
                  <td>{toDateInput(d.donated_at)}</td>
                  <td className="actions-cell">
                    <button className="link" onClick={() => startEdit(d)}>Edit</button>
                    <button className="link danger" onClick={() => onDelete(d._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function todayISODate(){
  const d = new Date()
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function toDateInput(dateLike){
  // Accept Date string/ISO; return YYYY-MM-DD for <input type="date">
  if(!dateLike) return ''
  const d = new Date(dateLike)
  if(Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${d.getFullYear()}-${mm}-${dd}`
}