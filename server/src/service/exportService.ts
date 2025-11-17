import { db, schema } from "../db/index.js";
import { stringify } from "csv-stringify/sync";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { desc } from "drizzle-orm";

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

export async function createCsvAndUpload() {
  //  buscar todos os links
  const rows = await db
    .select()
    .from(schema.links)
    .orderBy(desc(schema.links.created_at));

  //  mapear dados para CSV
  const data = rows.map((r) => ({
    original_url: r.original_url,
    short_url: `${process.env.BASE_URL}/r/${r.short_code}`,
    access_count: r.access_count,
    created_at: r.created_at.toISOString(),
  }));

  //  gerar CSV
  const header = ["original_url", "short_url", "access_count", "created_at"];
  const csv = stringify(data, { header: true, columns: header });

  //  gerar nome único
  const filename = `exports/links_${Date.now()}_${uuidv4()}.csv`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET!,
      Key: filename,
      Body: Buffer.from(csv),
      ContentType: "text/csv",
      ACL: "public-read",
    })
  );

  //  retornar URL pública
  if (process.env.CLOUDFLARE_PUBLIC_URL) {
    return `${process.env.CLOUDFLARE_PUBLIC_URL.replace(
      /\/$/,
      ""
    )}/${filename}`;
  } else {
    return `${process.env.S3_ENDPOINT!.replace(/\/$/, "")}/${
      process.env.CLOUDFLARE_BUCKET
    }/${filename}`;
  }
}
