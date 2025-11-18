import express from "express";
import driver from "./neo.js";


const app = express();
const PORT = 3004;
app.use(express.json());

app.get("/", (req, res) => res.send("rodando"));

app.post("/", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `CREATE (p:Pessoa {nome: $nome}) RETURN p`,
      { nome: req.body.nome }
    );
    res.json(result.records[0].get("p").properties);
  } finally {
    await session.close();
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

import fetch from "node-fetch";

(async () => {
  const resp = await fetch(`http://localhost:${PORT}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "joao" })
  });
  
  console.log(await resp.json());
})();
