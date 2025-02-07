import Link from "next/link";
import { auth } from "@/auth";
import GradientButton from "./ui/GradientButton";

const Navbar = async () => {
  const session = await auth();

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <div className="relative">
        {/* Blur effect background */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" />

        {/* Navbar content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">MetaBoost</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden space-x-8 sm:flex">
              {["Features", "Pricing", "Documentation"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="group relative text-sm text-zinc-400"
                >
                  <span className="relative block overflow-hidden py-1">
                    {/* Text that slides up */}
                    <span className="relative block transform transition-transform duration-300 group-hover:-translate-y-full">
                      {item}
                    </span>
                    {/* Clone that slides up from bottom */}
                    <span className="absolute inset-0 block translate-y-full transform text-white transition-transform duration-300 group-hover:translate-y-0">
                      {item}
                    </span>
                  </span>
                </Link>
              ))}
            </nav>

            {/* Auth Button */}
            <GradientButton
              size="sm"
              isLink
              href={session ? "/dashboard" : "/login"}
            >
              {session ? "Dashboard" : "Login"}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
