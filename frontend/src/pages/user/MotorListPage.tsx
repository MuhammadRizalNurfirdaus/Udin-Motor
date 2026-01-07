import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motorAPI, transactionAPI } from '../../services/api';
import MotorCard from '../../components/MotorCard';
import { useAuth } from '../../contexts/AuthContext';

interface Motor {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    stock: number;
    image?: string;
    description?: string;
}

export default function MotorListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [motors, setMotors] = useState<Motor[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
    const [orderAddress, setOrderAddress] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadMotors();
        loadBrands();
    }, []);

    useEffect(() => {
        loadMotors();
    }, [search, brandFilter]);

    const loadMotors = async () => {
        try {
            const response = await motorAPI.getAll({
                search: search || undefined,
                brand: brandFilter || undefined
            });
            setMotors(response.data);
        } catch (error) {
            console.error('Failed to load motors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadBrands = async () => {
        try {
            const response = await motorAPI.getBrands();
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to load brands:', error);
        }
    };

    const handleBuy = (motor: Motor) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedMotor(motor);
        setOrderAddress(user.address || '');
        setShowModal(true);
    };

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMotor) return;

        try {
            await transactionAPI.create({
                motorId: selectedMotor.id,
                quantity: 1,
                paymentMethod: 'CASH',
                address: orderAddress
            });
            setMessage({ type: 'success', text: 'Pesanan berhasil dibuat! Silakan cek halaman Pesanan Saya.' });
            setShowModal(false);
            loadMotors();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal membuat pesanan' });
        }
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
                <h1 className="page-title">🏍️ Daftar Motor</h1>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Cari motor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="form-control form-select filter-select"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                >
                    <option value="">Semua Brand</option>
                    {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                    ))}
                </select>
            </div>

            {motors.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏍️</div>
                    <h3 className="empty-state-title">Motor tidak ditemukan</h3>
                    <p>Coba ubah kata kunci pencarian atau filter</p>
                </div>
            ) : (
                <div className="motor-grid">
                    {motors.map(motor => (
                        <MotorCard
                            key={motor.id}
                            motor={motor}
                            onBuy={handleBuy}
                        />
                    ))}
                </div>
            )}

            {/* Order Modal */}
            {showModal && selectedMotor && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Konfirmasi Pesanan</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleOrder}>
                            <div className="modal-body">
                                <div style={{
                                    padding: '20px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{ marginBottom: '10px' }}>{selectedMotor.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{selectedMotor.brand} - {selectedMotor.model}</p>
                                    <p style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: 'var(--color-primary)',
                                        marginTop: '10px'
                                    }}>
                                        {formatCurrency(selectedMotor.price)}
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Alamat Pengiriman *</label>
                                    <textarea
                                        className="form-control"
                                        value={orderAddress}
                                        onChange={(e) => setOrderAddress(e.target.value)}
                                        rows={3}
                                        required
                                        placeholder="Masukkan alamat lengkap untuk pengiriman"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Metode Pembayaran</label>
                                    <select className="form-control form-select" disabled>
                                        <option value="CASH">Pembayaran di Tempat (COD)</option>
                                    </select>
                                    <small style={{ color: 'var(--text-muted)' }}>Pembayaran dilakukan saat motor diantar</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    🛒 Pesan Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
