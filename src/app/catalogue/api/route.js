import { fetchFilms, searchFilms } from "@/app/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const films = await searchFilms(q);

  return Response.json({
    films,
    message: films.length === 0 ? "No films found" : undefined,
  });
}
