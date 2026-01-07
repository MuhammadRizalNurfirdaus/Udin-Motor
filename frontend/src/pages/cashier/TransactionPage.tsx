import { useState, useEffect } from 'react';
import { transactionAPI } from '../../services/api';

interface Transaction {
    id: string;
    quantity: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string; phone?: string; address?: string };
    motor: { name: string; brand: string };
}

export default function TransactionPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

    useEffect(() => {
        loadTransactions();
    }, [activeTab]);

    const loadTransactions = async () => {
        try {
            const response = activeTab === 'pending'
                ? await transactionAPI.getPending()
                : await transactionAPI.getAll();
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcess = async (id: string, status: string) => {
        try {
            await transactionAPI.process(id, status);
            setMessage({
                type: 'success',
                text: status === 'PAID' ? 'Pembayaran dikonfirmasi!' : 'Transaksi dibatalkan'
            });
            loadTransactions();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal memproses' });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            PENDING: { class: 'badge-pending', label: '⏳ Pending' },
            PAID: { class: 'badge-paid', label: '💳 Dibayar' },
            PROCESSING: { class: 'badge-processing', label: '🔄 Diproses' },
            DELIVERING: { class: 'badge-delivering', label: '🚚 Dikirim' },
            DELIVERED: { class: 'badge-delivered', label: '📦 Terkirim' },
            COMPLETED: { class: 'badge-completed', label: '✅ Selesai' },
            CANCELLED: { class: 'badge-cancelled', label: '❌ Dibatalkan' }
        };
        return statusMap[status] || { class: '', label: status };
    };

    if (isLoading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">💳 Transaksi</h1>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Menunggu Konfirmasi
                </button>
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    Semua Transaksi
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3 className="empty-state-title">
                        {activeTab === 'pending' ? 'Tidak ada transaksi pending' : 'Belum ada transaksi'}
                    </h3>
                </div>
            ) : (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Pelanggan</th>
                                <th>Motor</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>
                                        <strong>{tx.user.name}</strong>
                                        <br />
                                        <small style={{ color: 'var(--text-secondary)' }}>
                                            {tx.user.phone || tx.user.email}
                                        </small>
                                        {tx.user.address && (
                                            <>
                                                <br />
                                                <small style={{ color: 'var(--text-muted)' }}>{tx.user.address}</small>
                                            </>
                                        )}
                                    </td>
                                    <td>{tx.motor.brand} {tx.motor.name}</td>
                                    <td><strong>{formatCurrency(tx.totalPrice)}</strong></td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(tx.status).class}`}>
                                            {getStatusBadge(tx.status).label}
                                        </span>
                                    </td>
                                    <td>{new Date(tx.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className="action-btns">
                                            {tx.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleProcess(tx.id, 'PAID')}
                                                    >
                                                        ✓ Konfirmasi
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleProcess(tx.id, 'CANCELLED')}
                                                    >
                                                        ✗ Batal
                                                    </button>
                                                </>
                                            )}
                                            {tx.status === 'PAID' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleProcess(tx.id, 'PROCESSING')}
                                                >
                                                    🔄 Proses
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
