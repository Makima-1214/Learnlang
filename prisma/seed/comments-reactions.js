async function seedCommentsAndReactions(prisma, users) {
  console.log("\n📝 Creating sample comments and reactions...");

  const firstBlog = await prisma.blog.findFirst({
    where: { published: true },
  });

  if (!firstBlog) {
    console.log("⏭️  No published blog found for comments and reactions");
    return null;
  }

  const comments = [
    {
      content:
        "Artikel yang sangat menarik! Saya jadi lebih termotivasi untuk belajar bahasa Inggris.",
      userId: users[0].id,
      blogId: firstBlog.id,
    },
    {
      content:
        "Tips yang diberikan sangat praktis dan mudah diikuti. Terima kasih!",
      userId: users[1].id,
      blogId: firstBlog.id,
    },
    {
      content:
        "Saya sudah mencoba beberapa tips ini dan hasilnya luar biasa. Highly recommended!",
      userId: users[2].id,
      blogId: firstBlog.id,
    },
    {
      content:
        "Saya suka struktur artikelnya, sangat mudah dipahami oleh pemula.",
      userId: users[3].id,
      blogId: firstBlog.id,
    },
    {
      content:
        "Contoh-contohnya jelas dan relevan dengan kebutuhan belajar sehari-hari.",
      userId: users[4].id,
      blogId: firstBlog.id,
    },
  ];

  for (const comment of comments) {
    await prisma.comment.upsert({
      where: {
        id: `comment-${comment.userId}-${comment.blogId}`,
      },
      update: {},
      create: {
        id: `comment-${comment.userId}-${comment.blogId}`,
        ...comment,
      },
    });
  }
  console.log(`✅ Created ${comments.length} comments`);

  const reactions = [
    { emoji: "👍", userId: users[0].id, blogId: firstBlog.id },
    { emoji: "❤️", userId: users[1].id, blogId: firstBlog.id },
    { emoji: "👍", userId: users[2].id, blogId: firstBlog.id },
    { emoji: "🎉", userId: users[3].id, blogId: firstBlog.id },
    { emoji: "👍", userId: users[4].id, blogId: firstBlog.id },
  ];

  for (const reaction of reactions) {
    try {
      await prisma.reaction.create({ data: reaction });
    } catch (error) {
      // skip duplicates
    }
  }
  console.log("✅ Created reactions");

  return firstBlog;
}

module.exports = { seedCommentsAndReactions };
