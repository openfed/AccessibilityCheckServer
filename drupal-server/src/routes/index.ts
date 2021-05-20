import express from "express";
import ScanController from "../controllers/scan";

const router = express.Router();

const scanController = new ScanController();

router.post("/scan", async (req, res, next) => {
  try {
    const response = await scanController.runScan(req.body);
    const status = scanController.getStatus() || 200;
    return res.status(status).send(response);
  } catch (err) {
    next(err);
  }
});

router.get("/scan/:token/status", async (req, res) => {
  const response = await scanController.getScanStatus(req.params.token);
  const status = scanController.getStatus() || 200;
  return res.status(status).send(response);
});

router.get("/scan/:token/report", async (req, res) => {
  const response = await scanController.getJsonResult(req.params.token);
  const status = scanController.getStatus() || 200;
  return res.status(status).send(response);
});

router.get("/scan/:token/angular-app-export", async (req, res) => {
  const response = await scanController.getAngularAppJsonResult(
    req.params.token
  );
  const status = scanController.getStatus() || 200;
  return res.status(status).send(response);
});

export default router;
