import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    return null;
  }

  // Em um cenário real, validaríamos o JWT ou buscaríamos no banco.
  return {
    user: {
      id: "mock-admin-id",
      name: "Dra. Ana Silva",
      email: "admin@sabercuidar.com.br",
      role: "admin",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    },
  };
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
