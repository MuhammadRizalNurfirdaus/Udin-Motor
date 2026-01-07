# 🏍️ Udin Motor - Aplikasi Penjualan Motor

## 📋 Informasi Proyek

| Field | Keterangan |
|-------|------------|
| **Nama** | Muhammad Rizal Nurfirdaus |
| **NIM** | 20230810088 |
| **Kelas** | TINFC-2023-04 |
| **Mata Kuliah** | Rekayasa Perangkat Lunak |
| **Dosen Pengampu** | Iwan Lesmana, S.Kom., M.Kom. |

---

## ⚠️ Status: Dalam Tahap Pengembangan

Proyek ini masih dalam tahap pengembangan aktif. Beberapa fitur mungkin belum sepenuhnya berfungsi atau masih dalam proses penyempurnaan.

---

## 📝 Deskripsi

**Udin Motor** adalah aplikasi web penjualan motor berbasis TypeScript yang dibangun dengan arsitektur full-stack modern. Aplikasi ini mendukung multi-role dengan 4 jenis pengguna yang berbeda.

---

## 👥 Role Pengguna

| Role | Deskripsi | Fitur Utama |
|------|-----------|-------------|
| **Owner (Pemilik)** | Administrator utama sistem | Dashboard statistik, CRUD motor, kelola staff, laporan keuangan |
| **Cashier (Kasir)** | Memproses transaksi | Konfirmasi pembayaran, assign driver pengiriman |
| **Driver (Supir)** | Mengantarkan motor | Update status pengiriman, konfirmasi pengantaran |
| **User (Pelanggan)** | Pembeli motor | Browse motor, order, tracking pesanan |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Aiven Cloud)
- **Authentication**: JWT, Passport.js (Local + Google OAuth)

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router DOM
- **Charts**: Chart.js + react-chartjs-2
- **HTTP Client**: Axios

---

## ✨ Fitur

### Autentikasi
- [x] Login dengan Email & Password
- [x] Login dengan Google OAuth
- [x] Registrasi pengguna baru
- [x] JWT Token authentication

### Owner
- [x] Dashboard dengan statistik penjualan
- [x] CRUD Motor (Create, Read, Update, Delete)
- [x] Upload gambar motor
- [x] Kelola Staff (register kasir & supir)
- [x] Lihat semua transaksi
- [x] Laporan keuangan dengan grafik
- [x] Grafik pendapatan bulanan
- [x] Grafik tren transaksi
- [x] Motor terlaris

### Kasir
- [x] Dashboard transaksi pending
- [x] Konfirmasi pembayaran
- [x] Batalkan pesanan
- [x] Assign driver untuk pengiriman

### Supir
- [x] Dashboard pengiriman
- [x] Update status pengiriman
- [x] Konfirmasi selesai antar

### Pelanggan
- [x] Browse katalog motor
- [x] Filter motor berdasarkan brand
- [x] Cari motor
- [x] Buat pesanan
- [x] Tracking status pesanan

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js v18+
- npm atau yarn
- PostgreSQL database

### 1. Clone Repository
```bash
git clone <repository-url>
cd "Udin Motor"
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Buat file `.env` dengan isi:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"
FRONTEND_URL="http://localhost:5173"
PORT=4000
```

Setup database:
```bash
npx prisma db push
npx prisma db seed
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

### 4. Jalankan Aplikasi
Dari root folder:
```bash
npm run dev:all
```

Atau jalankan terpisah:
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

### 5. Akses Aplikasi
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

---

## 🔐 Akun Default (Setelah Seed)

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@gmail.com | owner123 |
| Kasir | kasir@gmail.com | kasir123 |
| Supir | supir@gmail.com | supir123 |

---

## 📁 Struktur Folder

```
Udin Motor/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeder
│   ├── src/
│   │   ├── config/          # Passport configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Entry point
│   └── uploads/             # Uploaded images
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.tsx          # Main app
│   │   └── main.tsx         # Entry point
│   └── index.html
├── package.json             # Root scripts
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Motors
- `GET /api/motors` - List semua motor
- `GET /api/motors/:id` - Detail motor
- `POST /api/motors` - Tambah motor (Owner)
- `PUT /api/motors/:id` - Edit motor (Owner)
- `DELETE /api/motors/:id` - Hapus motor (Owner)

### Transactions
- `POST /api/transactions` - Buat pesanan (User)
- `GET /api/transactions/my` - Pesanan saya (User)
- `GET /api/transactions` - Semua transaksi (Owner/Kasir)
- `PUT /api/transactions/:id/process` - Proses transaksi (Kasir)

### Deliveries
- `GET /api/deliveries/my` - Pengiriman saya (Supir)
- `PUT /api/deliveries/:id/status` - Update status (Supir)

### Users & Reports
- `GET /api/users/dashboard` - Dashboard stats (Owner)
- `GET /api/users/reports` - Financial reports (Owner)

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan tugas mata kuliah Rekayasa Perangkat Lunak.

---

## 👨‍💻 Pengembang

**Muhammad Rizal Nurfirdaus**  
NIM: 20230810088  
Universitas Kuningan

---

*Terakhir diperbarui: 7 Januari 2026*
