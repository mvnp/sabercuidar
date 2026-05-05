import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAuthSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_token")?.value;

  if (!userId) {
    return null;
  }

  try {
    // Busca o usuário no banco pelo ID armazenado no cookie
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      user: {
        ...user,
        // Garantindo que avatarUrl tenha um fallback se estiver nulo
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
      },
    };
  } catch (error) {
    console.error("Auth session error:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
