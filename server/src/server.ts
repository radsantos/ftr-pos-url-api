import Fastify from "fastify";
import { linkRoutes } from "./routes/links.js";
import { fastifyCors } from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
});

fastify.register(linkRoutes);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
fastify
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    fastify.log.info(`Server listening on ${port}`);
  })
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
