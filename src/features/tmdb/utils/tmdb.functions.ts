import { createServerFn } from "@tanstack/react-start";
import { getMovieById } from "./tmdb.server";

export const getMovie = createServerFn({ method: "GET" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return getMovieById(data.id);
  });
