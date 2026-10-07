import express from "express";
import authRoutes from "./routes/v1/auth.js";
import { NextFunction, Response, Request } from "express";
import { errorMonitor } from "events";
import adminRoutes from "./routes/v1/admin/admin.js";
import { auth } from "./middlewares/auth.js";
import cookieParser from "cookie-parser";
import { authorise } from "./middlewares/authorise.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import * as middleware from "i18next-http-middleware";
import path from "path";

import { backup } from "node:sqlite";
import routes from "./routes/v1/index.js";

export const app = express();

app.use(express.json()).use(cookieParser());

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(
        process.cwd(),
        "src/locales",
        "{{lng}}",
        "{{ns}}.json",
      ),
    },
    detection: {
      order: ["querystring", "cookie"],
      caches: ["cookie"],
    },
    fallbackLng: "en",
    preload: ["en", "mm"],
  });
app.use(middleware.handle(i18next));

app.use(routes);
// app.use(authRoutes);
// app.use("/admin", auth, authorise(true, "ADMIN"), adminRoutes);
// app.use(userRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 400;
  const message = error.message || "Server_Error";
  const errorCode = error.errorCode || "Error_Code";

  return res.status(status).json({
    message,
    errorCode,
  });
});
