"use client"; // Ensure this is a client component

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook to get the current path

function NavBar() {
  const pathname = usePathname(); // Get current path

  return (
    <div className="relative h-[25vh] stikcy top-0 ">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/images/navBackground.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10"></div>
      </div>

      {/* Top Right Links */}
      <div className="absolute top-5 right-10 z-20 flex space-x-6 text-white text-lg font-medium">
        <Link href="/admin" className="hover:text-gray-300">Admin</Link>
        <Link href="/" className="hover:text-gray-300">Logout</Link>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center text-white px-10 py-5 h-full">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Image src="/images/navlogo.png" alt="Logo" width={270} height={70} />
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-20 text-2xl font-semibold ml-10">
          {[
            { name: "Home", path: "/home" },
            { name: "Task", path: "/task" },
            { name: "User", path: "/user" },
            { name: "Admin", path: "/admin" },
          ].map(({ name, path }) => (
            <Link key={name} href={path}>
              <button
                className={`hover:text-yellow-300 ${
                  pathname === path ? "text-yellow-400" : "text-white"
                }`}
              >
                {name}
              </button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
