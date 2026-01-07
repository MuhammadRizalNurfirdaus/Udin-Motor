import { useState, useEffect } from 'react';
import { transactionAPI, deliveryAPI } from '../../services/api';

interface Transaction {
    id: string;
    totalPrice: number;
    status: string;
    user: { name: string; phone?: string; address?: string };
    motor: { name: string };
    delivery?: { id: string; status: string; driver: { name: string } };
}

interface Driver {
    id: string;
    name: string;
    phone?: string;
}

export default function DeliveryManagement() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [formData, setFormData] = useState({ driverId: '', address: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [txResponse, driversResponse] = await Promise.all([
                transactionAPI.getAll('PROCESSING'),
                deliveryAPI.getDrivers()
            ]);
            setTransactions(txResponse.data.filter((tx: Transaction) => !tx.delivery));
            setDrivers(driversResponse.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransaction) return;

        try {
            await transactionAPI.assignDelivery({
                transactionId: selectedTransaction.id,
                driverId: formData.driverId,
                address: formData.address
            });
            setMessage({ type: 'success', text: 'Pengiriman berhasil ditugaskan!' });
            setShowModal(false);
            loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal menugaskan pengiriman' });
        }
    };

    const openAssignModal = (tx: Transaction) => {
        setSelectedTransaction(tx);
        setFormData({
            driverId: drivers[0]?.id || '',
            address: tx.user.address || ''
        });
        setShowModal(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (isLoading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">🚚 Atur Pengiriman</h1>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {transactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3 className="empty-state-title">Tidak ada transaksi siap kirim</h3>
                    <p>Transaksi akan muncul setelah dikonfirmasi pembayarannya</p>
                </div>
            ) : (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Pelanggan</th>
                                <th>Motor</th>
                                <th>Total</th>
                                <th>Alamat</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>
                                        <strong>{tx.user.name}</strong>
                                        <br />
                                        <small style={{ color: 'var(--text-secondary)' }}>{tx.user.phone}</small>
                                    </td>
                                    <td>{tx.motor.name}</td>
                                    <td>{formatCurrency(tx.totalPrice)}</td>
                                    <td>{tx.user.address || '-'}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => openAssignModal(tx)}
                                            disabled={drivers.length === 0}
                                        >
                                            🚗 Assign Supir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {drivers.length === 0 && (
                <div className="alert alert-error" style={{ marginTop: '20px' }}>
                    ⚠️ Tidak ada supir terdaftar. Minta pemilik untuk menambahkan supir terlebih dahulu.
                </div>
            )}

            {/* Modal */}
            {showModal && selectedTransaction && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Assign Supir</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAssign}>
                            <div className="modal-body">
                                <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <p><strong>Pelanggan:</strong> {selectedTransaction.user.name}</p>
                                    <p><strong>Motor:</strong> {selectedTransaction.motor.name}</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Pilih Supir *</label>
                                    <select
                                        className="form-control form-select"
                                        value={formData.driverId}
                                        onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Pilih Supir --</option>
                                        {drivers.map(driver => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name} {driver.phone && `(${driver.phone})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Alamat Pengiriman *</label>
                                    <textarea
                                        className="form-control"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        required
                                        placeholder="Alamat lengkap tujuan"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Assign Pengiriman
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
