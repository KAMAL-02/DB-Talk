"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {DashboardSkeleton} from "./skeletons";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
}
