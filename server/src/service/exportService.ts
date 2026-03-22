import { db, schema } from "../db/index.js";
import { stringify } from "csv-stringify/sync";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { desc } from "drizzle-orm";

const s3 = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

export async function createCsvAndUpload() {
  try {
    const rows = await db
      .select()
      .from(schema.links)
      .orderBy(desc(schema.links.created_at));

    if (rows.length === 0) {
      throw new Error("Nenhum link encontrado para exportar");
    }

    const data = rows.map((r) => ({
      original_url: r.original_url,
      short_url: `${process.env.BASE_URL || "http://localhost:3000"}/${r.short_code}`,
      access_count: r.access_count,
      created_at: r.created_at.toISOString(),
    }));

    const header = ["original_url", "short_url", "access_count", "created_at"];
    const csv = stringify(data, { header: true, columns: header });

    const filename = `exports/links_${Date.now()}_${uuidv4()}.csv`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET!,
        Key: filename,
        Body: Buffer.from(csv, "utf-8"),
        ContentType: "text/csv",
        ACL: "public-read",
      }),
    );

    let publicUrl: string;

    if (process.env.CLOUDFLARE_PUBLIC_URL) {
      publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL.replace(/\/$/, "")}/${filename}`;
    } else {
      publicUrl = `${process.env.S3_ENDPOINT}/${process.env.CLOUDFLARE_BUCKET}/${filename}`;
    }

    return publicUrl;
  } catch (error) {
    throw error;
  }
}
