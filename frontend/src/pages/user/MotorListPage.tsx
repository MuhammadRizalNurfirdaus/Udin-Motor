import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motorAPI, transactionAPI } from '../../services/api';
import MotorCard from '../../components/MotorCard';
import { useAuth } from '../../contexts/AuthContext';
import { getProvinces, getCities, getDistricts, getVillages, getPostalCode } from '../../data/locationData';

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

interface OrderForm {
    quantity: number;
    paymentMethod: string;
    shippingAddress: string;
    shippingProvince: string;
    shippingCity: string;
    shippingDistrict: string;
    shippingVillage: string;
    shippingPostalCode: string;
    shippingPhone: string;
    latitude: number | null;
    longitude: number | null;
}

interface VirtualAccountInfo {
    number: string;
    bank: string;
    amount: number;
    expiredAt: string;
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
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [vaInfo, setVaInfo] = useState<VirtualAccountInfo | null>(null);

    const [orderForm, setOrderForm] = useState<OrderForm>({
        quantity: 1,
        paymentMethod: 'COD',
        shippingAddress: '',
        shippingProvince: '',
        shippingCity: '',
        shippingDistrict: '',
        shippingVillage: '',
        shippingPostalCode: '',
        shippingPhone: '',
        latitude: null,
        longitude: null
    });

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
        setOrderForm({
            quantity: 1,
            paymentMethod: 'COD',
            shippingAddress: user.address || '',
            shippingProvince: user.province || '',
            shippingCity: user.city || '',
            shippingDistrict: user.district || '',
            shippingVillage: user.village || '',
            shippingPostalCode: user.postalCode || '',
            shippingPhone: user.phone || '',
            latitude: null,
            longitude: null
        });
        setShowModal(true);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: 'Browser tidak mendukung geolocation' });
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setOrderForm(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setMessage({ type: 'success', text: 'Lokasi berhasil didapatkan!' });
                setIsGettingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setMessage({ type: 'error', text: 'Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.' });
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMotor) return;

        try {
            const response = await transactionAPI.create({
                motorId: selectedMotor.id,
                quantity: orderForm.quantity,
                paymentMethod: orderForm.paymentMethod,
                shippingAddress: orderForm.shippingAddress,
                shippingCity: orderForm.shippingCity,
                shippingProvince: orderForm.shippingProvince,
                shippingPostalCode: orderForm.shippingPostalCode,
                shippingPhone: orderForm.shippingPhone,
                latitude: orderForm.latitude,
                longitude: orderForm.longitude
            });

            if (response.data.virtualAccount) {
                setVaInfo(response.data.virtualAccount);
                setShowPaymentSuccess(true);
            } else {
                setMessage({ type: 'success', text: 'Pesanan berhasil dibuat! Silakan cek halaman Pesanan Saya.' });
                setShowModal(false);
            }
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

    // Kuningan area bounds (approximate)
    // Kuningan: Lat -6.85 to -7.05, Long 108.35 to 108.65
    const KUNINGAN_BOUNDS = {
        minLat: -7.15,
        maxLat: -6.75,
        minLng: 108.25,
        maxLng: 108.75
    };

    // Check if GPS coordinates are within Kuningan area
    const isGpsInKuningan = () => {
        if (!orderForm.latitude || !orderForm.longitude) return false;

        return (
            orderForm.latitude >= KUNINGAN_BOUNDS.minLat &&
            orderForm.latitude <= KUNINGAN_BOUNDS.maxLat &&
            orderForm.longitude >= KUNINGAN_BOUNDS.minLng &&
            orderForm.longitude <= KUNINGAN_BOUNDS.maxLng
        );
    };

    // Check if location is Kuningan (by city name OR GPS)
    const isKuninganArea = () => {
        // Check city name first
        if (orderForm.shippingCity.toLowerCase().includes('kuningan')) {
            return true;
        }
        // Then check GPS coordinates
        return isGpsInKuningan();
    };

    // Calculate shipping cost based on location
    const getShippingCost = () => {
        if (isKuninganArea()) {
            return 0;
        }
        // Shipping cost for outside Kuningan
        return 500000; // Rp 500.000
    };

    const getSubtotal = () => {
        if (!selectedMotor) return 0;
        return selectedMotor.price * orderForm.quantity;
    };

    const getTotalPrice = () => {
        return getSubtotal() + getShippingCost();
    };

    // Bank account info - Real accounts with simulated name
    const bankAccounts = {
        BANK_BCA: {
            number: '5270424224',
            name: 'UDIN MOTOR INDONESIA',
            code: '014'
        },
        BANK_BNI: {
            number: '1234567890',
            name: 'UDIN MOTOR INDONESIA',
            code: '009'
        },
        BANK_BRI: {
            number: '032101003456789',
            name: 'UDIN MOTOR INDONESIA',
            code: '002'
        },
        BANK_MANDIRI: {
            number: '1370012345678',
            name: 'UDIN MOTOR INDONESIA',
            code: '008'
        }
    };

    const paymentMethods = [
        { value: 'COD', label: 'Bayar di Tempat (COD)', desc: 'Pembayaran saat motor diantar', account: null },
        { value: 'BANK_BCA', label: 'Transfer Bank BCA', desc: `No. Rek: ${bankAccounts.BANK_BCA.number}`, account: bankAccounts.BANK_BCA },
        { value: 'BANK_BNI', label: 'Transfer Bank BNI', desc: `No. Rek: ${bankAccounts.BANK_BNI.number}`, account: bankAccounts.BANK_BNI },
        { value: 'BANK_BRI', label: 'Transfer Bank BRI', desc: `No. Rek: ${bankAccounts.BANK_BRI.number}`, account: bankAccounts.BANK_BRI },
        { value: 'BANK_MANDIRI', label: 'Transfer Bank Mandiri', desc: `No. Rek: ${bankAccounts.BANK_MANDIRI.number}`, account: bankAccounts.BANK_MANDIRI },
    ];

    // Store location
    const storeLocation = {
        address: "Jl. Kroya-Sidaraja, Sidaraja, Kec. Ciawigebang, Kabupaten Kuningan, Jawa Barat 45591",
        plusCode: "2H8C+QV8",
        mapsUrl: "https://maps.google.com/?q=-6.9537,108.4753"
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

            {/* Store Info & Free Shipping Notice */}
            <div style={{
                padding: '15px 20px',
                background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0, 212, 170, 0.05))',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                border: '1px solid rgba(0, 212, 170, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <p style={{ fontWeight: '600', color: 'var(--color-success)', marginBottom: '5px' }}>
                        🚚 GRATIS ONGKIR untuk area Kuningan!
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        📍 {storeLocation.address}
                    </p>
                </div>
                <a
                    href={storeLocation.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                >
                    🗺️ Lihat Lokasi Toko
                </a>
            </div>

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

            {/* Enhanced Order Modal */}
            {showModal && selectedMotor && !showPaymentSuccess && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">🛒 Konfirmasi Pesanan</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleOrder}>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {/* Motor Info */}
                                <div style={{
                                    padding: '20px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <img
                                            src={selectedMotor.image || 'https://via.placeholder.com/100'}
                                            alt={selectedMotor.name}
                                            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        <div>
                                            <h3 style={{ marginBottom: '5px' }}>{selectedMotor.name}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {selectedMotor.brand} - {selectedMotor.model} ({selectedMotor.year})
                                            </p>
                                            <p style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                                                {formatCurrency(selectedMotor.price)} / unit
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="form-group">
                                    <label className="form-label">Jumlah Unit *</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setOrderForm(prev => ({
                                                ...prev,
                                                quantity: Math.max(1, prev.quantity - 1)
                                            }))}
                                            disabled={orderForm.quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            minWidth: '50px',
                                            textAlign: 'center'
                                        }}>
                                            {orderForm.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setOrderForm(prev => ({
                                                ...prev,
                                                quantity: Math.min(selectedMotor.stock, prev.quantity + 1)
                                            }))}
                                            disabled={orderForm.quantity >= selectedMotor.stock}
                                        >
                                            +
                                        </button>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            (Stok: {selectedMotor.stock})
                                        </span>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div style={{
                                    padding: '15px',
                                    background: 'rgba(255, 107, 53, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(255, 107, 53, 0.3)'
                                }}>
                                    {/* Subtotal */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                                        <span style={{ fontWeight: '600' }}>
                                            {formatCurrency(getSubtotal())}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                        {orderForm.quantity} unit × {formatCurrency(selectedMotor.price)}
                                    </p>

                                    {/* Shipping Cost */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Ongkos Kirim:</span>
                                        <span style={{
                                            fontWeight: '600',
                                            color: isKuninganArea() ? 'var(--color-success)' : 'inherit'
                                        }}>
                                            {isKuninganArea() ? 'GRATIS' : formatCurrency(getShippingCost())}
                                        </span>
                                    </div>
                                    {isKuninganArea() && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginBottom: '10px' }}>
                                            ✓ {isGpsInKuningan() ? 'Lokasi GPS terdeteksi di area Kuningan' : 'Area Kuningan'} - Gratis Ongkir!
                                        </p>
                                    )}
                                    {!isKuninganArea() && (orderForm.shippingCity || (orderForm.latitude && orderForm.longitude)) && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                            Pengiriman luar Kuningan
                                        </p>
                                    )}

                                    {/* Total */}
                                    <div style={{
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        paddingTop: '10px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: '600' }}>Total Bayar:</span>
                                        <span style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            color: 'var(--color-primary)'
                                        }}>
                                            {formatCurrency(getTotalPrice())}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="form-group">
                                    <label className="form-label">Metode Pembayaran *</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {paymentMethods.map(pm => (
                                            <label
                                                key={pm.value}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px 15px',
                                                    background: orderForm.paymentMethod === pm.value
                                                        ? 'rgba(255, 107, 53, 0.1)'
                                                        : 'var(--bg-tertiary)',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: orderForm.paymentMethod === pm.value
                                                        ? '1px solid var(--color-primary)'
                                                        : '1px solid transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={pm.value}
                                                    checked={orderForm.paymentMethod === pm.value}
                                                    onChange={(e) => setOrderForm(prev => ({
                                                        ...prev,
                                                        paymentMethod: e.target.value
                                                    }))}
                                                    style={{ accentColor: 'var(--color-primary)' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{pm.label}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {pm.desc}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Address Section */}
                                <div style={{
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    paddingTop: '20px',
                                    marginTop: '10px'
                                }}>
                                    <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        📍 Alamat Pengiriman
                                    </h4>

                                    <div className="form-group">
                                        <label className="form-label">Alamat Lengkap * (Nama Jalan, RT/RW, No. Rumah)</label>
                                        <textarea
                                            className="form-control"
                                            value={orderForm.shippingAddress}
                                            onChange={(e) => setOrderForm(prev => ({
                                                ...prev,
                                                shippingAddress: e.target.value
                                            }))}
                                            rows={2}
                                            required
                                            placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                                        />
                                    </div>

                                    {/* Province & City Dropdown */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Provinsi *</label>
                                            <select
                                                className="form-control form-select"
                                                value={orderForm.shippingProvince}
                                                onChange={(e) => setOrderForm(prev => ({
                                                    ...prev,
                                                    shippingProvince: e.target.value,
                                                    shippingCity: '',
                                                    shippingDistrict: '',
                                                    shippingVillage: '',
                                                    shippingPostalCode: ''
                                                }))}
                                                required
                                            >
                                                <option value="">-- Pilih Provinsi --</option>
                                                {getProvinces().map(prov => (
                                                    <option key={prov} value={prov}>{prov}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Kota/Kabupaten *</label>
                                            <select
                                                className="form-control form-select"
                                                value={orderForm.shippingCity}
                                                onChange={(e) => setOrderForm(prev => ({
                                                    ...prev,
                                                    shippingCity: e.target.value,
                                                    shippingDistrict: '',
                                                    shippingVillage: '',
                                                    shippingPostalCode: ''
                                                }))}
                                                required
                                                disabled={!orderForm.shippingProvince}
                                            >
                                                <option value="">-- Pilih Kota --</option>
                                                {getCities(orderForm.shippingProvince).map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* District & Village Dropdown */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Kecamatan *</label>
                                            <select
                                                className="form-control form-select"
                                                value={orderForm.shippingDistrict}
                                                onChange={(e) => setOrderForm(prev => ({
                                                    ...prev,
                                                    shippingDistrict: e.target.value,
                                                    shippingVillage: '',
                                                    shippingPostalCode: ''
                                                }))}
                                                required
                                                disabled={!orderForm.shippingCity}
                                            >
                                                <option value="">-- Pilih Kecamatan --</option>
                                                {getDistricts(orderForm.shippingProvince, orderForm.shippingCity).map(dist => (
                                                    <option key={dist} value={dist}>{dist}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Desa/Kelurahan *</label>
                                            <select
                                                className="form-control form-select"
                                                value={orderForm.shippingVillage}
                                                onChange={(e) => {
                                                    const village = e.target.value;
                                                    const postalCode = getPostalCode(
                                                        orderForm.shippingProvince,
                                                        orderForm.shippingCity,
                                                        orderForm.shippingDistrict,
                                                        village
                                                    );
                                                    setOrderForm(prev => ({
                                                        ...prev,
                                                        shippingVillage: village,
                                                        shippingPostalCode: postalCode
                                                    }));
                                                }}
                                                required
                                                disabled={!orderForm.shippingDistrict}
                                            >
                                                <option value="">-- Pilih Desa --</option>
                                                {getVillages(orderForm.shippingProvince, orderForm.shippingCity, orderForm.shippingDistrict).map(v => (
                                                    <option key={v.name} value={v.name}>{v.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Postal Code & Phone */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Kode Pos</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={orderForm.shippingPostalCode}
                                                readOnly
                                                placeholder="Otomatis dari desa"
                                                style={{ background: 'var(--bg-tertiary)' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">No. HP Penerima *</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={orderForm.shippingPhone}
                                                onChange={(e) => setOrderForm(prev => ({
                                                    ...prev,
                                                    shippingPhone: e.target.value
                                                }))}
                                                required
                                                placeholder="08123456789"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Share */}
                                    <div className="form-group">
                                        <label className="form-label">Bagikan Lokasi GPS</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleGetLocation}
                                                disabled={isGettingLocation}
                                            >
                                                {isGettingLocation ? '⏳ Mencari...' : '📍 Ambil Lokasi Saya'}
                                            </button>
                                            {orderForm.latitude && orderForm.longitude && (
                                                <span style={{ color: 'var(--color-success)', fontSize: '0.9rem' }}>
                                                    ✓ Lokasi tersimpan
                                                </span>
                                            )}
                                        </div>
                                        {orderForm.latitude && orderForm.longitude && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                                Koordinat: {orderForm.latitude.toFixed(6)}, {orderForm.longitude.toFixed(6)}
                                                <a
                                                    href={`https://maps.google.com/?q=${orderForm.latitude},${orderForm.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    Lihat di Maps →
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    🛒 Pesan Sekarang - {formatCurrency(getTotalPrice())}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Success / Bank Transfer Info Modal */}
            {showPaymentSuccess && vaInfo && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ background: 'var(--color-success)', color: 'white' }}>
                            <h2 className="modal-title">✅ Pesanan Berhasil!</h2>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🏦</div>
                            <h3 style={{ marginBottom: '20px' }}>Transfer ke Rekening Bank</h3>

                            <div style={{
                                padding: '20px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '20px'
                            }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                    Bank {vaInfo.bank}
                                </p>

                                {/* Account Number */}
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '5px'
                                }}>
                                    Nomor Rekening:
                                </p>
                                <p style={{
                                    fontSize: '1.8rem',
                                    fontWeight: '700',
                                    letterSpacing: '2px',
                                    fontFamily: 'monospace',
                                    marginBottom: '10px'
                                }}>
                                    {vaInfo.number}
                                </p>

                                {/* Account Name */}
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '5px'
                                }}>
                                    Nama Rekening:
                                </p>
                                <p style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    color: 'var(--color-primary)',
                                    marginBottom: '15px'
                                }}>
                                    UDIN MOTOR INDONESIA
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(vaInfo.number);
                                        setMessage({ type: 'success', text: 'Nomor rekening disalin!' });
                                    }}
                                >
                                    📋 Salin Nomor Rekening
                                </button>
                            </div>

                            <div style={{
                                padding: '15px',
                                background: 'rgba(255, 107, 53, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '20px'
                            }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Total Pembayaran</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                                    {formatCurrency(vaInfo.amount)}
                                </p>
                            </div>

                            <div style={{
                                padding: '15px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '15px',
                                textAlign: 'left',
                                fontSize: '0.85rem'
                            }}>
                                <p style={{ fontWeight: '600', marginBottom: '8px' }}>📌 Cara Pembayaran:</p>
                                <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                                    <li>Buka aplikasi mobile banking atau ATM</li>
                                    <li>Pilih menu Transfer</li>
                                    <li>Masukkan nomor rekening di atas</li>
                                    <li>Masukkan jumlah: <strong>{formatCurrency(vaInfo.amount)}</strong></li>
                                    <li>Konfirmasi nama: <strong>UDIN MOTOR INDONESIA</strong></li>
                                    <li>Selesaikan pembayaran</li>
                                </ol>
                            </div>

                            <p style={{ color: 'var(--color-warning)', fontSize: '0.9rem' }}>
                                ⏰ Bayar sebelum {new Date(vaInfo.expiredAt).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="modal-footer" style={{ justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowPaymentSuccess(false);
                                    setShowModal(false);
                                    setVaInfo(null);
                                    navigate('/orders');
                                }}
                            >
                                Lihat Pesanan Saya
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

