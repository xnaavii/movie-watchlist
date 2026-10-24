import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

/** A row of links that reads like a segmented control. */
export function PillNav({ className, ...props }: ComponentProps<"nav">) {
	return (
		<nav
			className={cn(
				"flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-muted p-1",
				className,
			)}
			{...props}
		/>
	);
}

interface PillNavItemProps extends ComponentProps<"a"> {
	active?: boolean;
	asChild?: boolean;
}

export function PillNavItem({
	active,
	asChild,
	className,
	...props
}: PillNavItemProps) {
	const Comp = asChild ? Slot.Root : "a";
	return (
		<Comp
			aria-current={active ? "page" : undefined}
			data-active={active}
			className={cn(
				"flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-4",
				"data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm",
				className,
			)}
			{...props}
		/>
	);
}
