import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionAPI } from '../../services/api';

export default function CashierDashboard() {
    const { user } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPendingCount();
    }, []);

    const loadPendingCount = async () => {
        try {
            const response = await transactionAPI.getPending();
            setPendingCount(response.data.length);
        } catch (error) {
            console.error('Failed to load pending:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Halo, {user?.name}! 👋</h1>
                <p className="dashboard-subtitle">Dashboard Kasir Udin Motor</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                        {isLoading ? '...' : pendingCount}
                    </div>
                    <div className="stat-label">Transaksi Menunggu</div>
                </div>
            </div>

            <h2 style={{ marginBottom: '20px' }}>Menu Cepat</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <Link to="/cashier/transactions" className="card" style={{ padding: '25px', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💳</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Proses Transaksi</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Konfirmasi pembayaran pelanggan</p>
                </Link>

                <Link to="/cashier/deliveries" className="card" style={{ padding: '25px', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚚</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Atur Pengiriman</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Assign supir untuk pengiriman</p>
                </Link>
            </div>
        </div>
    );
}
