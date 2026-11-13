import type { APIRoute } from "astro";
import { generateChallenge } from "capjs-core";
import { env } from "@/lib/env";

export const prerender = false;

export const POST: APIRoute = async ({ url }) => {
  const secret = env.CAP_SECRET_KEY || "amsirar-default-dev-cap-secret-key-32b";
  try {
    const isWasmDisabled = url.searchParams.get("wasm") === "0";
    const challenge = await generateChallenge(secret, {
      format: 2,
      protocols: isWasmDisabled ? ["sha256-pow"] : ["hashwx"],
    });

    return Response.json(challenge, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[cap] Failed to generate challenge:", error);
    return Response.json(
      { error: "Failed to generate challenge" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
