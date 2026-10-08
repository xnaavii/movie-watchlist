import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { CardDescription, CardTitle } from "#/components/ui/card";

interface MovieReviewAuthorProps {
	name: string;
	avatarSrc?: string;
	date: string;
}

export function MovieReviewAuthor({
	name,
	avatarSrc,
	date,
}: MovieReviewAuthorProps) {
	return (
		<div className="flex items-center gap-3 min-w-0">
			<Avatar>
				<AvatarImage src={avatarSrc} alt={name} />
				<AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
			</Avatar>
			<div className="flex flex-col gap-0.5 min-w-0">
				<CardTitle className="truncate">{name}</CardTitle>
				<CardDescription>{date}</CardDescription>
			</div>
		</div>
	);
}
