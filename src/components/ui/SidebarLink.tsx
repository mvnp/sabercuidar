"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";

interface SidebarLinkProps {
  href: string;
  iconName: keyof typeof Icons;
  label: string;
  isCollapsed: boolean;
}

export default function SidebarLink({ 
  href, 
  iconName, 
  label, 
  isCollapsed 
}: SidebarLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  
  // Resolve icon component from name
  const Icon = Icons[iconName] as Icons.LucideIcon;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] shadow-sm border border-[var(--color-brand-100)]" 
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
      } ${isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : ""}`}
      title={isCollapsed ? label : ""}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[var(--color-brand-600)]" : ""}`} />
      {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">{label}</span>}
    </Link>
  );
}
