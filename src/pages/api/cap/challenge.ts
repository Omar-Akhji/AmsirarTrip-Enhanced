import type { APIRoute } from "astro";
import { generateChallenge } from "capjs-core";
import { env } from "@/lib/env";

export const prerender = false;

export const POST: APIRoute = async () => {
  const secret = env.CAP_SECRET_KEY || "amsirar-default-dev-cap-secret-key-32b";
  try {
    const challenge = await generateChallenge(secret, {
      format: 2,
      protocols: ["hashwx", "instrumentation"],
    });

    return new Response(JSON.stringify(challenge), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[cap] Failed to generate challenge:", error);
    return new Response(JSON.stringify({ error: "Failed to generate challenge" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
