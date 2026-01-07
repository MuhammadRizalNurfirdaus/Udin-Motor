import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

    const getNavLinks = () => {
        if (!user) return [];

        switch (user.role) {
            case 'OWNER':
                return [
                    { to: '/owner', label: 'Dashboard' },
                    { to: '/owner/motors', label: 'Motor' },
                    { to: '/owner/staff', label: 'Staff' },
                    { to: '/owner/transactions', label: 'Transaksi' },
                    { to: '/owner/reports', label: 'Laporan' },
                ];
            case 'CASHIER':
                return [
                    { to: '/cashier', label: 'Dashboard' },
                    { to: '/cashier/transactions', label: 'Transaksi' },
                    { to: '/cashier/deliveries', label: 'Pengiriman' },
                ];
            case 'DRIVER':
                return [
                    { to: '/driver', label: 'Dashboard' },
                    { to: '/driver/deliveries', label: 'Pengiriman' },
                ];
            case 'USER':
                return [
                    { to: '/', label: 'Beranda' },
                    { to: '/motors', label: 'Motor' },
                    { to: '/orders', label: 'Pesanan Saya' },
                ];
            default:
                return [];
        }
    };

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
                            className="nav-link"
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
