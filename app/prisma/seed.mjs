import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Администратор";

  if (!adminEmail || !adminPassword) {
    console.log("ADMIN_EMAIL and ADMIN_PASSWORD are not set. Seed skipped.");
    return;
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

  if (adminCount > 0) {
    console.log("Admin user already exists. Seed skipped.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      accessUntil: addMonths(new Date(), 12),
    },
  });

  console.log(`Admin user created: ${adminEmail}`);
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
