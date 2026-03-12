import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/members', icon: '👥', label: 'Members' },
    { path: '/attendance', icon: '✅', label: 'Attendance' },
    { path: '/alerts', icon: '🚨', label: 'Alerts' },
    { path: '/reports', icon: '📊', label: 'Reports' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.menuButton}
          >
            ☰
          </button>

          {/* Logo */}
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⛪</span>
            <span style={styles.logoText}>Church Platform</span>
          </div>

          {/* User menu */}
          <div style={styles.userMenu}>
            <span style={styles.userEmail}>{currentUser?.email}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={styles.main}>
        {/* Sidebar */}
        <aside style={{
          ...styles.sidebar,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}>
          <nav style={styles.nav}>
            {menuItems.map(item => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                style={{
                  ...styles.navItem,
                  ...(isActive(item.path) ? styles.navItemActive : {})
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.background = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Version info */}
          <div style={styles.sidebarFooter}>
            <div style={styles.versionText}>v1.0.0</div>
            <div style={styles.statusText}>✅ All systems operational</div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            style={styles.overlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    maxWidth: '100%',
  },
  menuButton: {
    display: 'block',
    padding: '0.5rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#374151',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: '1.75rem',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#111827',
    display: 'none',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userEmail: {
    fontSize: '0.875rem',
    color: '#6b7280',
    display: 'none',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  main: {
    display: 'flex',
    position: 'relative',
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: '64px',
    bottom: 0,
    width: '16rem',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    zIndex: 30,
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
    overflowY: 'auto',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    fontSize: '0.95rem',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left',
  },
  navItemActive: {
    background: '#eff6ff',
    color: '#667eea',
    fontWeight: '600',
    borderLeft: '3px solid #667eea',
  },
  navIcon: {
    fontSize: '1.25rem',
  },
  navLabel: {
    fontSize: '0.95rem',
  },
  sidebarFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  versionText: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginBottom: '0.25rem',
  },
  statusText: {
    fontSize: '0.75rem',
    color: '#10b981',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
  content: {
    flex: 1,
    marginLeft: '0',
    minHeight: 'calc(100vh - 64px)',
  },
};

// Apply responsive styles based on screen size
function updateStyles() {
  if (window.innerWidth >= 768) {
    styles.menuButton.display = 'none';
    styles.logoText.display = 'block';
    styles.userEmail.display = 'block';
    styles.sidebar.transform = 'translateX(0)';
    styles.content.marginLeft = '16rem';
  } else {
    styles.menuButton.display = 'block';
    styles.logoText.display = 'none';
    styles.userEmail.display = 'none';
    styles.sidebar.transform = 'translateX(-100%)';
    styles.content.marginLeft = '0';
  }
}

updateStyles();
window.addEventListener('resize', updateStyles);