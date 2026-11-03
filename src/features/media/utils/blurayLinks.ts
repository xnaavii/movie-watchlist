/** A Blu-ray.com search for a title, to check which disc editions exist. */
export const toBlurayComSearchUrl = (title: string): string =>
	`https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=all&quicksearch_keyword=${encodeURIComponent(title)}&section=bluraymovies`;
