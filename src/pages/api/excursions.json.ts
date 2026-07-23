import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const excursions = await getCollection("excursions");
  const data = excursions.map((excursion) => ({ id: excursion.id, ...excursion.data }));
  return Response.json(data);
};
