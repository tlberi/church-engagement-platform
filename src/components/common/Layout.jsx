import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Responsive detection
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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
    { path: '/growth', icon: '📈', label: 'Growth' },
    { path: '/attendance', icon: '✅', label: 'Attendance' },
    { path: '/alerts', icon: '🚨', label: 'Alerts' },
    { path: '/reports', icon: '📊', label: 'Reports' },
    { path: '/diagnostics', icon: '🧪', label: 'Diagnostics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className={cn(
          "flex items-center justify-between px-6 py-4 max-w-full",
          isDesktop ? 'px-6' : 'px-4'
        )}>
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "p-2 bg-transparent border-none text-2xl cursor-pointer text-gray-700 block md:hidden",
              isDesktop && 'hidden'
            )}
          >
            ☰
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            <span className="text-3xl">⛪</span>
            <span className={cn(
              "text-xl font-bold text-gray-900",
              isDesktop ? 'block' : 'hidden md:block'
            )}>
              Church Platform
            </span>
          </div>

          {/* User menu */}
          <div className={cn(
            "flex items-center gap-4",
            isDesktop ? 'block' : 'hidden md:flex'
          )}>
            <span className="text-sm text-gray-500">
              {currentUser?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white border-none rounded-lg text-sm font-semibold cursor-pointer hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-30 md:translate-x-0",
          isDesktop || sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <nav className="flex-1 p-4 overflow-y-auto">
            {menuItems.map(item => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 bg-transparent border-none text-base text-gray-700 cursor-pointer transition-colors text-left rounded-lg hover:bg-gray-100",
                  isActive(item.path) && "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600"
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Version info */}
          <div className="p-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1">v1.0.0</div>
            <div className="text-xs text-green-600 font-medium">✅ All systems operational</div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && !isDesktop && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={cn(
          "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300",
          isDesktop ? 'ml-64' : 'ml-0'
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

