import { env } from "cloudflare:workers";
import { makeChallenge, requireSecret } from "../../../lib/submissions";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (!env.DB) throw new Error();
    return Response.json(await makeChallenge(requireSecret(env.BOT_SECRET)), { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Սպամի ստուգումը ժամանակավորապես անհասանելի է։ Փորձեք կրկին։" }, { status: 503 }); }
}
