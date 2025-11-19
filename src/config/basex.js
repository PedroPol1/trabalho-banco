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

    const fullCommand = `XQUERY ${query}`; 

    session.execute(fullCommand, (error, response) => {
      if (error) {
       
        reject(error);
      } else {
        resolve(response.result);
      }
    });
  });
};

export default session;