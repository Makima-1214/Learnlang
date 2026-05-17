/**
 * Unit tests for friends utility helpers
 */

import {
  buildFollowingIdSet,
  applyFollowStateToList,
  syncFollowStateAcrossCollections,
  removeUserFromRecommendations,
} from "@/lib/friends-utils";

describe("friends-utils", () => {
  const baseUsers = [
    { id: "u1", name: "A", isFollowing: false },
    { id: "u2", name: "B", isFollowing: true },
    { id: "u3", name: "C", isFollowing: false },
  ];

  it("buildFollowingIdSet should return only followed user IDs", () => {
    const ids = buildFollowingIdSet(baseUsers);

    expect(ids.has("u1")).toBe(false);
    expect(ids.has("u2")).toBe(true);
    expect(ids.has("u3")).toBe(false);
    expect(ids.size).toBe(1);
  });

  it("applyFollowStateToList should update one targeted user without mutating others", () => {
    const updated = applyFollowStateToList(baseUsers, "u1", true);

    expect(updated.find((u) => u.id === "u1").isFollowing).toBe(true);
    expect(updated.find((u) => u.id === "u2").isFollowing).toBe(true);
    expect(updated.find((u) => u.id === "u3").isFollowing).toBe(false);

    // original array should stay unchanged
    expect(baseUsers.find((u) => u.id === "u1").isFollowing).toBe(false);
  });

  it("syncFollowStateAcrossCollections should sync target state to all collections", () => {
    const collections = {
      searchResults: [...baseUsers],
      recommendations: [...baseUsers],
      followers: [...baseUsers],
      following: [...baseUsers],
      friends: [...baseUsers],
    };

    const synced = syncFollowStateAcrossCollections(collections, "u3", true);

    expect(synced.searchResults.find((u) => u.id === "u3").isFollowing).toBe(
      true,
    );
    expect(synced.recommendations.find((u) => u.id === "u3").isFollowing).toBe(
      true,
    );
    expect(synced.followers.find((u) => u.id === "u3").isFollowing).toBe(true);
    expect(synced.following.find((u) => u.id === "u3").isFollowing).toBe(true);
    expect(synced.friends.find((u) => u.id === "u3").isFollowing).toBe(true);
  });

  it("removeUserFromRecommendations should remove matched user only", () => {
    const recommendations = [
      { id: "u1", name: "A" },
      { id: "u2", name: "B" },
      { id: "u3", name: "C" },
    ];

    const result = removeUserFromRecommendations(recommendations, "u2");

    expect(result.map((u) => u.id)).toEqual(["u1", "u3"]);
  });
});
