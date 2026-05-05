import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function hashFirstUser() {
  console.log("🔐 Hashing password for the first user found...");

  try {
    // Buscamos o primeiro usuário do banco
    const allUsers = await db.select().from(users).limit(1);
    
    if (allUsers.length === 0) {
      console.log("❌ No users found in database.");
      return;
    }

    const user = allUsers[0];
    console.log(`ℹ️ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`ℹ️ Current password value (plain text): ${user.passwordHash}`);
    
    const hashed = await bcrypt.hash(user.passwordHash, 10);
    
    await db.update(users)
      .set({ passwordHash: hashed })
      .where(eq(users.id, user.id));
      
    console.log(`✅ Password successfully hashed and updated for ${user.email}`);
  } catch (error) {
    console.error("❌ Operation failed:", error);
  } finally {
    process.exit(0);
  }
}

hashFirstUser();
