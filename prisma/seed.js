const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Ambil kredensial admin dari environment variables untuk keamanan
  // Jika tidak ada, gunakan nilai default (hanya untuk pengembangan)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Please provide ADMIN_EMAIL and ADMIN_PASSWORD in your .env file"
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Menggunakan upsert: membuat user jika belum ada, atau tidak melakukan apa-apa jika sudah ada.
  const admin = await prisma.users.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Created/updated admin user: ${admin.email}`);
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
