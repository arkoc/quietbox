import { env } from "cloudflare:workers";
import { boundedJson, checkProof, messageText, requireSecret, sameOrigin, saveSubmission, SubmissionError } from "../../../lib/submissions";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new SubmissionError(403, "Հաղորդագրությունն ուղարկեք Quietbox-ի ձևի միջոցով։");
    if (!env.DB) throw new SubmissionError(503, "Արկղը ժամանակավորապես անհասանելի է։");
    const data = await boundedJson(request);
    const body = messageText(data);
    const proof = await checkProof(data.proof, requireSecret(env.BOT_SECRET));
    await saveSubmission(env.DB, body, proof);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SubmissionError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Չհաջողվեց պահել հաղորդագրությունը։ Ձեր գրածը մնացել է այս էջում․ փորձեք կրկին։" }, { status: 503 });
  }
}
