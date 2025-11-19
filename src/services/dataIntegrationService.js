import xml2js from 'xml2js';
import pool from '../config/postgres.js';
import { runQuery } from '../config/basex.js';

// Usamos 'fornecedor' conforme o último log de sucesso
const BASEX_DB_NAME = "fornecedor"; 

export const obterRelatorioIntegrado = async () => {
  const client = await pool.connect();
  const parser = new xml2js.Parser({ explicitArray: false });

  try {
    // 1. Busca dados relacionais no PostgreSQL (Tabela Peca)
    console.log("📥 Buscando dados no Postgres...");
    const resPecas = await client.query('SELECT * FROM Peca');
    const listaPecas = resPecas.rows;

    // 2. Busca dados semiestruturados no BaseX via XQuery
    // Usamos collection() que foi confirmada como funcional
    const xquery = `
      <raiz>
      {
        for $f in collection('${BASEX_DB_NAME}')/dados/fornecimento 
        return $f
      }
      </raiz>
    `;
    
    console.log(`📡 Buscando fornecimentos no BaseX (DB: ${BASEX_DB_NAME})...`);
    
    const xmlRaw = await runQuery(xquery); 

    // 3. Converte a string XML para JSON
    const resultadoXML = await parser.parseStringPromise(xmlRaw);

    console.log("XML bruto:", xmlRaw.slice(0, 300));
console.log("JSON convertido:", JSON.stringify(resultadoXML, null, 2));
console.log("Fornecimentos normalizados:", resultadoXML.raiz?.fornecimento);
    
    // Garante que o resultado seja um array para iteração
   let listaFornecimentos = [];
if (resultadoXML?.raiz?.fornecimento) {
  if (Array.isArray(resultadoXML.raiz.fornecimento)) {
    listaFornecimentos = resultadoXML.raiz.fornecimento;
  } else {
    listaFornecimentos = [resultadoXML.raiz.fornecimento];
  }
}


    // 4. Realiza o JOIN (Cruzamento de dados)
    console.log("⚙️ Processando integração em memória...");

    
const relatorio = listaFornecimentos.map((fornecimento) => {
  // Normaliza o código da peça do XML removendo o "P"
  const idBaseX = String(fornecimento.Cod_Peca).trim().replace(/^P/, "");

  const pecaDetalhe = listaPecas.find(p => String(p.cod_peca).trim() === idBaseX);

  if (pecaDetalhe) {
    return {
      cod_fornec: fornecimento.Cod_Fornec,
      cod_proj: fornecimento.Cod_Proj,
      quantidade: Number(fornecimento.Quantidade),
      peca: {
        nome: pecaDetalhe.pnome,
        cor: pecaDetalhe.cor,
        cidade: pecaDetalhe.cdade,
        peso: Number(pecaDetalhe.peso)
      }
    };
  }
  return null;
}).filter(item => item !== null);

console.log("📊 Relatório final:", relatorio);


    return relatorio; // <--- ESTE RETORNO DEVE SER EXECUTADO
    
 
  } catch (error) {
    console.error(`ERRO CRÍTICO na integração: Verifique o BaseX ou o nome do DB. Detalhes: ${error.message}`);
    throw new Error(`Falha na integração: ${error.message}`);
  } finally {
    // Libera a conexão do pool do PostgreSQL
    client.release();
  }
};