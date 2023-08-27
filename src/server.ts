import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import config from "./config";

import Debuger from "./debuger";

import routes from "./routes";
import apiErrorHandler from "./middlewares/api_error_handler";
import ApiError from "./errors/ApiError";

import swaggerDocs from "./swagger.json";

const Debug = Debuger("Routes");
const app = express();

/** Debug the request */
app.use((req: Request, res: Response, next: NextFunction) => {
  Debug.log(`METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

  res.on("finish", () => {
    Debug.log(
      `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`
    );
  });
  console.log("\n");

  next();
});

/** Parse the request */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/** Rules of the API */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  next();
});

/** Allow external applications to request the API's allowed options */
app.options("/", (req: Request, res: Response) => res.end());

/** Define Swagger Documentation route */
app.get("/docs-data", (req: Request, res: Response) => {
  res.status(200).json(swaggerDocs);
});
app.get("/docs", (req: Request, res: Response) => {
  res.redirect("https://ftasks.vercel.app/docs");
});

/** Import routes from 'routes.ts' file */
app.use("/", routes);

/** Error Handling */
app.use((req: Request, res: Response) => {
  throw ApiError.notFound();
});
app.use(apiErrorHandler);

/** Create the server */
app.listen(config.server.port, () => {
  Debug.info(`Server running on port ${config.server.port}`);
});
