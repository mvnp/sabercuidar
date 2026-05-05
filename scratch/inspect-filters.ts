import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

async function inspect() {
  try {
    for (const table of ['municipios', 'cnaes']) {
      const res = await client`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${table}`;
      console.log(`\n--- ${table} ---`);
      console.log(res);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
