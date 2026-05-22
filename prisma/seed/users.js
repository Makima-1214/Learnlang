const bcrypt = require("bcryptjs");

async function seedUsers(prisma) {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@learnlang.com" },
    update: { username: "admin" },
    create: {
      name: "Admin LernLang",
      email: "admin@learnlang.com",
      password: adminPassword,
      username: "admin",
      bio: "Administrator platform LernLang",
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user: ${admin.email}`);

  const users = [];
  const userSeeds = [
    {
      name: "Budi Santoso",
      email: "budi@example.com",
      username: "budi_santoso",
      bio: "Sedang belajar bahasa Inggris untuk karir",
    },
    {
      name: "Siti Nurhaliza",
      email: "siti@example.com",
      username: "siti_n",
      bio: "Pelajar bahasa Inggris yang antusias",
    },
    {
      name: "Andi Prasetya",
      email: "andi@example.com",
      username: "andi_p",
      bio: "Suka tantangan terjemahan",
    },
    {
      name: "Dewi Lestari",
      email: "dewi@example.com",
      username: "dewi_lestari",
      bio: "Belajar bahasa Inggris setiap hari",
    },
    {
      name: "Rizky Hidayat",
      email: "rizky@example.com",
      username: "rizky_h",
      bio: "English learner 🇬🇧",
    },
  ];

  for (const u of userSeeds) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { username: u.username, bio: u.bio },
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        username: u.username,
        bio: u.bio,
        role: "USER",
      },
    });
    users.push(user);
    console.log(`✅ User: ${user.email}`);
  }

  return { admin, users };
}

module.exports = { seedUsers };
