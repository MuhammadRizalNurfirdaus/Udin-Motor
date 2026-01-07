import { useState, useEffect } from 'react';
import { transactionAPI, deliveryAPI } from '../../services/api';

interface Transaction {
    id: string;
    quantity: number;
    totalPrice: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
    motor: { name: string; brand: string; image?: string };
    delivery?: {
        id: string;
        status: string;
        address: string;
        driver: { name: string; phone?: string };
    };
}

export default function MyOrders() {
    const [orders, setOrders] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await transactionAPI.getMy();
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelivery = async (deliveryId: string) => {
        try {
            await deliveryAPI.complete(deliveryId);
            setMessage({ type: 'success', text: 'Pesanan selesai! Terima kasih telah berbelanja.' });
            loadOrders();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal konfirmasi' });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { class: string; label: string; description: string }> = {
            PENDING: {
                class: 'badge-pending',
                label: '⏳ Menunggu Konfirmasi',
                description: 'Pesanan Anda sedang menunggu konfirmasi dari kasir'
            },
            PAID: {
                class: 'badge-paid',
                label: '💳 Pembayaran Dikonfirmasi',
                description: 'Pembayaran dikonfirmasi, sedang diproses'
            },
            PROCESSING: {
                class: 'badge-processing',
                label: '🔄 Sedang Diproses',
                description: 'Motor sedang disiapkan untuk pengiriman'
            },
            DELIVERING: {
                class: 'badge-delivering',
                label: '🚚 Dalam Pengiriman',
                description: 'Motor sedang dalam perjalanan ke alamat Anda'
            },
            DELIVERED: {
                class: 'badge-delivered',
                label: '📦 Sudah Dikirim',
                description: 'Motor sudah sampai, mohon konfirmasi penerimaan'
            },
            COMPLETED: {
                class: 'badge-completed',
                label: '✅ Selesai',
                description: 'Pesanan telah selesai. Terima kasih!'
            },
            CANCELLED: {
                class: 'badge-cancelled',
                label: '❌ Dibatalkan',
                description: 'Pesanan dibatalkan'
            }
        };
        return statusMap[status] || { class: '', label: status, description: '' };
    };

    const getDeliveryStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            PENDING: '📦 Menunggu dijemput supir',
            PICKED_UP: '🚗 Motor diambil supir',
            ON_THE_WAY: '🚚 Sedang dalam perjalanan',
            DELIVERED: '✅ Sudah sampai tujuan'
        };
        return statusMap[status] || status;
    };

    if (isLoading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">📋 Pesanan Saya</h1>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <h3 className="empty-state-title">Belum ada pesanan</h3>
                    <p>Anda belum melakukan pemesanan motor</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map(order => (
                        <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
                                <img
                                    src={order.motor.image || 'https://via.placeholder.com/150?text=Motor'}
                                    alt={order.motor.name}
                                    style={{
                                        width: '150px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-tertiary)'
                                    }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Motor';
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ marginBottom: '5px' }}>{order.motor.brand} {order.motor.name}</h3>
                                            <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                                                {formatCurrency(order.totalPrice)}
                                            </p>
                                        </div>
                                        <span className={`badge ${getStatusInfo(order.status).class}`}>
                                            {getStatusInfo(order.status).label}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '0.9rem' }}>
                                        {getStatusInfo(order.status).description}
                                    </p>
                                </div>
                            </div>

                            {order.delivery && (
                                <div style={{
                                    padding: '15px 20px',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ marginBottom: '5px' }}>
                                                <strong>Supir:</strong> {order.delivery.driver.name}
                                                {order.delivery.driver.phone && (
                                                    <span style={{ marginLeft: '10px', color: 'var(--color-primary)' }}>
                                                        📞 {order.delivery.driver.phone}
                                                    </span>
                                                )}
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {getDeliveryStatus(order.delivery.status)}
                                            </p>
                                        </div>
                                        {order.status === 'DELIVERED' && (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleConfirmDelivery(order.delivery!.id)}
                                            >
                                                ✓ Konfirmasi Diterima
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{
                                padding: '10px 20px',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem'
                            }}>
                                <span>ID: {order.id.slice(0, 8)}...</span>
                                <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
