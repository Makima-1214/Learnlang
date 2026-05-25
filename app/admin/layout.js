import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-[family-name:var(--font-nunito)]">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
