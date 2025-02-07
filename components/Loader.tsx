"use client";
import { ADMIN_ROLES } from "@/config/api";
import { fetchUserData } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/useRedux";
import { redirect, usePathname } from "next/navigation";
import React, { useEffect } from "react";

const Loader = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchUserData());
  }, []);
  const pathname = usePathname();
  if (user.status !== "succeeded") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-primary to-secondary">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-t-4 border-white"></div>
          <h2 className="mb-2 text-2xl font-semibold text-white">Loading</h2>
          <p className="text-white text-opacity-80">Please wait...</p>
        </div>
      </div>
    );
  }

  // check if its /admin* route and user.role not in admin roles
  if (
    pathname.startsWith("/admin") &&
    !ADMIN_ROLES.includes(user.data?.role + "")
  ) {
    redirect("/login");
  }

  return <>{children}</>;
};

export default Loader;
