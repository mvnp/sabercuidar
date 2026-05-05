"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação.",
    };
  }

  // --- Mock Authentication ---
  // Em um cenário real, consultaríamos o banco de dados (users table) e verificaríamos o hash.
  // Por enquanto, aceitaremos qualquer login para facilitar o desenvolvimento do dashboard.
  if (email === "admin@sabercuidar.com.br" && password === "123456") {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", "mock-token-123", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 dia
      path: "/",
    });

    redirect("/dashboard");
  } else {
    return {
      message: "Credenciais inválidas. Tente admin@sabercuidar.com.br / 123456",
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("sidebar_collapsed");
  redirect("/login");
}
