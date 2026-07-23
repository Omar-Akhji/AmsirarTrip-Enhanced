import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const destinations = await getCollection("destinations");
  const data = destinations.map((destination) => ({ id: destination.id, ...destination.data }));
  return Response.json(data);
};
