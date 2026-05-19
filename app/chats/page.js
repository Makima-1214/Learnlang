import ChatsClient from "./chats-client";

export default function ChatsPage({ searchParams }) {
  const initialUserId = searchParams?.userId ?? null;

  return <ChatsClient initialUserId={initialUserId} />;
}
