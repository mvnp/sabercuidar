"use server";

import { cookies } from "next/headers";

export async function toggleSidebarAction() {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar_collapsed")?.value === "true";
  
  cookieStore.set("sidebar_collapsed", isCollapsed ? "false" : "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });

  return { success: true };
}
