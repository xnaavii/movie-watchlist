import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";

export function UserMenu() {
	const { data: session } = authClient.useSession();

	if (!session) {
		return (
			<Link to="/login" aria-label="Log in">
				<Avatar>
					<AvatarFallback>
						<LogIn className="size-4" />
					</AvatarFallback>
				</Avatar>
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Avatar>
					<AvatarImage src={session.user.image ?? undefined} />
					<AvatarFallback>
						{session.user.name?.[0]?.toUpperCase() ?? "?"}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={() => authClient.signOut()}>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
