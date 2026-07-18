import type { LanguageISO6391 } from "@lorenzopant/tmdb";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { movieQueries } from "#/features/movies/queries";
import { cn } from "#/lib/utils";

const routeApi = getRouteApi("/discover");

export function LanguageFilter() {
	const { language } = routeApi.useSearch();
	const navigate = routeApi.useNavigate();
	const { data: languages } = useSuspenseQuery(movieQueries.languages());
	const [open, setOpen] = useState(false);

	const selected = languages.find((l) => l.iso_639_1 === language);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open}>
					{selected?.english_name ?? "Any Language"}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0">
				<Command>
					<CommandInput placeholder="Search language..." />
					<CommandList>
						<CommandEmpty>No language found.</CommandEmpty>
						<CommandGroup>
							<CommandItem
								value="any"
								onSelect={() => {
									navigate({
										search: (prev) => ({ ...prev, language: undefined }),
									});
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										"mr-2",
										!language ? "opacity-100" : "opacity-0",
									)}
								/>
								Any Language
							</CommandItem>
							{languages.map((lang) => (
								<CommandItem
									key={lang.iso_639_1}
									value={lang.english_name}
									onSelect={() => {
										navigate({
											search: (prev) => ({
												...prev,
												language: lang.iso_639_1 as LanguageISO6391,
											}),
										});
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2",
											language === lang.iso_639_1 ? "opacity-100" : "opacity-0",
										)}
									/>
									{lang.english_name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
