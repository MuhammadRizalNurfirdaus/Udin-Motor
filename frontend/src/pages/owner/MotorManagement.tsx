import { useState, useEffect, useRef } from 'react';
import { motorAPI, uploadAPI, API_BASE_URL } from '../../services/api';
import MotorCard from '../../components/MotorCard';

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

export default function MotorManagement() {
    const [motors, setMotors] = useState<Motor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMotor, setEditingMotor] = useState<Motor | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        price: 0,
        stock: 0,
        image: '',
        description: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMotors();
    }, []);

    const loadMotors = async () => {
        try {
            const response = await motorAPI.getAll();
            setMotors(response.data);
        } catch (error) {
            console.error('Failed to load motors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setFormData({ ...formData, image: '' }); // Clear URL when file selected
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            let imageUrl = formData.image;

            // Upload image if file selected
            if (imageFile) {
                setIsUploading(true);
                const uploadResponse = await uploadAPI.uploadImage(imageFile);
                imageUrl = `${API_BASE_URL}${uploadResponse.data.url}`;
                setIsUploading(false);
            }

            const dataToSave = { ...formData, image: imageUrl };

            if (editingMotor) {
                await motorAPI.update(editingMotor.id, dataToSave);
                setMessage({ type: 'success', text: 'Motor berhasil diupdate!' });
            } else {
                await motorAPI.create(dataToSave);
                setMessage({ type: 'success', text: 'Motor berhasil ditambahkan!' });
            }
            setShowModal(false);
            resetForm();
            loadMotors();
        } catch (error: any) {
            setIsUploading(false);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Terjadi kesalahan' });
        }
    };

    const handleEdit = (motor: Motor) => {
        setEditingMotor(motor);
        setFormData({
            name: motor.name,
            brand: motor.brand,
            model: motor.model,
            year: motor.year,
            price: motor.price,
            stock: motor.stock,
            image: motor.image || '',
            description: motor.description || ''
        });
        setImagePreview(motor.image || '');
        setImageFile(null);
        setShowModal(true);
    };

    const handleDelete = async (motor: Motor) => {
        if (confirm(`Yakin ingin menghapus ${motor.name}?`)) {
            try {
                await motorAPI.delete(motor.id);
                setMessage({ type: 'success', text: 'Motor berhasil dihapus!' });
                loadMotors();
            } catch (error: any) {
                setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal menghapus motor' });
            }
        }
    };

    const resetForm = () => {
        setEditingMotor(null);
        setFormData({
            name: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            price: 0,
            stock: 0,
            image: '',
            description: ''
        });
        setImageFile(null);
        setImagePreview('');
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
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
                <h1 className="page-title">🏍️ Kelola Motor</h1>
                <button className="btn btn-primary" onClick={openAddModal}>
                    + Tambah Motor
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {motors.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏍️</div>
                    <h3 className="empty-state-title">Belum ada motor</h3>
                    <p>Klik tombol "Tambah Motor" untuk menambahkan motor pertama</p>
                </div>
            ) : (
                <div className="motor-grid">
                    {motors.map(motor => (
                        <MotorCard
                            key={motor.id}
                            motor={motor}
                            isOwner={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingMotor ? 'Edit Motor' : 'Tambah Motor Baru'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nama Motor *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Honda Beat Street 2024"
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Brand *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="Honda"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Model *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.model}
                                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="Beat Street"
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Tahun *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            min="2000"
                                            max="2030"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stok *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Harga (Rp) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        min="0"
                                        placeholder="18500000"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gambar Motor</label>

                                    {/* File Upload */}
                                    <div style={{
                                        border: '2px dashed rgba(255,255,255,0.2)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '20px',
                                        textAlign: 'center',
                                        marginBottom: '10px',
                                        cursor: 'pointer',
                                        background: 'var(--bg-tertiary)'
                                    }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '150px',
                                                    borderRadius: 'var(--radius-sm)'
                                                }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Preview';
                                                }}
                                            />
                                        ) : (
                                            <div>
                                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📷</div>
                                                <p style={{ color: 'var(--text-secondary)' }}>
                                                    Klik untuk upload gambar
                                                </p>
                                                <small style={{ color: 'var(--text-muted)' }}>
                                                    JPG, PNG, WebP (max 5MB)
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    {imageFile && (
                                        <p style={{ color: 'var(--color-success)', fontSize: '0.85rem', marginBottom: '10px' }}>
                                            ✓ File dipilih: {imageFile.name}
                                        </p>
                                    )}

                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '10px 0' }}>atau</div>

                                    {/* URL Input */}
                                    <input
                                        type="url"
                                        className="form-control"
                                        value={formData.image}
                                        onChange={e => {
                                            setFormData({ ...formData, image: e.target.value });
                                            setImageFile(null);
                                            setImagePreview(e.target.value);
                                        }}
                                        placeholder="Masukkan URL gambar"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Deskripsi</label>
                                    <textarea
                                        className="form-control"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Deskripsi motor..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                                    {isUploading ? '⏳ Mengupload...' : (editingMotor ? 'Simpan Perubahan' : 'Tambah Motor')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
