declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    BOT_SECRET?: string;
    RECIPIENT_EMAIL?: string;
  }
}
