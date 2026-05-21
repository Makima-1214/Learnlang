"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MethodPracticeClient from "@/components/MethodPracticeClient";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!params) {
    return null;
  }

  return <MethodPracticeClient method={params.method} />;
}
