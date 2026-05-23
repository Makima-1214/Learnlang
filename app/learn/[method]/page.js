"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MethodPracticeClient from "@/components/MethodPracticeClient";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";

export default function MethodPracticePage({ params: paramsPromise }) {
  const router = useRouter();
  const [params, setParams] = require("react").useState(null);
  const [loading, setLoading] = require("react").useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await paramsPromise;
      const method = String(resolvedParams?.method || "").toLowerCase();

      // Check if we have a valid session for this method
      const sessionId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("learningSessionId")
          : null;
      const sessionMethod =
        typeof window !== "undefined"
          ? sessionStorage.getItem("learningMethod")
          : null;

      // Redirect to /learn if no valid session or method mismatch
      if (!sessionId || sessionMethod !== method) {
        router.push("/learn");
        return;
      }

      setParams({ method });
      setLoading(false);
    };

    resolveParams();
  }, [paramsPromise, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 rounded-tl-none md:rounded-tl-3xl md:rounded-bl-3xl border-0 md:border-l-2 md:border-t-2 md:border-b-2 border-white/50 p-8">
          <Skeleton className="h-10 w-48 mb-6 rounded-2xl" />
          <Skeleton className="flex-1 w-full rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!params) {
    return null;
  }

  return <MethodPracticeClient method={params.method} />;
}
