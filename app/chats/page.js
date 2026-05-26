import ChatsClient from "./chats-client";
import DashboardLayout from "@/components/DashboardLayout";

export default async function ChatsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const initialUserId = resolvedParams?.userId ?? null;

  return (
    <DashboardLayout>
      <ChatsClient initialUserId={initialUserId} />
    </DashboardLayout>
  );
}
