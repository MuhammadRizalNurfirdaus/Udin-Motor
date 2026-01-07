import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motorAPI } from '../../services/api';
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

export default function HomePage() {
    const { user } = useAuth();
    const [featuredMotors, setFeaturedMotors] = useState<Motor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFeaturedMotors();
    }, []);

    const loadFeaturedMotors = async () => {
        try {
            const response = await motorAPI.getAll();
            setFeaturedMotors(response.data.slice(0, 4));
        } catch (error) {
            console.error('Failed to load motors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in">
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '60px'
            }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>
                    🏍️ <span style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>Udin Motor</span>
                </h1>
                <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
                    Dealer motor terpercaya dengan koleksi motor terlengkap dan harga terbaik.
                    Temukan motor impian Anda di sini!
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to="/motors" className="btn btn-primary btn-lg">
                        Lihat Semua Motor
                    </Link>
                    {!user && (
                        <Link to="/register" className="btn btn-outline btn-lg">
                            Daftar Sekarang
                        </Link>
                    )}
                </div>
            </section>

            {/* Features */}
            <section style={{ marginBottom: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
                    <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
                        <h3 style={{ marginBottom: '10px' }}>Motor Berkualitas</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Semua motor dijamin kondisi baik dan terawat</p>
                    </div>
                    <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💰</div>
                        <h3 style={{ marginBottom: '10px' }}>Harga Terjangkau</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Harga kompetitif dengan pilihan pembayaran fleksibel</p>
                    </div>
                    <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚚</div>
                        <h3 style={{ marginBottom: '10px' }}>Pengiriman Gratis</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Gratis antar ke alamat Anda di area cakupan</p>
                    </div>
                </div>
            </section>

            {/* Featured Motors */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem' }}>🔥 Motor Populer</h2>
                    <Link to="/motors" className="btn btn-secondary">Lihat Semua →</Link>
                </div>

                {isLoading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : (
                    <div className="motor-grid">
                        {featuredMotors.map(motor => (
                            <MotorCard
                                key={motor.id}
                                motor={motor}
                                showActions={false}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
