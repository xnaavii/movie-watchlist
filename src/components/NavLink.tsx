import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type NavLinkProps = LinkProps & {
	icon: LucideIcon;
	label: string;
	showLabel?: boolean;
	className?: string;
};

const NavLink = ({
	icon: Icon,
	label,
	showLabel = false,
	className,
	...linkProps
}: NavLinkProps) => {
	return (
		<Button
			variant="ghost"
			size={showLabel ? "default" : "icon"}
			asChild
			className={cn(
				!showLabel && "shrink-0",
				"rounded-md size-12 hover:bg-indigo-950 hover:text-white",
			)}
		>
			<Link
				{...linkProps}
				aria-label={label}
				activeProps={{ className: "bg-indigo-950 text-indigo-500" }}
				inactiveProps={{ className: "text-white" }}
				className={cn("flex items-center gap-2", className)}
			>
				<Icon className="size-6" />
				{showLabel && <span>{label}</span>}
			</Link>
		</Button>
	);
};

export default NavLink;
