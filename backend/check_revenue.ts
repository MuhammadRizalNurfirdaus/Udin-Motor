import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking transactions...');
    const transactions = await prisma.transaction.findMany();

    if (transactions.length === 0) {
        console.log('No transactions found.');
    } else {
        console.log(`Found ${transactions.length} transactions.`);
        transactions.forEach(t => {
            console.log(`- ID: ${t.id}, Status: ${t.status}, TotalPrice: ${t.totalPrice}`);
        });

        const revenue = await prisma.transaction.aggregate({
            where: { status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] } },
            _sum: { totalPrice: true }
        });
        console.log('Total Revenue Aggregation:', revenue._sum.totalPrice);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
