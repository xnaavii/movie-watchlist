import { useState } from "react";
import { cn } from "#/lib/utils";

interface MediaLogoProps {
	logoSrc: string | undefined;
	title: string;
	isLoading?: boolean;
	className?: string;
	imageClassName?: string;
	/**
	 * When set, the title shows as text in this style until the logo image
	 * loads, and stays if it fails. Use it where the logo replaces the
	 * visible heading, so the title never goes missing.
	 */
	fallbackClassName?: string;
	/** Softens the glow behind the logo when it sits on the page, not a photo. */
	overBackground?: boolean;
}

type LogoStatus = "loading" | "loaded" | "error";

export function MediaLogo({
	logoSrc,
	title,
	className,
	imageClassName,
	fallbackClassName,
	overBackground = false,
}: MediaLogoProps) {
	const [status, setStatus] = useLogoStatus(logoSrc);
	const showFallback = fallbackClassName !== undefined && status !== "loaded";

	if (!logoSrc) return <div className={className} title={title} />;

	return (
		<div className={className} title={title}>
			<div className="relative inline-block self-start">
				{/* The glow is scaled to twice the logo's size, so on details
				    pages it spills over the nav rail. pointer-events-none keeps
				    it from swallowing clicks on whatever it covers. */}
				<div
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-0 blur-2xl rounded-full scale-200",
						overBackground ? "bg-background/20" : "bg-black/20",
					)}
				/>
				{showFallback && (
					// The page heading carries the title for screen readers.
					<p aria-hidden="true" className={cn("relative", fallbackClassName)}>
						{title}
					</p>
				)}
				{status !== "error" && (
					<img
						// A cached logo can finish before React attaches onLoad.
						ref={(img) => {
							if (img?.complete && img.naturalWidth > 0) setStatus("loaded");
						}}
						src={logoSrc}
						alt={title}
						onLoad={() => setStatus("loaded")}
						onError={() => setStatus("error")}
						className={cn(
							"relative w-[clamp(12rem,14vw,40rem)] object-contain drop-shadow-2xl",
							imageClassName,
							// Out of flow and invisible until loaded, so the text
							// fallback holds the space instead.
							showFallback && "absolute top-0 left-0 opacity-0",
						)}
						loading="eager"
						fetchPriority="high"
					/>
				)}
			</div>
		</div>
	);
}

/** Load status of the current logo, reset whenever the source changes. */
function useLogoStatus(src: string | undefined) {
	const [state, setState] = useState<{ src?: string; status: LogoStatus }>({
		src,
		status: "loading",
	});
	const status = state.src === src ? state.status : "loading";
	const setStatus = (next: LogoStatus) => {
		if (state.src !== src || state.status !== next) {
			setState({ src, status: next });
		}
	};
	return [status, setStatus] as const;
}
