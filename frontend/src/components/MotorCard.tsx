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
}

export default function MotorCard({ motor, onBuy, onEdit, onDelete, showActions = true, isOwner = false }: MotorCardProps) {
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

    return (
        <div className="card motor-card">
            <img
                src={motor.image || 'https://via.placeholder.com/400x200?text=Motor'}
                alt={motor.name}
                className="motor-card-image"
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
                                <button className="btn btn-secondary btn-sm" onClick={() => onEdit?.(motor)}>
                                    ✏️ Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(motor)}>
                                    🗑️ Hapus
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={() => onBuy?.(motor)}
                                disabled={motor.stock === 0}
                                style={{ width: '100%' }}
                            >
                                {motor.stock === 0 ? 'Stok Habis' : '🛒 Beli Sekarang'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
