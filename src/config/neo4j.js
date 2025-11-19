import neo4j from "neo4j-driver";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

// Tenta carregar o .env
dotenv.config({ path: envPath });

// --- SOLUÇÃO DE CONTINGÊNCIA ---
// Se não encontrar no .env, usa estes valores padrão:
const uri = process.env.NEO_URI || "neo4j://127.0.0.1:7687";
const user = process.env.NEO_USER || "neo4j";
const pass = process.env.NEO_PASS || "pedro123";

console.log(`🔌 Conectando ao Neo4j em: ${uri}`);

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(user, pass)
);

export default driver;