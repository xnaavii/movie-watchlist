import { Input } from "./ui/input";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<Input
			type="search"
			placeholder="Search a title or person, or describe a vibe…"
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}
