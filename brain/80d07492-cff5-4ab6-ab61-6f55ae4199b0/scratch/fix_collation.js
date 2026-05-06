const postgres = require('postgres');
const dotenv = require('dotenv');
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function fix() {
  try {
    console.log("Iniciando correo de colao no banco 'dados'...");
    await sql.unsafe("ALTER DATABASE dados REFRESH COLLATION VERSION;");
    console.log("Colao atualizada com sucesso.");
    
    console.log("Iniciando reindexao completa do banco (isso pode levar alguns segundos)...");
    await sql.unsafe("REINDEX DATABASE dados;");
    console.log("Reindexao concluda com sucesso.");
  } catch (err) {
    console.error("Erro ao tentar corrigir automaticamente:", err.message);
    console.log("\nCaso o erro persista, tente rodar os comandos manualmente no seu gerenciador de banco de dados (DBeaver/pgAdmin):");
    console.log("1. ALTER DATABASE dados REFRESH COLLATION VERSION;");
    console.log("2. REINDEX DATABASE dados;");
  } finally {
    await sql.end();
    process.exit();
  }
}

fix();
