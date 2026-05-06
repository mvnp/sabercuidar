"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

  try {
    // 1. Busca o usuário pelo e-mail
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return {
        message: "Credenciais inválidas.",
      };
    }

    // 2. Verifica se o usuário está ativo
    if (!user.active) {
      return {
        message: "Esta conta está desativada.",
      };
    }

    // 3. Compara a senha com o hash no banco
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return {
        message: "Credenciais inválidas.",
      };
    }

    // 4. Se tudo estiver correto, cria a sessão
    const cookieStore = await cookies();
    cookieStore.set("auth_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 dia
      path: "/",
    });

  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "Ocorreu um erro ao processar o login.",
    };
  }

  // Redirect deve ser fora do try/catch no Next.js
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("sidebar_collapsed");
  redirect("/login");
}

const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validatedFields = resetPasswordSchema.safeParse({ email, password, confirmPassword });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação.",
    };
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return {
        message: "Usuário não encontrado.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: "Senha redefinida com sucesso!",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      message: "Ocorreu um erro ao processar a redefinição de senha.",
    };
  }
}
