import React, { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("auth/Login" as any);
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
