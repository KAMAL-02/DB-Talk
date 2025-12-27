import type { FastifyInstance } from "fastify";
import { loginSchema } from "../schemas/auth.schema.js";
import * as auth from "../handlers/auth.handler.js";

export const authRoutes = async (app: FastifyInstance) => {
  app.post("/login", { schema: loginSchema }, auth.loginHandler);
  app.get("/me", { preHandler: app.authenticate }, auth.meHandler);
};
