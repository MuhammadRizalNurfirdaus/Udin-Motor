import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryAPI } from '../../services/api';

export default function DriverDashboard() {
    const { user } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDeliveryCounts();
    }, []);

    const loadDeliveryCounts = async () => {
        try {
            const response = await deliveryAPI.getMy();
            const deliveries = response.data;
            setPendingCount(deliveries.filter((d: any) => d.status === 'PENDING').length);
            setActiveCount(deliveries.filter((d: any) => ['PICKED_UP', 'ON_THE_WAY'].includes(d.status)).length);
        } catch (error) {
            console.error('Failed to load deliveries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Halo, {user?.name}! 🚗</h1>
                <p className="dashboard-subtitle">Dashboard Supir Udin Motor</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                        {isLoading ? '...' : pendingCount}
                    </div>
                    <div className="stat-label">Menunggu Dijemput</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                        {isLoading ? '...' : activeCount}
                    </div>
                    <div className="stat-label">Sedang Diantar</div>
                </div>
            </div>

            <h2 style={{ marginBottom: '20px' }}>Menu</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <Link to="/driver/deliveries" className="card" style={{ padding: '25px', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Daftar Pengiriman</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Lihat dan update status pengiriman</p>
                </Link>
            </div>
        </div>
    );
}
