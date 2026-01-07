import { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';

interface Staff {
    id: string;
    email: string;
    name: string;
    role: 'CASHIER' | 'DRIVER';
    phone?: string;
    createdAt: string;
}

export default function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'CASHIER' | 'DRIVER'>('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'CASHIER' as 'CASHIER' | 'DRIVER'
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadStaff();
    }, [activeTab]);

    const loadStaff = async () => {
        try {
            const response = await staffAPI.getAll(activeTab === 'all' ? undefined : activeTab);
            setStaff(response.data);
        } catch (error) {
            console.error('Failed to load staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            await staffAPI.register(formData);
            setMessage({ type: 'success', text: `${formData.role === 'CASHIER' ? 'Kasir' : 'Supir'} berhasil didaftarkan!` });
            setShowModal(false);
            setFormData({ email: '', password: '', name: '', phone: '', role: 'CASHIER' });
            loadStaff();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal mendaftarkan staff' });
        }
    };

    const handleDelete = async (staffMember: Staff) => {
        if (confirm(`Yakin ingin menghapus ${staffMember.name}?`)) {
            try {
                await staffAPI.delete(staffMember.id);
                setMessage({ type: 'success', text: 'Staff berhasil dihapus!' });
                loadStaff();
            } catch (error: any) {
                setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal menghapus staff' });
            }
        }
    };

    const filteredStaff = activeTab === 'all' ? staff : staff.filter(s => s.role === activeTab);

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
                <h1 className="page-title">👥 Kelola Staff</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Tambah Staff
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    Semua
                </button>
                <button
                    className={`tab-btn ${activeTab === 'CASHIER' ? 'active' : ''}`}
                    onClick={() => setActiveTab('CASHIER')}
                >
                    Kasir
                </button>
                <button
                    className={`tab-btn ${activeTab === 'DRIVER' ? 'active' : ''}`}
                    onClick={() => setActiveTab('DRIVER')}
                >
                    Supir
                </button>
            </div>

            {filteredStaff.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    <h3 className="empty-state-title">Belum ada staff</h3>
                    <p>Klik tombol "Tambah Staff" untuk mendaftarkan kasir atau supir</p>
                </div>
            ) : (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Telepon</th>
                                <th>Terdaftar</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map(member => (
                                <tr key={member.id}>
                                    <td><strong>{member.name}</strong></td>
                                    <td>{member.email}</td>
                                    <td>
                                        <span className={`badge ${member.role === 'CASHIER' ? 'badge-paid' : 'badge-delivering'}`}>
                                            {member.role === 'CASHIER' ? '💼 Kasir' : '🚗 Supir'}
                                        </span>
                                    </td>
                                    <td>{member.phone || '-'}</td>
                                    <td>{new Date(member.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(member)}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Tambah Staff Baru</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Role *</label>
                                    <select
                                        className="form-control form-select"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as 'CASHIER' | 'DRIVER' })}
                                        required
                                    >
                                        <option value="CASHIER">Kasir</option>
                                        <option value="DRIVER">Supir</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nama lengkap"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Minimal 6 karakter"
                                        minLength={6}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">No. Telepon</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Daftarkan Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
