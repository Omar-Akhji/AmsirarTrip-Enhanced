import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { actions, i18n, middleware, pages, sessions } from "astro/hono";

const app = new Hono();

const isDevelopment = import.meta.env.DEV;

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  console.error("[Hono Error]", error);

  return c.json(
    {
      error: "Internal Server Error",
      ...(isDevelopment && { message: error.message, stack: error.stack }),
    },
    500,
  );
});

app.use(logger());

app.use(sessions());

app.use(
  "/_actions/*",
  rateLimiter({
    windowMs: 60_000,
    limit: 120,
    keyGenerator: (c) =>
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "anonymous",
  }),
);

app.use(actions());
app.use(middleware());
app.use(i18n());
app.use(pages());

export default app;
