import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Owner account
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const owner = await prisma.user.upsert({
        where: { email: 'owner@gmail.com' },
        update: {},
        create: {
            email: 'owner@gmail.com',
            password: ownerPassword,
            name: 'Udin (Owner)',
            role: 'OWNER',
            phone: '081234567890'
        }
    });
    console.log('✅ Owner created:', owner.email);

    // Create sample Cashier
    const cashierPassword = await bcrypt.hash('kasir123', 10);
    const cashier = await prisma.user.upsert({
        where: { email: 'kasir@gmail.com' },
        update: {},
        create: {
            email: 'kasir@gmail.com',
            password: cashierPassword,
            name: 'Budi Kasir',
            role: 'CASHIER',
            phone: '081234567891'
        }
    });
    console.log('✅ Cashier created:', cashier.email);

    // Create sample Driver
    const driverPassword = await bcrypt.hash('supir123', 10);
    const driver = await prisma.user.upsert({
        where: { email: 'supir@gmail.com' },
        update: {},
        create: {
            email: 'supir@gmail.com',
            password: driverPassword,
            name: 'Joko Supir',
            role: 'DRIVER',
            phone: '081234567892'
        }
    });
    console.log('✅ Driver created:', driver.email);

    // Create sample motors
    const motors = [
        {
            name: 'Honda Beat Street 2024',
            brand: 'Honda',
            model: 'Beat Street',
            year: 2024,
            price: 18500000,
            stock: 10,
            image: 'https://imgd.aipluspng.com/download/resized/2020/honda-beat-street-2020-png-15.png',
            description: 'Motor matic sporty dengan desain street fighter yang tangguh.'
        },
        {
            name: 'Yamaha NMAX 155 2024',
            brand: 'Yamaha',
            model: 'NMAX',
            year: 2024,
            price: 32000000,
            stock: 5,
            image: 'https://imgd.aipluspng.com/download/resized/2021/yamaha-nmax-155-2021-png-2.png',
            description: 'Skutik premium dengan fitur VVA dan ABS untuk kenyamanan maksimal.'
        },
        {
            name: 'Honda Vario 160 2024',
            brand: 'Honda',
            model: 'Vario 160',
            year: 2024,
            price: 26500000,
            stock: 8,
            image: 'https://imgd.aipluspng.com/download/resized/2022/honda-vario-160-2022-png-2.png',
            description: 'Motor matic premium dengan mesin 160cc bertenaga.'
        },
        {
            name: 'Yamaha Aerox 155 2024',
            brand: 'Yamaha',
            model: 'Aerox',
            year: 2024,
            price: 28000000,
            stock: 6,
            image: 'https://imgd.aipluspng.com/download/resized/2021/yamaha-aerox-155-2021-png-3.png',
            description: 'Motor sport matic dengan performa tinggi dan desain agresif.'
        },
        {
            name: 'Honda PCX 160 2024',
            brand: 'Honda',
            model: 'PCX 160',
            year: 2024,
            price: 35000000,
            stock: 4,
            image: 'https://imgd.aipluspng.com/download/resized/2021/honda-pcx-160-2021-png-2.png',
            description: 'Premium automatic scooter dengan teknologi canggih.'
        },
        {
            name: 'Suzuki GSX-R150 2024',
            brand: 'Suzuki',
            model: 'GSX-R150',
            year: 2024,
            price: 32500000,
            stock: 3,
            image: 'https://imgd.aipluspng.com/download/resized/2021/suzuki-gsx-r150-2021-png-2.png',
            description: 'Sport bike dengan DNA MotoGP, handling presisi tinggi.'
        },
        {
            name: 'Kawasaki Ninja 250 2024',
            brand: 'Kawasaki',
            model: 'Ninja 250',
            year: 2024,
            price: 65000000,
            stock: 2,
            image: 'https://imgd.aipluspng.com/download/resized/2021/kawasaki-ninja-250-2021-png-3.png',
            description: 'Supersport 250cc twin cylinder dengan performa luar biasa.'
        },
        {
            name: 'Honda Scoopy 2024',
            brand: 'Honda',
            model: 'Scoopy',
            year: 2024,
            price: 22000000,
            stock: 12,
            image: 'https://imgd.aipluspng.com/download/resized/2021/honda-scoopy-2021-png-2.png',
            description: 'Skutik retro modern dengan gaya klasik yang stylish.'
        }
    ];

    for (const motorData of motors) {
        const motor = await prisma.motor.upsert({
            where: {
                id: motorData.name.toLowerCase().replace(/\s+/g, '-').slice(0, 36)
            },
            update: motorData,
            create: motorData
        });
        console.log('✅ Motor created:', motor.name);
    }

    console.log('🎉 Database seeding completed!');
    console.log('\n📝 Login credentials:');
    console.log('   Owner: owner@gmail.com / owner123');
    console.log('   Kasir: kasir@udinmotor.com / kasir123');
    console.log('   Supir: supir@udinmotor.com / supir123');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
