import { env } from "cloudflare:workers";
import { isRecipient } from "../../../lib/recipient";
import { boundedJson, cleanupStatements, sameOrigin } from "../../../lib/submissions";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isRecipient())) return Response.json({ error: "Անհրաժեշտ է հասցեատիրոջ մուտքը։" }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Արկղն անհասանելի է։" }, { status: 503 });
  try {
    await env.DB.batch(cleanupStatements(env.DB));
    const result = await env.DB.prepare("SELECT id, body, day, is_read FROM messages ORDER BY day DESC, id DESC LIMIT 500").all();
    return Response.json({ messages: result.results });
  } catch { return Response.json({ error: "Չհաջողվեց բեռնել արկղը։ Փորձեք կրկին։" }, { status: 503 }); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await isRecipient())) return Response.json({ error: "Անհրաժեշտ է հասցեատիրոջ մուտքը։" }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Արկղն անհասանելի է։" }, { status: 503 });
  try {
    const data = await boundedJson(request);
    if (typeof data.id !== "string" || !/^[a-f0-9-]{36}$/.test(data.id) || !["read", "delete"].includes(String(data.action))) return Response.json({ error: "Անվավեր հարցում։" }, { status: 400 });
    await env.DB.prepare(data.action === "delete" ? "DELETE FROM messages WHERE id = ?" : "UPDATE messages SET is_read = 1 WHERE id = ?").bind(data.id).run();
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Չհաջողվեց պահել փոփոխությունը։" }, { status: 503 }); }
}
