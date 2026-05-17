import { useState, useEffect } from 'react'
import { expensesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, IndianRupee, Calendar } from 'lucide-react'
import styles from './Dashboard.module.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const PIE_COLORS = ['#6c63ff','#22c55e','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6','#f97316']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: 'var(--text-muted)' }}>{payload[0].name || payload[0].payload.month}</p>
      <p style={{ color: 'var(--accent-light)', fontWeight: 700 }}>₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    expensesAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  const monthlyData = (stats?.monthlyTotals || []).map((m) => ({
    month: MONTHS[m.month - 1],
    total: parseFloat(m.total),
  }))

  const categoryData = (stats?.categorySummary || []).map((c) => ({
    name: c.category,
    value: parseFloat(c.total),
  }))

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Here's your spending overview</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.statGrid}>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ background: 'rgba(108,99,255,0.12)', color: 'var(--accent-light)' }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>All-Time Spending</p>
            <p className={styles.statValue}>₹{Number(stats?.totalAllTime || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>This Month</p>
            <p className={styles.statValue}>₹{Number(stats?.totalThisMonth || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--yellow)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>Top Category</p>
            <p className={styles.statValue}>{categoryData[0]?.name || '—'}</p>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className={styles.chartGrid}>
        <div className="card">
          <h3 className={styles.chartTitle}>Monthly Spending</h3>
          <p className={styles.chartSub}>Last 6 months</p>
          {monthlyData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>No data yet — add some expenses!</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.06)' }} />
                <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className={styles.chartTitle}>By Category</h3>
          <p className={styles.chartSub}>All time breakdown</p>
          {categoryData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>No data yet!</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
