import type { APIRoute } from "astro";
import { validateChallenge, type ValidateChallengeBody } from "capjs-core";
import { env } from "@/lib/env";
import { capStore } from "@/services/cap-store";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secret = env.CAP_SECRET_KEY || "amsirar-default-dev-cap-secret-key-32b";
  try {
    const rawBody = (await request.json()) as unknown;
    if (!rawBody || typeof rawBody !== "object") {
      return new Response(JSON.stringify({ success: false, reason: "invalid_body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = rawBody as ValidateChallengeBody;
    const result = await validateChallenge(secret, body, { consumeNonce: capStore.consumeNonce });

    if (!result.success || !result.tokenKey) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: result.success ? "missing_token_key" : result.reason,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    capStore.saveToken(result.tokenKey, result.expires);

    return new Response(
      JSON.stringify({ success: true, token: result.token, expires: result.expires }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("[cap] Failed to redeem challenge:", error);
    return new Response(JSON.stringify({ success: false, error: "Validation error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
