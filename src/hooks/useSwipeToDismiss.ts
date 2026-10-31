import { useEffect, useState } from "react";

/** Distance (px) or flick speed (px/ms) past which a release dismisses. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.5;
/** Movement (px) before deciding whether a touch is a swipe or a scroll. */
const SLOP = 8;
/** Height (px) of the grab-handle strip at the top that always drags. */
const HANDLE_ZONE = 48;

/** Fields and other controls keep their own touch handling. */
const IGNORE =
	"input, textarea, select, [contenteditable='true'], [data-no-swipe]";

interface Options {
	/** Only runs while this media query matches, e.g. phones only. */
	media: string;
	onDismiss: () => void;
}

/**
 * Lets a bottom sheet be dragged down and flicked away, like a native sheet.
 * The sheet follows the finger; it closes once dragged far or fast enough,
 * otherwise it springs back. A drag only starts when the sheet is scrolled to
 * the top or starts on the grab handle, so scrolling long content still works.
 *
 * Uses touch events (not pointer events) so the drag can stop the browser's
 * own scroll, which would otherwise cancel the gesture.
 */
export function useSwipeToDismiss({ media, onDismiss }: Options) {
	// A callback ref, since the sheet mounts after its parent (in a portal,
	// behind Radix's presence animation).
	const [el, setEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!el) return;

		let startY = 0;
		let startX = 0;
		let startTime = 0;
		let offset = 0;
		let fromHandle = false;
		let state: "idle" | "pending" | "dragging" | "ignored" = "idle";

		const reset = () => {
			el.style.transition = "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)";
			el.style.transform = "";
			const clear = () => {
				el.style.transition = "";
				el.removeEventListener("transitionend", clear);
			};
			el.addEventListener("transitionend", clear);
		};

		const onStart = (event: TouchEvent) => {
			if (event.touches.length !== 1 || !window.matchMedia(media).matches) {
				state = "ignored";
				return;
			}
			const target = event.target as Element | null;
			state = target?.closest(IGNORE) ? "ignored" : "pending";
			startY = event.touches[0].clientY;
			startX = event.touches[0].clientX;
			startTime = event.timeStamp;
			fromHandle = startY - el.getBoundingClientRect().top < HANDLE_ZONE;

			offset = 0;
		};

		const onMove = (event: TouchEvent) => {
			const touch = event.touches[0];
			if (state === "idle" || state === "ignored" || !touch) return;
			const dy = touch.clientY - startY;
			const dx = touch.clientX - startX;

			if (state === "pending") {
				if (Math.abs(dy) < SLOP && Math.abs(dx) < SLOP) return;
				// A downward, mostly vertical drag is a swipe when it starts on the
				// grab handle, or anywhere once the content is scrolled to the top.
				// Anything else is a scroll or a horizontal gesture.
				const isSwipe =
					dy > 0 &&
					Math.abs(dy) > Math.abs(dx) &&
					(fromHandle || el.scrollTop <= 0);
				state = isSwipe ? "dragging" : "ignored";
				if (!isSwipe) return;
				el.style.transition = "none";
			}

			event.preventDefault();
			offset = Math.max(0, dy);
			el.style.transform = `translateY(${offset}px)`;
		};

		const onEnd = (event: TouchEvent) => {
			const wasDragging = state === "dragging";
			state = "idle";
			if (!wasDragging) return;

			const elapsed = Math.max(1, event.timeStamp - startTime);
			if (offset > DISMISS_DISTANCE || offset / elapsed > DISMISS_VELOCITY) {
				// Leave the sheet where the finger let go; the closing animation
				// carries it the rest of the way down.
				el.style.transition = "";
				onDismiss();
			} else {
				reset();
			}
		};

		el.addEventListener("touchstart", onStart, { passive: true });
		el.addEventListener("touchmove", onMove, { passive: false });
		el.addEventListener("touchend", onEnd);
		el.addEventListener("touchcancel", onEnd);
		return () => {
			el.removeEventListener("touchstart", onStart);
			el.removeEventListener("touchmove", onMove);
			el.removeEventListener("touchend", onEnd);
			el.removeEventListener("touchcancel", onEnd);
		};
	}, [el, media, onDismiss]);

	return setEl;
}
