import driver from "../config/neo4j.js";
import { obterRelatorioIntegrado } from "../services/dataIntegrationService.js";

// Rota de teste simples
export const healthCheck = (req, res) => {
  res.send("API rodando perfeitamente!");
};

// Lógica do Neo4j
export const criarPessoaNeo4j = async (req, res) => { // <-- Função Corrigida
  const session = driver.session();
  try {
    const result = await session.run(
      `CREATE (p:Pessoa {nome: $nome}) RETURN p`,
      { nome: req.body.nome }
    );
    const pessoa = result.records[0].get("p").properties;
    res.json({ message: "Pessoa criada no Neo4j", data: pessoa });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Lógica da Integração (Postgres + BaseX)
export const getRelatorio = async (req, res) => {
  try {
    const dados = await obterRelatorioIntegrado();
    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao integrar dados." });
  }
};