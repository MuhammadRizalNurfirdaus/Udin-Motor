import { useState, useEffect } from 'react';
import { transactionAPI } from '../../services/api';

interface Transaction {
    id: string;
    userId: string;
    motorId: string;
    quantity: number;
    totalPrice: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
    user: { name: string; email: string; phone?: string; address?: string };
    motor: { name: string; brand: string };
    cashier?: { name: string };
}

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        loadTransactions();
    }, [statusFilter]);

    const loadTransactions = async () => {
        try {
            const response = await transactionAPI.getAll(statusFilter || undefined);
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setIsLoading(false);
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
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">📋 Semua Transaksi</h1>
                <select
                    className="form-control form-select"
                    style={{ width: '200px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Semua Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Dibayar</option>
                    <option value="PROCESSING">Diproses</option>
                    <option value="DELIVERING">Dikirim</option>
                    <option value="DELIVERED">Terkirim</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="CANCELLED">Dibatalkan</option>
                </select>
            </div>

            {transactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3 className="empty-state-title">Belum ada transaksi</h3>
                    <p>Transaksi akan muncul di sini ketika pelanggan melakukan pemesanan</p>
                </div>
            ) : (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Pelanggan</th>
                                <th>Motor</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Kasir</th>
                                <th>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td><code>{tx.id.slice(0, 8)}...</code></td>
                                    <td>
                                        <strong>{tx.user.name}</strong>
                                        <br />
                                        <small style={{ color: 'var(--text-secondary)' }}>{tx.user.phone || tx.user.email}</small>
                                    </td>
                                    <td>
                                        {tx.motor.brand} {tx.motor.name}
                                        {tx.quantity > 1 && <span> x{tx.quantity}</span>}
                                    </td>
                                    <td><strong>{formatCurrency(tx.totalPrice)}</strong></td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(tx.status).class}`}>
                                            {getStatusBadge(tx.status).label}
                                        </span>
                                    </td>
                                    <td>{tx.cashier?.name || '-'}</td>
                                    <td>{new Date(tx.createdAt).toLocaleDateString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
