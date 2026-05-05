"use client";

import { Menu } from "lucide-react";
import { toggleSidebarAction } from "@/actions/ui";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface SidebarToggleProps {
  isCollapsed: boolean;
}

export default function SidebarToggle({ isCollapsed }: SidebarToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleSidebarAction();
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`btn btn-ghost p-1.5 hover:bg-[var(--color-brand-100)] rounded-lg transition-all ${
        isPending ? "opacity-50" : ""
      }`}
      aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
    >
      <Menu className={`w-6 h-6 text-[var(--color-brand-700)]`} />
    </button>
  );
}
