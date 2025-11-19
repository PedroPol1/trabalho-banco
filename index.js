import express from "express";
import dotenv from "dotenv";
import routes from "./src/routes.js"; // Correto para default export

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// LINHA CRÍTICA REINTRODUZIDA: Sem ela, nenhuma rota funciona.
app.use(routes); 

app.listen(PORT, () => {
console.log(`Servidor rodando em http://localhost:${PORT}`);
 console.log(` Integração: http://localhost:${PORT}/relatorio/integrado`);
 console.log(` Neo4j: POST http://localhost:${PORT}/neo4j/pessoa`);
});