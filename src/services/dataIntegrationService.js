import xml2js from 'xml2js';
import pool from '../config/postgres.js';
import { runQuery } from '../config/basex.js';


const BASEX_DB_NAME = "fornecedor"; 

export const obterRelatorioIntegrado = async () => {
  const client = await pool.connect();
  const parser = new xml2js.Parser({ explicitArray: false });

  try {

    console.log("dados do postgres");
    const resPecas = await client.query('SELECT * FROM Peca');
    const listaPecas = resPecas.rows;


    const xquery = `
      <raiz>
      {
        for $f in collection('${BASEX_DB_NAME}')/dados/fornecimento 
        return $f
      }
      </raiz>
    `;
    
    console.log(`Buscando fornecimentos no BaseX (DB: ${BASEX_DB_NAME})...`);
    
    const xmlRaw = await runQuery(xquery); 


    const resultadoXML = await parser.parseStringPromise(xmlRaw);

    console.log("xml:", xmlRaw.slice(0, 300));
console.log("convertido:", JSON.stringify(resultadoXML, null, 2));
console.log("normalizado:", resultadoXML.raiz?.fornecimento);

   let listaFornecimentos = [];
if (resultadoXML?.raiz?.fornecimento) {
  if (Array.isArray(resultadoXML.raiz.fornecimento)) {
    listaFornecimentos = resultadoXML.raiz.fornecimento;
  } else {
    listaFornecimentos = [resultadoXML.raiz.fornecimento];
  }
}



    console.log("processando");

    
const relatorio = listaFornecimentos.map((fornecimento) => {

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

console.log("relatorio:", relatorio);


    return relatorio;
    
 
  } catch (error) {
    console.error(`ERRO CRÍTICO na integração: Verifique o BaseX ou o nome do DB. Detalhes: ${error.message}`);
    throw new Error(`Falha na integração: ${error.message}`);
  } finally {
  
    client.release();
  }
};