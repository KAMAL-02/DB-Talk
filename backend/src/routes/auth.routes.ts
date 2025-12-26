import type { FastifyInstance } from "fastify";
import { loginSchema } from "../schemas/auth.schema.js";
import * as authHandler from "../handlers/auth.handler.js";

export const authRoutes = async (app: FastifyInstance) => {
  app.post("/login", { schema: loginSchema }, authHandler.loginHandler);
  app.get("/me", { preHandler: app.authenticate }, authHandler.meHandler);
};
