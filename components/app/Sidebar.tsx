"use client";
import { sidebarItems } from "@/config/app";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/useRedux";
import { LogOut, Menu, Plus } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const Sidebar = () => {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 z-10 h-full w-full bg-black/50",
          isOpen ? "block" : "hidden",
        )}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={cn(
          "left-0 top-0 z-20 mr-0 flex w-[350px] flex-col p-5 max-lg:fixed max-lg:h-screen max-lg:bg-white max-lg:p-4 max-lg:transition-all max-lg:duration-300",
          isOpen ? "translate-x-0" : "max-lg:-translate-x-full",
        )}
      >
        <Button
          size={"icon"}
          variant={"secondary"}
          className={cn(
            "absolute top-0 bg-background transition-all duration-300 lg:hidden",
            isOpen ? "left-[85%]" : "left-full",
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu />
        </Button>

        <div className="flex items-center gap-3 px-5 pt-5">
          <Image
            src={user.data?.image || "/images/avatar.jpg"}
            width={50}
            height={50}
            alt="Logo"
            className="rounded-full"
          />
          <div>
            <h1 className="text-lg font-bold">{user.data?.name}</h1>
            <p className="text-sm font-bold text-muted-foreground">
              <span className="font-normal">Balance:</span>{" "}
              {user.data?.credits.balance} credits
            </p>
          </div>
        </div>
        <div className="mt-5 flex-1">
          {sidebarItems.map((item, index) => (
            <Link
              href={item.href}
              key={index}
              className={cn(
                "group flex items-center gap-4 rounded-full px-8 py-6 text-[#5F5F5F] transition-all",
                pathname === item.href
                  ? "bg-gradient-to-r from-primary to-secondary text-white"
                  : "hover:bg-muted hover:text-black",
              )}
            >
              <item.icon className="transition-transform group-hover:rotate-12" />
              <span>
                {item.title}
                {item.badge && (
                  <span className="ml-3 rounded-full bg-red-500 px-2 py-1.5 text-2xs text-white">
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          ))}
          <button
            className={cn(
              "group flex w-full items-center gap-4 rounded-full px-8 py-6 text-[#5F5F5F] transition-all hover:bg-muted hover:text-black",
            )}
            onClick={() => {
              signOut({ callbackUrl: "/", redirect: true });
            }}
          >
            <LogOut className="transition-transform duration-300 group-hover:rotate-12" />
            <span>Logout</span>
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-white px-5 py-8 text-center">
          <h1 className="text-2xl font-bold">Buy more credits</h1>
          <p className="max mt-2 text-sm text-muted-foreground">
            Running out of credits? Buy more now to keep generating.
          </p>
          <Link href={"/dashboard/credits"}>
            <Button className="mt-3" size={"lg"}>
              <Plus className="h-6 w-6" />
              Buy Now
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
