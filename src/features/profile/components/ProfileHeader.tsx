import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";

const memberSinceFormat = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});

interface ProfileHeaderProps {
	user: {
		name: string;
		email: string;
		image?: string | null;
		createdAt: Date | string;
	};
	onLogout: () => void;
}

export function ProfileHeader({ user, onLogout }: ProfileHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3 sm:gap-4 min-w-0">
				<Avatar className="size-12 sm:size-14 shrink-0">
					<AvatarImage src={user.image ?? undefined} />
					<AvatarFallback className="text-lg sm:text-xl font-medium">
						{user.name[0]?.toUpperCase() ?? "?"}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col gap-0.5 min-w-0">
					<h1 className="text-xl sm:text-2xl lg:text-3xl tracking-tight font-medium truncate">
						{user.name}
					</h1>
					<p className="flex flex-col text-xs sm:text-sm text-muted-foreground sm:flex-row sm:gap-1.5">
						<span className="truncate">{user.email}</span>
						<span aria-hidden="true" className="hidden sm:inline">
							·
						</span>
						<span className="truncate sm:truncate-none">
							Member since {memberSinceFormat.format(new Date(user.createdAt))}
						</span>
					</p>
				</div>
			</div>
			<Button variant="outline" onClick={onLogout} className="w-full sm:w-fit">
				Log out
				<LogOut data-icon="inline-end" />
			</Button>
		</div>
	);
}
