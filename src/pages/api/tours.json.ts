import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const tours = await getCollection("tours");
  const data = tours.map((tour) => ({ id: tour.id, ...tour.data }));
  return Response.json(data);
};
