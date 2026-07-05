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
			className="p-3 rounded-md bg-neutral-900 text-white placeholder-indigo-300"
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}
