import { Compass, Library, Search, VenetianMask } from "lucide-react";
import { UserMenu } from "#/features/auth/components/UserMenu";
import NavLink from "./NavLink";

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
						<NavLink
							to="/explore"
							icon={Compass}
							showLabel={false}
							label="Explore"
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

			<UserMenu />
		</aside>
	);
};
export default Sidebar;
