async function seedSocial(prisma, admin, users) {
  console.log("\n🤝 Seeding follows and friendships...");

  const followSeeds = [
    { followerId: users[0].id, followingId: users[1].id },
    { followerId: users[1].id, followingId: users[0].id },
    { followerId: users[2].id, followingId: users[0].id },
    { followerId: users[3].id, followingId: users[0].id },
    { followerId: users[4].id, followingId: users[0].id },
    { followerId: admin.id, followingId: users[0].id },
  ];

  for (const follow of followSeeds) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: follow.followerId,
          followingId: follow.followingId,
        },
      },
      update: {},
      create: follow,
    });
  }

  const friendshipSeeds = [
    [users[0].id, users[1].id],
    [users[0].id, users[2].id],
  ];

  for (const [firstUserId, secondUserId] of friendshipSeeds) {
    const [initiatorId, friendId] =
      firstUserId < secondUserId
        ? [firstUserId, secondUserId]
        : [secondUserId, firstUserId];

    await prisma.friendship.upsert({
      where: {
        initiatorId_friendId: {
          initiatorId,
          friendId,
        },
      },
      update: {},
      create: {
        initiatorId,
        friendId,
      },
    });
  }

  console.log("✅ Follow and friendship data created");
  return { followSeeds, friendshipSeeds };
}

module.exports = { seedSocial };
