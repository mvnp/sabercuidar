import { requireAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar_collapsed")?.value === "true";

  return (
    <DashboardShell 
      initialCollapsed={isCollapsed} 
      user={session.user}
    >
      {children}
    </DashboardShell>
  );
}
