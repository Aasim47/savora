import prisma from "../src/config/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const newEmail = "admin@bhojanwale.in";
  const newPassword = "2026@bhojanwale";
  const newName = "Bhojanwale Admin";

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Check if an existing admin exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  let adminUser;
  if (existingAdmin) {
    adminUser = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: newEmail,
        password: hashedPassword,
        name: newName,
        role: "ADMIN",
      },
    });
    console.log(`✓ Updated existing admin account (ID: ${existingAdmin.id}) to ${newEmail}`);
  } else {
    adminUser = await prisma.user.create({
      data: {
        email: newEmail,
        password: hashedPassword,
        name: newName,
        role: "ADMIN",
      },
    });
    console.log(`✓ Created new admin account: ${newEmail}`);
  }

  // Remove any remaining non-bhojanwale admin if multiple existed
  const cleanupOtherAdmins = await prisma.user.deleteMany({
    where: {
      role: "ADMIN",
      email: { not: newEmail },
    },
  });
  if (cleanupOtherAdmins.count > 0) {
    console.log(`✓ Cleaned up ${cleanupOtherAdmins.count} older admin account(s).`);
  }

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  console.log("\n=== ALL USERS IN DATABASE ===");
  console.table(allUsers);
}

main()
  .catch((err) => {
    console.error("Failed to update admin credentials:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
