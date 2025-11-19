import basex from "basex";
import dotenv from 'dotenv';
dotenv.config();

const session = new basex.Session(
  process.env.BASEX_HOST,
  process.env.BASEX_PORT,
  process.env.BASEX_USER,
  process.env.BASEX_PASS
);
export const runQuery = (query) => {
  return new Promise((resolve, reject) => {
    // 💡 MUDANÇA CRÍTICA AQUI: Prefixar a query com 'XQUERY '
    const fullCommand = `XQUERY ${query}`; 

    session.execute(fullCommand, (error, response) => {
      if (error) {
        // Se o erro ainda for 'undefined', pelo menos temos a query formatada
        reject(error);
      } else {
        resolve(response.result);
      }
    });
  });
};

export default session;