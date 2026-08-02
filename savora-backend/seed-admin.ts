import prisma from './src/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = "admin@bhojanwale.in";
  const password = "2026@bhojanwale";
  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`Admin user seeded successfully: ${adminUser.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
