import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import { getProvinces, getCities, getDistricts, getVillages, getPostalCode } from '../../data/locationData';

const ProfilePage = () => {
    const { user: authUser, updateUser: setAuthUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [formData, setFormData] = useState({
        name: authUser?.name || '',
        phone: authUser?.phone || '',
        email: authUser?.email || '',
        address: authUser?.address || '',
        province: authUser?.province || '',
        city: authUser?.city || '',
        district: authUser?.district || '',
        village: authUser?.village || '',
        postalCode: authUser?.postalCode || '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Address Dropdown Data
    const [provinces, setProvinces] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [villages, setVillages] = useState<{ name: string, postalCode: string }[]>([]);

    useEffect(() => {
        if (authUser) {
            loadProfile();
            setFormData(prev => ({
                ...prev,
                name: authUser.name || prev.name,
                email: authUser.email || prev.email,
            }));
        }
        setProvinces(getProvinces());
    }, [authUser]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getProfile();
            const data = response.data;

            setFormData({
                name: data.name || authUser?.name || '',
                phone: data.phone || authUser?.phone || '',
                email: data.email || authUser?.email || '',
                address: data.address || authUser?.address || '',
                province: data.province || authUser?.province || '',
                city: data.city || authUser?.city || '',
                district: data.district || authUser?.district || '',
                village: data.village || authUser?.village || '',
                postalCode: data.postalCode || authUser?.postalCode || '',
            });

            // Pre-load cascading data if values exist
            if (data.province) {
                setCities(getCities(data.province));
                if (data.city) {
                    setDistricts(getDistricts(data.province, data.city));
                    if (data.district) {
                        setVillages(getVillages(data.province, data.city, data.district));
                    }
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal memuat profil');
        } finally {
            setLoading(false);
        }
    };

    // Address Change Handlers (Cascading)
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            province: value,
            city: '', district: '', village: '', postalCode: ''
        }));
        setCities(value ? getCities(value) : []);
        setDistricts([]);
        setVillages([]);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            city: value,
            district: '', village: '', postalCode: ''
        }));
        setDistricts(value ? getDistricts(formData.province, value) : []);
        setVillages([]);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            district: value,
            village: '', postalCode: ''
        }));
        setVillages(value ? getVillages(formData.province, formData.city, value) : []);
    };

    const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const postalCode = getPostalCode(formData.province, formData.city, formData.district, value);
        setFormData(prev => ({
            ...prev,
            village: value,
            postalCode
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
        try {
            const response = await userAPI.uploadProfileImage(file);
            // Update local auth context
            const updatedUser = { ...authUser!, profileImage: response.data.profileImage };
            setAuthUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Ensure persistent storage update
            setSuccess('Foto profil berhasil diperbarui');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal upload foto');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload: any = {
                name: formData.name,
                phone: formData.phone
            };

            // Include address fields only for USER role
            if (authUser?.role === 'USER') {
                payload.address = formData.address;
                payload.province = formData.province;
                payload.city = formData.city;
                payload.district = formData.district;
                payload.village = formData.village;
                payload.postalCode = formData.postalCode;
            }

            // Include password if user wants to change it
            if (activeTab === 'password') {
                if (passwordData.newPassword) {
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                        setError('Konfirmasi password baru tidak cocok');
                        setSaving(false);
                        return;
                    }
                    if (!passwordData.currentPassword) {
                        setError('Masukkan password saat ini untuk konfirmasi perubahan');
                        setSaving(false);
                        return;
                    }
                    payload.currentPassword = passwordData.currentPassword;
                    payload.newPassword = passwordData.newPassword;
                }
            }

            const response = await userAPI.updateProfile(payload);

            // Update context
            const updatedUser = { ...authUser, ...response.data.user };
            setAuthUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setSuccess('Profil berhasil disimpan');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);

        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal menyimpan profil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const isUser = authUser?.role === 'USER';
    const roleLabel = {
        OWNER: 'Pemilik Toko',
        CASHIER: 'Kasir',
        DRIVER: 'Supir Pengiriman',
        USER: 'Pelanggan'
    }[authUser?.role || 'USER'];

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">⚙️ Pengaturan Profil</h1>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="profile-container">
                {/* Left Sidebar: Photo & Menu */}
                <div className="profile-sidebar">
                    <div className="card">
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div className="profile-avatar-container">
                                <img
                                    src={authUser?.profileImage ? `http://localhost:4115${authUser.profileImage}` : `https://ui-avatars.com/api/?name=${formData.name}&background=random`}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="profile-avatar-btn"
                                    title="Ubah Foto"
                                >
                                    {uploading ? '⏳' : '📷'}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' }}>{authUser?.name}</h2>
                            <span className="badge badge-paid">{roleLabel}</span>

                            <div className="profile-nav">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                >
                                    👤 Informasi Dasar
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`profile-nav-btn ${activeTab === 'password' ? 'active' : ''}`}
                                >
                                    🔒 Ganti Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="profile-content">
                    <form onSubmit={handleSubmit} className="card">
                        <div className="card-body">
                            {activeTab === 'profile' && (
                                <div className="fade-in">
                                    <h3 className="form-section-title">Informasi Pribadi</h3>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                className="form-control"
                                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                                disabled
                                            />
                                            <small style={{ color: 'var(--text-muted)' }}>Email tidak dapat diubah</small>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Nomor Telepon</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder="Contoh: 08123456789"
                                            />
                                        </div>
                                    </div>

                                    {/* Address Section - Only for USER role */}
                                    {isUser && (
                                        <div style={{ marginTop: '30px' }}>
                                            <h3 className="form-section-title">📍 Alamat Pengiriman</h3>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label className="form-label">Provinsi</label>
                                                    <select
                                                        name="province"
                                                        value={formData.province}
                                                        onChange={handleProvinceChange}
                                                        className="form-control form-select"
                                                    >
                                                        <option value="">-- Pilih Provinsi --</option>
                                                        {provinces.map(prov => (
                                                            <option key={prov} value={prov}>{prov}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Kota/Kabupaten</label>
                                                    <select
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleCityChange}
                                                        className="form-control form-select"
                                                        disabled={!formData.province}
                                                    >
                                                        <option value="">-- Pilih Kota --</option>
                                                        {cities.map(ct => (
                                                            <option key={ct} value={ct}>{ct}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Kecamatan</label>
                                                    <select
                                                        name="district"
                                                        value={formData.district}
                                                        onChange={handleDistrictChange}
                                                        className="form-control form-select"
                                                        disabled={!formData.city}
                                                    >
                                                        <option value="">-- Pilih Kecamatan --</option>
                                                        {districts.map(dist => (
                                                            <option key={dist} value={dist}>{dist}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Desa/Kelurahan</label>
                                                    <select
                                                        name="village"
                                                        value={formData.village}
                                                        onChange={handleVillageChange}
                                                        className="form-control form-select"
                                                        disabled={!formData.district}
                                                    >
                                                        <option value="">-- Pilih Desa --</option>
                                                        {villages.map(v => (
                                                            <option key={v.name} value={v.name}>{v.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Kode Pos</label>
                                                    <input
                                                        type="text"
                                                        name="postalCode"
                                                        value={formData.postalCode}
                                                        readOnly
                                                        className="form-control"
                                                        style={{ background: 'var(--bg-tertiary)' }}
                                                        placeholder="Otomatis terisi"
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Alamat Lengkap (Jalan, No. Rumah, RT/RW)</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                    rows={3}
                                                    placeholder="Contoh: Jl. Pramuka No. 123, RT 01/RW 02"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div className="fade-in">
                                    <h3 className="form-section-title">Keamanan Akun</h3>

                                    <div className="form-group">
                                        <label className="form-label">Password Saat Ini</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="form-control"
                                            placeholder="Masukkan password lama..."
                                        />
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                            Kosongkan jika Anda login menggunakan Google.
                                        </p>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Password Baru</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="form-control"
                                                placeholder="Minimal 6 karakter"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Konfirmasi Password Baru</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="form-control"
                                                placeholder="Ulangi password baru"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="card-footer" style={{ textAlign: 'right' }}>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn btn-primary"
                            >
                                {saving ? (
                                    <>
                                        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    '💾 Simpan Perubahan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
