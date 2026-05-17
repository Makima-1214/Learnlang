"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Users,
  Heart,
  Search,
  Mail,
  MessageSquare,
  Loader2,
  UserPlus,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  buildFollowingIdSet,
  syncFollowStateAcrossCollections,
  removeUserFromRecommendations,
} from "@/lib/friends-utils";

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [followingIds, setFollowingIds] = useState(new Set());
  const [actionLoadingUserId, setActionLoadingUserId] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load friends
  useEffect(() => {
    if (activeTab === "friends" && session) {
      loadFriends();
    }
  }, [activeTab, session]);

  // Load recommendations
  useEffect(() => {
    if (activeTab === "recommendations" && session) {
      loadRecommendations();
    }
  }, [activeTab, session]);

  // Load followers
  useEffect(() => {
    if (activeTab === "followers" && session) {
      loadFollowers();
    }
  }, [activeTab, session]);

  // Load following
  useEffect(() => {
    if (activeTab === "following" && session) {
      loadFollowing();
    }
  }, [activeTab, session]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends?type=friends", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load friends");
      const data = await response.json();
      setFriends(data.data.users);
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends/recommendations", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load recommendations");
      const data = await response.json();
      setRecommendations(data.data.recommendations);
      updateFollowingIds(data.data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends?type=followers", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load followers");
      const data = await response.json();
      setFollowers(data.data.users);
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends?type=following", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load following");
      const data = await response.json();
      setFollowing(data.data.users);
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      setError("Search query must be at least 2 characters");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const response = await fetch(
        `/api/friends?type=search&q=${encodeURIComponent(searchQuery)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchResults(data.data.users);
      setActiveTab("search");
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFollowingIds = (users) => {
    setFollowingIds(buildFollowingIdSet(users));
  };

  const syncFollowStateAcrossLists = (userId, isFollowing) => {
    const synced = syncFollowStateAcrossCollections(
      {
        searchResults,
        recommendations,
        followers,
        following,
        friends,
      },
      userId,
      isFollowing,
    );

    setSearchResults(synced.searchResults);
    setRecommendations(synced.recommendations);
    setFollowers(synced.followers);
    setFollowing(synced.following);
    setFriends(synced.friends);
  };

  const handleFollow = async (userId) => {
    setActionLoadingUserId(userId);
    setError("");
    try {
      const response = await fetch("/api/friends/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId }),
      });

      if (!response.ok) {
        const fail = await response.json().catch(() => null);
        throw new Error(fail?.error?.message || "Failed to follow");
      }
      const data = await response.json();

      // Update follow status
      setFollowingIds((prev) => new Set([...prev, userId]));
      syncFollowStateAcrossLists(userId, true);

      // UX polish: if action is done from recommendations context,
      // remove the item instantly from recommendation cards.
      setRecommendations((prev) => removeUserFromRecommendations(prev, userId));

      // Refresh current tab
      if (activeTab === "search") loadFriends();
      else if (activeTab === "recommendations") loadRecommendations();
      else if (activeTab === "followers") loadFollowers();
      else if (activeTab === "following") loadFollowing();

      toast.success(
        data?.data?.message ||
          (data?.data?.isFriend
            ? "Sekarang kalian berteman!"
            : "Berhasil mengikuti pengguna"),
      );
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal mengikuti pengguna");
    } finally {
      setActionLoadingUserId(null);
    }
  };

  const handleUnfollow = async (userId) => {
    setActionLoadingUserId(userId);
    setError("");
    try {
      const response = await fetch(
        `/api/friends/unfollow?followingId=${userId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const fail = await response.json().catch(() => null);
        throw new Error(fail?.error?.message || "Failed to unfollow");
      }

      // Update follow status
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      syncFollowStateAcrossLists(userId, false);

      // Refresh current tab
      if (activeTab === "search") loadFriends();
      else if (activeTab === "recommendations") loadRecommendations();
      else if (activeTab === "followers") loadFollowers();
      else if (activeTab === "following") loadFollowing();

      toast.success("Berhasil berhenti mengikuti pengguna");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal berhenti mengikuti pengguna");
    } finally {
      setActionLoadingUserId(null);
    }
  };

  const FriendCard = ({ user, isFriend }) => (
    <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{user.name}</h3>
              {isFriend && (
                <Badge variant="outline" className="text-xs">
                  <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                  Teman
                </Badge>
              )}
            </div>
            {user.username && (
              <p className="text-xs text-gray-500 mb-2">@{user.username}</p>
            )}
            {user.bio && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {user.bio}
              </p>
            )}

            <div className="flex gap-2 flex-col sm:flex-row mt-1">
              {isFriend && (
                <Link
                  href={`/chats?userId=${user.id}`}
                  className="w-full sm:w-1/2"
                >
                  <Button size="sm" variant="ghost" className="w-full gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                </Link>
              )}

              <Button
                size="sm"
                variant={followingIds.has(user.id) ? "outline" : "default"}
                onClick={() =>
                  followingIds.has(user.id)
                    ? handleUnfollow(user.id)
                    : handleFollow(user.id)
                }
                className={isFriend ? "w-full sm:w-1/2" : "w-full"}
                disabled={actionLoadingUserId === user.id}
              >
                {actionLoadingUserId === user.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : followingIds.has(user.id) ? (
                  "Mengikuti"
                ) : (
                  "Ikuti"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ title, description, actionLabel, onAction }) => (
    <Card>
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Inbox className="w-6 h-6 text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const LoadingCard = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
                <Users className="w-8 h-8" />
                Cari Teman
              </h1>
              <p className="text-gray-600">
                Temukan dan ikuti teman-teman baru
              </p>
            </div>
            <Link href="/friends/requests">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Mail className="w-4 h-4" />
                Inbox Permintaan
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Sticky Search + Tabs */}
          <div className="sticky top-16 z-20 bg-gray-50/95 backdrop-blur-sm pt-1 pb-3 mb-3">
            <Card className="mb-3 shadow-sm border-gray-200">
              <CardContent className="pt-4 pb-4">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <Input
                    placeholder="Cari nama atau username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || searchQuery.length < 2}
                  >
                    {loading && activeTab === "search" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="overflow-x-auto pb-1">
              <TabsList className="inline-flex w-max min-w-full gap-1 p-1">
                <TabsTrigger
                  value="search"
                  className="min-w-[92px] transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]"
                >
                  Cari
                </TabsTrigger>
                <TabsTrigger
                  value="recommendations"
                  className="min-w-[120px] transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]"
                >
                  Rekomendasi
                </TabsTrigger>
                <TabsTrigger
                  value="friends"
                  className="min-w-[92px] transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]"
                >
                  Teman
                </TabsTrigger>
                <TabsTrigger
                  value="followers"
                  className="min-w-[100px] transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]"
                >
                  Pengikut
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="min-w-[104px] transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]"
                >
                  Mengikuti
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Search Results */}
          <TabsContent value="search" className="mt-6">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((user) => (
                  <FriendCard
                    key={user.id}
                    user={user}
                    isFriend={user.isFriend}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  hasSearched ? "Tidak ada hasil pencarian" : "Cari teman baru"
                }
                description={
                  hasSearched
                    ? "Coba kata kunci lain (nama atau username)."
                    : "Masukkan minimal 2 karakter untuk mulai mencari teman."
                }
                actionLabel="Lihat rekomendasi"
                onAction={() => setActiveTab("recommendations")}
              />
            )}
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="mt-6">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid gap-4">
                {recommendations.map((user) => (
                  <FriendCard
                    key={user.id}
                    user={user}
                    isFriend={user.isFriend}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum ada rekomendasi"
                description="Kami belum menemukan pengguna yang cocok untuk Anda saat ini."
                actionLabel="Cari manual"
                onAction={() => setActiveTab("search")}
              />
            )}
          </TabsContent>

          {/* Friends */}
          <TabsContent value="friends" className="mt-6">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : friends.length > 0 ? (
              <div className="grid gap-4">
                {friends.map((user) => (
                  <FriendCard key={user.id} user={user} isFriend={true} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum punya teman"
                description="Mulai ikuti pengguna lain, lalu jika saling follow kalian akan jadi teman."
                actionLabel="Lihat rekomendasi"
                onAction={() => setActiveTab("recommendations")}
              />
            )}
          </TabsContent>

          {/* Followers */}
          <TabsContent value="followers" className="mt-6">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : followers.length > 0 ? (
              <div className="grid gap-4">
                {followers.map((user) => (
                  <FriendCard
                    key={user.id}
                    user={user}
                    isFriend={user.isFriend}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum ada pengikut"
                description="Ketika ada pengguna yang mengikuti Anda, daftar ini akan terisi."
                actionLabel="Cari teman"
                onAction={() => setActiveTab("search")}
              />
            )}
          </TabsContent>

          {/* Following */}
          <TabsContent value="following" className="mt-6">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : following.length > 0 ? (
              <div className="grid gap-4">
                {following.map((user) => (
                  <FriendCard
                    key={user.id}
                    user={user}
                    isFriend={user.isFriend}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum mengikuti siapa pun"
                description="Ikuti pengguna untuk membangun koneksi belajar Anda."
                actionLabel="Lihat rekomendasi"
                onAction={() => setActiveTab("recommendations")}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
