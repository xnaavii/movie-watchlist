const URL = "https://api.themoviedb.org/3";

export async function getMovieById(id: number) {
	if (id === undefined || id === null || id < 0) {
		return { success: false, message: "Please provide a valid id" };
	}

	try {
		const response = await fetch(`${URL}/movie/${id}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error(
				`TMDB API ERROR: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error("Error fetching movie: ", error);
	}
}
