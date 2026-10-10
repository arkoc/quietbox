import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";
export async function isRecipient(): Promise<boolean> {
  const user = await getChatGPTUser();
  return Boolean(user && env.RECIPIENT_EMAIL && user.email.toLowerCase() === env.RECIPIENT_EMAIL.toLowerCase());
}
