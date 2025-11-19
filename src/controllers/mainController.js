import driver from "../config/neo4j.js";
import { obterRelatorioIntegrado } from "../services/dataIntegrationService.js";


export const healthCheck = (req, res) => {
  res.send("API rodando perfeitamente!");
};

export const criarPessoaNeo4j = async (req, res) => { 
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
export const getRelatorio = async (req, res) => {
  try {
    const dados = await obterRelatorioIntegrado();
    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao integrar dados." });
  }
};