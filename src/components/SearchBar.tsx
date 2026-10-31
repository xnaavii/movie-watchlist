import { Input } from "./ui/input";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Search a title or person, or describe a vibe…",
}: SearchBarProps) {
	return (
		<Input
			type="search"
			aria-label="Search"
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}
