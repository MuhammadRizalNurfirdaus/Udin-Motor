import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking users...');
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.log('No users found.');
    } else {
        console.log(`Found ${users.length} users.`);
        users.forEach(u => {
            console.log(`- ID: ${u.id}`);
            console.log(`  Name: ${u.name}`);
            console.log(`  Email: ${u.email}`);
            console.log(`  Phone: ${u.phone}`);
            console.log(`  Role: ${u.role}`);
            console.log('---');
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
