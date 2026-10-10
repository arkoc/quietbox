import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { sanitizeRequest, secureResponse } from "../lib/privacy";

export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "Հարցման ժամկետը լրացել է։ Փորձեք կրկին։" };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    try {
      const response = await runWithConnectorBinding(binding, () => handler.fetch(sanitizeRequest(request), env, ctx));
      return secureResponse(response, import.meta.env.DEV);
    } catch {
      // Never log requests, headers, proofs, message bodies, or raw exceptions.
      return secureResponse(Response.json({ error: "Ժամանակավորապես անհասանելի է։ Փորձեք կրկին։" }, { status: 503 }));
    }
  },
};
