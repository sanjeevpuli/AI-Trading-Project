"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Get first letter of email for avatar fallback
  const initial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 font-medium">Signed in as</p>
            <p className="text-sm text-zinc-200 font-semibold truncate mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
            >
              👤 Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
            >
              ⚙️ Settings
            </Link>
          </div>

          <div className="border-t border-zinc-800 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer font-medium"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
