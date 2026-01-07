import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { userAPI } from '../../services/api';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ReportData {
    summary: {
        totalRevenue: number;
        totalTransactions: number;
        estimatedProfit: number;
        estimatedCost: number;
        profitMargin: number;
        thisMonthRevenue: number;
        thisMonthTransactions: number;
        lastMonthRevenue: number;
        growthPercentage: number;
    };
    monthlySales: {
        month: string;
        revenue: number;
        transactions: number;
    }[];
    salesByStatus: {
        status: string;
        count: number;
        revenue: number;
    }[];
    topSellingMotors: {
        motor: string;
        brand: string;
        unitPrice: number;
        soldCount: number;
        totalRevenue: number;
    }[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const statusLabels: Record<string, string> = {
    'PENDING': 'Menunggu',
    'PAID': 'Dibayar',
    'PROCESSING': 'Diproses',
    'DELIVERING': 'Dikirim',
    'DELIVERED': 'Terkirim',
    'COMPLETED': 'Selesai',
    'CANCELLED': 'Dibatalkan'
};

export default function Reports() {
    const [data, setData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const response = await userAPI.getReports();
            setData(response.data);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3 className="empty-state-title">Gagal memuat laporan</h3>
            </div>
        );
    }

    // Chart data for monthly sales
    const monthlySalesChartData = {
        labels: data.monthlySales.map(m => m.month),
        datasets: [
            {
                label: 'Pendapatan (Juta Rp)',
                data: data.monthlySales.map(m => m.revenue / 1000000),
                backgroundColor: 'rgba(255, 107, 53, 0.6)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 2,
                borderRadius: 5,
            }
        ]
    };

    // Line chart for transactions trend
    const transactionsTrendData = {
        labels: data.monthlySales.map(m => m.month),
        datasets: [
            {
                label: 'Jumlah Transaksi',
                data: data.monthlySales.map(m => m.transactions),
                borderColor: 'rgba(0, 200, 150, 1)',
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    // Doughnut chart for sales by status
    const statusColors = [
        'rgba(255, 193, 7, 0.8)',   // PENDING - yellow
        'rgba(76, 175, 80, 0.8)',   // PAID - green
        'rgba(33, 150, 243, 0.8)',  // PROCESSING - blue
        'rgba(156, 39, 176, 0.8)',  // DELIVERING - purple
        'rgba(0, 200, 150, 0.8)',   // DELIVERED - teal
        'rgba(255, 107, 53, 0.8)',  // COMPLETED - orange
        'rgba(244, 67, 54, 0.8)',   // CANCELLED - red
    ];

    const salesByStatusData = {
        labels: data.salesByStatus.map(s => statusLabels[s.status] || s.status),
        datasets: [
            {
                data: data.salesByStatus.map(s => s.count),
                backgroundColor: statusColors.slice(0, data.salesByStatus.length),
                borderWidth: 0,
            }
        ]
    };

    // Profit/Loss chart data
    const profitLossData = {
        labels: ['Pendapatan', 'Biaya Modal', 'Keuntungan'],
        datasets: [
            {
                data: [
                    data.summary.totalRevenue / 1000000,
                    data.summary.estimatedCost / 1000000,
                    data.summary.estimatedProfit / 1000000
                ],
                backgroundColor: [
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(244, 67, 54, 0.8)',
                    'rgba(76, 175, 80, 0.8)'
                ],
                borderWidth: 0,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: 'rgba(255, 255, 255, 0.8)' }
            }
        },
        scales: {
            x: {
                ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: 'rgba(255, 255, 255, 0.8)', padding: 15 }
            }
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">📊 Laporan Keuangan</h1>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                        {formatCurrency(data.summary.totalRevenue)}
                    </div>
                    <div className="stat-label">Total Pendapatan</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(data.summary.estimatedProfit)}
                    </div>
                    <div className="stat-label">Estimasi Keuntungan ({data.summary.profitMargin}%)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📉</div>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                        {formatCurrency(data.summary.estimatedCost)}
                    </div>
                    <div className="stat-label">Estimasi Modal</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-value">{data.summary.totalTransactions}</div>
                    <div className="stat-label">Total Transaksi</div>
                </div>
            </div>

            {/* This Month Summary */}
            <div className="stats-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                        {formatCurrency(data.summary.thisMonthRevenue)}
                    </div>
                    <div className="stat-label">Pendapatan Bulan Ini</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📆</div>
                    <div className="stat-value">
                        {formatCurrency(data.summary.lastMonthRevenue)}
                    </div>
                    <div className="stat-label">Pendapatan Bulan Lalu</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">{data.summary.growthPercentage >= 0 ? '📈' : '📉'}</div>
                    <div className="stat-value" style={{
                        color: data.summary.growthPercentage >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                        {data.summary.growthPercentage >= 0 ? '+' : ''}{data.summary.growthPercentage}%
                    </div>
                    <div className="stat-label">Pertumbuhan</div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
                {/* Monthly Revenue Chart */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>📊 Pendapatan Bulanan {new Date().getFullYear()}</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={monthlySalesChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Profit/Loss Doughnut */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>💹 Komposisi Keuangan</h3>
                    <div style={{ height: '300px' }}>
                        <Doughnut data={profitLossData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
                {/* Transactions Trend */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>📈 Tren Transaksi</h3>
                    <div style={{ height: '300px' }}>
                        <Line data={transactionsTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* Sales by Status */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>📋 Status Transaksi</h3>
                    <div style={{ height: '300px' }}>
                        <Doughnut data={salesByStatusData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Top Selling Motors Table */}
            <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>🏆 Motor Terlaris</h3>
                {data.topSellingMotors.length > 0 ? (
                    <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Rank</th>
                                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Motor</th>
                                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Brand</th>
                                <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Harga Satuan</th>
                                <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Terjual</th>
                                <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Total Pendapatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topSellingMotors.map((motor, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--bg-tertiary)',
                                            color: index < 3 ? '#000' : 'var(--text-primary)',
                                            fontWeight: 'bold'
                                        }}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{motor.motor}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span className="badge">{motor.brand}</span>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
                                        {formatCurrency(motor.unitPrice)}
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                        <strong style={{ color: 'var(--color-primary)' }}>{motor.soldCount}</strong> unit
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right', color: 'var(--color-success)' }}>
                                        {formatCurrency(motor.totalRevenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state" style={{ padding: '40px' }}>
                        <div className="empty-state-icon">🏍️</div>
                        <p>Belum ada data penjualan motor</p>
                    </div>
                )}
            </div>
        </div>
    );
}
