import {
	Baby,
	BookOpen,
	Clapperboard,
	Drama,
	Film,
	Ghost,
	Heart,
	Landmark,
	Laugh,
	type LucideIcon,
	Map as MapIcon,
	Music,
	Rocket,
	Search,
	Shield,
	Skull,
	Swords,
	Tv,
	Users,
	Wand,
	Zap,
} from "lucide-react";

/** Icons for TMDB's movie genre ids. */
const GENRE_ICONS: Record<number, LucideIcon> = {
	28: Zap, // Action
	12: MapIcon, // Adventure
	16: Baby, // Animation
	35: Laugh, // Comedy
	80: Shield, // Crime
	99: BookOpen, // Documentary
	18: Drama, // Drama
	10751: Users, // Family
	14: Wand, // Fantasy
	36: Landmark, // History
	27: Ghost, // Horror
	10402: Music, // Music
	9648: Search, // Mystery
	10749: Heart, // Romance
	878: Rocket, // Science Fiction
	10770: Tv, // TV Movie
	53: Skull, // Thriller
	10752: Swords, // War
	37: Clapperboard, // Western
};

export const getGenreIcon = (genreId: number): LucideIcon =>
	GENRE_ICONS[genreId] ?? Film;
