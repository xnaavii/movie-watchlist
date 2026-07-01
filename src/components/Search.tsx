import { Input } from "./ui/input";

const Search = () => {
	return (
		<Input
			type="search"
			placeholder="Search for a movie..."
			className="p-3 rounded-md bg-neutral-900 text-white placeholder-indigo-300"
		/>
	);
};

export default Search;
