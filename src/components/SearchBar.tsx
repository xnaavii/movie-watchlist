import { Input } from "./ui/input";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<Input
			type="search"
			placeholder="Search for a movie..."
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}
