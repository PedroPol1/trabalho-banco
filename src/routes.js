import express from "express";
import { healthCheck, criarPessoaNeo4j, getRelatorio } from "./controllers/mainController.js";

const router = express.Router();

router.get("/", healthCheck);
router.post("/neo4j/pessoa", criarPessoaNeo4j);
router.get("/relatorio/integrado", getRelatorio);

export default router;