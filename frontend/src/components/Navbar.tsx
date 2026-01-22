import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            OWNER: 'Pemilik',
            CASHIER: 'Kasir',
            DRIVER: 'Supir',
            USER: 'Pelanggan'
        };
        return labels[role] || role;
    };

    const isActive = (path: string) => {
        const currentPath = location.pathname;

        // For dashboard routes (exact paths like /owner, /cashier, /driver)
        if (path === '/owner' || path === '/cashier' || path === '/driver') {
            return currentPath === path;
        }

        // For home page
        if (path === '/') {
            return currentPath === '/';
        }

        // For other routes, use prefix matching
        return currentPath.startsWith(path);
    };

    const getNavLinks = () => {
        if (!user) return [];

        switch (user.role) {
            case 'OWNER':
                return [
                    { to: '/owner', label: '📊 Dashboard', icon: '📊' },
                    { to: '/owner/motors', label: '🏍️ Motor', icon: '🏍️' },
                    { to: '/owner/staff', label: '👥 Staff', icon: '👥' },
                    { to: '/owner/transactions', label: '💳 Transaksi', icon: '💳' },
                    { to: '/owner/reports', label: '📈 Laporan', icon: '📈' },
                    { to: '/profile', label: '👤 Profil Saya', icon: '👤' },
                    { to: '/home', label: '🌐 Lihat Website', icon: '🌐' },
                ];
            case 'CASHIER':
                return [
                    { to: '/cashier', label: '📊 Dashboard', icon: '📊' },
                    { to: '/cashier/transactions', label: '💳 Transaksi', icon: '💳' },
                    { to: '/cashier/deliveries', label: '🚚 Pengiriman', icon: '🚚' },
                    { to: '/profile', label: '👤 Profil Saya', icon: '👤' },
                    { to: '/home', label: '🌐 Lihat Website', icon: '🌐' },
                ];
            case 'DRIVER':
                return [
                    { to: '/driver', label: '📊 Dashboard', icon: '📊' },
                    { to: '/driver/deliveries', label: '🚚 Pengiriman', icon: '🚚' },
                    { to: '/profile', label: '👤 Profil Saya', icon: '👤' },
                    { to: '/home', label: '🌐 Lihat Website', icon: '🌐' },
                ];
            case 'USER':
                return [
                    { to: '/', label: 'Beranda', icon: '🏠' },
                    { to: '/motors', label: 'Motor', icon: '🏍️' },
                    { to: '/orders', label: 'Pesanan Saya', icon: '📦' },
                    { to: '/profile', label: 'Profil Saya', icon: '👤' },
                ];
            default:
                return [];
        }
    };

    const isStaffRole = user?.role === 'OWNER' || user?.role === 'CASHIER' || user?.role === 'DRIVER';

    // Sidebar for staff roles
    if (isStaffRole && user) {
        return (
            <>
                {/* Top Navbar */}
                <nav className="navbar" style={{ paddingLeft: isStaffRole ? '260px' : '0' }}>
                    <div className="navbar-content">
                        <div style={{ flex: 1 }}></div>
                        <div className="navbar-user">
                            <span className="user-badge">{getRoleLabel(user.role)}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
                            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Sidebar */}
                <div className="sidebar">
                    <div className="sidebar-brand">
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            🏍️ <span>Udin Motor</span>
                        </Link>
                    </div>
                    <div className="sidebar-nav">
                        {getNavLinks().map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`sidebar-link ${isActive(link.to) ? 'sidebar-link-active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="sidebar-footer">
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            © 2024 Udin Motor
                        </p>
                    </div>
                </div>
            </>
        );
    }

    // Regular navbar for users
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    🏍️ <span>Udin Motor</span>
                </Link>

                <div className="navbar-nav">
                    {getNavLinks().map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link ${isActive(link.to) ? 'nav-link-active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="navbar-user">
                    {user ? (
                        <>
                            <span className="user-badge">{getRoleLabel(user.role)}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
                            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">Masuk</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}


