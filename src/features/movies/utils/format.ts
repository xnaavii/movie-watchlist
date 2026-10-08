export const formatRuntime = (minutes: number | undefined): string | null => {
	if (!minutes || minutes <= 0) return null;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
};

const reviewDateFormat = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
	timeZone: "UTC",
});

export const formatReviewDate = (isoDate: string): string =>
	reviewDateFormat.format(new Date(isoDate));

export const stripMarkdown = (markdown: string): string =>
	markdown
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}(#{1,6}|>)\s?/gm, "")
		.replace(/(\*{1,3}|_{1,3}|~~|`)(\S(?:.*?\S)?)\1/g, "$2");
