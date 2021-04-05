import express from "express";
import ScanController from "../controllers/scan";

const router = express.Router();

const scanController = new ScanController();

router.post("/scan", async (req, res, next) => {
  try {
    const response = await scanController.runScan(req.body);
    return res.send(response);
  } catch(err) {
    next(err);
  }
});

router.get("/scan/:token/status", async (req, res) => {
  const response = await scanController.getScanStatus(req.params.token);
  return res.send(response);
});

router.get("/scan/:token/report", async (req, res) => {
  const response = await scanController.getJsonResult(req.params.token);
  return res.send(response);
});

router.get("/scan/:token/angular-app-export", async (req, res) => {
  const buf = await scanController.getAngularAppJsonResult(req.params.token);
  return res.send(Buffer.from(buf));
});

export default router;
