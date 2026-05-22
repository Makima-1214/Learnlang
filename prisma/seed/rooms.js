async function seedRooms(prisma, admin, users) {
  const generalRoom = await prisma.room.upsert({
    where: { id: "general-discussion-room" },
    update: {},
    create: {
      id: "general-discussion-room",
      name: "Diskusi Umum",
      description:
        "Room diskusi umum untuk semua pengguna LernLang. Tanya jawab, sharing pengalaman, dan diskusi bebas seputar belajar bahasa Inggris.",
      isDefault: true,
      createdById: admin.id,
    },
  });
  console.log(`✅ Default room: ${generalRoom.name}`);

  const grammarRoom = await prisma.room.upsert({
    where: { id: "grammar-discussion-room" },
    update: {},
    create: {
      id: "grammar-discussion-room",
      name: "Belajar Grammar",
      description:
        "Diskusi seputar tata bahasa Inggris. Tenses, sentence structure, dan lainnya.",
      isDefault: false,
      createdById: admin.id,
    },
  });
  console.log(`✅ Room created: ${grammarRoom.name}`);

  const vocabRoom = await prisma.room.upsert({
    where: { id: "vocabulary-discussion-room" },
    update: {},
    create: {
      id: "vocabulary-discussion-room",
      name: "Vocabulary Corner",
      description: "Berbagi dan belajar kosa kata baru setiap hari.",
      isDefault: false,
      createdById: admin.id,
    },
  });
  console.log(`✅ Room created: ${vocabRoom.name}`);

  const sampleMessages = [
    {
      content: "Selamat datang di forum diskusi LernLang! 🎉",
      userId: admin.id,
    },
    {
      content: "Halo semua! Saya baru bergabung di sini.",
      userId: users[0]?.id || admin.id,
    },
    {
      content:
        "Hai! Senang bertemu dengan kalian semua. Ada tips belajar bahasa Inggris?",
      userId: users[1]?.id || admin.id,
    },
    {
      content:
        "Tips dari saya: konsisten latihan setiap hari, minimal 15 menit!",
      userId: admin.id,
    },
    {
      content:
        "Setuju! Saya juga suka pakai fitur quiz di sini, sangat membantu.",
      userId: users[2]?.id || admin.id,
    },
  ];

  for (const message of sampleMessages) {
    await prisma.message.create({
      data: {
        content: message.content,
        roomId: generalRoom.id,
        userId: message.userId,
      },
    });
  }
  console.log(`✅ Sample messages added to ${generalRoom.name}`);

  const samplePrivateMessage = await prisma.privateMessage.findFirst({
    where: {
      senderId: admin.id,
      receiverId: users[0].id,
      content: "Halo Budi, kalau ada pertanyaan bisa langsung chat saya ya.",
    },
  });

  if (!samplePrivateMessage) {
    await prisma.privateMessage.create({
      data: {
        senderId: admin.id,
        receiverId: users[0].id,
        content: "Halo Budi, kalau ada pertanyaan bisa langsung chat saya ya.",
      },
    });
    console.log("✅ Sample private message created");
  }

  return { generalRoom, grammarRoom, vocabRoom };
}

module.exports = { seedRooms };
