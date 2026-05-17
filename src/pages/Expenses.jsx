import { useState, useEffect, useCallback } from 'react'
import { expensesAPI } from '../services/api'
import ExpenseModal from '../components/ExpenseModal'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import styles from './Expenses.module.css'

const CATEGORIES = ['All', 'Food', 'Transport', 'Housing', 'Health', 'Shopping', 'Entertainment', 'Education', 'Other']

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#06b6d4', Housing: '#8b5cf6',
  Health: '#22c55e', Shopping: '#ec4899', Entertainment: '#ef4444',
  Education: '#6c63ff', Other: '#64748b',
}

function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || '#64748b'
  return (
    <span className="badge" style={{ background: `${color}18`, color }}>
      {category}
    </span>
  )
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [category, setCategory] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const PAGE_SIZE = 10

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: PAGE_SIZE }
      if (category !== 'All') params.category = category
      const res = await expensesAPI.getAll(params)
      setExpenses(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    } catch (err) {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [page, category])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  // Reset to page 0 when category changes
  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setPage(0)
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingExpense(null)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    setDeletingId(id)
    try {
      await expensesAPI.delete(id)
      toast.success('Expense deleted')
      fetchExpenses()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Expenses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {totalElements} expense{totalElements !== 1 ? 's' : ''} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* ── Category filter pills ── */}
      <div className={styles.filterBar}>
        <Filter size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <div className={styles.pills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${category === cat ? styles.pillActive : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className={styles.loadingRow}>
            <div className="spinner" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <p style={{ fontWeight: 600 }}>No expenses found</p>
            <p style={{ fontSize: 13 }}>
              {category !== 'All' ? `No expenses in "${category}" category` : 'Add your first expense to get started'}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className={styles.row}>
                  <td>
                    <div className={styles.titleCell}>
                      <span className={styles.expenseTitle}>{exp.title}</span>
                      {exp.notes && (
                        <span className={styles.expenseNotes}>{exp.notes}</span>
                      )}
                    </div>
                  </td>
                  <td><CategoryBadge category={exp.category} /></td>
                  <td className={styles.dateCell}>{formatDate(exp.date)}</td>
                  <td className={styles.amountCell}>
                    ₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleEdit(exp)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(exp.id)}
                        disabled={deletingId === exp.id}
                        title="Delete"
                      >
                        {deletingId === exp.id
                          ? <span className="spinner" style={{ width: 14, height: 14 }} />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Page {page + 1} of {totalPages}
          </span>
          <div className={styles.pageButtons}>
            <button
              className="btn btn-ghost"
              style={{ padding: '8px 12px' }}
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: '8px 12px' }}
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setModalOpen(false)}
          onSaved={fetchExpenses}
        />
      )}
    </div>
  )
}
