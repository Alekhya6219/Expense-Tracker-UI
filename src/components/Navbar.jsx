import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Receipt, LogOut } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.brand}>
          <span className={styles.brandIcon}>💸</span>
          <span className={styles.brandName}>SpendWise</span>
        </Link>

        <div className={styles.links}>
          <Link to="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}>
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link to="/expenses" className={`${styles.link} ${pathname === '/expenses' ? styles.active : ''}`}>
            <Receipt size={16} />
            Expenses
          </Link>
        </div>

        <div className={styles.right}>
          <span className={styles.userName}>{user?.name}</span>
          <button onClick={logout} className={styles.logoutBtn} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
