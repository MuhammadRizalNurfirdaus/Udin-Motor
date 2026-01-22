import { useState } from 'react';
import { Link } from 'react-router-dom';

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

interface MotorCardProps {
    motor: Motor;
    onBuy?: (motor: Motor) => void;
    onEdit?: (motor: Motor) => void;
    onDelete?: (motor: Motor) => void;
    showActions?: boolean;
    isOwner?: boolean;
    clickable?: boolean;
}

export default function MotorCard({ motor, onBuy, onEdit, onDelete, showActions = true, isOwner = false, clickable = false }: MotorCardProps) {
    const [showLightbox, setShowLightbox] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getStockStatus = () => {
        if (motor.stock === 0) return { text: 'Habis', class: 'stock-out' };
        if (motor.stock <= 3) return { text: `Sisa ${motor.stock}`, class: 'stock-low' };
        return { text: `Stok: ${motor.stock}`, class: 'stock-available' };
    };

    const stockStatus = getStockStatus();

    const handleImageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowLightbox(true);
    };

    const cardContent = (
        <>
            <img
                src={motor.image || 'https://via.placeholder.com/400x200?text=Motor'}
                alt={motor.name}
                className="motor-card-image"
                onClick={handleImageClick}
                style={{ cursor: 'zoom-in' }}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Motor';
                }}
            />
            <div className="motor-card-content">
                <span className="motor-card-brand">{motor.brand}</span>
                <h3 className="motor-card-name">{motor.name}</h3>
                <p className="motor-card-price">{formatPrice(motor.price)}</p>
                <p className={`motor-card-stock ${stockStatus.class}`}>{stockStatus.text}</p>

                {showActions && (
                    <div className="action-btns" style={{ marginTop: '15px' }}>
                        {isOwner ? (
                            <>
                                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.preventDefault(); onEdit?.(motor); }}>
                                    ✏️ Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={(e) => { e.preventDefault(); onDelete?.(motor); }}>
                                    🗑️ Hapus
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={(e) => { e.preventDefault(); onBuy?.(motor); }}
                                disabled={motor.stock === 0}
                                style={{ width: '100%' }}
                            >
                                {motor.stock === 0 ? 'Stok Habis' : '🛒 Beli Sekarang'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );

    // Image Lightbox Modal
    const lightboxModal = showLightbox && (
        <div
            className="modal-overlay"
            onClick={() => setShowLightbox(false)}
            style={{
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.9)'
            }}
        >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                <button
                    onClick={() => setShowLightbox(false)}
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '0',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '2rem',
                        cursor: 'pointer',
                        padding: '10px'
                    }}
                >
                    ✕
                </button>
                <img
                    src={motor.image || 'https://via.placeholder.com/800x600?text=Motor'}
                    alt={motor.name}
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Motor';
                    }}
                />
                <div style={{
                    textAlign: 'center',
                    marginTop: '15px',
                    color: 'white'
                }}>
                    <h3 style={{ marginBottom: '5px' }}>{motor.name}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {motor.brand} - {motor.model} ({motor.year})
                    </p>
                    <p style={{
                        color: 'var(--color-primary)',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        marginTop: '10px'
                    }}>
                        {formatPrice(motor.price)}
                    </p>
                </div>
            </div>
        </div>
    );

    // If clickable, wrap in Link to navigate to motors page
    if (clickable && !isOwner) {
        return (
            <>
                <Link
                    to={`/motors?selected=${motor.id}`}
                    className="card motor-card motor-card-clickable"
                    style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                    {cardContent}
                </Link>
                {lightboxModal}
            </>
        );
    }

    return (
        <>
            <div className="card motor-card">
                {cardContent}
            </div>
            {lightboxModal}
        </>
    );
}


