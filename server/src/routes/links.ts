import { FastifyInstance } from "fastify";
import { db, schema } from "../db/index.js";
import { eq, sql, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateShortCode, SHORT_CODE_REGEX } from "../util/short.js";
import { createLinkSchema } from "../schemas/request.js";
import { z } from "zod";
import { createCsvAndUpload } from "../service/exportService.js";

export async function linkRoutes(fastify: FastifyInstance) {
  fastify.get("/", () => ({ message: "Up" }));

  fastify.post("/links", async (request, reply) => {
    const body = createLinkSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send(body.error.message);

    const { original_url, short_code: desired } = body.data;
    let short_code = desired ?? generateShortCode(6);

    if (!SHORT_CODE_REGEX.test(short_code)) {
      return reply.status(400).send({ error: "short_code invalid format" });
    }

    for (let i = 0; i < 5; i++) {
      const existing = await db
        .select()
        .from(schema.links)
        .where(eq(schema.links.short_code, short_code))
        .limit(1);

      if (existing.length === 0) {
        const id = uuidv4();
        await db.insert(schema.links).values({ id, original_url, short_code });
        return reply.status(201).send({ id, original_url, short_code });
      }

      if (desired) {
        return reply.status(409).send({ error: "short_code already exists" });
      }

      short_code = generateShortCode(6);
    }

    return reply
      .status(500)
      .send({ error: "could not create link after retries" });
  });

  fastify.get("/links", async (request, reply) => {
    const { limit = "20", cursor } = z
      .object({
        limit: z.string().optional(),
        cursor: z.string().optional(),
      })
      .parse(request.query);

    const pageLimit = Math.min(Number(limit), 100);

    if (cursor) {
      const [createdAt, id] = cursor.split("|");
      const items = await db.query.links.findMany({
        where: sql`(created_at < ${createdAt} OR (created_at = ${createdAt} AND id < ${id}))`,
        orderBy: [desc(schema.links.created_at)],
        limit: pageLimit,
      });
      return reply.send({ items });
    }

    const rows = await db
      .select()
      .from(schema.links)
      .orderBy(desc(schema.links.created_at))
      .limit(pageLimit);

    const nextCursor =
      rows.length > 0
        ? `${rows[rows.length - 1].created_at.toISOString()}|${rows[rows.length - 1].id}`
        : null;

    return reply.send({ items: rows, nextCursor });
  });

  fastify.delete("/links/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db.delete(schema.links).where(eq(schema.links.id, id));
    return result.rowCount === 0
      ? reply.status(404).send({ error: "not found" })
      : reply.status(204).send();
  });

  fastify.get("/links/info/:short", async (request, reply) => {
    const { short } = request.params as { short: string };
    const link = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.short_code, short))
      .limit(1);

    return link.length === 0
      ? reply.status(404).send({ error: "not found" })
      : reply.send(link[0]);
  });

  fastify.get("/:short", async (request, reply) => {
    const { short } = request.params as { short: string };

    const link = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.short_code, short))
      .limit(1);

    if (!link.length) {
      return reply.status(404).send({ error: "not found" });
    }

    // Incrementa contador em background
    db.update(schema.links)
      .set({ access_count: sql`${schema.links.access_count} + 1` })
      .where(eq(schema.links.id, link[0].id))
      .catch(console.error);

    return reply.redirect(link[0].original_url);
  });

  fastify.post("/exports", async (request, reply) => {
    try {
      const publicUrl = await createCsvAndUpload();
      return reply.send({ url: publicUrl });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
}
