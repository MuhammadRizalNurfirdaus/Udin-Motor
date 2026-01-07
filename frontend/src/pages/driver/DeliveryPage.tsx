import { useState, useEffect } from 'react';
import { deliveryAPI } from '../../services/api';

interface Delivery {
    id: string;
    address: string;
    status: string;
    notes?: string;
    deliveredAt?: string;
    createdAt: string;
    transaction: {
        id: string;
        motor: { name: string; brand: string };
        user: { name: string; phone?: string; address?: string };
    };
}

export default function DeliveryPage() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        loadDeliveries();
    }, [statusFilter]);

    const loadDeliveries = async () => {
        try {
            const response = await deliveryAPI.getMy(statusFilter || undefined);
            setDeliveries(response.data);
        } catch (error) {
            console.error('Failed to load deliveries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await deliveryAPI.updateStatus(id, newStatus);
            setMessage({ type: 'success', text: 'Status berhasil diupdate!' });
            loadDeliveries();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal update status' });
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            PENDING: { class: 'badge-pending', label: '⏳ Menunggu' },
            PICKED_UP: { class: 'badge-paid', label: '📦 Diambil' },
            ON_THE_WAY: { class: 'badge-delivering', label: '🚚 Dalam Perjalanan' },
            DELIVERED: { class: 'badge-completed', label: '✅ Terkirim' }
        };
        return statusMap[status] || { class: '', label: status };
    };

    const getNextAction = (status: string) => {
        switch (status) {
            case 'PENDING': return { status: 'PICKED_UP', label: '📦 Ambil Motor' };
            case 'PICKED_UP': return { status: 'ON_THE_WAY', label: '🚚 Mulai Antar' };
            case 'ON_THE_WAY': return { status: 'DELIVERED', label: '✅ Selesai Diantar' };
            default: return null;
        }
    };

    if (isLoading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">🚚 Pengiriman Saya</h1>
                <select
                    className="form-control form-select"
                    style={{ width: '200px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Semua Status</option>
                    <option value="PENDING">Menunggu</option>
                    <option value="PICKED_UP">Diambil</option>
                    <option value="ON_THE_WAY">Dalam Perjalanan</option>
                    <option value="DELIVERED">Terkirim</option>
                </select>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {deliveries.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3 className="empty-state-title">Tidak ada pengiriman</h3>
                    <p>Pengiriman akan muncul ketika kasir menugaskan Anda</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {deliveries.map(delivery => (
                        <div key={delivery.id} className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ marginBottom: '5px' }}>{delivery.transaction.motor.brand} {delivery.transaction.motor.name}</h3>
                                    <span className={`badge ${getStatusBadge(delivery.status).class}`}>
                                        {getStatusBadge(delivery.status).label}
                                    </span>
                                </div>
                                <small style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(delivery.createdAt).toLocaleDateString('id-ID')}
                                </small>
                            </div>

                            <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
                                <div>
                                    <strong>Pelanggan:</strong> {delivery.transaction.user.name}
                                    {delivery.transaction.user.phone && (
                                        <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>
                                            📞 {delivery.transaction.user.phone}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <strong>Alamat:</strong> {delivery.address}
                                </div>
                            </div>

                            {getNextAction(delivery.status) && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleUpdateStatus(delivery.id, getNextAction(delivery.status)!.status)}
                                >
                                    {getNextAction(delivery.status)!.label}
                                </button>
                            )}

                            {delivery.status === 'DELIVERED' && delivery.deliveredAt && (
                                <p style={{ color: 'var(--color-success)', marginTop: '10px' }}>
                                    ✅ Terkirim pada {new Date(delivery.deliveredAt).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
