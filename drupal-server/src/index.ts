import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import express, {
    Application,
    Response as ExResponse,
    Request as ExRequest,
    NextFunction,
  } from "express";

import Router from "./routes";
import { TooManyRequestsError as MaxNumberOfScansError } from "./model/too-many-requests-error";
import  basicAuth from 'express-basic-auth';
// tslint:disable-next-line:no-require-imports
require('log-timestamp');

const PORT = process.env.PORT || 8000;

const app: Application = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));

app.get("/ping", async (_req, res) => {
  res.send({
    message: "pong"
  });
});

app.use(basicAuth({
  users: { admin: 'admin' },
  challenge: true,
}));

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json"
    }
  })
);

app.use(Router);

app.use(function errorHandler(
    err: unknown,
    req: ExRequest,
    res: ExResponse,
    next: NextFunction
  ): ExResponse | void {
    if (err instanceof MaxNumberOfScansError) {
      console.warn(`Too many requests for ${req.path}: ${err.message}`);
      return res.status(429).json({
        error: `Max number of scans reached, please try again later: ${err.message}`,
      });
    }
    if (err instanceof Error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  
    next();
  });

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
