import { Router } from "express";
import { catalog, flattenPrograms } from "../data/catalog.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(flattenPrograms(catalog));
});

router.get("/catalog", (_req, res) => {
  res.json(catalog);
});

export default router;
