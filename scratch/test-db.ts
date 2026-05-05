import { db } from "../src/db";
import { empresas } from "../src/db/schema";
import { count } from "drizzle-orm";

async function test() {
  try {
    const totalResult = await db.select({ value: count() }).from(empresas);
    console.log("DB Success:", totalResult[0].value);
  } catch (err) {
    console.error("DB Error:", err);
  }
}

test();
