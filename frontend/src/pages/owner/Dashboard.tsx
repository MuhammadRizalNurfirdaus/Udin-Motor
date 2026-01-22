import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';

interface DashboardStats {
    totalUsers: number;
    totalCashiers: number;
    totalDrivers: number;
    totalMotors: number;
    totalTransactions: number;
    totalRevenue: number;
    pendingTransactions: number;
    activeDeliveries: number;
}

export default function OwnerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await userAPI.getDashboard();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Selamat Datang, {user?.name}! 👋</h1>
                <p className="dashboard-subtitle">Dashboard Pemilik Udin Motor</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(stats?.totalRevenue || 0)}
                    </div>
                    <div className="stat-label">Total Pendapatan</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏍️</div>
                    <div className="stat-value">{stats?.totalMotors || 0}</div>
                    <div className="stat-label">Total Motor</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value">{stats?.totalTransactions || 0}</div>
                    <div className="stat-label">Total Transaksi</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                        {stats?.pendingTransactions || 0}
                    </div>
                    <div className="stat-label">Transaksi Pending</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-label">Total Pelanggan</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💼</div>
                    <div className="stat-value">{stats?.totalCashiers || 0}</div>
                    <div className="stat-label">Kasir</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🚗</div>
                    <div className="stat-value">{stats?.totalDrivers || 0}</div>
                    <div className="stat-label">Supir</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                        {stats?.activeDeliveries || 0}
                    </div>
                    <div className="stat-label">Pengiriman Aktif</div>
                </div>
            </div>

            <h2 style={{ marginBottom: '20px' }}>Menu Cepat</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <Link to="/owner/motors" className="card" style={{ padding: '25px', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏍️</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Kelola Motor</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Tambah, edit, hapus motor</p>
                </Link>

                <Link to="/owner/staff" className="card" style={{ padding: '25px', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👨‍💼</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Kelola Staff</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Register kasir & supir</p>
                </Link>

                <Link to="/owner/transactions" className="card" style={{ padding: '25px', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Lihat Transaksi</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Monitor semua transaksi</p>
                </Link>

                <Link to="/owner/reports" className="card" style={{ padding: '25px', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Laporan Keuangan</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Grafik penjualan & laba rugi</p>
                </Link>
            </div>
        </div>
    );
}
