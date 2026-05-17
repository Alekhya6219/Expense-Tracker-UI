import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { expensesAPI } from '../services/api'
import toast from 'react-hot-toast'
import styles from './ExpenseModal.module.css'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Shopping', 'Entertainment', 'Education', 'Other']

const EMPTY_FORM = { title: '', amount: '', category: 'Food', date: '', notes: '' }

export default function ExpenseModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const isEdit = !!expense

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes || '',
      })
    } else {
      // Default date to today
      setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) })
    }
  }, [expense])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount || !form.category || !form.date) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (isEdit) {
        await expensesAPI.update(expense.id, payload)
        toast.success('Expense updated!')
      } else {
        await expensesAPI.create(payload)
        toast.success('Expense added!')
      }
      onSaved()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className={styles.close} onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label>Title *</label>
            <input
              className="form-control"
              name="title"
              placeholder="e.g. Grocery run"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className={styles.row}>
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                className="form-control"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              className="form-control"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-control"
              name="notes"
              placeholder="Optional notes..."
              rows={3}
              value={form.notes}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {isEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
