import ChatsClient from "./chats-client";
import DashboardLayout from "@/components/DashboardLayout";

export default function ChatsPage({ searchParams }) {
  const initialUserId = searchParams?.userId ?? null;

  return (
    <DashboardLayout>
      <ChatsClient initialUserId={initialUserId} />
    </DashboardLayout>
  );
}
