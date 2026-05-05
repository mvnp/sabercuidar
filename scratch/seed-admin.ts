import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding database...");

  const email = "admin@sabercuidar.com.br";
  const password = "admin_password_123"; // Troque esta senha!
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Verifica se já existe
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
      console.log("ℹ️ Admin user already exists.");
    } else {
      await db.insert(users).values({
        name: "Administrador SaberCuidar",
        email,
        passwordHash,
        role: "admin",
        active: true,
      });
      console.log("✅ Admin user created successfully!");
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();
