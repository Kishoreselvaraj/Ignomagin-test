"use client"; // Ensure this is a client component

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook to get the current path

function NavBar() {
  const [role, setRole] = useState(""); // State to store role

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("userRole") || "");
    }
  }, []);

  const pathname = usePathname(); // Get current path

  return (
    <div className=" h-[25vh] sticky top-0">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/images/navBackground.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10"></div>
      </div>

      {/* Top Right Links */}
      <div className="absolute top-5 right-10 z-20 flex space-x-6 text-white text-lg font-medium">
        <Link href="" className="hover:text-gray-300">
          {role}
        </Link>
        <Link href="/" className="hover:text-gray-300">
          Logout
        </Link>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center text-white px-10 py-5 h-full">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Image src="/images/navlogo.png" alt="Logo" width={270} height={70} />
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-20 text-2xl font-semibold ml-10">
          {/* Show specific links for superadmin */}
          {role === "superadmin" ? (
            <>
              <Link
                href="/superuser"
                className={`hover:text-yellow-300 ${
                  pathname === "/create-user" ? "text-yellow-400" : "text-white"
                }`}
              >
                Create User
              </Link>
              <Link
                href="/product"
                className={`hover:text-yellow-300 ${
                  pathname === "/product"
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                Product
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/home"
                className={`hover:text-yellow-300 ${
                  pathname === "/home" ? "text-yellow-400" : "text-white"
                }`}
              >
                Home
              </Link>

              {/* Show Task & User only if the role is "admin" */}
              {role === "admin" && (
                <>
                  <Link
                    href="/task"
                    className={`hover:text-yellow-300 ${
                      pathname === "/task" ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    Task
                  </Link>
                  <Link
                    href="/user"
                    className={`hover:text-yellow-300 ${
                      pathname === "/user" ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    User
                  </Link>
                </>
              )}
              {/* Always show Help */}
              <Link
                href="/help"
                className={`hover:text-yellow-300 ${
                  pathname === "/help" ? "text-yellow-400" : "text-white"
                }`}
              >
                Help
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
