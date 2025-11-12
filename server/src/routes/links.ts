import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, sql, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateShortCode, SHORT_CODE_REGEX } from "../util/short";
import { createLinkSchema } from "../schemas/request";
import { z } from "zod";
import { createCsvAndUpload } from "../service/exportService";

export async function linkRoutes(fastify: FastifyInstance) {
  fastify.post("/links", async (request, reply) => {
    const body = createLinkSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);

    const { original_url, short_code: desired } = body.data;

    // validação de short_code
    let short_code = desired ?? generateShortCode(6);
    if (!SHORT_CODE_REGEX.test(short_code)) {
      return reply.status(400).send({ error: "short_code invalid format" });
    }

    const MAX_TRIES = 5;
    for (let i = 0; i < MAX_TRIES; i++) {
      // checar se já existe
      const found = await db
        .select()
        .from(schema.links)
        .where(eq(schema.links.short_code, short_code))
        .limit(1);

      if (found.length === 0) {
        try {
          const id = uuidv4();
          await db.insert(schema.links).values({
            id,
            original_url,
            short_code,
          });
          return reply.status(201).send({ id, original_url, short_code });
        } catch (err: any) {
          if (i === MAX_TRIES - 1) {
            return reply.status(500).send({ error: "could not create link" });
          }
          if (!desired) {
            short_code = generateShortCode(6);
            continue;
          } else {
            return reply
              .status(409)
              .send({ error: "short_code already exists" });
          }
        }
      } else {
        if (desired) {
          return reply.status(409).send({ error: "short_code already exists" });
        } else {
          short_code = generateShortCode(6);
        }
      }
    }

    return reply
      .status(500)
      .send({ error: "could not create link after retries" });
  });

  fastify.get("/links", async (request, reply) => {
    const q = z
      .object({
        limit: z.string().optional(),
        cursor: z.string().optional(),
      })
      .parse(request.query);

    const limit = Math.min(Number(q.limit || 20), 100);

    if (q.cursor) {
      const [createdAt, id] = q.cursor.split("|");

      const items = await db.query.links.findMany({
        where: sql`(created_at < ${createdAt} OR (created_at = ${createdAt} AND id < ${id}))`,
        orderBy: [desc(schema.links.created_at)],
        limit,
      });

      return reply.send({ items });
    }

    // fallback para primeira página
    const rows = await db
      .select()
      .from(schema.links)
      .orderBy(desc(schema.links.created_at))
      .limit(limit);

    const nextCursor =
      rows.length > 0
        ? `${rows[rows.length - 1].created_at.toISOString()}|${
            rows[rows.length - 1].id
          }`
        : null;

    return reply.send({ items: rows, nextCursor });
  });

  fastify.delete("/links/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const res = await db
      .delete(schema.links)
      .where(eq(schema.links.id, String(id)));
    if (res.rowCount === 0)
      return reply.status(404).send({ error: "not found" });
    return reply.status(204).send();
  });

  //  Obter URL original por short_code (sem redirecionar)
  fastify.get("/links/:short", async (request, reply) => {
    const { short } = request.params as { short: string };
    const item = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.short_code, short))
      .limit(1);

    if (!item || item.length === 0)
      return reply.status(404).send({ error: "not found" });

    return reply.send(item[0]);
  });

  //  Redirecionamento e incremento
  fastify.get("/r/:short", async (request, reply) => {
    const { short } = request.params as { short: string };

    // Buscar o link pelo código curto
    const rows = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.short_code, short))
      .limit(1);

    if (!rows || rows.length === 0)
      return reply.status(404).send({ error: "not found" });

    const link = rows[0] as {
      id: string;
      original_url: string;
    };

    // Incrementar contador
    await db
      .update(schema.links)
      .set({
        access_count: sql`${schema.links.access_count} + 1`,
      })
      .where(eq(schema.links.id, link.id));

    // Redirecionar para o link original
    return reply.redirect(link.original_url);
  });

  //  Exportar CSV e enviar cloud
  fastify.post("/exports", async (request, reply) => {
    try {
      const publicUrl = await createCsvAndUpload();
      return reply.send({ url: publicUrl });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
}
