import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class R2Service {
  private client: S3Client;
  private bucketName: string;
  private publicUrl?: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
    const bucket = process.env.CLOUDFLARE_BUCKET;
    const endpoint =
      process.env.S3_ENDPOINT ||
      `https://${accountId}.r2.cloudflarestorage.com`;
    this.publicUrl = process.env.CLOUDFLARE_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      console.warn(
        "Cloudflare R2 credentials missing, using local storage fallback",
      );
      this.client = null as any;
      this.bucketName = "";
      return;
    }

    this.bucketName = bucket;

    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string,
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Cloudflare R2 not configured");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.client.send(command);

    // Retorna a URL pública se configurada
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }

    return key;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.client) return;

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  generateKey(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split(".").pop();
    return `exports/${timestamp}-${random}.${extension}`;
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}

// Exporta uma instância única
export const r2Service = new R2Service();
