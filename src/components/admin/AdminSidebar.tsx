"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const nav = [
  { label: "Dashboard", href: "/admin", icon: "⊞" },
  { label: "Projects", href: "/admin/projects", icon: "◈" },
  { label: "Pages", href: "/admin/pages", icon: "☰" },
  { label: "Categories", href: "/admin/categories", icon: "⊹" },
  { label: "Tags", href: "/admin/tags", icon: "#" },
  { label: "Media", href: "/admin/media", icon: "⊡" },
  { label: "Backup", href: "/admin/backup", icon: "↓" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
  { label: "Docs", href: "/admin/docs", icon: "?" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow border border-gray-200"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative lg:flex flex-col w-60 bg-gray-900 text-white min-h-screen z-50 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0 flex" : "-translate-x-full hidden lg:flex"
        }`}
      >
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin" className="font-bold text-lg text-white tracking-tight">
            Sympl CMS
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Portfolio Platform</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span className="text-base w-5 text-center">↗</span>
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <span className="text-base w-5 text-center">→</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
