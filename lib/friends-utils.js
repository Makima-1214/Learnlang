/**
 * Friends feature helper utilities
 */

/**
 * Build a Set of followed user IDs from user list
 */
export function buildFollowingIdSet(users = []) {
  return new Set(users.filter((u) => u?.isFollowing).map((u) => u.id));
}

/**
 * Apply follow status to one list without mutating original entries
 */
export function applyFollowStateToList(list = [], userId, isFollowing) {
  return list.map((user) =>
    user.id === userId
      ? {
          ...user,
          isFollowing,
        }
      : user,
  );
}

/**
 * Sync follow state across known friends collections
 */
export function syncFollowStateAcrossCollections(collections, userId, isFollowing) {
  return {
    ...collections,
    searchResults: applyFollowStateToList(collections.searchResults, userId, isFollowing),
    recommendations: applyFollowStateToList(
      collections.recommendations,
      userId,
      isFollowing,
    ),
    followers: applyFollowStateToList(collections.followers, userId, isFollowing),
    following: applyFollowStateToList(collections.following, userId, isFollowing),
    friends: applyFollowStateToList(collections.friends, userId, isFollowing),
  };
}

/**
 * Remove followed user from recommendation list for instant UX update
 */
export function removeUserFromRecommendations(recommendations = [], userId) {
  return recommendations.filter((u) => u.id !== userId);
}
