import prisma from './src/config/prisma';

async function main() {
  const users = await prisma.user.updateMany({
    data: { role: 'ADMIN' },
  });
  console.log(`Updated ${users.count} users to ADMIN.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
