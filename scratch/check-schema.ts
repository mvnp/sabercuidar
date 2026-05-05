import "dotenv/config";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

async function check() {
  try {
    const res = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'sabercuidar'
    `;
    console.log("Tables in sabercuidar schema:");
    console.log(res);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
