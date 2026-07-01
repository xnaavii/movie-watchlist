import {
	Clapperboard,
	Compass,
	Library,
	Search,
	VenetianMask,
} from "lucide-react";
import NavLink from "./NavLink";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Sidebar = () => {
	return (
		<aside className="p-4 flex flex-col justify-between items-center">
			<div className="size-12 flex items-center justify-center p-3">
				<VenetianMask className="text-indigo-300" />
			</div>
			<nav>
				<ul className="flex flex-col gap-4">
					<li>
						<NavLink
							to="/search"
							icon={Search}
							showLabel={false}
							label="Search"
						/>
					</li>
					<li>
						<NavLink to="/" icon={Compass} showLabel={false} label="Explore" />
					</li>
					<li>
						<NavLink
							to="/movies"
							icon={Clapperboard}
							showLabel={false}
							label="Movies"
						/>
					</li>
					<li>
						<NavLink
							to="/watchlist"
							icon={Library}
							showLabel={false}
							label="Watchlist"
						/>
					</li>
				</ul>
			</nav>

			<Avatar>
				<AvatarImage
					src="https://github.com/shadcn.png"
					alt="@shadcn"
					className="grayscale"
				/>
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
		</aside>
	);
};
export default Sidebar;
